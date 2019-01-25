## dynamicon

dynamic emoticon

`npm i -S dynamicon`

```
const d = require('dynamicon')()

// or

require('dynamicon')
const d = document.createElement('dynamic-emoticon')

// append somewhere

document.body.appendChild(d)

// set mood

d.set(value)

// change appearance

d.setSize(width)
d.setTheme('outline')

// custom initialization

const d = require('dynamicon'){
    value: 0,
    size: 200,
    min: -100,
    max: 100,
    theme: {
        face: 'rgb(255, 235, 151)',
        faceStroke: 'none',
        stroke: '#444',
        mouthFill: '#ff396d40',
        heart: '#ff396d'
    }
}

```
