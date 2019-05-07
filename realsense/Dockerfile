FROM ubuntu:18.04
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs

# install intel realsense sdk dependencies | @see https://github.com/IntelRealSense/librealsense/blob/master/doc/installation.md
RUN apt-get update && apt-get install -y git libssl-dev libusb-1.0-0-dev pkg-config libgtk-3-dev libglfw3-dev libgl1-mesa-dev libglu1-mesa-dev curl udev sudo
RUN curl -sL https://github.com/Kitware/CMake/releases/download/v3.14.3/cmake-3.14.3-Linux-x86_64.sh > cmake.sh
RUN chmod u+x cmake.sh && ./cmake.sh --skip-license && export PATH=$PATH:/root/bin
RUN npm install -g jsdoc node-gyp

# build librealsense
##RUN cd /root && git clone https://github.com/IntelRealSense/librealsense.git
##RUN cd /root/librealsense && ./scripts/setup_udev_rules.sh
##RUN mkdir /root/librealsense/build && cd /root/librealsense/build && cmake ../ -DBUILD_EXAMPLES=true -DBUILD_NODEJS_BINDINGS=1 -DBUILD_GRAPHICAL_EXAMPLES=false
##RUN cd /root/librealsense/build && make uninstall && make clean && make && make install

# install librealsense nodejs wrapper modules | @see https://github.com/IntelRealSense/librealsense/tree/master/wrappers/nodejs
##RUN cd /root/librealsense/wrappers/nodejs && npm i
##RUN cd /root/librealsense/wrappers/nodejs/examples && npm i

# copy web service and install dependencies
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# start web service
CMD bash -c "cd /root/webservice && node index.js"
EXPOSE 8080/tcp