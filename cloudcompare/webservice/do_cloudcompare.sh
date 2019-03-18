#!/bin/bash

shopt -s expand_aliases
alias red="GREP_COLOR='1;31' grep --color=always ."
alias green="GREP_COLOR='1;32' grep --color=always ."
alias yellow="GREP_COLOR='1;33' grep --color=always ."

export DISPLAY=:1.0
cd "in_$1"

echo "started cloud comparison $1" | yellow

# https://www.cloudcompare.org/doc/wiki/index.php?title=Command_line_mode
CloudCompare -SILENT -o object.bin -o oscene.obj -c2m_dist 2>&1 | red

echo "done with cloud comparison $1" | green