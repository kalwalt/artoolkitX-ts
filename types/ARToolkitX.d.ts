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
    static get UNKNOWN_MARKER(): number;
    static get NFT_MARKER(): number;
    instance: any;
    private cameraCount;
    private version;
    setup: (width: number, height: number, cameraId: number) => number;
    teardown: () => void;
    setupAR2: (id: number) => void;
    setDebugMode: (id: number, mode: boolean) => number;
    getDebugMode: (id: number) => boolean;
    getProcessingImage: (id: number) => number;
    detectMarker: (id: number) => number;
    detectNFTMarker: (id: number) => number;
    getNFTMarker: (id: number, markerIndex: number) => number;
    setLogLevel: (mode: boolean) => number;
    getLogLevel: () => number;
    frameMalloc: {
        framepointer: number;
        framesize: number;
        videoLumaPointer: number;
        camera: number;
        transform: number;
    };
    setProjectionNearPlane: (id: number, value: number) => void;
    getProjectionNearPlane: (id: number) => number;
    setProjectionFarPlane: (id: number, value: number) => void;
    getProjectionFarPlane: (id: number) => number;
    setThresholdMode: (id: number, mode: number) => number;
    getThresholdMode: (id: number) => number;
    setThreshold: (id: number, threshold: number) => number;
    getThreshold: (id: number) => number;
    setImageProcMode: (id: number, mode: number) => number;
    getImageProcMode: (id: number) => number;
    constructor();
    init(): Promise<this>;
    private _decorate;
    private converter;
    loadCamera(urlOrData: any): Promise<number>;
    loadCameraParam(url: any): Promise<unknown>;
    private _storeDataFile;
}
