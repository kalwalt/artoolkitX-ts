interface ImageObj {
    videoWidth: number;
    width: number;
    videoHeight: number;
    height: number;
    data: Uint8ClampedArray;
}
interface ITrackableObj {
    width: number;
    height: number;
    trackableType: string;
    barcodeId: number;
    url: string;
}
export default class ARControllerX {
    private options;
    private id;
    private width;
    private height;
    private image;
    private imageData;
    private orientation;
    private cameraParam;
    private cameraParaFileURL;
    private _projectionMatPtr;
    private cameraId;
    private cameraLoaded;
    private artoolkitX;
    private listeners;
    private trackables;
    private transform_mat;
    private _transMatPtr;
    private marker_transform_mat;
    private transformGL_RH;
    private videoWidth;
    private videoHeight;
    private videoSize;
    private framepointer;
    private framesize;
    private dataHeap;
    private videoLuma;
    private camera_mat;
    private videoLumaPointer;
    private canvas;
    private ctx;
    private defaultMarkerWidth;
    private default2dHeight;
    private _patternDetection;
    private userSetPatternDetection;
    private _marker_count;
    private has2DTrackable;
    private _bwpointer;
    constructor(image: object, cameraPara: string, confWidth: number, confHeight: number);
    static init(image: ImageObj, cameraUrl: string, width: number, height: number): Promise<ARControllerX>;
    private _initialize;
    start(): Promise<void>;
    dispose(): void;
    process(image: ImageObj): Promise<void>;
    _processImage(image: ImageObj): void;
    private _prepareImage;
    getCameraProjMatrix(nearPlane?: number, farPlane?: number): Float32Array;
    addTrackable(trackableObj: ITrackableObj): Promise<number>;
    addEventListener(name: string, callback: object): void;
    removeEventListener(name: string, callback: object): void;
    dispatchEvent(event: {
        name: string;
        target: any;
        data?: object;
    }): void;
    transMatToGLMat(transMat: Float64Array, glMat: Float64Array, scale?: number): Float64Array;
    arglCameraViewRHf(glMatrix: Float64Array, glRhMatrix?: Float64Array, scale?: number): Float64Array;
    getTransformationMatrix(): Float64Array;
    getCameraMatrix(): Float32Array;
    setLogLevel(mode: boolean): number;
    getLogLevel(): number;
    _loadTrackable(url: string): Promise<unknown>;
    setPatternDetectionMode(mode: number): number;
    private _setPatternDetectionMode;
    _updateDetectionMode(): void;
    private converter;
}
export {};
