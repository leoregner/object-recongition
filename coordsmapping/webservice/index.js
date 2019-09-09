const express = require('express'), ps = require('child_process'), fileUpload = require('express-fileupload'), fs = require('fs');
const pcd = require('./pcd.js'), map = require('./map.js'), math = require('mathjs');
const uuidv4 = () => new Date().getTime() + (Math.random() + '').substring(2);

// create web app server instance
const app = express();
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use(require('body-parser').urlencoded({ extended: false }));
app.listen(8080);

// use await-able async exec function instead of execSync to avoid server blocking while executing
const exec = function(cmd, returnStdOut)
{
    return new Promise(function(resolve, reject)
    {
        const process = ps.exec(cmd);
        let returnValue = '';

        process.stdout.on('data', returnStdOut ? ((data) => returnValue += data) : console.log);
        process.stderr.on('data', console.error);

        process.on('close', function(exitCode)
        {
            if(exitCode == 0) resolve(returnValue);
            else reject(exitCode);
        });
    });
};

// inject CORS-enabling headers
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// graphical representation of experiment data
app.get('/experiment_results/*', require('./experiment_results/index.js'));

//
app.post('/grab', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const id = uuidv4();
        if(req.files.model) await exec('mv "' + req.files['model'].tempFilePath + '" /tmp/in_' + id + '_model.pcd');console.log('/tmp/in_'+id+'_model.pcd');
        const model = new pcd.PcdFile('/tmp/in_' + id + '_model.pcd');

        const instances = JSON.parse(req.body.recognition);

        let instance = instances[0]; // TODO

        let x = instance.t[0];
        let y = instance.t[1];
        let z = instance.t[2] + .005;

        let p1 = [ -0.015757733955979347, 0.031741950660943985, 0 ];//model.getPoint(req.query.p1);
        p1 = math.add(math.multiply(instance.R, p1), instance.t);

        let p2 = [ 0.01548727136105299, 0.03200000151991844, 0.00013623380800709128 ];//model.getPoint(req.query.p2);
        p2 = math.add(math.multiply(instance.R, p2), instance.t);

        let deltaX = p2[0] - p1[0];
        let deltaY = p2[1] - p1[1];
        let phi = -Math.atan(deltaX / deltaY) + Math.PI / 2;

        console.log(p1, p2);
        res.send({ x, y, z, phi }); // TODO move robot arm
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});
