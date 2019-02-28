const express = require('express'), exec = require('child_process').execSync;
const app = express();

app.get('/', function(req, res)
{
    exec('./make_3d.sh')
    res.download('/root/3D-R2N2/prediction.obj');
});

app.listen(8080, () => console.log('webservice is ready'));