const pcd = require('./pcd.js'), axios = require('axios'), map = require('./map.js'), cliProgress = require('cli-progress');

// show experiment progress as progress bar in command line
let experimentProgress = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
experimentProgress.start(200, 0);

async function experiment()
{
    // test different parameters and store results in local database for error and accuracy calculation
    for(let frames = 1; frames <= 300; frames += 10)
    {
        // scan scene
        let beginScanTime = new Date().getTime();
        const sceneObj = await axios.get('http://realsense.thesis.leoregner.eu/obj?frames=' + frames);
        let scanDuration = new Date().getTime() - beginScanTime;

        const tests = [];

        for(let model of [ 'model5000.pcd', 'cuboid5000.pcd', 'cylinder5000.pcd', 'ring5000.pcd' ])
        {
            const modelPcd = await axios.get('http://pcl.thesis.leoregner.eu/example_models/' + model);

            // extract reference points
            const cloud = new pcd.PcdFile('../../pcl/webservice/example_models/' + model);
            let point1 = cloud.getPoint(4745), // for "model5000.pcd" = [ 0.0345793217420578, 0.00040303703281097114, -0.02250000089406967 ]
                point2 = cloud.getPoint(1316); // for "model5000.pcd" = [ -0.03451980650424957, 0.009716058149933815, 0.02213151752948761 ]

            // template alignment
            tests.push(new Promise(function(resolve, reject)
            {
                let beginTime = new Date().getTime();
                let result = await axios.post(); // TODO file upload
                // TODO extract R and t value from result
                
                // map coordinates to world
                const m1 = map(point1, r, t), m2 = map(point2, r, t);

                // store result in local database
                experimentProgress.increment();
                storeResult(
                [
                    'ta', model, frames, new Date().getTime() - beginTime + scanDuration,
                    '', 0, 0, 0, 0, 0, 0,
                    m1[0], m1[1], m1[2], m2[0], m2[1], m2[2]
                ]);

                // test is done
                resolve();
            }));

            // correspondence grouping tests
            for(let algorithm of [ 'Hough', 'GC' ])
            {
                for(let parameter of [ 'model_ss', 'scene_ss', 'rf_rad', 'descr_rad', 'cg_size' ])
                {
                    for(let value = .001; value < .020; model_ss += .001)
                    {
                        for(let cg_thresh = .1; cg_tresh < 10; cg_tresh += .1)
                        {
                            tests.push(new Promise(function(resolve, reject)
                            {
                                let beginTime = new Date().getTime();
                                let result = await axios.post(); // TODO file upload
                                // TODO extract best model

                                // map coordinates to world
                                const m1 = map(point1, r, t), m2 = map(point2, r, t);

                                // store result in local database
                                experimentProgress.increment();
                                storeResult(
                                [
                                    'cg', model, frames, new Date().getTime() - beginTime + scanDuration,
                                    algorithm, parameter == 'model_ss' ? value : 0, parameter == 'scene_ss' ? value : 0, parameter === 'rf_rad' ? value : 0,
                                    parameter == 'descr_rad' ? value : 0, parameter == 'cg_size' ? value : 0, cg_tresh,
                                    .055, .045, .000, m1[0], m1[1], m1[2], // TODO model-dependent
                                    .000, .000, .000, m2[0], m2[1], m2[2] // TODO second reference point
                                ]);

                                // test is done
                                resolve();
                            }));
                        }
                    }
                }
            }
        }

        // wait until all test of this scan have finished before continuing to the next scan
        await Promise.all(tests);
    }

    // tell the command line that the progress bar does no long need to be updated
    experimentProgress.stop();
}

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
                             cgtresh FLOAT
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
                                       targetx1, targety1, targetz1, actualx1, actualy1, actualz1, targetx2, targety2, targetz2, actualx2, actualy2, actualz2)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)``);
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
