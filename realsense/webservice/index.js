const scan = require('./pointcloud.js'), express = require('express');

let app = express();
app.listen(8081);

app.get('/obj', function(req, res)
{
    // store response instead of writing to std::out
    let txt = ''; console.log = (line) => txt += line;

    // use Intel RealSense camera and create point cloud
    scan(undefined, req.query.frames || 100);

    // send 3D model via web service
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'text/plain');
    res.send(txt);
});

app.get('/obj/universalrobot', function(req, res)
{
    // store response instead of writing to std::out
    let txt = ''; console.log = (line) => txt += line;

    // configuration for scenery with CDP's universal robot
    const settings = (
    {
        resolutionWidth: 640,
        resolutionHeight: 480,
        maxSideOffset: .40,
        legoStructureAngle: 0,
        minDistanceThreshold: .20,
        maxDistanceThreshold: .365 // actual height directly underneath the camera lense 37.3 cm
    });

    // use Intel RealSense camera attached to the Universal Robot and create point cloud
    scan(undefined, req.query.frames || 1, settings);

    // send 3D model via web service
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'text/plain');
    res.send(txt);
});

app.get('/photo', function(req, res)
{
    const rs2 = require('node-librealsense'), pngFile = '/tmp/currentRealSensePhoto.png';

    let colorizer = new rs2.Colorizer();
    let pipeline = new rs2.Pipeline();
    pipeline.start();
    pipeline.waitForFrames();

    let frameset = pipeline.waitForFrames();
    for(let i = 0; i < frameset.size; ++i)
    {
        let frame = frameset.at(i);
        if(frame instanceof rs2.VideoFrame)
        {
            if(frame instanceof rs2.DepthFrame)
                frame = colorizer.colorize(frame);
            rs2.util.writeFrameToFile(pngFile, frame, 'png');
        }
    }

    pipeline.stop();
    pipeline.destroy();
    rs2.cleanup();

    // send photo via web service
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'image/png');
    res.sendFile(pngFile);
});
