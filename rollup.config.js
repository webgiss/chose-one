import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from "rollup-plugin-uglify"
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'

const iconSizes = [16, 32, 48, 64, 96, 144, 152, 167, 180, 192, 196, 228, 230]

export default {
    input: 'src/choseone.js',
    output: {
        file: 'dist/choseone.js',
        format: 'cjs'
    },
    plugins: [
        resolve(),
        babel(),
        uglify(),
        commonjs(),
        copy({
            targets: [
                { src: 'src/index.html', dest: 'dist' },
                {
                    src:
                        [
                            'src/sound/170237__luttoaudio__glass-ting.wav',
                            'src/sound/237105__sqeeeek__sqeeeek-bell-ting2.wav',
                            'src/sound/237106__sqeeeek__sqeeeek-bell-ting1.wav',
                            'src/sound/80427__phoenixdk__ploing.wav',
                        ],
                    dest: 'dist/sound',
                },
                { src: 'src/browserconfig.xml', dest: 'dist' },
                { src: 'res/chose-one.ico', dest: 'dist', rename: 'favicon.ico' },
                ...iconSizes.map((size) => ({ src: `res/chose-one-${size}.png`, dest: 'dist', rename: `favicon-${size}.png` }))
            ]
        }),
    ],
}
