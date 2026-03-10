cmake_minimum_required(VERSION 3.16)

project(artoolkitX.js)

#set(CMAKE_CXX_STANDARD 11)
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-warn-absolute-paths ")

#add_definitions(" -D HAVE_NFT=1 -DARX_EXPORTS=1 -DARX_TARGET_PLATFORM_EMSCRIPTEN=1 -DARVIDEO_INPUT_DUMMY -DARVIDEO_INPUT_IMAGE -DARVIDEO_INPUT_WEB")

if(VERSION GREATER 3.24)
  cmake_policy(SET CMP0135 NEW)
endif()

include(FetchContent)

FetchContent_Declare(
    build_artoolkitx
    URL https://github.com/artoolkitx/artoolkitx/releases/download/1.1.21/artoolkitx-1.1.21-Emscripten.zip
)

FetchContent_MakeAvailable(build_artoolkitx)

get_filename_component(PARENT_DIR ./ ABSOLUTE)

#[[set(ARTOOLKITXJS_HEADERS
${PARENT_DIR}/artoolkitx.js/ARX_js.h
${PARENT_DIR}/artoolkitx.js/ARX_additions.h
)

set(SOURCE
${PARENT_DIR}/artoolkitx.js/ARX_js.cpp
${PARENT_DIR}/artoolkitx.js/ARX_bindings.cpp
)
]]#
set(COMP_OPTS " -Wno-warn-absolute-paths --llvm-lto 1 -s INVOKE_RUN=0 ")
set(CMAKE_BUILD_TYPE Release)

if (NOT ARX_TARGET_PLATFORM_ANDROID)
    set(CMAKE_CXX_STANDARD "11")
    set(CMAKE_CXX_STANDARD_REQUIRED ON)
    set(CMAKE_CXX_EXTENSIONS OFF)
else()
    message("Nothing ...")
endif()

set(EM_FLAGS "-s USE_ZLIB=1 -s USE_LIBJPEG=1 -s USE_PTHREADS=1 -msimd128 -fwasm-exceptions -mbulk-memory -mnontrapping-fptoint -msse4.2 -sWASM_BIGINT -sSUPPORT_LONGJMP=wasm")


#add_definitions(" -Wno-warn-absolute-paths  -D HAVE_NFT=1 -DARX_EXPORTS=1 -DARX_TARGET_PLATFORM_EMSCRIPTEN=1 -DARX_GL_PREFER_EMBEDDED=ON -DARX_NO_BUILTIN_MINIZIP=ON -DARVIDEO_INPUT_DUMMY -DARVIDEO_INPUT_IMAGE -DARVIDEO_INPUT_WEB ")
add_definitions(" -Wno-warn-absolute-paths  -D HAVE_NFT=1 -DARX_EXPORTS=1 -DARX_TARGET_PLATFORM_EMSCRIPTEN=1 -DARX_GL_PREFER_EMBEDDED=1 -DARX_NO_BUILTIN_MINIZIP=1 ")

#if(ARX_TARGET_PLATFORM_EMSCRIPTEN)
if(TRUE)

    set(HAVE_INTEL_SIMD 1)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EM_FLAGS} -mssse3 -msimd128")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${EM_FLAGS} -mssse3 -msimd128")
    add_definitions("-DEIGEN_DONT_VECTORIZE")

endif()
add_executable(artoolkitxES6  ${PROJECT_SOURCE_DIR}/ARX_js.cpp ${PROJECT_SOURCE_DIR}/ARX_bindings.cpp)

#add_compile_options(" -Wno-warn-absolute-paths -D HAVE_NFT=1 -DARX_EXPORTS=1 -DARX_TARGET_PLATFORM_EMSCRIPTEN=1 -DARVIDEO_INPUT_DUMMY -DARVIDEO_INPUT_IMAGE -DARVIDEO_INPUT_WEB ")

#target_include_directories(artoolkitxES6 PRIVATE "${PARENT_DIR}/artoolkitx.js")
#target_include_directories(artoolkitx PRIVATE "${PARENT_DIR}/WebARKitTrackers/WebARKitOpticalTracking/include")

target_include_directories(artoolkitxES6 PRIVATE
    "${build_artoolkitx_SOURCE_DIR}/SDK/include"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/AR"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/AR2"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/ARUtil"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/ARVideo"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/ARG"
    "${build_artoolkitx_SOURCE_DIR}/SDK/include/ARX/KPM"
)


#[[include_directories(${PROJECT_SOURCE_DIR}/ARX/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX)
include_directories(${PROJECT_SOURCE_DIR}/ARX/AR/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX/AR2/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX/ARUtil/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX/ARVideo/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX/ARG/include)
include_directories(${PROJECT_SOURCE_DIR}/ARX/KPM/include)
#]]
#include_directories(${CMAKE_CURRENT_BINARY_DIR}/../ARX/AR/include)

#add_definitions("-std=c++11")
#set(OPENCV_EM "../../depends/emscripten/build_opencv-em")

#link_directories(${CMAKE_CURRENT_BINARY_DIR}/../ARX ${CMAKE_CURRENT_BINARY_DIR}/../ARX/AR ${CMAKE_CURRENT_BINARY_DIR}/../ARX/ARUtil ${CMAKE_CURRENT_BINARY_DIR}/../ARX/AR2 ${CMAKE_CURRENT_BINARY_DIR}/../ARX/KPM ${CMAKE_CURRENT_BINARY_DIR}/../ARX/ARVideo ${CMAKE_CURRENT_BINARY_DIR}/../ARX/ARG)
target_link_libraries(artoolkitxES6 PRIVATE ARX)

#add_executable(artoolkitx  ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_js.cpp ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_bindings.cpp)
#add_executable(artoolkitxES6  ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_js.cpp ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_bindings.cpp)

set(EXPORT_FUNCTIONS "'_arwUpdateAR', '_arwCapture', '_arwGetProjectionMatrix', '_arwQueryTrackableVisibilityAndTransformation', '_arwGetTrackablePatternConfig', '_arwGetTrackablePatternImage', '_arwLoadOpticalParams'")
set(EXPORTED_RUNTIME_FUNCTIONS "'ccall', 'cwrap', 'FS', 'setValue'")
set(MODULE_OPTIONS "-s MODULARIZE_INSTANCE=1 -s EXPORT_NAME='artoolkitX' -s EXPORT_ES6=1" )
set(WASM_FLAGS_SINGLE_FILE  " -s SINGLE_FILE=1 ")
set(ES6_FLAGS  " -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=0 -s EXPORT_NAME='artoolkitX' -s MODULARIZE=1 ")


#math(EXPR MEM 512*1024*1024)
set(MEM 16777216) #This is default value
message("CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")
set(MEMORY "-s TOTAL_MEMORY=${MEM} -s ALLOW_MEMORY_GROWTH=1")

#set(WASM_LOADER "--pre-js ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_wasmLoader.js")
#To generate source maps the -g4 needs to be passed to the LINK_FLAGS
#if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
    # https://github.com/kripken/emscripten/blob/master/src/settings.js#L85
    # set(TOTAL_STACK "-s TOTAL_STACK=5*1024*1024)"
    #set(DEBUG_EMCC "-g4 -s SAFE_HEAP=1 -s ASSERTIONS=1 --js-opts 0 -s DEMANGLE_SUPPORT=0" )
    # set(NO_WASM "-s WASM=0")
#else()
    # set(OPTIMIZE_EMCC "--memory-init-file 0 -s INVOKE_RUN=0 --llvm-lto 1 -s ASSERTIONS=0 -s PRECISE_I64_MATH=0 -s PRECISE_F32=2")
    # set(NO_WASM "-s WASM=0")
    # If WASM add a pre-js to register the wasm loader
#endif()

# set(OPTIMIZE_OPTIONS "-s NO_EXIT_RUNTIME=1 -s INVOKE_RUN=0")
# set_target_properties(artoolkitx PROPERTIES LINK_FLAGS "${OPTIMIZE_OPTIONS} ${MODULE_OPTIONS} ${NO_WASM} ${WASM_LOADER} ${MEMORY} ${DEBUG_EMCC} ${OPTIMIZE_EMCC} --bind --post-js ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_additions.js -s EXPORTED_FUNCTIONS='[${EXPORT_FUNCTIONS}]' -s EXTRA_EXPORTED_RUNTIME_METHODS='[${EXPORTED_RUNTIME_FUNCTIONS}]'")
set_target_properties(artoolkitxES6 PROPERTIES LINK_FLAGS "${EM_FLAGS} ${COMP_OPTS} ${OPTIMIZE_OPTIONS} ${ES6_FLAGS} ${WASM_FLAGS_SINGLE_FILE} ${MEMORY} ${DEBUG_EMCC} ${OPTIMIZE_EMCC} --bind --post-js ${PROJECT_SOURCE_DIR}/artoolkitx.js/ARX_additions.js -s EXPORTED_FUNCTIONS='[${EXPORT_FUNCTIONS}]' -s EXTRA_EXPORTED_RUNTIME_METHODS='[${EXPORTED_RUNTIME_FUNCTIONS}]'")