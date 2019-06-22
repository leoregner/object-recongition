const express = require('express'), ps = require('child_process'), fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.listen(8080);

const uuidv4 = () => new Date().getTime() + (Math.random() + '').substring(2);

const exec = function(cmd, returnStdOut) // use await-able async exec function instead of execSync to avoid server blocking while executing
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

app.get('/', async function(req, res)
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');

    let json = await exec('build/correspondence_grouping "model5000.pcd" "scene45deg_cutfloor.pcd" --api --model_ss 0.001 --scene_ss 0.001 2> /dev/null', true);
    res.send(json);
});

app.post('/', async function(req, res)
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');

    const id = uuidv4();
    log('received request - processing as', id);

    fs.mkdirSync('in_' + id);
    if(req.files.object) await exec('mv "' + req.files['object'].tempFilePath + '" in_' + id + '/model.obj');
    if(req.files.oscene) await exec('mv "' + req.files['oscene'].tempFilePath + '" in_' + id + '/scene.obj');

    // prepare 3D models
    await exec('build/converter "in_' + id + '/model.obj" "in_' + id + '/model.pcd"'); // points only, no mesh
    await exec('build/converter "in_' + id + '/scene.obj" "in_' + id + '/scene.pcd"');

    // execute object recognition program
    let json = await exec('build/correspondence_grouping "in_' + id + '/model.pcd" "in_' + id + '/scene.pcd" --api --model_ss 0.001 --scene_ss 0.001 2> /dev/null', true);
    res.send(json);
});
