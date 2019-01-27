const config = {
    themes: {
        outline: {
                face: 'none',
                faceStroke: '#444',
                stroke: '#444',
                mouthFill: 'none',
                heart: '#444'
        },
        default: {
                face: '#ffeb97',
                faceStroke: 'none',
                stroke: '#444',
                mouthFill: '#ff643948',
                heart: '#ff6439'
        }
    }
};

function defineElement() {

    class DynamicEmoticon extends HTMLElement {

        connectedCallback() {            
            this.attachShadow({mode: 'open'});
            this.value = config.value || this.dataset.value || 0;
            this.size = config.size || this.dataset.size || 200;
            this.min = config.min || this.dataset.min || -100;
            this.max = config.max || this.dataset.max || 100;
            this.theme = this.dataset.theme;
            this.render();
        }

        static get observedAttributes() {
            return ['data-value', 'data-size', 'data-theme'];
        }

        attributeChangedCallback(attr, __, value) {
            /value/.test(attr) && this.set(value);
            /size/.test(attr) && this.setSize(value);
            /theme/.test(attr) && this.setTheme(value);
        }    

        update() {
            this.updateEyes();
            this.updateMouth();
        }

        updateEyes() {
            clearTimeout(this.winkTimeout);

            const value = this.value;
            const { eyes, misery, bliss } = this;
            const p = this.size * 0.1;
            const change = p * value*100/this.max/100;
        
            if (value < this.miseryLimit) {
                this.extreme.off(bliss);
                this.extreme.on(misery);
            }
            else if (value > this.blissLimit) {
                this.extreme.off(misery);
                this.extreme.on(bliss);
            }
            else {
                if (this.extreme.state) {
                    this.extreme.off(misery);
                    this.extreme.off(bliss);   
                }  

                const eyesY = this.size/2.5 - change/3;
                eyes._children.map(eye => {
                    attrNS(eye, {
                        cy: eyesY - (value < 0 ? change/4 : 0),
                        r: this.eyeSize + (value < 0 ? change/3.5 : change/7.5)
                    });
                });            

                clearTimeout(this.winkTimeout);
                const wink = this.value > this.winkLimit && this.eyes._children[1];

                if (wink) {
                    this.winkTimeout = setTimeout(()=>{
                        wink.style.transition = this.winkTransition;
                        wink.style.transform = 'scale3d(1.1, .05, 1)';
                        setTimeout(()=>{
                            wink.style.transform = 'scale3d(1, 1, 1)';
                            setTimeout(()=>{
                                wink.style.transition = 'none';
                            }, 350);                            
                        }, 350);
                    }, 350);
                }   

            }
        }   
        
        updateMouth() {
            const value = this.value;

            // face/ mouth padding
            const p = this.size * 0.15;

            // mouth width
            const z = this.size - p*2;
            
            // change relative to input value
            const change = p * value*100/this.max/100;

            // horizontal shrink/ grow relative to change
            const scale = value < 0 ? Math.abs(change)/2.5 : Math.abs(change);

            // vertical origin
            const o = z/1.1 - ( value < 0 ? change : change/2);

            // vertical shrink/ grow relative to change (bezier points distance)
            const y = o + (z/2 * value / this.max) - (value < 0 ? change : 0);

            // horizontal origins
            const l = p*2;
            const r = z - p*2;

            // horizontal bezier origins
            const hl = value < 0 ? r*.25 : 0;
            const hr = value < 0 ? r*.75 : r;

            // close path
            const close = value > 0 ? 'z' : '';

            // fill path if positive
            this.mouth.style.fill = value > 0 ? this.colors.mouthFill : 'transparent';

            this.mouth.setAttributeNS(
                null,
                'd',
                `m${l - scale/2},${o} c${hl} ${y-o}, ${hr + scale} ${y-o}, ${r + scale},0 ${close}`
            );
        }    

        buildEmoticon() {
            if (!this.container) {
                this.container = create('div', this.shadowRoot);
                this.container.className = 'emoticon';
                this.svg = createNS('svg', this.container);
                this.face = createNS('circle', this.svg);
                this.eyes = createNS('g', this.svg);
                this.eyes._children = Array(2).fill().map(() => createNS('circle', this.eyes));
                this.misery = createNS('g', this.svg);
                this.misery._children = Array(4).fill().map(() => createNS('line', this.misery));
                this.bliss = createNS('g', this.svg);
                this.bliss._children = Array(2).fill().map(() => createNS('path', this.bliss));
                this.mouth = createNS('path', this.svg);
            }

            this.colors = this.getTheme();
        
            const strokeWidth = this.size/30;
            const extremeTransition = 'all .35s cubic-bezier(0.175, 0.885, 0.32, 1.5)';
            this.winkTransition = 'transform .35s cubic-bezier(.5, 0, 0, 1)';

            this.miseryLimit = ( this.min < 0 ? -1 : 1 ) * ( Math.abs(this.min) - Math.abs(this.min)*.01 );     
            this.blissLimit = ( this.max > 0 ? 1 : -1 ) * ( Math.abs(this.max) - Math.abs(this.max)*.01 );     
            this.winkLimit = ( this.max > 0 ? 1 : -1 ) * ( Math.abs(this.max) - Math.abs(this.max)*.25 );     
            
            attrNS(this.svg, {
                width: this.size,
                height: this.size,
                version: '1.1'
            });
            
            attrNS(this.face, {
                cx: this.size/2,
                cy: this.size/2,
                r: this.size/2 - strokeWidth,
                stroke: this.colors.faceStroke,
                fill: this.colors.face,
                'stroke-width': strokeWidth
            });

            const eyeX = this.size/3.5;
            const eyeY = this.size/4;
            this.eyeSize = this.size/15;
            this.eyes._children.map((circle, i) => {
                attrNS(circle, {
                    cx: i ? this.size - eyeX : eyeX,
                    cy: eyeY,
                    r: this.eyeSize,
                    fill: this.colors.stroke,
                    'stroke-width': strokeWidth
                });                
                Object.assign(circle.style, {
                    transformOrigin: '70% 37.5%'
                });   
            });
        
            this.misery.style.opacity = 0;
            this.misery._children.map((line, i) => {
                const l = this.size * 0.15;
                const x = (i > 1 ? this.size - eyeX : eyeX) - l/2;
                const y = eyeY + l/2 + this.eyeSize;
                const flip = i % 2 === 0 ? l : 0;
                const back = i % 2 !== 0 ? l : 0;
                attrNS(line, {
                    x1: x,
                    y1: y + back,
                    x2: x + l,
                    y2: y + flip,
                    fill: 'none',
                    stroke: this.colors.stroke,
                    'stroke-linecap': 'round',
                    'stroke-width': strokeWidth
                });
                Object.assign(line.style, {
                    transformOrigin: `${i > 1 ? 70 : 30}% 45%`,
                    transform: 'scale(.5)',
                    transition: extremeTransition                
                });                  
            });    

            this.bliss.style.opacity = 0;
            this.bliss._children.map((heart, i) => {
                const xx = i ? this.size - eyeX : eyeX;
                const yy = eyeY;
                attrNS(heart, {
                    d: this.heart(xx, yy, this.size),
                    name: 'bliss',
                    fill: this.colors.stroke,
                    stroke: 'none',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': strokeWidth
                });                
                Object.assign(heart.style, {
                    transformOrigin: `${i ? 70 : 35}% 35%`,
                    transform: 'scale(.5)',
                    transition: extremeTransition
                });                
            });        

            this.extreme = {
                on: n => {
                    n._children.map(x => {
                        if (x.getAttribute('name') === 'bliss') {
                            x.style.fill = this.colors.heart;
                        }                        
                        x.style.transform = 'scale(1)';
                    });
                    this.eyes.style.opacity = 0;
                    n.style.opacity = 1;
                    this.extreme.state = true;            
                },
                off: n => {
                    n.style.opacity = 0;
                    this.eyes.style.opacity = 1;
                    n._children.map(x => {
                        if (x.getAttribute('name') === 'bliss') {
                            x.style.fill = this.colors.stroke;
                        }                        
                        x.style.transform = 'scale(.5)';
                    });          
                    this.extreme.state = false;            
                }
            };    

            attrNS(this.mouth, {
                fill: this.colors.mouthFill,
                stroke: this.colors.stroke,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': strokeWidth
            });              

        }

        get() {
            return this.value;
        }   

        set(value) {
            if (this.easeInterval) {
                clearInterval(this.easeInterval);
            }            
            this.setValue(value);
        }   
        
        ease(value) {
            const self = this;
            this.animate(this.value, value, 1000, val => {
                self.setValue(val);
            });         
        }

        setValue(value) {
            requestAnimationFrame( () => {
                this.value = value;
                this.update();            
            });
        }

        setSize(value) {
            this.size = value;
            this.render();
        }

        setTheme(value) {
            this.theme = value;
            this.render();
        }

        getTheme() {
            return config.theme || config.themes[this.theme] || config.themes.default;
        }

        heart(x1,y1) {
            const w = this.size/8;
            const h = w * .75;
            x1 = x1 + w;
            y1 = y1 + h;
            return `M${x1},${y1}c0,${h-h/6}-${w},${w+h/6}-${w},${w+h/6}s-${w}-${h/2}-${w}-${w+h/6}c0-${h},${w}-${h},${w}-0C${x1-w},${y1-h},${x1},${y1-h},${x1},${y1}z`;
        }        

        animate(from, to, duration = 500, cb) {
            clearInterval(this.easeInterval);
            from = parseFloat(from, 10);
            to = parseFloat(to, 10);
            const range = to - from;
            const start = new Date().getTime();
            const easingFunction = this.easeInOutQuart;
            if (from === to || to > this.max || from < this.min) {
                return;
            }
            this.easeInterval = setInterval(() => {
                const time = new Date().getTime() - start;
                cb(easingFunction(
                    time,
                    from, 
                    range,
                    duration
                ));
                if (time >= duration) {
                    clearInterval(this.easeInterval);
                }
            }, 1000 / 60);
        }

        easeInOutQuart(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }        

        render () {
            this.buildEmoticon();
            this.update();
        }
    }

    return DynamicEmoticon;
}

function create(type, parent) {
    return parent.appendChild(document.createElement(type));
}

function createNS(type, parent) {
    return parent.appendChild(document.createElementNS('http://www.w3.org/2000/svg', type));
}    

function attrNS(node, o) {
    Object.entries(o).map( ([ key, val ]) => node.setAttributeNS( null, key, val) );
}

try {
    if (!window.customElements.get('dynamic-emoticon')) {
        window.customElements.define('dynamic-emoticon', defineElement());
    }

    const init = options => {
        Object.assign(config, options || {});
        return document.createElement('dynamic-emoticon');
    };

    if (typeof window === 'object') window.dynamicon = init;
    if (typeof define === "function" & define.amd) this.dynamicon = init, define(init);
    else if (typeof module === "object" && module.exports) module.exports = init;

} 
catch (err) {
    console.error('Environment does not support custom elements');
}