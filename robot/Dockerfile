FROM ubuntu:18.04
LABEL maintainer="Leopold Mathias Regner"

# install nodejs
RUN apt-get update && apt-get install -y curl bash
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs

# copy webservice and install its dependencies
ADD webservice /root/webservice
RUN cd /root/webservice && npm install

# expose tcp port for webservice
EXPOSE 8084/tcp

# launch web service on container start
ENTRYPOINT [ "bash", "-c", "cd /root/webservice && node index.js" ]
