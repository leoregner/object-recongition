#!/usr/bin/env node

'use strict';
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

const rs2 = require('node-librealsense'), fs = require('fs');

const numberOfFrames = 100; // pcs
const resolutionWidth = 848; // px
const resolutionHeight = 480; // px
const minDistanceThreshold = 0.00; // meters
const maxDistanceThreshold = 0.19; // meters

const config = new rs2.Config();
config.enableStream(rs2.stream.stream_color, -1, resolutionWidth, resolutionHeight, rs2.format.format_any, 30);
config.enableStream(rs2.stream.stream_depth, -1, resolutionWidth, resolutionHeight, rs2.format.format_any, 30);

const pipeline = new rs2.Pipeline();
pipeline.start(config);

for(let i = 0; i < numberOfFrames; ++i)
    pipeline.waitForFrames();

const pointcloud = new rs2.PointCloud();
const frameSet = pipeline.waitForFrames();

// get depth data
const points = pointcloud.calculate(frameSet.depthFrame);

// get color data and scale to depth coordinates
const color = frameSet.colorFrame;
pointcloud.mapTo(color); // FIXME

if(points.vertices && points.textureCoordinates)
{
    const vertices = [];
    
    /** @see https://github.com/IntelRealSense/librealsense/blob/master/src/archive.cpp#L48 */
    for(let i = 0; i < points.size; ++i)
    {
        const MIN_DISTANCE = 1e-6, vertice = { x: points.vertices[i * 3], y: -points.vertices[i * 3 + 1], z: -points.vertices[i * 3 + 2] };
        
        if(Math.abs(vertice.x) >= MIN_DISTANCE || Math.abs(vertice.y) >= MIN_DISTANCE || Math.abs(vertice.z) >= MIN_DISTANCE)
            if(vertice.z > -maxDistanceThreshold && vertice.z < -minDistanceThreshold)
            {
                let u = points.textureCoordinates[i * 2], v = points.textureCoordinates[i * 2 + 1], w = color.width, h = color.height;
                let x = Math.min(Math.max(parseInt(u * w + .5), 0), w - 1);
                let y = Math.min(Math.max(parseInt(v * h + .5), 0), h - 1);
                let idx = x * color.bytesPerPixel / 8 + y * color.strideInBytes;
                
                vertice.red = color.data[idx];
                vertice.green = color.data[idx + 1];
                vertice.blue = color.data[idx + 2];
                
                vertices.push(vertice);
            }
    }
    
    writeToPlyFile('3d.ply', vertices);
    writeToObjFile('3d.obj', vertices);
}

pointcloud.destroy();
pipeline.stop();
pipeline.destroy();
rs2.cleanup();

function writeToPlyFile(fileName, vertices)
{
    const ply = fs.createWriteStream(fileName);
    ply.write('ply\n');
    ply.write('\t\tformat ascii 1.0\n');
    ply.write('\t\telement vertex ' + vertices.length + '\n');
    ply.write('\t\tproperty float x\n');
    ply.write('\t\tproperty float y\n');
    ply.write('\t\tproperty float z\n');
    ply.write('\t\tproperty uchar red\n');
    ply.write('\t\tproperty uchar green\n');
    ply.write('\t\tproperty uchar blue\n');
    ply.write('\t\tend_header\n\t\t');
    
    for(let i = 0; i < vertices.length; ++i)
        ply.write(vertices[i].x + ' ' + vertices[i].y + ' ' + vertices[i].z + ' ' + vertices[i].red + ' ' + vertices[i].green + ' ' + vertices[i].blue + '\n');
    
    ply.end();
}

function writeToObjFile(fileName, objPoints)
{
    const obj = fs.createWriteStream(fileName);
    obj.write('# OBJ File\n');
    obj.write('# Vertices: ' + objPoints.length + '\n# Faces: 0\n');
    
    for(let i = 0; i < objPoints.length; ++i)
        obj.write('vn 0.000000 0.000000 0.000000\nv ' + objPoints[i].x + ' ' + objPoints[i].y + ' ' + objPoints[i].z + '\n');
    
    obj.end();
}

