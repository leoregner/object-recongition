const express = require('express'), ps = require('child_process'), fileUpload = require('express-fileupload'), fs = require('fs');
const uuidv4 = () => new Date().getTime() + (Math.random() + '').substring(2), pcd = require('./pcd.js'), map = require('./map.js');

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

app.post('/map', async function(req, res)
{
    // TODO
});
