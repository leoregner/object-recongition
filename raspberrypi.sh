#!/bin/bash
cd realsense/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..
cd pcl/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..
cd coordsmapping/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..
cd robot/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..
echo;
