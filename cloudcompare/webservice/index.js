const express = require('express'), ps = require('child_process'), fs = require('fs');
const app = express();

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
    
    // TODO
    ps.execSync('./do_cloudcompare.sh');
});

app.listen(80, () => log('webservice is ready'));