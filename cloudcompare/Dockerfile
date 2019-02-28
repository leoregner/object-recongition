##FROM ubuntu:18
##MAINTAINER Leopold Mathias Regner "me@leoregner.eu"
##
### download and install dependencies
##RUN apt-get update && apt-get install -y wget git cmake gcc qt-sdk build-essential libfontconfig1 mesa-common-dev libglu1-mesa-dev
##RUN wget http://download.qt.io/official_releases/qt/5.12/5.12.1/qt-opensource-linux-x64-5.12.1.run
##RUN chmod +x qt-opensource-linux-x64-5.12.1.run && ./qt-opensource-linux-x64-5.12.1.run
##
### download and install cloudcompare
##RUN cd /root && git clone --recursive https://github.com/cloudcompare/trunk.git
##RUN cmake -B/root/build -H/root/trunk

FROM tswetnam/cloudcompare:latest
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

RUN apt-get update && apt-get install -y coreutils xvfb

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# fake xwindow system and run web service
CMD nohup Xvfb :1 -screen 0 800x600x16 > /dev/null 2>&1 & bash -c "cd /root/webservice && node index.js"
EXPOSE 80/tcp