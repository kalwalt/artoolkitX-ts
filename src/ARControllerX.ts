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
import Utils from './ARXUtils'
 
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
  transformation: Float32Array;
  arCameraViewRH?: Float32Array;
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
    videoMalloc: {
      framepointer: number;
      framesize: number;
      videoLumaPointer: number;
      lumaFramePointer: number;
      newFrameBoolPtr: number;
      fillFlagIntPtr: number;
      timeSecPtr: number;
      timeMilliSecPtr: number
    };
    FS: {
      writeFile: (target: string, data: Uint8Array, { }: object) => void;
    };
    setValue: (pointer: number, a: number, type: string) => void;
  }
  loadCameraParam: (cameraParam: string) => Promise<string>;
  arwStartRunningJS: (arCameraURL: string, width: number, height: number) => number;
  pushVideoInit: (n: number, width: number, height: number, pixelformat: string, a: number, b: number) => number;
  isInitialized: () => boolean;
  _arwUpdateAR: () => number;
  _malloc: (numBytes: number) => number;
  _free: (pointer: number) => void;
  _arwGetProjectionMatrix: (nearPlane: number, farPlane: number, pointer: number) => Float32Array;
  videoMalloc: {
    framepointer: number;
    framesize: number;
    videoLumaPointer: number;
    lumaFramePointer: number;
    newFrameBoolPtr: number;
    fillFlagIntPtr: number;
    timeSecPtr: number;
    timeMilliSecPtr: number
  };
  _arwQueryTrackableVisibilityAndTransformation: (id: number, pointer: number) => Float32Array;
  setValue: (pointer: number, a: number, type: string) => void;
  _arwCapture: () => number;
  stopRunning: () => void;
  shutdownAR: () => void;
  addTrackable: (config: string) => number;
  setTrackerOptionInt: (value: number, mode: number) => void;
  getTrackerOptionInt: (value: number) => number;
  setTrackerOptionFloat: (value: number, mode: number) => void;
  getTrackerOptionFloat: (value: number) => number;
  TrackableOptions: {
    ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_THRESHOLD:  { value: number};
    ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_LABELING_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE:  { value: number};
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
  private defaultMarkerWidth: number;
  private default2dHeight: number;
  private _patternDetection: IPatternDetectionObj;
  private userSetPatternDetection: boolean;
  private _marker_count: number;
  private has2DTrackable: boolean;
  private _bwpointer: number;
  private threshold: number;

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
    this._marker_count = 0

    this.width = confWidth
    this.height = confHeight

    // holds an image in case the instance was initialized with an image
    this.image = image

    // default camera orientation
    this.orientation

    this.cameraParaFileURL = cameraPara
    this.cameraId = -1
    this.cameraLoaded = false
    this._projectionMatPtr
    this._transMatPtr

    // toolkit instance
    this.artoolkitX

    // to register observers as event listeners
    this.listeners = {}
    this._patternDetection = {
      barcode: false,
      template: false,
    }

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

    this._bwpointer = null
    this.defaultMarkerWidth = 80
    this.default2dHeight = 0.001
    this.has2DTrackable
    this.threshold
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
   * This is one of the most important method inside ARControllerX.
   * @param {image} image image data
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
          const transformation = this._queryTrackableVisibility(trackable.trackableId)
          if (transformation) {
            trackable.transformation = transformation
            trackable.arCameraViewRH = this.arglCameraViewRHf(transformation)
            trackable.visible = true
            trackable.scale = this.height / this.width
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
  private _prepareImage (sourceImage: ImageObj) {
    if (!sourceImage) {
    // default to preloaded image
      sourceImage = this.image
    }  

    // this is of type Uint8ClampedArray:
    // The Uint8ClampedArray typed array represents an array of 8-bit unsigned
    // integers clamped to 0-255
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
    let data: Uint8ClampedArray;

    if (sourceImage.data) {
      // directly use source image
      data = sourceImage.data
    }

    this.videoLuma = new Uint8ClampedArray(data.length / 4)
    // Here we have access to the unmodified video image. We now need to add the videoLuma chanel to be able to serve the underlying ARTK API
    if (this.videoLuma) {
      
      let q = 0

      // Create luma from video data assuming Pixelformat AR_PIXEL_FORMAT_RGBA
      // see (ARToolKitJS.cpp L: 43)
      for (let p = 0; p < this.videoSize; p++) {      
        let r = data[q + 0], g = data[q + 1], b = data[q + 2];
        // @see https://stackoverflow.com/a/596241/5843642    
        this.videoLuma[p] = (r + r + r + b + g + g + g + g) >> 3
        q += 4
      }
    }

     // Get access to the video allocation object
     //const videoMalloc = this.artoolkitX.videoMalloc
     const params: delegateMethods['videoMalloc'] = this.artoolkitX.instance.videoMalloc;
     
     // Copy luma image
     const videoFrameLumaBytes = new Uint8Array(this.artoolkitX.instance.HEAPU8.buffer, params.lumaFramePointer, params.framesize / 4)
     videoFrameLumaBytes.set(this.videoLuma)
     //this.videoLuma = videoLuma
 
     // Copy image data into HEAP. HEAP was prepared during videoWeb.c::ar2VideoPushInitWeb()
     const videoFrameBytes = new Uint8Array(this.artoolkitX.instance.HEAPU8.buffer, params.framepointer, params.framesize)
     videoFrameBytes.set(data)
     this.framesize = params.framesize
 
     this.artoolkitX.instance.setValue(params.newFrameBoolPtr, 1, 'i8')
     this.artoolkitX.instance.setValue(params.fillFlagIntPtr, 1, 'i32')
 
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
     this.artoolkitX.instance.setValue(params.timeSecPtr, seconds, 'i32')
     this.artoolkitX.instance.setValue(params.timeMilliSecPtr, milliSeconds, 'i32')
 
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
        console.log('filename inside barcodeId query', fileName);       
        if (!this._patternDetection.barcode) {
          this._patternDetection.barcode = true
        }
      } else {
        try {
          console.log('inside try')
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
        console.log('2d id: ', trackableId);    
      } else {
        trackableId = this.artoolkitX.addTrackable(trackableObj.trackableType + ';' + fileName + ';' + trackableObj.width)
        console.log('other id: ', trackableId);
      }
    }

    if (trackableId >= 0) {
      console.log(trackableId);
      this.trackables.push({ trackableId: trackableId, transformation: (new Float32Array(16)), visible: false })
      if (!this.userSetPatternDetection) { this._updateDetectionMode() }
      return trackableId
    }
    throw new Error('Failed to add Trackable: ' + trackableId)
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
  public addEventListener(name: string, callback: object) {
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
  public removeEventListener(name: string, callback: object) {
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
  public dispatchEvent(event: { name: string; target: any; data?: object }) {
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
  public transMatToGLMat(transMat: Float64Array, glMat: Float64Array, scale?: number,) {
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
   * @param {Float32Array} glMatrix The 4x4 marker transformation matrix.
   * @param {Float32Array} [glRhMatrix] The 4x4 GL right hand transformation matrix.
   * @param {number} [scale] The scale for the transform.
   */
  public arglCameraViewRHf(glMatrix: Float32Array, glRhMatrix?: Float32Array, scale?: number) {
    let m_modelview
    if (glRhMatrix == undefined) { m_modelview = new Float32Array(16) } else { m_modelview = glRhMatrix }

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
  public getTransformationMatrix() {
    return this.transform_mat
  };

  /**
   * Returns the projection matrix computed from camera parameters for the ARControllerX.
   * @return {Float64Array} The 16-element WebGL camera matrix for the ARControllerX camera parameters.
   */
  public getCameraMatrix() {
    return this.camera_mat
  };


  /**
   * Sets the logging level to use by ARToolKitX.
   * @param {number} mode type for the log level.
   */
  public setLogLevel(mode: boolean) {
    return this.artoolkitX.setLogLevel(mode);
  };

  /**
   * Gets the logging level used by ARToolKit.
   * @return {number} return the log level in use.
   */
  public getLogLevel() {
    return this.artoolkitX.getLogLevel();
  };

  /**
   * Set the labeling threshold mode (auto/manual).
   *
   * @param {number}     mode An integer specifying the mode. One of:
   * artoolkitX.LabelingThresholdMode.AR_LABELING_THRESH_MODE_MANUAL,
   * artoolkitX.LabelingThresholdMode.AR_LABELING_THRESH_MODE_AUTO_MEDIAN,
   * artoolkitX.LabelingThresholdMode.AR_LABELING_THRESH_MODE_AUTO_OTSU,
   * artoolkitX.LabelingThresholdMode.AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE,
   * artoolkitX.LabelingThresholdMode.AR_LABELING_THRESH_MODE_AUTO_BRACKETING
   * {@see https://github.com/artoolkitx/artoolkitx/Source/artoolkitx.js/ARX_bindings.cpp} -> LabelingThresholdMode
   */
  public setThresholdMode (mode: number) {
    this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE.value, mode)
  };
          
  /**
   * Gets the current threshold mode used for image binarization.
   * @return  {number}        The current threshold mode
   * @see     getVideoThresholdMode()
   */
  public getThresholdMode () {
    return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE.value)
  };

  /**
   * Set the labeling threshhold.
   * This function forces sets the threshold value.
   * The default value is AR_DEFAULT_LABELING_THRESH which is 100.
   *
   * The current threshold mode is not affected by this call.
   * Typically, this function is used when labeling threshold mode
   * is AR_LABELING_THRESH_MODE_MANUAL.
   *
   * The threshold value is not relevant if threshold mode is
   * AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.
   *
   * Background: The labeling threshold is the value which
   * the AR library uses to differentiate between black and white
   * portions of an ARToolKit marker. Since the actual brightness,
   * contrast, and gamma of incoming images can vary signficantly
   * between different cameras and lighting conditions, this
   * value typically needs to be adjusted dynamically to a
   * suitable midpoint between the observed values for black
   * and white portions of the markers in the image.
   * @param {number} threshold An integer in the range [0,255] (inclusive).
   */
  public setThreshold (threshold: number) {
    this.threshold = threshold;
    this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_THRESHOLD.value, threshold)
  };

  /**
    Get the current labeling threshold.

    This function queries the current labeling threshold. For,
    AR_LABELING_THRESH_MODE_AUTO_MEDIAN, AR_LABELING_THRESH_MODE_AUTO_OTSU,
    and AR_LABELING_THRESH_MODE_AUTO_BRACKETING
    the threshold value is only valid until the next auto-update.

    The current threshold mode is not affected by this call.

    The threshold value is not relevant if threshold mode is
    AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.

    @return {number} The current threshold value.
  */
  public getThreshold () {
      return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_THRESHOLD.value)
  };

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
   * Returns the current pattern detection mode.
   * @return {number} The current pattern detection mode. {@see https://github.com/artoolkitx/artoolkitx/Source/artoolkitx.js/ARX_bindings.cpp} -> arPatternDetectionMode
   * Which is represented in JS as artoolkitXjs.[Mode]
   */
  public getPatternDetectionMode () {
    return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE.value)
  };

  /**
    Set the size and ECC algorithm to be used for matrix code (2D barcode) marker detection.

    When matrix-code (2D barcode) marker detection is enabled (see arSetPatternDetectionMode)
    then the size of the barcode pattern and the type of error checking and correction (ECC)
    with which the markers were produced can be set via this function.

    This setting is global to a given ARHandle; It is not possible to have two different matrix
    code types in use at once.

    @param      type The type of matrix code (2D barcode) in use. Options include:
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_3x3
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_3x3_HAMMING63
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_3x3_PARITY65
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_4x4
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_4x4_BCH_13_9_3
      artoolkitX.ARMatrixCodeType.AR_MATRIX_CODE_4x4_BCH_13_5_5
      The default mode is artoolkitXjs.ARMatrixCodeType.AR_MATRIX_CODE_3x3.
    {@see https://github.com/artoolkitx/artoolkitx/Source/artoolkitx.js/ARX_bindings.cpp} -> ARMatrixCodeType
   */
  public setMatrixCodeType (type: number) {
    this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE.value, type)
  };
          
  /**
   * Returns the current matrix code (2D barcode) marker detection type.
   *       
   * @return {number} The current matrix code type. {@link setMatrixCodeType}
   */
  public getMatrixCodeType () {
    return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE.value)
  };

  /**
    Select between detection of black markers and white markers.

    ARToolKit's labelling algorithm can work with both black-bordered
    markers on a white background (AR_LABELING_BLACK_REGION) or
    white-bordered markers on a black background (AR_LABELING_WHITE_REGION).
    This function allows you to specify the type of markers to look for.
    Note that this does not affect the pattern-detection algorith
    which works on the interior of the marker.

    @param {number}      mode
    Options for this field are:
    artoolkitX.AR_LABELING_WHITE_REGION
    artoolkitX.AR_LABELING_BLACK_REGION
    The default mode is AR_LABELING_BLACK_REGION.
   */
  public setLabelingMode (mode: number) {
    this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_LABELING_MODE.value, mode)
  };
          
  /**
   * Enquire whether detection is looking for black markers or white markers.
   * See {@link #setLabelingMode}
   *     
   * @result {number} The current labeling mode see {@link setLabelingMode}.
   */
  public getLabelingMode () {
    return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_LABELING_MODE.value)
  };

  /**
   * Set the width/height of the marker pattern space, as a proportion of marker width/height.
   *
   * @param {number}     pattRatio The the width/height of the marker pattern space, as a proportion of marker
   * width/height. To set the default, pass artoolkitX.AR_PATT_RATIO.
   */
  public setPattRatio (pattRatio: number) {
    this.artoolkitX.setTrackerOptionFloat(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE.value, pattRatio)
  };
          
  /**
   * Returns the current ratio of the marker pattern to the total marker size.
   *     
   *  @return {number} The current pattern ratio.
   */
  public getPattRatio () {
    return this.artoolkitX.getTrackerOptionFloat(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE.value)
  };

  /**
    Set the image processing mode.

    When the image processing mode is AR_IMAGE_PROC_FRAME_IMAGE,
    artoolkitX processes all pixels in each incoming image
    to locate markers. When the mode is AR_IMAGE_PROC_FIELD_IMAGE,
    artoolkitX processes pixels in only every second pixel row and
    column. This is useful both for handling images from interlaced
    video sources (where alternate lines are assembled from alternate
    fields and thus have one field time-difference, resulting in a
    "comb" effect) such as Digital Video cameras.
    The effective reduction by 75% in the pixels processed also
    has utility in accelerating tracking by effectively reducing
    the image size to one quarter size, at the cost of pose accuraccy.

    @param {number} mode
      Options for this field are:
      artoolkitX.AR_IMAGE_PROC_FRAME_IMAGE
      artoolkitX.AR_IMAGE_PROC_FIELD_IMAGE
      The default mode is artoolkitX.AR_IMAGE_PROC_FRAME_IMAGE.
   */
  public setImageProcMode (mode: number) {
    this.artoolkitX.setTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE.value, mode)
  };
          
  /**
   * Get the image processing mode.
   * See {@link #setImageProcMode} for a complete description.
   *
   * @return {number} The current image processing mode.
   */
  public getImageProcMode () {
    return this.artoolkitX.getTrackerOptionInt(this.artoolkitX.TrackableOptions.ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE.value)
  };
                      

  // private accessors
  // ----------------------------------------------------------------------------

  /**
   * Used internally by ARControllerX, it permit to add methods to this.
   * @return {any} ARControllerX
   */
  private converter(): any {
    return this;
  }

  /**
   * For ease of use check what kinds of markers have been added and set the detection mode accordingly
   */
   private _updateDetectionMode() {
    if (this._patternDetection.barcode && this._patternDetection.template) {
      this.setPatternDetectionMode(this.artoolkitX.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX)
    } else if (this._patternDetection.barcode) {
      this.setPatternDetectionMode(this.artoolkitX.AR_MATRIX_CODE_DETECTION)
    } else {
      this.setPatternDetectionMode(this.artoolkitX.AR_TEMPLATE_MATCHING_COLOR)
    }
  }

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
   * Used internally by the addTrackable method.
   * @param url of the file to load.
   * @returns the target.
   */
   private async _loadTrackable(url: string) {
    var target = "/trackable_" + this._marker_count++;
    try {
      let data = await Utils.fetchRemoteData(url);
      this.artoolkitX.instance.FS.writeFile(target, data, {
        encoding: "binary",
      });
      return target;
    } catch (e) {
      console.log(e);
      return e;
    }
  }


  // Internal wrapper to _arwQueryTrackableVisibilityAndTransformation to avoid ccall overhead
  private _queryTrackableVisibility (trackableId: number) {
    const transformationMatrixElements = 16
    const numBytes = transformationMatrixElements * Float32Array.BYTES_PER_ELEMENT
    this._transMatPtr = this.artoolkitX._malloc(numBytes)
    // Call compiled C-function directly using '_' notation
    // https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-direct-function-calls
    const transformation = this.artoolkitX._arwQueryTrackableVisibilityAndTransformation(trackableId, this._transMatPtr)
    const matrix = new Float32Array(this.artoolkitX.instance.HEAPU8.buffer, this._transMatPtr, transformationMatrixElements)
    if (transformation) {
      return matrix
    }
    return undefined
  }


}