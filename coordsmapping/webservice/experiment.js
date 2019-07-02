const pcd = require('./pcd.js');

// test different parameters and store results in local database for error and accuracy calculation
// Copyright Leopold Mathias Regner, 2019

let iterations = 0, model = 'model5000.pcd';

const cloud = new pcd.PcdFile('../../pcl/webservice/example_models/' + model);
let point1 = cloud.getPoint(4745), // [ 0.0345793217420578, 0.00040303703281097114, -0.02250000089406967 ]
    point2 = cloud.getPoint(1316); // [ -0.03451980650424957, 0.009716058149933815, 0.02213151752948761 ]

for(let frames = 1; frames <= 300; frames += 10)
{
    // TODO scanning

    // template alignment
    {
        let beginTime = new Date().getTime();

        // TODO

         ++iterations; storeResult([ 'ta', model, frames, new Date().getTime() - beginTime, model_ss, scene_ss, 1, 2, 3 ]);
    }

    // correspondence grouping
    for(let model_ss = .001; model_ss <= .02; model_ss += .001)
    {
        for(let scene_ss = .001; scene_ss <= .02; scene_ss += .001)
        {
            let beginTime = new Date().getTime();

            // TODO

            ++iterations; storeResult([ 'cg', model, frames, new Date().getTime() - beginTime, model_ss, scene_ss, 1, 2, 3 ]);
        }
    }
}

console.log('executed ' + iterations + ' iterations');

function storeResult(params)
{
    return new Promise(function(resolve, reject)
    {
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./experiment.sqlite3');

        db.serialize(function()
        {
            db.run(`CREATE TABLE IF NOT EXISTS measurements
                            (algo CHAR(2),
                             model VARCHAR(15),
                             frames INT,
                             duration INT,
                             modelss FLOAT,
                             sceness FLOAT,
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

            const insert = db.prepare(`INSERT INTO measurements (algo, model,
                                       frames, duration, modelss, sceness,
                                       targetx1, targety1, targetz1, actualx1, actualy1, actualz1, targetx2, targety2, targetz2, actualx2, actualy2, actualz2)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)``);
            insert.run(params);
            insert.finalize();

            resolve();
        });

        db.close();
        resolve();
    });
}
