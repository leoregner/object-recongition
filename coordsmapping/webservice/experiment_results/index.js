const express = require('express'), sqlite = require('sqlite3').verbose();
let visualization = express.static('.');

module.exports = async function(req, res, next)
{
    // deliver static files for showing visualization
    visualization(req, res, function()
    {
        // send useful statistical evaluations for visualizations
        let db = new sqlite.Database('./experiment_results/data.sqlite3', 'OPEN_READONLY');

        db.serialize(function()
        {
            let errors = `(select algo, model, frames, duration, calgo,
                           modelss, sceness, rfrad, descrrad, cgsize, cgtresh as cgthresh,
                           bestfiness as bestfitness, (targetx1 - actualx1) * (targetx1 - actualx1) + (targety1 - actualy1) *
                           (targety1 - actualy1) + (targetz1 - actualz1) * (targetz1 - actualz1) + (targetx2 - actualx2) *
                           (targetx2 - actualx2) + (targety2 - actualy2) * (targety2 - actualy2) + (targetz2 - actualz2) *
                           (targetz2 - actualz2) as error from measurements) errors`; // TODO null = default value

            db.send = function(sql)
            {
                this.all(sql, function(error, results)
                {
                    if(error)
                    {
                        console.error(error);
                        res.send({ success: false, error })
                    }
                    else res.send(results);
                });
            };

            if(req.url.indexOf('/all.json') > -1)
                db.send('select * from measurements');

            else if(req.url.indexOf('/count.json') > -1)
                db.send('select count(*) as count from measurements');

            else if(req.url.indexOf('/algo.json') > -1)
                db.send(`select algo, avg(error) error, avg(duration) duration from ${errors} group by algo order by algo`);

            else if(req.url.indexOf('/model.json') > -1)
                db.send(`select model, avg(error) error, avg(duration) duration from ${errors} group by model order by model`);

            else if(req.url.indexOf('/frames.json') > -1)
                db.send(`select frames, avg(error) error, avg(duration) duration from ${errors} group by frames order by frames`);

            else if(req.url.indexOf('/calgo.json') > -1)
                db.send(`select calgo, avg(error) error, avg(duration) duration from ${errors} where calgo is not null group by calgo order by calgo`);

            else if(req.url.indexOf('/modelss.json') > -1)
                db.send(`select modelss, avg(error) error, avg(duration) duration from ${errors} group by modelss order by modelss`);

            else if(req.url.indexOf('/sceness.json') > -1)
                db.send(`select sceness, avg(error) error, avg(duration) duration from ${errors} group by sceness order by sceness`);

            else if(req.url.indexOf('/rfrad.json') > -1)
                db.send(`select rfrad, avg(error) error, avg(duration) duration from ${errors} group by rfrad order by rfrad`);

            else if(req.url.indexOf('/descrrad.json') > -1)
                db.send(`select descrrad, avg(error) error, avg(duration) duration from ${errors} group by descrrad order by descrrad`);

            else if(req.url.indexOf('/cgsize.json') > -1)
                db.send(`select cgsize, avg(error) error, avg(duration) duration from ${errors} group by cgsize order by cgsize`);

            else if(req.url.indexOf('/cgthresh.json') > -1)
                db.send(`select cgthresh, avg(error) error, avg(duration) duration from ${errors} group by cgthresh order by cgthresh`);

            else next();
        });

        db.close();
    });
};
