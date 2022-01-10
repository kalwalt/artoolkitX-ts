importScripts('../../../dist/ARToolkitX.js')
self.onmessage = function (e) {
  var msg = e.data;
  switch (msg.type) {
    case 'load': {
      load(msg);
      return;
    }
    case 'process': {
      next = msg.imagedata;
      process();
      return;
    }
  }
};

var next = null;
var ar = null;
var markerResult = null;
var arController, camMatrix;
var _projectionMatPtr;
var _camera_count = 0;
var _cameraParaFileURL;
var videoWidth, videoHeight;
var trackable = {
  trackableType: "2d",
  url: '../../../examples/Data/pinball.jpg',
  //height: 1.0
}

/*var trackable = {
  trackableType: "single_barcode",
  barcodeId: 4
}*/

function load(msg) {

  ARToolkitX.ARControllerX.init(0, msg.camera_para, msg.pw, msg.ph).then((arController) => {
    console.log('arController is: ', arController);

    arController.addEventListener('getMarker', (trackableInfo) => {
      console.log("TrackableID: " + trackableInfo.data.trackableId);
      markerResult = {type: "found", matrixGL_RH: JSON.stringify(ev.data.transformation)};
    });
   
    try {

      arController.start().then(_ => {

        console.log('We are ready...');
        let cameraMatrix = arController.getCameraProjMatrix()
        console.log('camera projection matrix: ', cameraMatrix);
        // We send the camera matrix outside the worker
        postMessage({ type: 'loaded', proj: JSON.stringify(cameraMatrix) })
        if (trackable) {
          var trackableId = arController.addTrackable(trackable);
        }
        setInterval(function () {
          ar = arController;
        }, 13)
      })
      
    } catch (e) {
      console.error(e)
    }

  })

  console.debug('Loading camera at:', msg.camera_para);

}

function process() {

  markerResult = null;

  if (ar && ar.process) {
    ar.process(next);
  }

  if (markerResult) {
    postMessage(markerResult);
  } else {
    postMessage({ type: 'not found' });
  }

  next = null;
}
