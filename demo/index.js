const initialSize = window.innerHeight/3;

(() => {

    const dynamicon = require('../index')({
        size: initialSize
    });
    document.body.appendChild(dynamicon);

    const score = scoreElement(dynamicon);
    const moodRange = moodInput(dynamicon, score);
    scaleInput(dynamicon);
    themeInput(dynamicon);

    randomFace(dynamicon, score, moodRange);

    info();   

})();

function moodInput(dynamicon, score) {
    const moodRange = create('input');
    moodRange.className = 'mood';
    moodRange.type = 'range';
    moodRange.setAttribute('min', -100);
    moodRange.setAttribute('max', 100);
    moodRange.value = 0;
    moodRange.oninput = e => {
        dynamicon.set(e.target.value);
        score.innerHTML = e.target.value;   
    };  
    moodRange.insertAdjacentHTML('afterend', '<label>mood<span>click icon for transition</span></label>');
    return moodRange;
}

function scaleInput(dynamicon) {
    const scaleContainer = create('div');
    const scaleRange = create('input', scaleContainer);
    scaleRange.type = 'range';
    scaleContainer.style.position = 'fixed';
    scaleContainer.style.top = 'auto';
    scaleContainer.style.bottom = '2.5vh';
    scaleRange.setAttribute('min', 25);
    scaleRange.setAttribute('max', Math.min(.65 * window.innerHeight, window.innerWidth));
    scaleRange.value = initialSize;
    scaleRange.oninput = e => {
        dynamicon.setSize(e.target.value);        
    };
    scaleContainer.insertAdjacentHTML('beforeend', '<label>scale</label>')
    return scaleRange;
}

function themeInput(dynamicon) {
    const themeContainer = create('div');
    themeContainer.style.position = 'fixed';
    themeContainer.style.top = '2.5vh';
    themeContainer.style.right = '2.5vh';
    themeContainer.style.minHeight = '3em';
    themeContainer.style.display = 'flex';
    themeContainer.style.alignItems = 'center';

    const check = create('input', themeContainer);
    check.type = 'checkbox';
    check.name = 'theme';
    check.value = 'theme';
    check.oninput = function(e) {
        if (e.target.checked) {
            dynamicon.setTheme('outline');
        }
        else {
            dynamicon.setTheme('default');
        }
    }; 
    themeContainer.insertAdjacentHTML('afterbegin', '<label>theme</label>')
    return check;    
}

function scoreElement(dynamicon) {
    const score = create('div');
    score.className = 'score';
    score.innerHTML = dynamicon.get();
    return score;    
}

function randomFace(dynamicon, score, moodRange) {
    dynamicon.addEventListener('click', () => {
        let rand = Math.floor(Math.random()*220) - 110;
        rand = Math.max(-100, rand);
        rand = Math.min(100, rand);
        dynamicon.ease(rand);
        score.innerHTML = rand;
        moodRange.value = rand;
    });
}

function info() {
    const infoContainer = create('aside');
    infoContainer.style.position = 'fixed';
    infoContainer.style.top = '2.5vh';
    infoContainer.style.left = '2.5vh';
    infoContainer.style.display = 'flex';
    infoContainer.style.alignItems = 'center';
    infoContainer.innerHTML = '<pre>npm i -S dynamicon</pre><a href="https://github.com/frdnrdb/dynamicon">github</a>';
}

function create(type, parent) {
    return (parent || document.body).appendChild(document.createElement(type));
}