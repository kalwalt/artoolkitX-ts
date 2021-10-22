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
  width: 1.0
}

function load(msg) {

  ARToolkitX.ARControllerX.init(0, msg.camera_para, msg.pw, msg.ph).then((arController) => {
    console.log('arController is: ', arController);
    
    arController.start().then(_ => {

      console.log('We are ready...');
      let cameraMatrix = arController.getCameraProjMatrix()
      console.log('camera projection matrix: ', cameraMatrix);
      // We send the camera matrix outside the worker
      postMessage({ type: 'loaded', proj: JSON.stringify(cameraMatrix) })
      // This line will pass imageData through the process() function... not ready yet...
      // ar = arController;
      var trackableId = arController.addTrackable(trackable);
      console.log(trackableId);
      arController.addEventListener('getMarker', function(e){
        console.log(e);
      })
    })
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
