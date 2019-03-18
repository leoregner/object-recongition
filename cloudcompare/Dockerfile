FROM tswetnam/cloudcompare:latest
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

RUN apt-get update && apt-get install -y coreutils xvfb
RUN mkdir /root/cloudcompare

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# fake xwindow system and run web service
CMD nohup Xvfb :1 -screen 0 800x600x16 > /dev/null 2>&1 & bash -c "cd /root/webservice && node index.js"
EXPOSE 80/tcp