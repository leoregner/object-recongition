FROM python
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# download and install dependencies
RUN apt-get update && apt-get install -y git wget curl python3 python3-pip libglib2.0-0 libsm6 libxext6 libfontconfig1 libxrender1
RUN pip3 install --upgrade pip && pip install opencv-python tqdm Pillow matplotlib plyfile

# clone 3D reconstruction and file format conversion scripts
RUN cd /root && git clone https://github.com/OmarPadierna/3DReconstruction.git
RUN cd /root/3DReconstruction/Reconstruction && mkdir c && git clone https://gist.github.com/ca110dba829dc960c48ad9ab90b8081e.git c && mv c/ply2obj.py .

# calibrate camera using chessboard pictures
RUN rm /root/3DReconstruction/Calibration/calibration_images/*
ADD calibration_images /root/3DReconstruction/Calibration/calibration_images/
RUN cd /root/3DReconstruction/Reconstruction && mv camera_params ../Calibration/
RUN cd /root/3DReconstruction/Calibration && python3 calibrate.py
RUN cd /root/3DReconstruction/Calibration && cp -R camera_params/ ../Reconstruction/

# install nodejs and copy web service script
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
COPY webservice /root/webservice
RUN cd /root/webservice && npm install -y

# run web service
ENTRYPOINT [ "bash", "-c", "cd /root/webservice && node index.js" ]
EXPOSE 80/tcp