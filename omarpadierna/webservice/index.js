const express = require('express'), ps = require('child_process'), fs = require('fs');
const crypto = { getRandomValues: require('get-random-values') }, fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

const server = app.listen(80, () => log('webservice is ready'));
server.setTimeout(5 * 60 * 1000);

const uuidv4 = function() // @author https://stackoverflow.com/a/2117523
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};

const log = function()
{
    let data = [ new Date().toLocaleString() ];
    for(let i = 0; i < arguments.length; ++i)
        data.push(arguments[i]);
    console.log.apply(null, data);
};

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
    
    // create folder to store uploaded pictures
    fs.mkdirSync('in_' + id);
    
    // move uploaded pictures and convert to JPEG file with max side of 4000px @see https://nghiaho.com/?page_id=253
    for(let i in req.files) mv(req.files[i].tempFilePath, 'in_' + id + '/' + i + '.jpg');
    
    // execute script triggering 3D library
    await exec('./make_3d.sh "' + id + '"');
    
    // stream output file as HTTP response
    res.download(id + '.ply', async function(err)
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
            await exec('rm -rf "in_' + id + '/"');
            fs.unlinkSync(id + '.ply');
        }
        catch(x) { log('could not delete work files:', id, x.message || x) }
    });
});