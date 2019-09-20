#!/usr/bin/env node

'use strict';
// Copyright Leopold Mathias Regner
// based on code provided by the Intel Corporation - librealsense is licensed under the Apache license https://github.com/IntelRealSense/librealsense/blob/master/LICENSE

const rs2 = require('node-librealsense'), fs = require('fs');

module.exports = function(fileName, numberOfFrames = 100, settings = {})
{
    const resolutionWidth = settings.resolutionWidth || 848; // px
    const resolutionHeight = settings.resolutionHeight || 480; // px

    const maxSideOffset = settings.maxSideOffset || 0.20; //meters
    const minDistanceThreshold = settings.minDistanceThreshold || 0.10; // meters
    const maxDistanceThreshold = settings.maxDistanceThreshold || 0.185; // meters
    const legoStructureAngle = settings.legoStructureAngle === 0 ? 0 : (settings.legoStructureAngle || 45); // deg

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
            vertice.floorDistance = mapDepthToFloor(legoStructureAngle, vertice.x, vertice.y, vertice.z);

            if(Math.abs(vertice.x) >= MIN_DISTANCE || Math.abs(vertice.y) >= MIN_DISTANCE || Math.abs(vertice.z) >= MIN_DISTANCE)
                if(vertice.x >= -maxSideOffset && vertice.x <= maxSideOffset && vertice.y >= -maxSideOffset && vertice.y <= maxSideOffset)
                    if(vertice.floorDistance > -maxDistanceThreshold && vertice.floorDistance < -minDistanceThreshold)
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

        // export to *.ply file
        if(fileName && fileName.toLowerCase().substr(-4) == '.ply')
            writeToPlyFile(fileName, vertices);

        // export to *.obj file
        else if(fileName && fileName.toLowerCase().substr(-4) == '.obj')
            writeToObjFile('3d.obj', vertices);

        // write to std::out in *.obj format
        else writeToObjFile(null, vertices);
    }

    pointcloud.destroy();
    pipeline.stop();
    pipeline.destroy();
    rs2.cleanup();
}

function mapDepthToFloor(angle, x, y, depth)
{
    if(angle == 0)
        return depth;

    if(angle == 45)
        return .0307012186 * x + .8044191429 * y + .8287873915 * depth;

    throw 'depth mapping not defined for an angle of ' + angle + ' degrees';
}

function writeToPlyFile(fileName, vertices)
{
    const ply = fileName ? fs.createWriteStream(fileName) : { write: console.log, end: ()=>{} };
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

function writeToObjFile(fileName, vertices)
{
    const obj = fileName ? fs.createWriteStream(fileName) : { write: console.log, end: ()=>{} };
    obj.write('# OBJ File\n');
    obj.write('# Vertices: ' + vertices.length + '\n# Faces: 0\n');

    for(let i = 0; i < vertices.length; ++i)
        obj.write('vn 0.000000 0.000000 0.000000\nv ' + vertices[i].x + ' ' + vertices[i].y + ' ' + vertices[i].z + '\n');

    obj.end();
}

// if started from command line, write to file
if(process.argv.length > 2)
    module.exports(process.argv[2]);
