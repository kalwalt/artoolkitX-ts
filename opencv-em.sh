#!/usr/bin/env bash
if [ ! -d "opencv-em/include/opencv2" ] ; then
        curl --location "https://github.com/webarkit/opencv-em/releases/download/0.1.6/opencv-js-4.10.0-emcc-3.1.38-simd.zip" -o opencv2.zip
        unzip opencv2.zip -d opencv-em
        rm opencv2.zip
fi

if [ ! -d "emscripten/artoolkitx/artoolkitX/SDK/include/ARX/AR/config.h" ] ; then
        curl --location 'https://github.com/artoolkitx/artoolkitx/releases/download/1.1.21/artoolkitx-1.1.21-Emscripten.zip' -o artoolkitx.zip
        unzip artoolkitx.zip -d emscripten/artoolkitx
        rm artoolkitx.zip
fi