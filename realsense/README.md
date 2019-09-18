If the Intel RealSense D435 is supposed to be running on a Raspberry Pi with Raspbian installed, please refer to these installation instructions:
*  https://github.com/IntelRealSense/librealsense/issues/4272
*  https://github.com/IntelRealSense/librealsense/blob/master/doc/installation.md

In case of error message `librealsense2.so.2: undefined symbol: __atomic_fetch_add_8`, add `-ltatomic` to the linker flags:
*  https://github.com/IntelRealSense/librealsense/issues/4565#issuecomment-518359584

```bash
cd realsense/webservice/node_modules/node-librealsense/build
make LDFLAGS="-latomic"
```
