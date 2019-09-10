const express = require('express'), math = require('mathjs');

// create web app server instance
const app = express();
app.use(require('multer')().single());
app.listen(8080);

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

        if(instances.length > 0)
        {
            for(let instance of instances)
                if(instance.quality > bestInstance.quality)
                    bestInstance = instance;
        }
        else throw 'no instances provided';

        let x = bestInstance.t[0];
        let y = bestInstance.t[1];
        let z = bestInstance.t[2] + .005;

        let p1 = math.add(math.multiply(bestInstance.R, [ 0, 0, 0 ]), bestInstance.t);
        let p2 = math.add(math.multiply(bestInstance.R, [ 1, 1, 1 ]), bestInstance.t);

        let deltaX = p2[0] - p1[0];
        let deltaY = p2[1] - p1[1];
        let deltaZ = p2[2] - p1[2];
        let phi = Math.atan2(bestInstance.R[1][0], bestInstance.R[0][0]);//Math.atan(deltaY / deltaX);

        console.log(p1, p2);
        res.send({ x, y, z, phi });
    }
    catch(x)
    {
        console.error(x);
        res.send({ error: x });
    }
});
