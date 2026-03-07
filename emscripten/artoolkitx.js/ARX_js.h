#include <emscripten.h>
#include <emscripten/val.h>
#include "ARX/ARX_c.h"
#include <string>
#include <ctime>
#include <iostream>
#include "ARX/ARController.h"


std::string getARToolKitVersion();
int addTrackable(std::string cfg);
bool arwStartRunningJS(std::string cparaName, int width, int height);
int pushVideoInit(int videoSourceIndex, int width, int height, std::string pixelFormat, int camera_index, int camera_face);
int pushVideo(int videoSourceIndex, emscripten::val buff, int width, int height);
bool pushVideoPtr(int bufferPtr, int width, int height);
bool updateTexture32(emscripten::val buffer);
bool updateTexture32Ptr(int bufferPtr);

struct VideoParams {
    int width;
    int height;
    int pixelSize;
    std::string pixelFormat;
};
VideoParams getVideoParams();
