## dynamicon

dynamic emoticon

did some textual sentiment analysis and needed a face rather than a float (number)

`npm i -S dynamicon`

```
const d = require('dynamicon')()

// or

require('dynamicon')
const d = document.createElement('dynamic-emoticon')

// append somewhere

document.body.appendChild(d)

// set mood

d.ease(value) // transition/ animate
d.set(value) // immediate

// change appearance

d.setSize(width)
d.setTheme('outline')

// custom initialization

const d = require('dynamicon')({
    value: 0,
    min: -100,
    max: 100,
    size: 200,
    theme: {
        face: '#ffeb97',
        faceStroke: 'none',
        stroke: '#444',
        mouthFill: '#ff396d40',
        heart: '#ff396d'
    }
})

```

maybe
* support old browsers (typeof window.customElements === undefined)
* drop webpack and babel (read: modern javascript) to reduce filesize
