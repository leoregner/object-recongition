FROM i686/ubuntu
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# download and install dependencies
RUN apt-get update && apt-get install -y git wget zip jhead imagemagick python3 python3-pil make gcc g++ curl
RUN apt-get update && apt-get install -y gfortran libz-dev libjpeg-dev libblas-dev liblapack-dev

# clone library and dependencies
RUN cd /root && git clone https://github.com/snavely/bundler_sfm.git
RUN cd /root && wget http://www.cs.ubc.ca/~lowe/keypoints/siftDemoV4.zip && unzip siftDemoV4.zip && cd siftDemoV4 && make && mv * ../bundler_sfm/bin/
RUN cd /root && git clone https://github.com/oelbrenner/jhead && cd jhead && make && mv * ../bundler_sfm/bin/

## USE_CERES=true
## https://code.google.com/p/ceres-solver/

# compile bundler_sfm
RUN cd /root/bundler_sfm && make && cp libANN_char.so /usr/lib

# manually install libvips
#RUN apt-get remove -y udev upstart && DEBIAN_FRONTEND=noninteractive apt-get install -y libvips libvips-dev libvips-tools

# install nodejs and copy web service script
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
#RUN cd /root/webservice && npm install -y && apt-get install -y libvips && npm install -y sharp@0.11.4 --save-dev --arch=ia32

# run web service
ENTRYPOINT [ "bash", "-c", "cd /root/webservice && ./make_3d.sh abc #node index.js" ]
EXPOSE 80/tcp