#!/bin/bash

shopt -s expand_aliases
alias red="GREP_COLOR='1;31' grep --color=always ."
alias green="GREP_COLOR='1;32' grep --color=always ."
alias yellow="GREP_COLOR='1;33' grep --color=always ."

echo "started rendering $1.obj" | yellow

mv "in_$1" "../3DReconstruction/Reconstruction/reconstruct_this"

cd "../3DReconstruction/Reconstruction"
python3 disparity.py | red

mv "reconstructed.ply" "../../webservice/$1.ply"

echo "done rendering $1.obj" | green