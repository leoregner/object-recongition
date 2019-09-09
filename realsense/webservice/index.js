const scan = require('./pointcloud.js'), express = require('express');

let app = express();
app.listen(8080);

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
