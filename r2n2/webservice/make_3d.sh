#!/bin/bash

alias red="GREP_COLOR='1;31' grep --color=always ."
alias green="GREP_COLOR='1;32' grep --color=always ."
alias yellow="GREP_COLOR='1;33' grep --color=always ."

PATH=$PATH:$HOME/anaconda3/bin
cd /root/3D-R2N2

source activate py3-theano | yellow
python magic.py "in_$1" "$1.obj" | red
deactivate | yellow

echo "done rendering $1.obj" | green