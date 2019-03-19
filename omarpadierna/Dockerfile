FROM ubuntu
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# download and install dependencies
RUN apt-get update && apt-get install -y git wget curl python3 python3-pip libglib2.0-0 libsm6 libxext6 libfontconfig1 libxrender1
RUN pip3 install --upgrade pip

# clone library and install required python modules
RUN cd /root && git clone https://github.com/OmarPadierna/3DReconstruction.git
RUN cd /root/3DReconstruction/Calibration && pip install opencv-python tqdm Pillow
RUN cd /root/3DReconstruction/Reconstruction && pip install matplotlib

# calibrate camera
RUN rm /root/3DReconstruction/Calibration/calibration_images/*
ADD calibration_images /root/3DReconstruction/Calibration/calibration_images/
RUN cd /root/3DReconstruction/Calibration && python3 calibrate.py

# install nodejs and copy web service script
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# run web service
ENTRYPOINT [ "bash", "-c", "cd /root/webservice && node index.js" ]
EXPOSE 80/tcp