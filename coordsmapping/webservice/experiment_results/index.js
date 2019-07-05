const express = require('express'), sqlite = require('sqlite3').verbose();

module.exports = async function(req, res, next)
{
    if(req.url.indexOf('/data') < 0)
        express.static('.')(req, res, next);

    else
    {
        let db = new sqlite.Database('./experiment_results/data.sqlite3');

        db.serialize(function()
        {
            let results = db.run('select count(*) from measurements');
            res.send(results);

            // TODO send useful statistical evaluations
        });

        db.close();
    }
};
