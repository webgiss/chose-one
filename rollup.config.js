import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from "rollup-plugin-uglify"
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'


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
            ]
        }),
    ],
}
