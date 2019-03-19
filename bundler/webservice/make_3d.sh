#!/bin/bash

shopt -s expand_aliases
alias red="GREP_COLOR='1;31' grep --color=always ."
alias green="GREP_COLOR='1;32' grep --color=always ."
alias yellow="GREP_COLOR='1;33' grep --color=always ."

LD_LIBRARY_PATH=/root/bundler_sfm/bin

mv in_abc /root/bundler_sfm/ ############ TEST ONLY

echo "started rendering $1.obj" | yellow

cd "/root/bundler_sfm/in_$1"
../../bundler_sfm/RunBundler.sh | red

echo "done rendering $1.obj" | green