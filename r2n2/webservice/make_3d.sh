#!/bin/bash

PATH=$PATH:$HOME/anaconda3/bin
cd /root/3D-R2N2
source activate py3-theano
python magic.py "in_$1/" "$1.obj"
deactivate