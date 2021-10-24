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
export default class ARToolkitX {
    instance: any;
    private cameraCount;
    private version;
    initialiseAR: () => number;
    isInitialized: () => boolean;
    getARToolKitVersion: () => number;
    arwStartRunningJS: (arCameraURL: string, width: number, height: number) => number;
    pushVideoInit: (n: number, width: number, height: number, pixelformat: string, a: number, b: number) => number;
    _arwUpdateAR: () => number;
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
    };
    _arwQueryTrackableVisibilityAndTransformation: (id: number, pointer: number) => Float64Array;
    _arwCapture: () => number;
    setValue: (pointer: number, a: number, type: string) => void;
    stopRunning: () => void;
    shutdownAR: () => void;
    setLogLevel: (mode: boolean) => number;
    getLogLevel: () => number;
    addTrackable: (config: string) => number;
    setTrackerOptionInt: (value: number, mode: number) => number;
    TrackableOptions: {
        ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE: {
            value: number;
        };
        ARW_TRACKER_OPTION_SQUARE_THRESHOLD: {
            value: number;
        };
    };
    AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX: number;
    AR_MATRIX_CODE_DETECTION: number;
    AR_TEMPLATE_MATCHING_COLOR: number;
    constructor();
    init(): Promise<this>;
    private _decorate;
    private converter;
    loadCameraParam(urlOrData: any): Promise<string>;
    _ajax(url: string, target: string, that: any): Promise<unknown>;
    private _storeDataFile;
}
