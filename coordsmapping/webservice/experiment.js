const pcd = require('./pcd.js'), axios = require('axios'), map = require('./map.js'), cliProgress = require('cli-progress');
const fs = require('fs'), tmp = require('tmp'), FormData = require('form-data');

// show experiment progress as progress bar in command line
let experimentProgress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
experimentProgress.start(-1, 0);

async function experiment()
{
    // test different parameters and store results in local database for error and accuracy calculation
    for(let frames = 1; frames <= 300; frames += 50)
    {
        // scan scene
        let beginScanTime = new Date().getTime();
        const sceneObj = await axios.get('http://realsense.thesis.leoregner.eu/obj?frames=' + frames);
        const sceneObjFile = tmp.fileSync().name;
        fs.writeFileSync(sceneObjFile, sceneObj.data);
        let scanDuration = new Date().getTime() - beginScanTime;

        const scenarios =
        [
            {
                model: 'model5000.pcd',

                point1: 4745,
                targetx1: 0.055,
                targety1: 0.045,
                targetz1: 0.000,

                point2: 1316,
                targetx2: 0.000 + .020,
                targety2: 0.045 + .080,
                targetz2: 1.000
            }/*,
            {
                model: 'cuboid5000.pcd',

                point1: , // TODO
                targetx1: .,
                targety1: .,
                targetz1: .,

                point2: ,
                targetx2: ,
                targety2: ,
                targetz2:
            },
            {
                model: 'cylinder5000.pcd',

                point1: , // TODO
                targetx1: .,
                targety1: .,
                targetz1: .,

                point2: ,
                targetx2: ,
                targety2: ,
                targetz2:
            }*/
        ];

        for(let scenario of scenarios)
        {
            // extract reference points
            const cloud = new pcd.PcdFile('../../pcl/webservice/example_models/' + scenario.model);
            let point1 = cloud.getPoint(scenario.point1),
                point2 = cloud.getPoint(scenario.point2);

            // template alignment
            {
                let beginTime = new Date().getTime();

                // apply template alignment algorithm
                let uploadData = new FormData();
                let modelStream = fs.createReadStream('../../pcl/webservice/example_models/' + scenario.model); uploadData.append('model', modelStream);
                let sceneStream = fs.createReadStream(sceneObjFile); uploadData.append('scene', sceneStream);
                let result = { data: await upload('http://pcl.thesis.leoregner.eu/ta', uploadData) };

                // map coordinates to world
                let m1 = [ null, null, null ], m2 = [ null, null, null ];
                if(!result.data.error)
                {
                    m1 = map(point1, result.data.R, result.data.t);
                    m2 = map(point2, result.data.R, result.data.t);
                }

                // store result in local database
                experimentProgress.increment();
                await storeResult(
                [
                    'ta', scenario.model, frames, new Date().getTime() - beginTime + scanDuration,
                    null, null, null, null, null, null, null, result.data.bestFitnessScore,
                    scenario.targetx1, scenario.targety1, scenario.targetz1, m1[0], m1[1], m1[2],
                    scenario.targetx2, scenario.targety2, scenario.targetz2, m2[0], m2[1], m2[2]
                ]);
            }

            // correspondence grouping tests
            for(let algorithm of [ 'Hough', 'GC' ])
            {
                for(let parameter of [ 'model_ss', 'scene_ss', 'rf_rad', 'descr_rad', 'cg_size' ])
                {
                    for(let value = .001; value < .020; value += .005)
                    {
                        for(let cg_thresh = .1; cg_thresh < 10; cg_thresh += .5)
                        {
                            let beginTime = new Date().getTime();

                            // apply correspondence grouping algorithm
                            let uploadData = new FormData();
                            let cgParams = [ 'algorithm=' + algorithm, parameter + '=' + value, 'cg_thresh=' + cg_thresh ].join('&');
                            let modelStream = fs.createReadStream('../../pcl/webservice/example_models/' + scenario.model);
                            uploadData.append('model', modelStream);
                            let sceneStream = fs.createReadStream(sceneObjFile);
                            uploadData.append('scene', sceneStream);
                            let result = { data: await upload('http://pcl.thesis.leoregner.eu/cg?' + cgParams, uploadData) };

                            let m1 = [ null, null, null ], m2 = [ null, null, null ];
                            if(!result.error && result.data.models.length > 0)
                            {
                                // select found model instance with the most correspondences
                                let bestInstance = { correspondences: 0 };
                                for(let instance of result.data.models)
                                    if(bestInstance.correspondences < instance.correspondences)
                                        bestInstance = instance;

                                // map coordinates to world
                                m1 = map(point1, bestInstance.R, bestInstance.t);
                                m2 = map(point2, bestInstance.R, bestInstance.t);
                            }

                            // store result in local database
                            experimentProgress.increment();
                            await storeResult(
                            [
                                'cg', scenario.model, frames, new Date().getTime() - beginTime + scanDuration,
                                algorithm, parameter == 'model_ss' ? value : 0, parameter == 'scene_ss' ? value : 0, parameter === 'rf_rad' ? value : 0,
                                parameter == 'descr_rad' ? value : 0, parameter == 'cg_size' ? value : 0, cg_thresh, null,
                                scenario.targetx1, scenario.targety1, scenario.targetz1, m1[0], m1[1], m1[2],
                                scenario.targetx2, scenario.targety2, scenario.targetz2, m2[0], m2[1], m2[2]
                            ]);
                        }
                    }
                }
            }
        }
    }

    // tell the command line that the progress bar does no long need to be updated
    experimentProgress.stop();
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

/** store parameters in local sqlite database for statistical evaluation */
function storeResult(params)
{
    return new Promise(function(resolve, reject)
    {
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./experiment_results/data.sqlite3');

        db.serialize(function()
        {
            db.run(`CREATE TABLE IF NOT EXISTS measurements
                            (algo CHAR(2),
                             model VARCHAR(15),
                             frames INT,
                             duration INT,
                             calgo VARCHAR(5),
                             modelss FLOAT,
                             sceness FLOAT,
                             rfrad FLOAT,
                             descrrad FLOAT,
                             cgsize FLOAT,
                             cgtresh FLOAT,
                             bestfiness FLOAT,
                             targetx1 FLOAT,
                             targety1 FLOAT,
                             targetz1 FLOAT,
                             actualx1 FLOAT,
                             actualy1 FLOAT,
                             actualz1 FLOAT,
                             targetx2 FLOAT,
                             targety2 FLOAT,
                             targetz2 FLOAT,
                             actualx2 FLOAT,
                             actualy2 FLOAT,
                             actualz2 FLOAT)`);

            const insert = db.prepare(`INSERT INTO measurements (algo, model, frames, duration, calgo, modelss, sceness, rfrad, descrrad, cgsize, cgtresh,
                                       bestfiness, targetx1, targety1, targetz1, actualx1, actualy1, actualz1, targetx2, targety2, targetz2, actualx2,
                                       actualy2, actualz2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            insert.run(params);
            insert.finalize();

            resolve();
        });

        db.close();
        resolve();
    });
}

// start experiment
experiment();
