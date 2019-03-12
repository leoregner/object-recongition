const express = require('express'), fs = require('fs');
const app = express();

let index = -1;

const log = function()
{
    let data = [ new Date().toLocaleString() ];
    for(let i = 0; i < arguments.length; ++i)
        data.push(arguments[i]);
    console.log.apply(null, data);
};

app.get('/', function(req, res)
{
    res.header('Access-Control-Allow-Origin', '*');
    
    // --- BEGIN OF FAKE CAMERA FOR TESTING PURPOSES
    
    let files = fs.readdirSync('fakecam');
    res.download('fakecam/' + files[++index % files.length], () => log('took photo'));
    
    // --- END OF FAKE CAMERA FOR TESTING PURPOSES
});

app.listen(80, () => log('webservice is ready'));