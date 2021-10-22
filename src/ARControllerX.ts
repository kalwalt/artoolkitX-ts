/*
 *  ARControllerX.ts
 *  ARToolKitX-ts
 *
 *  This file is part of ARToolKitX-ts - WebARKit.
 *
 *  ARToolKitX-ts is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  ARToolKitX-ts is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with ARToolKitX-ts.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  As a special exception, the copyright holders of this library give you
 *  permission to link this library with independent modules to produce an
 *  executable, regardless of the license terms of these independent modules, and to
 *  copy and distribute the resulting executable under terms of your choice,
 *  provided that you also meet, for each linked independent module, the terms and
 *  conditions of the license of that module. An independent module is a module
 *  which is neither derived from nor based on this library. If you modify this
 *  library, you may extend this exception to your version of the library, but you
 *  are not obligated to do so. If you do not wish to do so, delete this exception
 *  statement from your version.
 *
 *  Copyright 2021 WebARKit.
 *
 *  Author(s): Walter Perdan @kalwalt https://github.com/kalwalt
 *
 */
import ARToolkitX from './ARToolkitX'
import Utils from './Utils'
 
interface Options {
  canvas: null,
  orientation: string,
}

interface ImageObj {
  videoWidth: number,
  width: number,
  videoHeight: number,
  height: number,
  data: Uint8ClampedArray,
}

interface ITrackable {
  trackableId: number;
  transformation: Float64Array;
  arCameraViewRH?: Float64Array;
  visible?: boolean;
  scale?: number;
}

interface ITrackableObj {
  width: number;
  height: number;
  trackableType: string;
  barcodeId: number;
  url: string;
}

interface IPatternDetectionObj {
  barcode: boolean,
  template: boolean,

}

interface delegateMethods {
  initialiseAR: () => number;
  getARToolKitVersion: () => number;
  setLogLevel: (mode: boolean) => number;
  getLogLevel: () => number;
  instance: {
    HEAPU8: {
      buffer: Uint8Array
    };
  }
  loadCameraParam: (cameraParam: string) => Promise<string>;
  arwStartRunningJS: (arCameraURL: string, width: number, height: number) => number;
  pushVideoInit: (n: number, width: number, height: number, pixelformat: string, a: number, b: number) => number;
  isInitialized: () => boolean;
  _arwUpdateAR: () => number;
  _queryTrackableVisibility: (id: number) => Float64Array;
  _malloc: (numBytes: number) => number;
  _free: (pointer: number) => void;
  _arwGetProjectionMatrix: (nearPlane: number, farPlane: number, pointer: number) => Float64Array;
  videoMalloc: {
    framepointer: number;
    framesize: number;
    videoLumaPointer: number;
    lumaFramePointer: number;
    newFrameBoolPtr: number;
    fillFlagIntPtr: number;
    timeSecPtr: number;
    timeMilliSecPtr: number;
    camera: number;
    transform: number
  };
  setValue: (pointer: number, a: number, type: string) => void;
  _arwCapture: () => number;
  stopRunning: () => void;
  shutdownAR: () => void;
  addTrackable: (config: string) => number;
  setTrackerOptionInt: (value: number, mode: number) => number;
  TrackableOptions: {
    ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE: { value: number}
  }
  AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX: number;
  AR_MATRIX_CODE_DETECTION: number;
  AR_TEMPLATE_MATCHING_COLOR: number;
}

const ORIENTATION = {
  0: 'portrait',
  180: 'portrait',
  90: 'landscape'
}

export default class ARControllerX {
  // private declarations
  private options = {} as Options;
  private id: number;
  private width: number;
  private height: number;
  private image: any;
  private imageData: any;
  private orientation: string;
  private cameraParam: string;
  private cameraParaFileURL: string;
  private _projectionMatPtr: number;
  private cameraId: number;
  private cameraLoaded: boolean;
  private artoolkitX: delegateMethods;
  private listeners: object;
  private trackables: Array<ITrackable>;
  private transform_mat: Float64Array;
  private _transMatPtr: number;
  private marker_transform_mat: Float64Array;
  private transformGL_RH: Float64Array;
  private videoWidth: number;
  private videoHeight: number;
  private videoSize: number;
  private framepointer: number;
  private framesize: number;
  private dataHeap: Uint8Array;
  private videoLuma: Uint8ClampedArray;
  private camera_mat: Float32Array;
  private videoLumaPointer: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private defaultMarkerWidth: number;
  private default2dHeight: number;
  private _patternDetection: IPatternDetectionObj;
  private userSetPatternDetection: boolean;
  private _marker_count: number;
  private has2DTrackable: boolean;
  private _bwpointer: number;

  /**
   * The ARControllerX constructor. It has 4 params (see above).
   * These properties are initialized:
   * options, id, width, height, image, orientation, cameraParam, cameraId,
   * cameraLoaded, artoolkitX, listeners, nftMarkers, transform_mat,
   * transformGL_RH, marker_transform_mat, videoWidth, videoHeight, videoSize,
   * framepointer, framesize, dataHeap, videoLuma, camera_mat, videoLumaPointer
   * @param {number} width
   * @param {number} height
   * @param {string} cameraParam
   * @param {object} options
   */
  constructor(image: object, cameraPara: string, confWidth: number, confHeight: number) {
    this.id = -1

    this.width = confWidth
    this.height = confHeight

    // holds an image in case the instance was initialized with an image
    this.image

    // default camera orientation
    this.orientation = this.options.orientation

    // this is a replacement for ARCameraParam
    //this.cameraParam = cameraParam
    this.cameraParaFileURL = cameraPara
    this.cameraId = -1
    this.cameraLoaded = false
    this._projectionMatPtr
    this._transMatPtr

    // toolkit instance
    this.artoolkitX

    // to register observers as event listeners
    this.listeners = {}

    this.trackables = []

    this.transform_mat = new Float64Array(16)
    this.transformGL_RH = new Float64Array(16)
    this.marker_transform_mat = null

    this.videoWidth = confWidth
    this.videoHeight = confHeight
    this.videoSize = this.videoWidth * this.videoHeight

    this.framepointer = null
    this.framesize = null
    this.dataHeap = null
    this.videoLuma = null
    this.camera_mat = null
    this.videoLumaPointer = null

    if (this.options.canvas) {
      // in case you use Node.js, create a canvas with node-canvas
      this.canvas = this.options.canvas
    } else if (typeof document !== 'undefined') {
      // try creating a canvas from document
      this.canvas = document.createElement('canvas') as HTMLCanvasElement
    }
    if (this.canvas) {
      this.canvas.width = confWidth
      this.canvas.height = confHeight
      this.ctx = this.canvas.getContext('2d')
    } else {
      console.warn('No canvas available')
    }

    this._bwpointer = null
    this.defaultMarkerWidth = 80
    this.default2dHeight = 0.001
    this.has2DTrackable
  }

  static async init(image: ImageObj, cameraUrl: string, width: number, height: number) {
    const _arx = new ARControllerX(image, cameraUrl, width, height);
    return await _arx._initialize();
  }

  private async _initialize() {
    // initialize the toolkit
    this.artoolkitX = await new ARToolkitX().init();
    console.log('[ARControllerX]', 'ARToolkitX initialized');
    setTimeout(() => {
      this.dispatchEvent({
        name: 'load',
        target: this
      })
    }, 1);
    return this;
  }

  async start() {
    let success = this.artoolkitX.initialiseAR()
    if (success) {
      console.debug('Version: ' + this.artoolkitX.getARToolKitVersion())
      // Only try to load the camera parameter file if an URL was provided
      let arCameraURL: string = ''
      console.log(this.cameraParaFileURL);

      if (this.cameraParaFileURL !== '') {
        try {
          arCameraURL = await this.artoolkitX.loadCameraParam(this.cameraParaFileURL)
          console.log(arCameraURL);

        } catch (e) {
          throw new Error('Error loading camera param: ' + e)
        }
      }
      success = this.artoolkitX.arwStartRunningJS(arCameraURL, this.videoWidth, this.videoHeight)
      console.log(success);

      if (success >= 0) {
        console.info(' artoolkitX-ts started')
        success = this.artoolkitX.pushVideoInit(0, this.videoWidth, this.videoHeight, 'RGBA', 0, 0)
        if (success < 0) {
          throw new Error('Error while starting')
        }
      } else { throw new Error('Error while starting') }
    } else {
      throw new Error('Error while starting')
    }

  }

  /**
        Destroys the ARController instance and frees all associated resources.
        After calling dispose, the ARController can't be used any longer. Make a new one if you need one.

        Calling this avoids leaking Emscripten memory.
    */
  public dispose() {
    this.artoolkitX._free(this._transMatPtr)
    /*if (this.image && this.image.srcObject) {
      this[_teardownVideo]()
    }*/
    this.artoolkitX.stopRunning()
    this.artoolkitX.shutdownAR()
    for (var t in this) {
      this[t] = null
    }
  };

  /**
   * This is one of the most important method inside ARControllerNFT. It detect the marker
   * and dispatch internally with the getNFTMarker event listener the NFTMarkerInfo
   * struct object of the tracked NFT Markers.
   * @param {image} image or image data
   * @return {void}
   */
  public async process(image: ImageObj) {
    if (!image) { image = this.image }

    if (!this.artoolkitX.isInitialized()) {
      try {
        await this.start()
      } catch (e) {
        console.error('Unable to start running')
      }
      this._processImage(image)
    } else {
      this._processImage(image)
    }
  }

  public _processImage(image: ImageObj) {
    try {
      this._prepareImage(image)
      const success = this.artoolkitX._arwUpdateAR()

      if (success >= 0) {
        this.trackables.forEach((trackable) => {
          var that = this;
          const transformation = this.artoolkitX._queryTrackableVisibility(trackable.trackableId)
          if (transformation) {
            trackable.transformation = transformation
            trackable.arCameraViewRH = this.arglCameraViewRHf(transformation)
            trackable.visible = true
            trackable.scale = this.canvas.height / this.canvas.width
            try {
              this.dispatchEvent({
                name: 'getMarker',
                target: this,
                data: trackable
              })
            } catch (e) {
              console.error('Error during trackable found event processing ' + e)
            }
          } else {
            trackable.visible = false
          }
        }, this)
      }
    } catch (e) {
      console.error('Unable to detect marker: ' + e)
    }
  }

  /**
     * Sets imageData and videoLuma as properties to ARControllerX object to be used for marker detection.
     * Copies the video image and luma buffer into the HEAP to be available for the compiled C code for marker detection.
     * Sets newFrame and fillFlag in the compiled C code to signal the marker detection that a new frame is available.
     *
     * @param {HTMLImageElement|HTMLVideoElement} [image] The image to prepare for marker detection
     * @returns {boolean} true if successfull
     * @private
     */
  private _prepareImage(image: any) {
    if (!image) {
      image = this.image
    }

    this.ctx.save()

    if ('orientation' in window && Math.abs(window.orientation) !== 90) {
      // portrait
      this.ctx.translate(this.canvas.width, 0)
      this.ctx.rotate(Math.PI / 2)
      this.ctx.drawImage(image, 0, 0, this.canvas.height, this.canvas.width) // draw video
      this.orientation = ORIENTATION[0]
    } else {
      this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height) // draw video
      this.orientation = ORIENTATION[90]
    }

    this.ctx.restore()
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data // this is of type Uint8ClampedArray: The Uint8ClampedArray typed array represents an array of 8-bit unsigned integers clamped to 0-255 (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)
    this.imageData = data

    // Here we have access to the unmodified video image. We now need to add the videoLuma chanel to be able to serve the underlying ARTK API
    let q = 0
    const videoLuma = new Uint8ClampedArray(data.length / 4)
    // Create luma from video data assuming Pixelformat AR_PIXEL_FORMAT_RGBA (ARToolKitJS.cpp L: 43)
    for (let p = 0; p < this.videoSize; p++) {
      const r = data[q + 0]; const g = data[q + 1]; const b = data[q + 2]
      videoLuma[p] = (r + r + r + b + g + g + g + g) >> 3 // https://stackoverflow.com/a/596241/5843642
      q += 4
    }
    // Get access to the video allocation object
    const videoMalloc = this.artoolkitX.videoMalloc
    // Copy luma image
    const videoFrameLumaBytes = new Uint8Array(this.artoolkitX.instance.HEAPU8.buffer, videoMalloc.lumaFramePointer, videoMalloc.framesize / 4)
    videoFrameLumaBytes.set(videoLuma)
    this.videoLuma = videoLuma

    // Copy image data into HEAP. HEAP was prepared during videoWeb.c::ar2VideoPushInitWeb()
    const videoFrameBytes = new Uint8Array(this.artoolkitX.instance.HEAPU8.buffer, videoMalloc.framepointer, videoMalloc.framesize)
    videoFrameBytes.set(data)
    this.framesize = videoMalloc.framesize

    this.artoolkitX.setValue(videoMalloc.newFrameBoolPtr, 1, 'i8')
    this.artoolkitX.setValue(videoMalloc.fillFlagIntPtr, 1, 'i32')

    // Provide a timestamp to each frame because arvideo2.arUtilTimeSinceEpoch() seems not to perform well with Emscripten.
    // It internally calls gettimeofday which should not be used with Emscripten according to this: https://github.com/urho3d/Urho3D/issues/916
    // which says that emscripten_get_now() should be used. However, this seems to have issues too https://github.com/kripken/emscripten/issues/5893
    // Basically because it relies on performance.now() and performance.now() is supposedly slower then Date.now() but offers greater accuracy.
    // Or rather should offer but does not anymore because of Spectre (https://en.wikipedia.org/wiki/Spectre_(security_vulnerability))
    // Bottom line as performance.now() is slower then Date.now() (https://jsperf.com/gettime-vs-now-0/7) and doesn't offer higher accuracy and we
    // would be calling it for each video frame I decided to read the time per frame from JS and pass it in to the compiled C-Code using a pointer.
    const time = Date.now()
    const seconds = Math.floor(time / 1000)
    const milliSeconds = time - seconds * 1000
    this.artoolkitX.setValue(videoMalloc.timeSecPtr, seconds, 'i32')
    this.artoolkitX.setValue(videoMalloc.timeMilliSecPtr, milliSeconds, 'i32')

    const ret = this.artoolkitX._arwCapture()

    /*if (this.debug) {
      this.debugDraw()
    }*/
    return ret
  };

  /**
  * Returns the projection matrix computed from camera parameters for the ARControllerX.
  * @param nearPlane {number} the near plane value of the camera.
  * @param farPlane {number} the far plane value of the camera.
  * @return {Float32Array} The 16-element WebGL camera matrix for the ARControllerX camera parameters.
  */
  public getCameraProjMatrix(nearPlane = 0.1, farPlane = 1000) {
    const cameraMatrixElements = 16
    const numBytes: number = cameraMatrixElements * Float32Array.BYTES_PER_ELEMENT
    this._projectionMatPtr = this.artoolkitX._malloc(numBytes)
    // Call compiled C-function directly using '_' notation
    // https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-direct-function-calls
    const cameraMatrix = this.artoolkitX._arwGetProjectionMatrix(nearPlane, farPlane, this._projectionMatPtr)
    this.camera_mat = new Float32Array(this.artoolkitX.instance.HEAPU8.buffer, this._projectionMatPtr, cameraMatrixElements)
    if (cameraMatrix) {
      return this.camera_mat
    }
    return undefined
  }

  /**
     * Loads a trackable into the artoolkitX contect by calling addTrackable on the artoolkitX native interface
     *
     * @param {object} trackableObj -
     *              {
     *                  trackableType:  {string} 'single_barcode' / 'multi' / 'single' / '2d'
     *                  url: {string} '<URL to the trackable file in case of multi, single or 2d>'
     *                  barcodeId: {number}
     *                  width: {number} defaults to this.markerWidth if not set
     *                  height: {number} if 2D trackable reflects height of trackable. If not set defaults to default2dHeight
     *              }
     * @returns {Promise} which resolves into a {number} trackable id if successfull or thorws an error
     */
  public async addTrackable(trackableObj: ITrackableObj) {
    if (!trackableObj.width) { trackableObj.width = this.defaultMarkerWidth }
    if (!trackableObj.height) trackableObj.height = this.default2dHeight
    let fileName, trackableId
    if (trackableObj.trackableType.includes('single') || trackableObj.trackableType.includes('2d')) {
      if (trackableObj.barcodeId !== undefined) {
        fileName = trackableObj.barcodeId
        if (!this._patternDetection.barcode) {
          this._patternDetection.barcode = true
        }
      } else {
        try {
          fileName = await this._loadTrackable(trackableObj.url)
        } catch (error) {
          throw new Error('Error to load trackable: ' + error)
        }
        if (!this._patternDetection.template) {
          this._patternDetection.template = true
        }
      }
      if (trackableObj.trackableType.includes('2d')) {
        this.has2DTrackable = true
        trackableId = this.artoolkitX.addTrackable(trackableObj.trackableType + ';' + fileName + ';' + trackableObj.height)
      } else {
        trackableId = this.artoolkitX.addTrackable(trackableObj.trackableType + ';' + fileName + ';' + trackableObj.width)
      }
    }

    if (trackableId >= 0) {
      this.trackables.push({ trackableId: trackableId, transformation: (new Float64Array(16)), visible: false })
      if (!this.userSetPatternDetection) { this._updateDetectionMode() }
      return trackableId
    }
    throw new Error('Faild to add Trackable: ' + trackableId)
  }


  // event handling
  //----------------------------------------------------------------------------

  /**
   * Add an event listener on this ARControllerNFT for the named event, calling the callback function
   * whenever that event is dispatched.
   * Possible events are:
   * - getMarker - dispatched whenever process() finds a square marker
   * - getMultiMarker - dispatched whenever process() finds a visible registered multimarker
   * - getMultiMarkerSub - dispatched by process() for each marker in a visible multimarker
   * - load - dispatched when the ARControllerNFT is ready to use (useful if passing in a camera URL in the constructor)
   * @param {string} name Name of the event to listen to.
   * @param {function} callback Callback function to call when an event with the given name is dispatched.
   */
  addEventListener(name: string, callback: object) {
    if (!this.converter().listeners[name]) {
      this.converter().listeners[name] = [];
    }
    this.converter().listeners[name].push(callback);
  };

  /**
   * Remove an event listener from the named event.
   * @param {string} name Name of the event to stop listening to.
   * @param {function} callback Callback function to remove from the listeners of the named event.
   */
  removeEventListener(name: string, callback: object) {
    if (this.converter().listeners[name]) {
      let index = this.converter().listeners[name].indexOf(callback);
      if (index > -1) {
        this.converter().listeners[name].splice(index, 1);
      }
    }
  };

  /**
   * Dispatches the given event to all registered listeners on event.name.
   * @param {Object} event Event to dispatch.
   */
  dispatchEvent(event: { name: string; target: any; data?: object }) {
    let listeners = this.converter().listeners[event.name];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].call(this, event);
      }
    }
  };


  /**
   * Converts the given 3x4 marker transformation matrix in the 12-element transMat array
   * into a 4x4 WebGL matrix and writes the result into the 16-element glMat array.
   * If scale parameter is given, scales the transform of the glMat by the scale parameter.
   * @param {Float64Array} transMat The 3x4 marker transformation matrix.
   * @param {Float64Array} glMat The 4x4 GL transformation matrix.
   * @param {number} scale The scale for the transform.
   */
  transMatToGLMat(transMat: Float64Array, glMat: Float64Array, scale?: number,) {
    if (glMat == undefined) {
      glMat = new Float64Array(16)
    }

    glMat[0 + 0 * 4] = transMat[0] // R1C1
    glMat[0 + 1 * 4] = transMat[1] // R1C2
    glMat[0 + 2 * 4] = transMat[2]
    glMat[0 + 3 * 4] = transMat[3]
    glMat[1 + 0 * 4] = transMat[4] // R2
    glMat[1 + 1 * 4] = transMat[5]
    glMat[1 + 2 * 4] = transMat[6]
    glMat[1 + 3 * 4] = transMat[7]
    glMat[2 + 0 * 4] = transMat[8] // R3
    glMat[2 + 1 * 4] = transMat[9]
    glMat[2 + 2 * 4] = transMat[10]
    glMat[2 + 3 * 4] = transMat[11]
    glMat[3 + 0 * 4] = 0.0
    glMat[3 + 1 * 4] = 0.0
    glMat[3 + 2 * 4] = 0.0
    glMat[3 + 3 * 4] = 1.0

    if (scale != undefined && scale !== 0.0) {
      glMat[12] *= scale
      glMat[13] *= scale
      glMat[14] *= scale
    }
    return glMat
  };

  /**
   * Converts the given 4x4 openGL matrix in the 16-element transMat array
   * into a 4x4 OpenGL Right-Hand-View matrix and writes the result into the 16-element glMat array.
   * If scale parameter is given, scales the transform of the glMat by the scale parameter.
   * @param {Float64Array} glMatrix The 4x4 marker transformation matrix.
   * @param {Float64Array} [glRhMatrix] The 4x4 GL right hand transformation matrix.
   * @param {number} [scale] The scale for the transform.
   */
  arglCameraViewRHf(glMatrix: Float64Array, glRhMatrix?: Float64Array, scale?: number) {
    let m_modelview
    if (glRhMatrix == undefined) { m_modelview = new Float64Array(16) } else { m_modelview = glRhMatrix }

    // x
    m_modelview[0] = glMatrix[0]
    m_modelview[4] = glMatrix[4]
    m_modelview[8] = glMatrix[8]
    m_modelview[12] = glMatrix[12]
    // y
    m_modelview[1] = -glMatrix[1]
    m_modelview[5] = -glMatrix[5]
    m_modelview[9] = -glMatrix[9]
    m_modelview[13] = -glMatrix[13]
    // z
    m_modelview[2] = -glMatrix[2]
    m_modelview[6] = -glMatrix[6]
    m_modelview[10] = -glMatrix[10]
    m_modelview[14] = -glMatrix[14]

    // 0 0 0 1
    m_modelview[3] = 0
    m_modelview[7] = 0
    m_modelview[11] = 0
    m_modelview[15] = 1

    if (scale != undefined && scale !== 0.0) {
      m_modelview[12] *= scale
      m_modelview[13] *= scale
      m_modelview[14] *= scale
    }

    glRhMatrix = m_modelview

    return glRhMatrix
  }

  /**
   * Returns the 16-element WebGL transformation matrix used by ARControllerX process to
   * pass marker WebGL matrices to event listeners.
   * Unique to each ARControllerX.
   * @return {Float64Array} The 16-element WebGL transformation matrix used by the ARControllerX.
   */
  getTransformationMatrix() {
    return this.transform_mat
  };

  /**
   * Returns the projection matrix computed from camera parameters for the ARControllerX.
   * @return {Float64Array} The 16-element WebGL camera matrix for the ARControllerX camera parameters.
   */
  getCameraMatrix() {
    return this.camera_mat
  };


  /**
   * Sets the logging level to use by ARToolKitX.
   * @param {number} mode type for the log level.
   */
  setLogLevel(mode: boolean) {
    return this.artoolkitX.setLogLevel(mode);
  };

  /**
   * Gets the logging level used by ARToolKit.
   * @return {number} return the log level in use.
   */
  getLogLevel() {
    return this.artoolkitX.getLogLevel();
  };

  public async _loadTrackable(url: string) {
    var filename = '/trackable_' + this._marker_count++
    try {
      await Utils.fetchRemoteData(url)
      return filename
    } catch (e) {
      console.log(e)
      return e
    }
  }

  /**
       Set the pattern detection mode

       The pattern detection determines the method by which ARToolKitX
       matches detected squares in the video image to marker templates
       and/or IDs. ARToolKitX v4.x can match against pictorial "template" markers,
       whose pattern files are created with the mk_patt utility, in either colour
       or mono, and additionally can match against 2D-barcode-type "matrix"
       markers, which have an embedded marker ID. Two different two-pass modes
       are also available, in which a matrix-detection pass is made first,
       followed by a template-matching pass.

       @param {number} mode
           Options for this field are:
           artoolkitX.AR_TEMPLATE_MATCHING_COLOR
           artoolkitX.AR_TEMPLATE_MATCHING_MONO
           artoolkitX.AR_MATRIX_CODE_DETECTION
           artoolkitX.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX
           artoolkitX.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
           The default mode is AR_TEMPLATE_MATCHING_COLOR.
   */
  public setPatternDetectionMode(mode: number) {
    this.userSetPatternDetection = true
    return this._setPatternDetectionMode(mode)
  };


  /**
    * Private function to set the pattenr detection mode.
    * It is implemented like this to have the posibility to let the user set the pattern detection mode
    * by still providing the automatism to allow to set the pattern detection mode depending on the registered trackables (see {@link #addTrackable}).
    * @param {*} mode see {@link #setPatternDetectionMode}
    */
  private _setPatternDetectionMode(mode: number) {
    return this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE.value, mode)
  }

  /**
   * For ease of use check what kinds of markers have been added and set the detection mode accordingly
   */
  _updateDetectionMode() {
    if (this._patternDetection.barcode && this._patternDetection.template) {
      this.setPatternDetectionMode(this.artoolkitX.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX)
    } else if (this._patternDetection.barcode) {
      this.setPatternDetectionMode(this.artoolkitX.AR_MATRIX_CODE_DETECTION)
    } else {
      this.setPatternDetectionMode(this.artoolkitX.AR_TEMPLATE_MATCHING_COLOR)
    }
  }

  // private accessors
  // ----------------------------------------------------------------------------
  /**
   * Used internally by ARControllerX, it permit to add methods to this.
   * @return {any} ARControllerX
   */
  private converter(): any {
    return this;
  }

}