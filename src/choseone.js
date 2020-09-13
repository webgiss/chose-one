import "regenerator-runtime/runtime.js";
import { Howl } from 'howler'
import { range } from './range'
import { readyPromise } from './readyPromise'
import { addStyle } from './addStyle'

/**
 * @typedef {[number, number, number]} Color
 */

/**
 * @typedef {Object} CirclePosition
 * @property {number} CirclePosition.x the x position
 * @property {number} CirclePosition.y the y position
 * @property {number} CirclePosition.colorIndex the color index
 */

/**
 * @typedef {Object} Sound
 * @property {()=>void} Sound.play
 */

/**
 * The colors used for circles. The numbers of colors in this list define the maximum number of choices
 * @type {Color[]}
 */
const colors = [
    [239, 247, 7],
    [52, 219, 2],
    [35, 35, 237],
    [209, 29, 29],
    [199, 54, 247],
    [247, 159, 7],
    [29, 242, 242],
    [252, 40, 171],
    [255, 255, 255],
    [136, 136, 136]
]

const now = () => new Date().getTime()

const data = {
    /** @type {number} */
    ref: null,
    /** @type {number} */
    lastChange: null,
    /** @type {number} */
    eventCount: null,
    /** @type {CirclePosition} The position of the chosen circle */
    winnerP: null,
    /** @type {CirclePosition[]} The positions of the circles in the workspace */
    positions: [],
    /** The list of color indexes not yet used by circles */
    availableColorIndexes: [...range(0, colors.length)],
    /** @type {Color} */
    bgColor: [7, 30, 3],
    /** @type {Color} */
    bgColor: [0, 0, 0],
    /** The number of sound before chosing one choice */
    eventCountMax: 3,
    /** The width of the circles */
    width: 50,
    /** The delay between each sound before chosing one choice */
    eventDelay: 1000,
    /** @type {Object<string, Sound>} */
    sounds: {
    }
}

/**
 * Clean all circles and restart from scratch
 */
const clean = () => {
    data.positions.forEach((position) => removeCircle(position))
    // console.log({ winnerP: data.winnerP })
    if (data.winnerP) {
        removeCircle(data.winnerP)
    }

    data.winnerP = null
    data.positions = []
    data.availableColorIndexes = [...range(0, colors.length)]
}

/**
 * Clean all circles and restart from scratch only if the process has ended
 */
const cleanIfEnded = () => {
    if (data.winnerP) {
        clean()
    }
}

/**
 * Stop the process, and chose a circle
 */
const stop = () => {
    data.winnerP = data.positions.splice(Math.random() * data.positions.length, 1)[0]
    data.positions.forEach(addBackCircle)
    data.sounds.blong.play()
    data.ref = null
    data.lastChange = null
    data.eventCount = null
    return
}

/**
 * react to another time event
 * @param {boolean} changed 
 */
const react = (changed) => {
    if (data.winnerP) {
        return
    }
    if (data.positions.length > 0) {
        if (!data.ref) {
            data.ref = now()
            data.lastChange = now()
            data.eventCount = 0
        }

        if (changed) {
            data.lastChange = now()
            data.eventCount = 0
        }

        delta = Math.floor(now() - data.lastChange)

        if (delta > data.eventDelay * data.eventCountMax) {
            stop()
        }
        else if (delta > data.eventDelay * data.eventCount) {
            data.sounds.tong.play()
            data.eventCount = data.eventCount + 1
        }
        nextPossibleEvent = data.lastChange + data.eventDelay * (data.eventCount)
        delay = nextPossibleEvent - now()
        setTimeout(react, delay)
    } else {
        data.ref = null
        data.lastChange = null
        data.eventCount = null
    }
    return
}

/**
 * Get the string reprentation of a color given the Color dans the alpha value
 * @param {Color} color The color
 * @param {number} a The alpha of the color
 */
const getColor = (color, a) => {
    r = color[0]
    g = color[1]
    b = color[2]
    if (a === undefined) {
        a = 1
    }
    return `rgba(${r},${g},${b},${a})`
}
const getBgColor = (a) => getColor(data.bgColor, a)

/**
 * Get the string reprentation of a color given the color index inside the color structure dans the alpha value
 * @param {number} colorIndex The color index inside the color structure
 * @param {number} a The alpha of the color
 */
const getColorFromIndex = (colorIndex, a) => {
    const color = colors[colorIndex % (colors.length)]
    return getColor(color, a)
}

/**
 * Add a circle from it's position
 * @param {CirclePosition} position 
 */
const addCircle = (position) => {
    const { x, y, colorIndex } = position
    const ctx = data.ctx
    const width = data.width
    const dwidth = 2 * width
    for (const dx of range(0, dwidth)) {
        for (const dy of range(0, dwidth)) {
            const dd = (dx - width) * (dx - width) + (dy - width) * (dy - width)
            if (dd < width * width) {
                const d = Math.sqrt((dd) / (width * width))
                const f = 1 - (Math.pow(1 - Math.sqrt(1 - d), 3))
                ctx.fillStyle = getColorFromIndex(colorIndex, f)
                ctx.fillRect(x + dx - width, y + dy - width, 1, 1)
            }
        }
    }
}

/**
 * Add a dark circle inside a choice circle to show that the circle hasn't been chosen
 * @param {CirclePosition} position
 */
const addBackCircle = (position) => {
    const { x, y } = position
    const ctx = data.ctx
    const width = data.width * (2 / 3)
    const dwidth = 2 * width
    for (const dx of range(0, dwidth)) {
        for (const dy of range(0, dwidth)) {
            const dd = (dx - width) * (dx - width) + (dy - width) * (dy - width)
            if (dd < width * width) {
                const d = Math.sqrt((dd) / (width * width))
                const f = 1 - (Math.pow(1 - Math.sqrt(1 - d), 4))
                ctx.fillStyle = getBgColor(f)
                ctx.fillRect(x + dx - width, y + dy - width, 1, 1)
            }
        }
    }
}

/**
 * Remove the circle at the position
 * @param {CirclePosition} position
 */
const removeCircle = (position) => {
    const { x, y } = position
    const bgColor = getBgColor()
    const ctx = data.ctx
    const width = data.width
    const dwidth = 2 * width
    for (const dx of range(0, dwidth)) {
        for (const dy of range(0, dwidth)) {
            const dd = (dx - width) * (dx - width) + (dy - width) * (dy - width)
            if (dd < width * width) {
                ctx.fillStyle = bgColor
                ctx.fillRect(x + dx - width, y + dy - width, 1, 1)
            }
        }
    }
}

/**
 * Add a new circle at position (x,y) if there is room or remove the circle already at (x,y) if there is one
 * @param {number} x 
 * @param {number} y 
 */

const toogleOn = (x, y) => {
    let pindex = 0
    cleanIfEnded()
    for (const position of data.positions) {
        const distance = (position.x - x) * (position.x - x) + (position.y - y) * (position.y - y)
        if (distance < data.width * data.width) {
            removeCircle(position)
            data.positions.splice(pindex, 1)
            data.availableColorIndexes.push(position.colorIndex)
            react(true)
            return
        }
        if (distance < (2*data.width) * (2*data.width)) {
            return 
        }
        pindex += 1
    }
    if (data.availableColorIndexes.length > 0) {
        const nextColorIndex = data.availableColorIndexes.splice(Math.random() * data.availableColorIndexes.length, 1)[0]

        /** @type {CirclePosition} */
        const position = { x, y, colorIndex: nextColorIndex }
        data.positions.push(position)
        addCircle(position)
        data.sounds.dzang.play()

        react(true)
    }
}

/**
 * React on a click on the canvas
 * @param {MouseEvent} e 
 */
const onClick = (e) => {
    // console.log({ e })
    toogleOn(e.offsetX, e.offsetY)
}

/**
 * Init the whole application
 */
const init = async () => {
    const body = document.body

    addStyle('body { margin: 0; border: 0; padding: 0; position: relative; }')
    addStyle('.workspace,canvas { padding: 0; margin: 0; border: 0; position: fixed; top: 0; bottom: 0; left: 0; right: 0; }')

    const workspace = document.createElement('div')
    workspace.classList.add('workspace')
    body.appendChild(workspace)

    const canvas = document.createElement("canvas")
    workspace.appendChild(canvas)

    // const prefix = 'https://webgiss.github.io/chose-one/';
    const prefix = '';
    data.sounds = {
        ting: new Howl({ src: [prefix + 'sound/237105__sqeeeek__sqeeeek-bell-ting2.wav'] }),
        tong: new Howl({ src: [prefix + 'sound/237106__sqeeeek__sqeeeek-bell-ting1.wav'] }),
        dzang: new Howl({ src: [prefix + 'sound/170237__luttoaudio__glass-ting.wav'] }),
        blong: new Howl({ src: [prefix + 'sound/80427__phoenixdk__ploing.wav'] }),
    }

    canvas.width = workspace.clientWidth
    canvas.height = workspace.clientHeight

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = getBgColor()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    data.canvas = canvas
    data.ctx = ctx
    canvas.addEventListener("click", onClick, false)
    window.addEventListener("resize", clean, false)

    const hashWord = window.document.location.hash.substring(1)
    if (hashWord.length > 0) {
        const hashWords = hashWord.split(',')
        if (hashWords.length > 0) {
            const hashValue = parseInt(hashWords[0])
            if (!isNaN(hashValue)) {
                data.eventCountMax = hashValue
            }
        }
        if (hashWords.length > 1) {
            const hashValue = parseInt(hashWords[1])
            if (!isNaN(hashValue)) {
                data.eventDelay = hashValue
            }
        }
    }
}

readyPromise.then(init)
