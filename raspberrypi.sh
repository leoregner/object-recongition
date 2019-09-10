#!/bin/bash
cd realsense && npm install -y && (nohup node index.js > output.log &); cd ..
cd pcl && npm install -y && (nohup node index.js > output.log &); cd ..
cd coordsmapping && npm install -y && (nohup node index.js > output.log &); cd ..
cd robot && npm install -y && (nohup node index.js > output.log &); cd ..
