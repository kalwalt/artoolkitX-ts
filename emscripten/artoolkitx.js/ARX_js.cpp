/**
 *  
 * 
 */

#include "ARX_js.h"
#include <cstdint>

#define PIXEL_FORMAT_BUFFER_SIZE 1024

std::string getARToolKitVersion(){
    char versionString[1024];
    std::string returnValue ("unknown version");
    if (arwGetARToolKitVersion(versionString, 1024)){
        return std::string(versionString);
    }
    return returnValue;
}

int addTrackable(std::string cfg) {
    return arwAddTrackable(cfg.c_str());
}

/**
 * Initialises and starts video capture.
 * 
 * @param cparamName    The URL to the camera parameter file. NULL if none required or if using an image as input
 * @param width         The width of the video frame/image to process
 * @param height        The height of the video frame/image to process
 * @return              true if successful, false if an error occurred
 * @see                 arwStopRunning()
 */
bool arwStartRunningJS(std::string cparaName, int width, int height) {
    char buffer[128];
    // Il modulo di default Emscripten si apre senza errori!
    snprintf(buffer, sizeof(buffer), "-width=%d -height=%d -format=RGBA", width, height);

    bool ret;
    if (cparaName.empty()) {
        ret = arwStartRunning(buffer, nullptr);
    } else {
        ret = arwStartRunning(buffer, cparaName.c_str());
    }
    return ret;
}

int pushVideoInit(int videoSourceIndex, int width, int height, std::string pixelFormat, int camera_index, int camera_face){
    return arwVideoPushInit(videoSourceIndex, width, height, pixelFormat.c_str(), camera_index, AR_VIDEO_POSITION_UNKNOWN);
}

// Define the callback function
void videoPushReleaseCallback(void* userdata) {
    // Fill a pointer from userdata
    if (userdata) {
        int* frameProcessed = static_cast<int*>(userdata);
        *frameProcessed = 1; // Indicate that the frame has been processed
    }
}

int pushVideo(int videoSourceIndex, emscripten::val buff, int width, int height) {
    auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(buff);
    int frameProcessed = 0;

    return arwVideoPush(videoSourceIndex, u8.data(), u8.size(), width, height, nullptr, 0, 0, 0, nullptr, 0, 0, 0, nullptr, 0, 0, 0, videoPushReleaseCallback, &frameProcessed);
}

bool pushVideoPtr(int bufferPtr, int width, int height) {
    unsigned char* pixels = reinterpret_cast<unsigned char*>(bufferPtr);
    int frameProcessed = 0;

    // 1. Iniettiamo il frame DIRETTAMENTE nella pipeline di tracking!
    int ret = arwVideoPush(0, pixels, width * height * 4, width, height,
                           nullptr, 0, 0, 0, nullptr, 0, 0, 0, nullptr, 0, 0, 0,
                           nullptr, &frameProcessed);

    // 2. Aggiorniamo anche la texture per il rendering video su schermo
    arwUpdateTexture32(reinterpret_cast<uint32_t*>(pixels));

    return (ret >= 0);
}

bool updateTexture32(emscripten::val buffer) {
    auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(buffer);
    return arwUpdateTexture32(reinterpret_cast<uint32_t*>(u8.data()));
}

// Accept a memory pointer instead of a JS array to avoid memory copy overhead
// Bypass embind overhead by accepting a raw memory pointer
bool updateTexture32Ptr(int bufferPtr) {
    // Inject the RGBA pixel array into the Unity video module
    return arwUpdateTexture32(reinterpret_cast<uint32_t*>(bufferPtr));
}

VideoParams getVideoParams() {
    int w, h, ps;
    char pf[PIXEL_FORMAT_BUFFER_SIZE];
    VideoParams videoParams;
    if( !arwGetVideoParams(&w, &h, &ps, pf, PIXEL_FORMAT_BUFFER_SIZE))
        return videoParams;
    else {
        videoParams.width = w;
        videoParams.height = h;
        videoParams.pixelSize = ps;
        videoParams.pixelFormat = std::string(pf);
    }
    return videoParams;
}

//TODO: to be implemented
// bool getTrackables() {
//     int count;
//     ARWTrackableStatus status;
//     arwGetTrackables(&count, status)
// }

