#!/bin/bash

shopt -s expand_aliases
alias red="GREP_COLOR='1;31' grep --color=always ."
alias green="GREP_COLOR='1;32' grep --color=always ."
alias yellow="GREP_COLOR='1;33' grep --color=always ."

PATH=$PATH:$HOME/anaconda3/bin
cd /root/3D-R2N2

source activate py3-theano 2>&1 | yellow
python magic.py "in_$1" "$1.obj" 2>&1 | red
deactivate 2>&1 | yellow

echo "done rendering $1.obj" | green