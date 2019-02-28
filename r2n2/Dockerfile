FROM nvidia/cuda:8.0-cudnn5-devel-ubuntu16.04
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# download and install dependencies
RUN apt-get update && apt-get install -y git curl python3 wget
RUN cd /tmp && curl -O https://repo.anaconda.com/archive/Anaconda3-2018.12-Linux-x86_64.sh && bash Anaconda3-2018.12-Linux-x86_64.sh -b

# download and install the R2N2 network as described in https://github.com/chrischoy/3D-R2N2
RUN cd /root && git clone https://github.com/chrischoy/3D-R2N2.git
RUN bash -c "export PATH=$PATH:$HOME/anaconda3/bin && cd /root/3D-R2N2 && conda create -n py3-theano python=3.6 -y && source activate py3-theano && conda install pygpu mkl-service -y && pip install -r requirements.txt && cp .theanorc ~/.theanorc"

# download pretrained model
## TODO

# install nodejs and run web service
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

ENTRYPOINT [ "cd /root/webservice && npm start" ]