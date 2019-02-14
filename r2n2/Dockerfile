FROM floydhub/theano:0.9.0-gpu-py3.6
MAINTAINER Leopold Mathias Regner "me@leoregner.eu"

# download and install dependencies
RUN apt-get update && apt-get install -y git curl bash python3 meshlab cuda || /bin/true
RUN cd /tmp && curl -O https://repo.anaconda.com/archive/Anaconda3-2018.12-Linux-x86_64.sh && bash Anaconda3-2018.12-Linux-x86_64.sh -b

# download and install R2N2 as described in https://github.com/chrischoy/3D-R2N2
RUN cd /root && git clone https://github.com/chrischoy/3D-R2N2.git
RUN export PATH=$PATH:$HOME/anaconda3/bin && bash -c "cd /root/3D-R2N2 && conda create -n py3-theano python=3.6 -y && source activate py3-theano"
RUN export PATH=$PATH:$HOME/anaconda3/bin && cd /root/3D-R2N2 && conda install pygpu mkl-service -y && pip install -r requirements.txt && cp .theanorc ~/.theanorc

##RUN cd /root/3D-R2N2 && set DEVICE=cuda0 && set GPUARRAY_CUDA_VERSION=80 && python demo.py prediction.obj
ENTRYPOINT [ "bash", "-c", "cd /root/3D-R2N2 && python demo.py prediction.obj" ]