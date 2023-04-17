cmake_minimum_required( VERSION 3.4 )

project("ARtoolkitX-ts")

set(ARTOOLKITX_PATH "../artoolkitx")

set(ARX_VERSION_MAJOR 1)
set(ARX_VERSION_MINOR 0)
set(ARX_VERSION_TINY  5)
set(ARX_VERSION_DEV   1)
set(ARX_VERSION_STRING "${ARX_VERSION_MAJOR}.${ARX_VERSION_MINOR}.${ARX_VERSION_TINY}")
math(EXPR ARX_VERSION_NUMBER "${ARX_VERSION_MAJOR}*1000000+${ARX_VERSION_MINOR}*10000+${ARX_VERSION_TINY}*100+${ARX_VERSION_DEV}")
set(HAVE_INTEL_SIMD 0)

set(HAVE_NFT 0)
set(HAVE_2D 1)
set(HAVE_GL 1)
set(HAVE_GL3 0)
set(HAVE_GLES2 0)
set(USE_GL_STATE_CACHE 0)
set(USE_CPARAM_SEARCH 0)
set(HAVE_GTSAM 0)
set(HAVE_OPENCV 0)

# Create ARX/AR/config.h and allow subdirectories to find it.
configure_file(${ARTOOLKITX_PATH}/Source/ARX/AR/include/ARX/AR/config.h.in ${ARTOOLKITX_PATH}/Source/ARX/AR/include/ARX/AR/config.h @ONLY)