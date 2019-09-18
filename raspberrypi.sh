#!/bin/bash

# port 8081 - Intel RealSense web service
cd realsense/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..

# port 8082 - object recognition web service
cd pcl/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..

# port 8083 - web service for transforming object recognition output in robot coordinates
cd coordsmapping/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..

# port 8084 - web service for robot control
cd robot/webservice && npm install -y && (nohup node index.js > output.log &); cd ../..
sleep 1s && echo;
