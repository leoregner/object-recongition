const express = require('express'), ps = require('child_process'), fs = require('fs'), axios = require('axios'), queryString = require('querystring');

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

// move Universal Robot to
app.post('/scanpos', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        let script = fs.readFileSync('ur/scanpos.txt', 'utf8');

        const response = await runRobotScript(script);
        res.send({ sent: true, response });
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
        let robot_x = coordinates.y, robot_y = -coordinates.x, robot_z = coordinates.z + .01, robot_rz = coordinates.phi;

        let script = fs.readFileSync('ur/pick.txt', 'utf8');
        script = script.split('%%%ROBOT_X%%%').join(robot_x);
        script = script.split('%%%ROBOT_Y%%%').join(robot_y);
        script = script.split('%%%ROBOT_Z%%%').join(robot_z);
        script = script.split('%%%ROBOT_RZ%%%').join(robot_rz);

        const response = await runRobotScript(script);
        res.send({ sent: true, response });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

async function runRobotScript(script, host = 'http://localhost:8085') // "urweb" (raspberry pi 192.168.30.30)
{
    console.log(script);

    try
    {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        let response = await axios({ url: host + '/cmd', method: 'POST', headers, data: queryString.encode({ script }) });
        return response.data;
    }
    catch(x)
    {
        console.error(x);
        return { error: x };
    }
}