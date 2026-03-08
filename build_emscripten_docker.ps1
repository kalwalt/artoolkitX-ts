$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$ArtoolkitxDir = Join-Path $ProjectRoot "emscripten\artoolkitx"
$SourceDir = Join-Path $ArtoolkitxDir "Source"

Write-Host "Checking for OpenCV dependency..."
$OpenCvDir = Join-Path $SourceDir "depends\emscripten\include\opencv2"
if (-Not (Test-Path $OpenCvDir)) {
    Write-Host "Downloading OpenCV for Emscripten..."
    $OpenCvUrl = "https://github.com/artoolkitx/opencv/releases/download/4.10.0-dev-artoolkitx/opencv-4.10.0-dev-artoolkitx-wasm+unity2023.tgz"
    $OpenCvTar = Join-Path $SourceDir "opencv2.tgz"
    Invoke-WebRequest -Uri $OpenCvUrl -OutFile $OpenCvTar
    
    Write-Host "Extracting OpenCV..."
    $DependsDir = Join-Path $SourceDir "depends\emscripten"
    if (-Not (Test-Path $DependsDir)) {
        New-Item -ItemType Directory -Path $DependsDir | Out-Null
    }
    # Uses Windows 10/11 built-in tar.exe to extract
    & tar.exe xzf $OpenCvTar --strip-components=1 -C $DependsDir
    Remove-Item $OpenCvTar
}

Write-Host "Creating build directory..."
$BuildDir = Join-Path $SourceDir "build-emscripten"
if (-Not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

Write-Host "Running Docker to configure and build..."

# Mount $ArtoolkitxDir to /workspace inside Docker
# Inside the container, artoolkitx\Source is /workspace/Source

$DockerContainerName = "emscripten-artoolkitx-ts"
$DockerImage = "emscripten/emsdk:3.1.38"

# Build script to run inside the container
$BuildScript = @"
#!/bin/bash
set -e

cd /src/emscripten/artoolkitx/Source/build-emscripten
rm -f CMakeCache.txt

export SETTINGS="-s USE_ZLIB=1 -s USE_LIBJPEG=1 -s USE_PTHREADS=1 -msimd128 -fwasm-exceptions -mbulk-memory -mnontrapping-fptoint -msse4.2 -sWASM_BIGINT -sSUPPORT_LONGJMP=wasm"
export CFLAGS="`$SETTINGS"
export CXXFLAGS="`$SETTINGS"
export LDFLAGS="`$SETTINGS"

echo "Configuring with CMake..."
emmake cmake .. -G "Unix Makefiles" \
    -DCMAKE_TOOLCHAIN_FILE=`$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DARX_GL_PREFER_EMBEDDED:BOOL=ON \
    -DARX_NO_BUILTIN_MINIZIP:BOOL=ON \
    -DZLIB_INCLUDE_DIR:PATH="`$EMSDK/upstream/emscripten/cache/sysroot/include" \
    -DZLIB_LIBRARY:PATH="`$EMSDK/upstream/emscripten/cache/sysroot/lib/wasm32-emscripten/libz.a" \
    -DJPEG_INCLUDE_DIR:PATH="`$EMSDK/upstream/emscripten/cache/sysroot/include" \
    -DJPEG_LIBRARY:PATH="`$EMSDK/upstream/emscripten/cache/sysroot/lib/wasm32-emscripten/libjpeg.a"

echo "Building with Make..."
emmake make -j `$(nproc)
echo "Installing..."
emmake make install
"@

$InternalScriptPath = Join-Path $BuildDir "docker_build_step.sh"
# Ensure the script uses LF line endings because it runs inside a Linux container
[IO.File]::WriteAllText($InternalScriptPath, $BuildScript.Replace("`r`n", "`n"))

$ContainerExists = docker ps -a -q -f name="^/${DockerContainerName}$"
if ($ContainerExists) {
    Write-Host "Found existing container: $DockerContainerName. Starting it..."
    docker start $DockerContainerName | Out-Null
    $DockerCmd = "docker exec $DockerContainerName bash /src/emscripten/artoolkitx/Source/build-emscripten/docker_build_step.sh"
} else {
    Write-Host "Container does not exist, creating new one..."
    # If the container runs, we rm it later. 
    $DockerCmd = "docker run --rm --name $DockerContainerName -v `"$($ProjectRoot):/src`" $DockerImage bash /src/emscripten/artoolkitx/Source/build-emscripten/docker_build_step.sh"
}

Write-Host "Executing Docker command:`n$DockerCmd"
Invoke-Expression $DockerCmd

Write-Host "Cleaning up internal build script..."
Remove-Item $InternalScriptPath

Write-Host "Build completed successfully."
Write-Host "The output library should be saved to the SDK folder: $($ArtoolkitxDir)\SDK"
