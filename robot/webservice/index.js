const express = require('express'), ps = require('child_process'), fs = require('fs'), net = require('net');
const axios = require('axios'), queryString = require('querystring');

// create web app server instance
const app = express();
app.use(require('multer')().single());
app.listen(8084);

// inject CORS-enabling headers
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// move Universal Robot into scanning position
app.post('/scanpos', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        let script = fs.readFileSync('ur/scanpos.txt', 'utf8');
        runRobotScript(script);

        res.send({ sent: true });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// move Universal Robot into photo position
app.post('/photopos', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const coordinates = JSON.parse(req.body.coordinates);
        let robot_x = coordinates.y, robot_y = -coordinates.x, robot_z = coordinates.z, robot_rz = coordinates.phi;

        let script = fs.readFileSync('ur/photopos.txt', 'utf8');
        script = script.split('%%%ROBOT_X%%%').join(robot_x);
        script = script.split('%%%ROBOT_Y%%%').join(robot_y);
        script = script.split('%%%ROBOT_Z%%%').join(robot_z);
        script = script.split('%%%ROBOT_RZ%%%').join(robot_rz);
        runRobotScript(script);

        res.send({ sent: true });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// moves the Universal Robot arm to the pick-up position, then to the object coordinates, closes the clamshell and moves upwards agains
app.post('/pick', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const coordinates = JSON.parse(req.body.coordinates);
        let robot_x = coordinates.y, robot_y = -coordinates.x, robot_z = coordinates.z + .005, robot_rz = coordinates.phi;

        let script = fs.readFileSync('ur/pick.txt', 'utf8');
        script = script.split('%%%ROBOT_X%%%').join(robot_x);
        script = script.split('%%%ROBOT_Y%%%').join(robot_y);
        script = script.split('%%%ROBOT_Z%%%').join(robot_z);
        script = script.split('%%%ROBOT_RZ%%%').join(robot_rz);
        runRobotScript(script);

        res.send({ sent: true });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// sends a UR script to the specified Universal Robot socket
function runRobotScript(script, host = '192.168.30.200', port = 30001) // @see https://bit.ly/2kxgQuE and https://bit.ly/2lMAcfm
{
    try
    {
        let client = net.createConnection({ host, port });
        client.setTimeout(1000);
        client.setEncoding('utf8');
        client.on('data', function() { client.destroy() });
        client.write(script);
    }
    catch(x)
    {
        console.error(x);
    }
}
