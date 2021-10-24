/*
 *  ARToolkitX.ts
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
import ModuleLoader from './ModuleLoader'

declare global {
  namespace NodeJS {
    interface Global {
      artoolkitX: any;
    }
  }
  interface Window {
    artoolkitX: any;
  }
}

interface runtimeInstanced {
  instance: any;
}

export default class ARToolkitX {

  public instance: any;
  private cameraCount: number;
  private version: string;
  public initialiseAR: () => number;
  public isInitialized: () => boolean;
  public getARToolKitVersion: () => number;
  public arwStartRunningJS: (arCameraURL: string, width: number, height: number) => number;
  public pushVideoInit: (n: number, width: number, height: number, pixelformat: string, a: number, b: number) => number;
  public _arwUpdateAR: () => number;
  public _malloc: (numBytes: number) => number;
  public _free: (pointer: number) => void;
  public _arwGetProjectionMatrix: (nearPlane: number, farPlane: number, pointer: number) => Float64Array;
  public videoMalloc: {
    framepointer: number;
    framesize: number;
    videoLumaPointer: number;
    lumaFramePointer: number;
    newFrameBoolPtr: number;
    fillFlagIntPtr: number;
    timeSecPtr: number;
    timeMilliSecPtr: number;
  };
  public _arwQueryTrackableVisibilityAndTransformation: (id: number, pointer: number) => Float64Array;
  public _arwCapture: () => number;
  public setValue: (pointer: number, a: number, type: string) => void;
  public stopRunning: () => void;
  public shutdownAR: () => void;

  public setLogLevel: (mode: boolean) => number;//ok
  public getLogLevel: () => number;//ok
  public addTrackable: (config: string) => number;
  public setTrackerOptionInt: (value: number, mode: number) => number;
  public getTrackerOptionInt: (value: number) => number;
  public setTrackerOptionFloat: (value: number, mode: number) => void;
  public getTrackerOptionFloat: (value: number) => number;
  public TrackableOptions: {
    ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_THRESHOLD:  { value: number};
    ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_LABELING_MODE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE: { value: number};
    ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE:  { value: number};
  }
  public AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX: number;
  public AR_MATRIX_CODE_DETECTION: number;
  public AR_TEMPLATE_MATCHING_COLOR: number;


  // construction
  /**
   * The ARToolkitX constructor. It has no arguments.
   * These properties are initialized:
   * - instance
   * - cameraCount
   * - version
   * A message is displayed in the browser console during the intitialization, for example:
   * "ARToolkitX 0.0.1"
   */
  constructor () {
    // reference to WASM module
    this.instance
    this.cameraCount = 0
    this.version = '0.0.1'
    console.info('ARToolkitX ', this.version)
  }

  // ---------------------------------------------------------------------------

  // initialization
  /**
   * Init the class injecting the Wasm Module, link the instanced methods and
   * create a global artoolkitX variable.
   * @return {object} the this object
   */
  public async init () {
     const runtime: runtimeInstanced = await ModuleLoader.init.catch((err: string) => {
      console.log(err);
      return Promise.reject(err)
    }).then((resolve: any) => {
      return resolve;
    })

    this.instance = runtime.instance;

    this._decorate()

    let scope: any = (typeof window !== 'undefined') ? window : global
    scope.artoolkitX = this

    return this
  }

  // private methods
  /**
   * Used internally to link the instance in the ModuleLoader to the
   * ARToolkitX internal methods.
   * @return {void}
   */
  private _decorate () {
    // add delegate methods
    [
      'setLogLevel',
      'getLogLevel',

      'ARLogLevel',
      'ARMatrixCodeType',

      'LabelingThresholdMode',
      'TrackableOptions',
      'TrackableOptionsSettings',

      'addTrackable',
      'arwGetTrackerOptionFloat',
      'arwGetTrackerOptionInt',
      'arwStartRunningJS',

      'getARToolKitVersion',
      'getError',
      'getTrackableOptionBool',
      'getTrackableOptionFloat',
      'getTrackableOptionInt',
      'getTrackablePatternConfig',
      'getTrackablePatternCount',
      'getTrackablePatternImage',
      'getTrackerOptionBool',
      'getVideoParams',

      'initialiseAR',
      'isInitialized',
      'isRunning',
      'loadOpticalParams',

      'pushVideoInit',

      'removeAllTrackables',
      'removeTrackable',

      'setTrackableOptionBool',
      'setTrackableOptionFloat',
      'setTrackableOptionInt',
      'setTrackerOptionBool',
      'setTrackerOptionFloat',
      'setTrackerOptionInt',

      'shutdownAR',
      'stopRunning',
      'updateAR',

      'videoMalloc',

      '_arwCapture',
      '_arwGetProjectionMatrix',
      '_arwGetTrackablePatternConfig',
      '_arwGetTrackablePatternImage',
      '_arwLoadOpticalParams',
      '_arwQueryTrackableVisibilityAndTransformation',
      '_arwUpdateAR',

      '_free',
      '_malloc'
    ].forEach(method => {
      this.converter()[method] = this.instance[method]
    })

    // expose constants
    for (const co in this.instance) {
      if (co.match(/^AR/)) {
        this.converter()[co] = this.instance[co]
      }
    }
  }

  /**
   * Used internally to convert and inject code.
   * @return {this} the this object
   */
  private converter(): any {
    return this
  }

  // ---------------------------------------------------------------------------
  // public accessors
  //----------------------------------------------------------------------------
  /**
   * Load the camera, this is an important and required step, Internally fill
   * the ARParam struct.
   * @param {string} urlOrData: the camera parameter, usually a path to a .dat file
   * @return {number} a number, the internal id.
   */
  /*public async loadCamera (urlOrData: any): Promise<number> {
    const target = '/camera_param_' + this.cameraCount++

    let data

    if (urlOrData instanceof Uint8Array) {
      // assume preloaded camera params
      data = urlOrData
    } else {
      // fetch data via HTTP
      try { data = await Utils.fetchRemoteData(urlOrData) } catch (error) { throw error }
    }

    this._storeDataFile(data, target)

    // return the internal marker ID
    return this.instance._loadCamera(target)
  }*/

  public async loadCameraParam(urlOrData: any): Promise<string>{
    return new Promise((resolve, reject) => {
      const filename = '/camera_param_' + this.cameraCount++
      if (typeof urlOrData === 'object' || urlOrData.indexOf('\n') > -1) { // Maybe it's a byte array
      //if (url) {
        const byteArray = urlOrData
        const target = filename
        this._storeDataFile(byteArray, target);
        if (target) {
          resolve(filename)
        } else {
          reject(new Error('Error'))
        }
      } else {
        this._ajax(urlOrData, filename, this).then(() => resolve(filename)).catch((e: any) => { reject(e) })
      }
    })
  }

  public _ajax (url: string, target: string, that: any) {
    return new Promise((resolve, reject) => {
      const oReq = new XMLHttpRequest()
      oReq.open('GET', url, true)
      oReq.responseType = 'arraybuffer' // blob arraybuffer
  
      oReq.onload = function () {
        if (this.status === 200) {
          // console.log('ajax done for ', url);
          const arrayBuffer = oReq.response
          const byteArray = new Uint8Array(arrayBuffer)
          that._storeDataFile(byteArray, target);
          resolve(byteArray)
        } else {
          reject(this.status)
        }
      }
      oReq.send()
    })
  }

  // ---------------------------------------------------------------------------

  // implementation
  /**
   * Used internally by LoadCamera method
   * @return {void}
   */
  private _storeDataFile (data: Uint8Array, target: string) {
    // FS is provided by emscripten
    // Note: valid data must be in binary format encoded as Uint8Array
    this.instance.FS.writeFile(target, data, {
      encoding: 'binary'
    })
  }
}
