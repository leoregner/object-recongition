//

function storeResult(params)
{
    return new Promise(function(resolve, reject)
    {
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./experiment.sqlite3');

        db.serialize(function()
        {
            db.run('CREATE TABLE IF NOT EXISTS measurements (frames INT, modelss FLOAT, sceness FLOAT, errorx FLOAT, errory FLOAT, errorz FLOAT)');

            const insert = db.prepare('INSERT INTO measurements (frames, modelss, sceness, errorx, errory, errorz) VALUES (?, ?, ?, ?)');
            insert.run(params);
            insert.finalize();

            resolve();
        });

        //db.close();
        resolve();
    });
}

let iterations = 0;

for(let frames = 1; frames <= 300; frames += 10)
{
    for(let model_ss = .001; model_ss <= .02; model_ss += .001)
    {
        for(let scene_ss = .001; scene_ss <= .02; scene_ss += .001)
        {
            ++iterations;
            // TODO storeResult([ frames, model_ss, scene_ss, 1, 2, 3 ]);
        }
    }
}

console.log('executed ' + iterations + ' iterations');
