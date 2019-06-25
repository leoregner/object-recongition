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

    const id = uuidv4();
    log('received request - processing as', id);

    fs.mkdirSync('in_' + id);
    if(req.files.model) await exec('mv "' + req.files['model'].tempFilePath + '" in_' + id + '/model.pcd');
    if(req.files.scene) await exec('mv "' + req.files['scene'].tempFilePath + '" in_' + id + '/scene.obj');
    await exec('build/converter "in_' + id + '/scene.obj" "in_' + id + '/scene.pcd"');

    // execute object recognition program
    let cmd = 'build/correspondence_grouping "in_' + id + '/model.pcd" "in_' + id + '/scene.pcd" --api --model_ss 0.001 --scene_ss 0.001 2> /dev/null';
    let json = await exec(cmd, true);
    res.send(json);
});

// template alignment algorithm
app.post('/ta', async function(req, res)
{
    res.header('Content-Type', 'application/json');

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
});
