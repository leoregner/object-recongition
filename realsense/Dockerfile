FROM ubuntu:18.04
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# install nodejs
RUN apt-get update && apt-get install -y curl bash
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs

# install intel realsense sdk dependencies | @see https://github.com/IntelRealSense/librealsense/blob/master/doc/installation.md
RUN apt-get update && apt-get install -y git libssl-dev libusb-1.0-0-dev pkg-config libgtk-3-dev libglfw3-dev libgl1-mesa-dev libglu1-mesa-dev udev sudo
RUN curl -sL https://github.com/Kitware/CMake/releases/download/v3.14.3/cmake-3.14.3-Linux-x86_64.sh > cmake.sh
RUN chmod u+x cmake.sh && ./cmake.sh --skip-license && export PATH=$PATH:/root/bin
RUN npm install -g jsdoc node-gyp

# copy web service and install dependencies
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# start web service
CMD bash -c "cd /root/webservice && node index.js"
EXPOSE 8081/tcp
