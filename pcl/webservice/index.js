const express = require('express'), ps = require('child_process'), fileUpload = require('express-fileupload'), fs = require('fs');
const uuidv4 = () => new Date().getTime() + (Math.random() + '').substring(2);

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

// provide request logger
const log = function()
{
    let data = [ new Date().toLocaleString() ];
    for(let i = 0; i < arguments.length; ++i)
        data.push(arguments[i]);
    console.log.apply(null, data);
};

// create web app server instance
const app = express();
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.listen(8080);

// inject CORS-enabling headers
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// publish available *.pcd object models
app.use('/example_models', express.static('example_models'));

// correspondence grouping algorithm
app.post('/cg', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const id = uuidv4();
        log('received request - processing as', id);

        fs.mkdirSync('in_' + id);
        if(req.files.model) await exec('mv "' + req.files['model'].tempFilePath + '" in_' + id + '/model.pcd');
        if(req.files.scene) await exec('mv "' + req.files['scene'].tempFilePath + '" in_' + id + '/scene.obj');
        await exec('build/converter "in_' + id + '/scene.obj" "in_' + id + '/scene.pcd"');

        // parameters
        let parameters = {};
        parameters.algorithm = req.query.algorithm || 'Hough';
        parameters.model_ss = req.query.model_ss || 0.001;
        parameters.scene_ss = req.query.scene_ss || 0.001;
        parameters.rf_rad = req.query.rf_rad || 0.015;
        parameters.descr_rad = req.query.descr_rad || 0.02;
        parameters.cg_size = req.cg_size || 0.01;
        parameters.cg_thresh = req.cg_tresh || 5.0;

        // execute object recognition program
        let cmd = 'build/correspondence_grouping "in_' + id + '/model.pcd" "in_' + id + '/scene.pcd" --api';
        for(let parameter in parameters) cmd += ' --' + parameter + ' ' + parameters[parameter];
        cmd += ' 2> /dev/null';
        let json = await exec(cmd, true);
        res.send(json);
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// template alignment algorithm
app.post('/ta', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const id = uuidv4();
        log('received request - processing as', id);

        fs.mkdirSync('in_' + id);
        if(req.files.model) await exec('mv "' + req.files['model'].tempFilePath + '" in_' + id + '/model.pcd');
        if(req.files.scene) await exec('mv "' + req.files['scene'].tempFilePath + '" in_' + id + '/scene.obj');
        await exec('build/converter "in_' + id + '/scene.obj" "in_' + id + '/scene.pcd"');

        // execute object recognition program
        let cmd = 'build/template_alignment --template "in_' + id + '/model.pcd" "in_' + id + '/scene.pcd" --api 2> /dev/null';
        let json = await exec(cmd, true);
        res.send(json);
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});

// my own baseline algorithm
app.post('/bl', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const id = uuidv4();
        log('received request - processing as', id);

        fs.mkdirSync('in_' + id);
        if(req.files.model) await exec('mv "' + req.files['model'].tempFilePath + '" in_' + id + '/model.pcd');
        if(req.files.scene) await exec('mv "' + req.files['scene'].tempFilePath + '" in_' + id + '/scene.obj');
        await exec('build/converter "in_' + id + '/scene.obj" "in_' + id + '/scene.pcd"');

        let angle = Number.parseInt(req.query.angle) || 45; // degrees
        let cameraHeight = Number.parseFloat(req.query.height) || .19; // meters
        let minClusterDistance = 0.02; // meters

        // execute base line algorithm
        let json = await require('./baselinealgo.js')('in_' + id + '/model.pcd', 'in_' + id + '/scene.pcd', angle, minClusterDistance, cameraHeight);
        res.send(json);
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});
