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
    _queryTrackableVisibility: (id: number) => Float64Array;
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
        transform: number;
    };
    _arwCapture: () => number;
    setValue: (pointer: number, a: number, type: string) => void;
    setLogLevel: (mode: boolean) => number;
    getLogLevel: () => number;
    constructor();
    init(): Promise<this>;
    private _decorate;
    private converter;
    loadCameraParam(urlOrData: any): Promise<string>;
    _ajax(url: string, target: string, that: any): Promise<unknown>;
    private _storeDataFile;
}
