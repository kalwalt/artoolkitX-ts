function isMobile() {
  return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}

var setMatrix = function (matrix, value) {
  var array = [];
  for (var key in value) {
    array[key] = value[key];
  }
  if (typeof matrix.elements.set === "function") {
    matrix.elements.set(array);
  } else {
    matrix.elements = [].slice.call(array);
  }
};


function start(markerUrl, video, input_width, input_height, render_update, track_update) {
  var vw, vh;
  var worker;
  var camera_para = '../../../examples/Data/camera_para.dat'

  var canvas_process = document.createElement('canvas');
  var context_process = canvas_process.getContext('2d');
  var targetCanvas = document.querySelector("#canvas");

  var renderer = new THREE.WebGLRenderer({ canvas: targetCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  var scene = new THREE.Scene();

  let fov = 0.8 * 180 / Math.PI;
  const camera = new THREE.PerspectiveCamera(fov, vw / vh, 0.01, 1000);

  scene.add(camera);

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8),
    new THREE.MeshNormalMaterial()
  );

  var root = new THREE.Object3D();
  scene.add(root);

  sphere.material.flatShading;
  sphere.position.z = 0;
  sphere.position.x = 100;
  sphere.position.y = 100;
  sphere.scale.set(200, 200, 200);

  root.matrixAutoUpdate = false;
  root.add(sphere);

  var load = function () {
    vw = input_width;
    vh = input_height;

    canvas_process.width = vw;
    canvas_process.height = vh;

    renderer.setSize(vw, vh);

    worker = new Worker('./Data/js/artoolkitxES6.worker.js')

    worker.postMessage({ type: "load", pw: vw, ph: vh, camera_para: camera_para, marker: markerUrl });

    worker.onmessage = function (ev) {
      var msg = ev.data;
      switch (msg.type) {
        case "loaded": {
          var proj = JSON.parse(msg.proj);
          camera.projectionMatrix.fromArray(proj);
          camera.updateProjectionMatrix();
          break;
        }
        case "endLoading": {
          if (msg.end == true) {
            // removing loader page if present
            var loader = document.getElementById('loading');
            if (loader) {
              loader.querySelector('.loading-text').innerText = 'Start the tracking!';
              setTimeout(function () {
                loader.parentElement.removeChild(loader);
              }, 2000);
            }
          }
          break;
        }
        case 'found': {
          found(msg);
          break;
        }
        case 'not found': {
          found(null);
          break;
        }
      }
      track_update();
      process();
    };
  };

  var world;

  var found = function (msg) {
    if (!msg) {
      world = null;
    } else {
      world = JSON.parse(msg.matrixGL_RH);
    }
  };

  var lasttime = Date.now();
  var time = 0;

  var draw = function () {
    render_update();
    var now = Date.now();
    var dt = now - lasttime;
    time += dt;
    lasttime = now;

    if (!world) {
      sphere.visible = false;
    } else {
      sphere.visible = true;
      // set matrix of 'root' by detected 'world' matrix
      setMatrix(root.matrix, world);
    }
    renderer.render(scene, camera);
  };

  var process = function () {
    context_process.fillStyle = 'black';
    context_process.fillRect(0, 0, vw, vh);
    context_process.drawImage(video, 0, 0, vw, vh)
    var imageData = context_process.getImageData(0, 0, vw, vh);
    worker.postMessage({ type: 'process', imagedata: imageData }, [imageData.data.buffer]);
  }
  var tick = function () {
    draw();
    requestAnimationFrame(tick);
  };

  load();
  tick();
  process();
}