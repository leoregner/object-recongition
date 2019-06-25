FROM ubuntu:18.04
LABEL maintainer="Leopold Mathias Regner"

# install nodejs
RUN apt-get update && apt-get install -y curl bash
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs

# install dependencies of libpcl
RUN apt-get update && apt-get install -y software-properties-common git make cmake
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential libeigen3-dev libflann-dev libvtk6-dev libboost-all-dev

# download and compile libpcl
RUN cd /root && git clone https://github.com/PointCloudLibrary/pcl.git
RUN cd /root/pcl && mkdir build && cd /root/pcl/build && cmake -DCMAKE_BUILD_TYPE=Release .. && make -j2 && make -j2 install

# copy webservice and install its dependencies
ADD webservice /root/webservice
RUN cd /root/webservice && npm install

# compile pcl cli components
RUN cd /root/webservice && rm -rf build && mkdir build && cd build && cmake .. && make

# expose tcp port for webservice
EXPOSE 8080/tcp

# launch web service on container start
ENTRYPOINT [ "bash", "-c", "cd /root/webservice && node index.js" ]
