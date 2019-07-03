const express = require('express'), sqlite = require('sqlite3').verbose();

module.exports = async function(req, res, next)
{
    if(req.url.indexOf('/data') < 0)
        express.static('.')(req, res, next);

    else
    {
        // TODO send query results from data.sqlite3 to client
    }
};
