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
First install all nodejs dependencies:

`npm install`

For a development build run:

`npm run dev-ts`

For a production-optimized build run:

`npm run build-ts`

### Future plans

- Add support for 2d markers! (only experimental examples for now!)
- npm package
