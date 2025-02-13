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
        char buffer [60];
        sprintf(buffer,"-module=Emscripten -width=%d -height=%d -format=RGBA", width, height);
        int ret;

        if( cparaName.empty()) {
            ret = arwStartRunning(buffer, nullptr);
        }
        else {
            ret = arwStartRunning(buffer, cparaName.c_str());
        }

        return ret;
    }

    int pushVideoInit(int videoSourceIndex, int width, int height, std::string pixelFormat, int camera_index, int camera_face){
        return arwVideoPushInit(videoSourceIndex, width, height, pixelFormat.c_str(), camera_index, camera_face);
    }

    int pushVideo(int videoSourceIndex, emscripten::val buff, int width, int height) {
        auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(buff);

        return arwVideoPush(videoSourceIndex, u8.data(), u8.size(), width, height, nullptr, 0, 0, 0, nullptr, 0, 0, 0, nullptr, 0, 0, 0, nullptr, nullptr);
}
    bool updateTexture32(emscripten::val buffer) {
        auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(buffer);
        return arwUpdateTexture32(reinterpret_cast<uint32_t*>(u8.data()));
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

