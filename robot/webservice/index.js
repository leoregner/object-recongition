const express = require('express'), ps = require('child_process'), fs = require('fs');

// create web app server instance
const app = express();
app.use(require('multer')().single());
app.listen(8080);

// inject CORS-enabling headers
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.post('/scanpos', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        let script = fs.readFileSync('ur/Leo_Go_D435_Pos', 'utf8');
        runRobotScript(script);

        res.send({ success: true });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// calculate coordinates for Universal Robot
app.post('/grab', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const coordinates = JSON.parse(req.body.coordinates);
        let robot_x = coordinates.y, robot_y = -coordinates.x, robot_z = coordinates.z, robot_rz = coordinates.phi;

        let script = fs.readFileSync('ur/Leo_Pick_Object', 'utf8');
        // TODO
        runRobotScript(script);

        res.send({ success: true });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

function runRobotScript(script, host = '192.168.30.30:8085') // urweb
{
    // TODO
}
