const express = require('express'), ps = require('child_process'), fs = require('fs'), crypto = { getRandomValues: require('get-random-values') };
const app = express();

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

app.get('/', function(req, res)
{
    const id = uuidv4();
    log('received request - processing as ', id);
    
    // create folder and store uploaded pictures there
    fs.mkdirSync('/root/3D-R2N2/in_' + id);
    //TODO https://www.npmjs.com/package/express-fileupload
    
    // execute script triggering 3D library
    ps.execSync('./make_3d.sh "' + id + '"');
    
    // stream output file as HTTP response
    res.download('/root/3D-R2N2/' + id + '.obj', function(err)
    {
        if(err)
        {
            console.log(err);
            res.status(500).end();
        }
        else res.end();
        
        try
        {
            // delete temporary files
            ps.execSync('rm -rf "/root/3D-R2N2/in_' +  '/"');
            fs.unlinkSync('/root/3D-R2N2/' + id + '.obj');
        }
        catch(x) {}
    });
});

app.listen(80, () => log('webservice is ready'));