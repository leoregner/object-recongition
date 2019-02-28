const express = require('express'), ps = require('child_process'), fs = require('fs');
const app = express();

app.get('/', function(req, res)
{
    // TODO
    ps.execSync('./do_cloudcompare.sh');
});

app.listen(80, () => console.log('webservice is ready'));