const express = require('express'), ps = require('child_process'), fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.listen(8080);

const uuidv4 = () => new Date().getTime() + (Math.random() + '').substring(2);

const exec = function(cmd) // use await-able async exec function instead of execSync to avoid server blocking while executing
{
    return new Promise(function(resolve, reject)
    {
        const process = ps.exec(cmd);
        
        process.stdout.on('data', console.log);
        process.stderr.on('data', console.error);
        
        process.on('close', function(exitCode)
        {
            if(exitCode == 0) resolve();
            else reject(exitCode);
        });
    });
};

app.post('/', async function(req, res)
{
    res.header('Access-Control-Allow-Origin', '*');
    
    const id = uuidv4();
    log('received request - processing as', id);
    
    // TODO TEST DELETE
    //req.files = { object: { tempFilePath: '/root/webservice/object.ply' }, oscene: { tempFilePath: '/root/webservice/oscene.obj' } };
    // END TODO TEST DELETE
    
    let obj = req.files;
    fs.mkdirSync('in_' + id);
    if(req.files.object) await exec('mv "' + req.files['object'].tempFilePath + '" in_' + id + '/model.stl');
    if(req.files.oscene) await exec('mv "' + req.files['oscene'].tempFilePath + '" in_' + id + '/scene.ply');
    
    // execute script triggering 3D library
    await exec('build/correspondence_grouping "in_' + id + '/model.stl" "in_' + id + '/scene.ply"');
    
    // stream output file as HTTP response
    /*res.download('/root/cloudcompare/' + id + '.obj', async function(err)
    {
        if(err)
        {
            log('could not stream output file:', id, err);
            res.status(500).end();
        }
        else res.end();
        
        try
        {
            // delete temporary files
            await exec('rm -rf "/root/cloudcompare/in_' + id + '/"');
            //fs.unlinkSync('/root/cloudcompare/' + id + '.obj');
        }
        catch(x) { log('could not delete work files:', id, x.message || x) }
    });*/
});
