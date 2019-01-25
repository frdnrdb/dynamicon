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
                face: 'rgb(255, 235, 151)',
                faceStroke: 'none',
                stroke: '#444',
                mouthFill: '#ff396d40',
                heart: '#ff396d'
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
            else if (this.extreme.state) {
                this.extreme.off(misery);
                this.extreme.off(bliss);   
            }        
            else {
                const eyesY = this.size/2.5 - change/3;
                eyes.map(eye => {
                    eye.setAttribute('cy', eyesY - (value < 0 ? change/4 : 0));
                    eye.setAttribute('r', this.eyeSize + (value < 0 ? change/3.5 : change/7.5));
                });            
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

            this.mouth.setAttribute(
                'd',
                `m${l - scale/2},${o} c${hl} ${y-o}, ${hr + scale} ${y-o}, ${r + scale},0 ${close}`
            );
        }    

        buildEmoticon() {
            if (!this.container) {
                this.container = create('div', this.shadowRoot);
                this.container.className = 'emoticon';
                this.svg = createNS('svg', this.container);
                this.circle = createNS('circle', this.svg);
                this.eyesGroup = createNS('g', this.svg);
                this.eyes = Array(2).fill().map(() => createNS('circle', this.eyesGroup));
                this.misery = createNS('g', this.svg);
                this.misery._children = Array(4).fill().map(() => createNS('line', this.misery));
                this.bliss = createNS('g', this.svg);
                this.bliss._children = Array(2).fill().map(() => createNS('path', this.bliss));
                this.mouth = createNS('path', this.svg);
            }

            this.colors = this.getTheme();
        
            const strokeWidth = this.size/30;
            const transition = 'all .35s cubic-bezier(0,0,0,1)';
            const extremeTransition = 'all .35s cubic-bezier(0.175, 0.885, 0.32, 1.5)';
            
            this.svg.setAttribute('width', this.size);
            this.svg.setAttribute('height', this.size);
            
            this.circle.setAttribute('cx', this.size/2);
            this.circle.setAttribute('cy', this.size/2);
            this.circle.setAttribute('r', this.size/2 - strokeWidth);
            this.circle.style.strokeWidth = strokeWidth;
            this.circle.style.stroke = this.colors.faceStroke;
            this.circle.style.fill = this.colors.face;
            
            const eyeX = this.size/3.5;
            const eyeY = this.size/4;
            this.eyeSize = this.size/15;
            this.eyes.map((circle, i) => {
                circle.setAttribute('cx', i ? this.size - eyeX : eyeX);
                circle.setAttribute('cy', eyeY);
                circle.setAttribute('r', this.eyeSize);
                circle.style.fill = this.colors.stroke;
                circle.style.transition = transition;
            });
        
            this.misery.style.opacity = 0;
            this.misery._children.map((line, i) => {
                const l = this.size * 0.15;
                const x = (i > 1 ? this.size - eyeX : eyeX) - l/2;
                const y = eyeY + l/2 + this.eyeSize;
                const flip = i % 2 === 0 ? l : 0;
                const back = i % 2 !== 0 ? l : 0;
                line.setAttribute('x1', x);
                line.setAttribute('y1', y + back);
                line.setAttribute('x2', x + l);
                line.setAttribute('y2', y + flip);
                line.style.fill = 'none';
                line.style.stroke = this.colors.stroke;
                line.style.strokeWidth = strokeWidth;
                line.style.strokeLinecap = 'round';
                line.style.transformOrigin = `${i > 1 ? 70 : 30}% 45%`;
                line.style.transform = 'scale(.5)';
                line.style.transition = extremeTransition;
            });    

            this.bliss.style.opacity = 0;
            this.bliss._children.map((heart, i) => {
                const xx = i ? this.size - eyeX : eyeX;
                const yy = eyeY;
                heart.setAttribute('d', this.heart(xx,yy,this.size));
                heart.style.fill = this.colors.heart;
                heart.style.stroke = 'none';
                heart.style.strokeWidth = strokeWidth;
                heart.style.strokeLinecap = 'round';
                heart.style.strokeLinejoin = 'round';
                heart.style.transformOrigin = `${i ? 70 : 35}% 35%`;
                heart.style.transform = 'scale(.5)';
                heart.style.transition = extremeTransition;
            });        

            this.extreme = {
                on: n => {
                    n._children.map(x => {
                        x.style.transform = 'scale(1)';
                    });
                    this.eyesGroup.style.opacity = 0;
                    n.style.opacity = 1;
                    this.extreme.state = true;            
                },
                off: n => {
                    n.style.opacity = 0;
                    this.eyesGroup.style.opacity = 1;
                    n._children.map(x => {
                        x.style.transform = 'scale(.5)';
                    });          
                    this.extreme.state = false;            
                }
            };    

            this.miseryLimit = ( this.min < 0 ? -1 : 1 ) * ( Math.abs(this.min) - Math.abs(this.min)*.01 );     
            this.blissLimit = ( this.max > 0 ? 1 : -1 ) * ( Math.abs(this.max) - Math.abs(this.max)*.01 );     

            this.mouth.style.fill = this.colors.mouthFill;
            this.mouth.style.stroke = this.colors.stroke;
            this.mouth.style.strokeWidth = strokeWidth;
            this.mouth.style.strokeLinecap = 'round';
            this.mouth.style.strokeLinejoin = 'round';  
            this.mouth.style.transition = transition;
        }    

        get() {
            return this.value;
        }   

        set(value) {
            this.value = value;
            this.update();
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

try {
    const init = options => {
        Object.assign(config, options || {});
        if (!window.customElements.get('dynamic-emoticon')) {
            window.customElements.define('dynamic-emoticon', defineElement());
        }
        return document.createElement('dynamic-emoticon');
    };

    if (typeof window === 'object') window.dynamicon = init;
    if (typeof define === "function" & define.amd) this.dynamicon = init, define(init);
    else if (typeof module === "object" && module.exports) module.exports = init;

} 
catch (err) {
    console.error('Environment does not support custom elements');
}
