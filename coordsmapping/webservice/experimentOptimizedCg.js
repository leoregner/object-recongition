const pcd = require('./pcd.js'), axios = require('axios'), map = require('./map.js');
const fs = require('fs'), tmp = require('tmp'), FormData = require('form-data');

async function experiment()
{
    const sceness = 0.001;
    const modelss = 0.001;
    const descrrad = 0.02;
    const algorithm = 'GC';
    const cgsize = 0.01;
    const cgthresh = 5;
    const frames = 1;

    let beginScanTime = new Date().getTime();

    const sceneObj = await axios.get('http://localhost:8081/obj?frames=' + frames);
    const sceneObjFile = tmp.fileSync().name;
    fs.writeFileSync(sceneObjFile, sceneObj.data);

    let scanDuration = new Date().getTime() - beginScanTime;

    const scenarios =
    [
        {
            model: 'model5000.pcd',

            point1: 4745, // one base corner
            targetx1: 0.055,
            targety1: 0.045,
            targetz1: 0.000,

            point2: 1316, // opposite base corner
            targetx2: 0.050 + .020,
            targety2: 0.045 + .080,
            targetz2: 1.000
        },
        {
            model: 'cuboid5000.pcd',

            point1: 2419, // one square corner
            targetx1: -.050,
            targety1: 0.014,
            targetz1: 0.000,

            point2: 1656, // opposite square corner
            targetx2: -.112,
            targety2: 0.025,
            targetz2: 0.032
        },
        {
            model: 'cylinder5000.pcd',

            point1: 1273, // center point of one circle
            targetx1: .105,
            targety1: .035,
            targetz1: 0.016,

            point2: 2705, // center point of other circle
            targetx2: .147,
            targety2: .035 + .023,
            targetz2: 0.016
        }
    ];

    for(let scenario of scenarios)
    {
        // extract reference points
        const cloud = new pcd.PcdFile('../../pcl/webservice/example_models/' + scenario.model);
        let point1 = cloud.getPoint(scenario.point1),
            point2 = cloud.getPoint(scenario.point2);

        let beginTime = new Date().getTime();

        // apply correspondence grouping algorithm
        let uploadData = new FormData();
        let cgParams = [ 'algorithm=' + algorithm, 'scene_ss=' + sceness, 'model_ss=' + modelss, 'descr_rad=' + descrrad, 'cg_size=' + cgsize, 'cg_thresh=' + cgthresh ].join('&');
        let modelStream = fs.createReadStream('../../pcl/webservice/example_models/' + scenario.model);
        uploadData.append('model', modelStream);
        let sceneStream = fs.createReadStream(sceneObjFile);
        uploadData.append('scene', sceneStream);
        let result = { data: await upload('http://localhost:8082/cg?' + cgParams, uploadData) };

        let m1 = [ null, null, null ], m2 = [ null, null, null ], bestInstance = { correspondences: 0 };
        if(!result.error && result.data.models.length > 0)
        {
            // select found model instance with the most correspondences
            for(let instance of result.data.models)
                if(bestInstance.correspondences < instance.correspondences)
                    bestInstance = instance;

            // map coordinates to world
            m1 = map(point1, bestInstance.R, bestInstance.t);
            m2 = map(point2, bestInstance.R, bestInstance.t);
        }

        let time = new Date().getTime() - beginTime + scanDuration;
        const error = Math.pow(m1[0] - scenario.targetx1, 2)
                    + Math.pow(m1[1] - scenario.targety1, 2)
                    + Math.pow(m1[2] - scenario.targetz1, 2)
                    + Math.pow(m2[0] - scenario.targetx2, 2)
                    + Math.pow(m2[1] - scenario.targety2, 2)
                    + Math.pow(m2[2] - scenario.targetz2, 2);

        console.log('=== ' + scenario.model + ' ===');
        console.log(time + ' ms | error: ' + error);
        console.log(m1, m2);

        console.log('\nrotation matrix:');
        console.log(bestInstance.R[0][0] + ' ' + bestInstance.R[0][1] + ' ' + bestInstance.R[0][2] + ' ' + bestInstance.t[0]);
        console.log(bestInstance.R[1][0] + ' ' + bestInstance.R[1][1] + ' ' + bestInstance.R[1][2] + ' ' + bestInstance.t[1]);
        console.log(bestInstance.R[2][0] + ' ' + bestInstance.R[2][1] + ' ' + bestInstance.R[2][2] + ' ' + bestInstance.t[2]);
        console.log('0 0 0 1');
    }
}

/** submits the given form and return a promise resovling the JSON-parsed response */
function upload(url, form)
{
    return new Promise(function(resolve, reject)
    {
        form.submit(url, function(error, response)
        {
            if(error)
                return reject(error);

            response.on('data', function(chunk)
            {
                let responseBody = chunk.toString('utf8'), json = JSON.parse(responseBody);
                resolve(json);
            });

            response.resume();
        });
    });
}

// start experiment
experiment();
