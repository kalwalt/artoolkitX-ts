#! /bin/bash

OURDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

EM_FLAGS="-O3 -s ASSERTIONS=0 --llvm-lto 1 --memory-init-file 0 -s INVOKE_RUN=0 -s NO_EXIT_RUNTIME=1"
# EM_FLAGS="--llvm-lto 1 -s ASSERTIONS=1 -g4 -s SAFE_HEAP=1 --memory-init-file 0 -s INVOKE_RUN=0 -s NO_EXIT_RUNTIME=1"
# specific Emscripten toolchain for docker
EM_TOOLCHAIN="/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake"

OPENCV_INTRINSICS="-DCV_ENABLE_INTRINSICS=0 -DCPU_BASELINE="" -DCPU_DISPATCH="""
OPENCV_MODULES_EXCLUDE="-DBUILD_opencv_dnn=0 -DBUILD_opencv_ml=0 -DBUILD_opencv_objdetect=0 -DBUILD_opencv_photo=0 -DBUILD_opencv_shape=0 -DBUILD_opencv_shape=0 -DBUILD_opencv_stitching=0 -DBUILD_opencv_superres=0 -DBUILD_opencv_videostab=0 -DWITH_TIFF=0 -DWITH_JASPER=0"
OPENCV_CONF="${OPENCV_MODULES_EXCLUDE} -DBUILD_opencv_apps=0 -DBUILD_JPEG=1 -DBUILD_PNG=1 -DBUILD_DOCS=0 -DBUILD_EXAMPLES=0 -DBUILD_IPP_IW=0 -DBUILD_PACKAGE=0 -DBUILD_PERF_TESTS=0 -DBUILD_TESTS=0 -DBUILD_WITH_DEBUG_INFO=0 -DWITH_PTHREADS_PF=0 -DWITH_PNG=1 -DWITH_WEBP=1 -DWITH_JPEG=1 -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=0 -DBUILD_ITT=0 -DWITH_IPP=0"
echo "Building artoolkit for the web with Emscripten"
echo "Building dependencies"
EM_ARTK_FLAGS="-msse -msse2 -msse3 -mssse3 -I$OURDIR/depends/emscripten/opencv-3.4.1 -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/core/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/highgui/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/imgcodecs/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/videoio/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/imgproc/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/calib3d/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/features2d/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/flann/include -I$OURDIR/depends/emscripten/opencv-3.4.1/modules/video/include -I$OURDIR/ARX/OCVT/include"
cd $OURDIR
cd emscripten/artoolkitX_em_2d/Source/depends/emscripten/
if [ ! -d "build_opencv-em" ] ; then
  mkdir build_opencv-em
fi
cd build_opencv-em
docker exec emscripten-artoolkitx-ts emcmake cmake .. -Semscripten/artoolkitX_em_2d/Source/depends/emscripten/opencv-3.4.1 -B./emscripten/artoolkitX_em_2d/Source/depends/emscripten/build_opencv-em -DCMAKE_TOOLCHAIN_FILE=$EM_TOOLCHAIN $OPENCV_CONF $OPENCV_INTRINSICS -DCMAKE_CXX_FLAGS="$EM_FLAGS" -DCMAKE_C_FLAGS="$EM_FLAGS" -DCMAKE_C_FLAGS_RELEASE="-DNDEBUG -O3" -DCMAKE_CXX_FLAGS_RELEASE="-DNDEBUG -O3"
# -DBUILD_PERF_TESTS:BOOL="0" -DWITH_IPP:BOOL="0" -DBUILD_SHARED_LIBS:BOOL="0" -DBUILD_IPP_IW:BOOL="0" -DBUILD_ITT:BOOL="0" -DBUILD_opencv_apps:BOOL="0" -DCMAKE_CXX_FLAGS:STRING="-O3 --llvm-lto 1 --bind -s ASSERTIONS=0 --memory-init-file 0 -s INVOKE_RUN=0 -s SIMD=1 -s WASM=0" -DCV_ENABLE_INTRINSICS:BOOL="1" -DWITH_ITT:BOOL="0" -DBUILD_TESTS:BOOL="0"
docker exec emscripten-artoolkitx-ts emmake make -Cemscripten/artoolkitX_em_2d/Source/depends/emscripten/build_opencv-em