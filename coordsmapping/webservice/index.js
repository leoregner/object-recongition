const express = require('express'), math = require('mathjs');

// create web app server instance
const app = express();
app.use(require('multer')().single());
app.listen(8083);

// inject CORS-enabling headers
app.use(function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// graphical representation of experiment data
app.get('/experiment_results/*', require('./experiment_results/index.js'));

// calculate coordinates for Universal Robot
app.post('/coords', async function(req, res)
{
    res.header('Content-Type', 'application/json');

    try
    {
        const instances = JSON.parse(req.body.recognition);
        let bestInstance = { quality: 0 };

        // compensation if the object model's coordinate of origin is not the bottom center
        const modelOff = (
        {
            x: Number.parseFloat(req.body.off_x || 0),
            y: Number.parseFloat(req.body.off_y || 0),
            z: Number.parseFloat(req.body.off_z || 0)
        });

        if(instances.length > 0)
        {
            for(let instance of instances)
                if(instance.quality > bestInstance.quality)
                    bestInstance = instance;
        }
        else throw 'no instances provided';

        // calculate translation/coordinates of origin point
        let x = bestInstance.t[0] + modelOff.x - .010;
        let y = bestInstance.t[1] + modelOff.y + .007;
        let z = bestInstance.t[2] + modelOff.z + .005;

        // calculate rotation angle around Z axis | @see https://de.wikipedia.org/wiki/Kosinussatz
        let M = [ 0, 0, 0 ];
        let E = [ 1, 1, 0 ];
        let K = math.multiply(bestInstance.R, E);
        let pointDistance2D = (p1, p2) => Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
        let a = pointDistance2D(E, M), b = pointDistance2D(K, M), c = pointDistance2D(K, E);
        let phi = Math.acos((a * a + b * b - c * c) / (2 * a * b)) - Math.PI / 4;

        res.send({ x, y, z, phi });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});
