# artoolkitX-ts
**artoolkitX-ts** is the Typescript version of [ArtoolkitX.js](https://github.com/webarkit/artoolkitX.js), the first emscripten port of [ARToolkitX](https://github.com/artoolkitx/artoolkitx).
Most of the features are in the library, but it's in an experimental stage. Actually it can track only barcode and pattern markers but we plan to add support for 2d markers too.

## Examples
Test the examples:
- `examples/simple_image.html` it load a simple static image and output some message in the console.
- `examples/simple_barcode.html` barcode example - a colored cube should appear on the barcode marker.
- `examples/simple_hiro.html` pattern example - a colored cube should appear on the hiro marker.
- `examples/simple_2d_tracking.html` 2d tracking example with the pinball image - very bad perfs.
- `examples/ArtoolkitX_example.html` 2d tracking example in a WebWorker with the pinball image - very bad perfs.

## Contributing
You can contribute to the project, just file an issue and send a PR: you are welcome!
Follow the **Build** instructions if you make changes to the code.

### Build
We use webpack as bundler, you need to rebuild the dist lib if you make changes.
If you make changes to the C/C++ Source code you need to build the whole project.
First of all you need to clone the **artoolkitX_em_2d** submodule:
`git submodule update --init`
then run the `configure.sh` script inside the main folder:
`./configure.sh`
the script will run cmake and will create the config.h file necessary for the compilation. After this step you can install all nodejs dependencies:

`npm install`

You need emsdk 2.0.20 to build the wasm module, check if you have installed with `emcc -v`. So if you have installed it run the command:

`npm run build`

For a development dist build run:

`npm run dev-ts`

For a production-optimized dits build run:

`npm run build-ts`

this will produce ARToolkitX.js dist lib.

### Future plans

- Add support for 2d markers! (only experimental examples for now!)
- NFT markers
- improved new build script for the wasm lib.
- npm package
- multi pattern marker support.
