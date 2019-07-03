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
