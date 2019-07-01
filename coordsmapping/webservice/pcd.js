// @see http://pointclouds.org/documentation/tutorials/pcd_file_format.php

const fs = require('fs');

class PcdFile
{
    /*
    # .PCD v0.7 - Point Cloud Data file format
    VERSION 0.7
    FIELDS normal_x normal_y normal_z _ x y z _
    SIZE 4 4 4 1 4 4 4 1
    TYPE F F F U F F F U
    COUNT 1 1 1 4 1 1 1 4
    WIDTH 5030
    HEIGHT 1
    VIEWPOINT 0 0 0 1 0 0 0
    POINTS 5030
    DATA binary
    */

    constructor(fileName)
    {
        this.headers = {};
        this.buffer = fs.readFileSync(fileName);

        let content = this.buffer.toString().split(/(?:\r\n|\r|\n)/g);
        for(let header of content)
        {
            // stop parsing once all headers are read
            if(Object.keys(this.headers).length == 10)
                break;

            // ignore comments
            if(header.substring(0, 1) == '#')
                continue;

            // store header
            let key = header.split(' ')[0];
            this.headers[key] = header.substring(key.length + 1).trim();
        }

        // calculate byte offset for header
        this.headerSize = this.buffer.toString().indexOf('DATA ' + this.headers['DATA']) + ('DATA ' + this.headers['DATA']).length + 1;

        // calculate binary size of each point in the cloud
        this.pointSize = 0;
        for(let i = 0; i < this.headers['FIELDS'].split(' ').length; ++i)
            this.pointSize += parseInt(this.headers['SIZE'].split(' ')[i]) * parseInt(this.headers['COUNT'].split(' ')[i]);

        // calculate byte offset for x field
        this.inPointOffsetX = 0;
        for(let i = 0; i < this.headers['FIELDS'].split(' ').length; ++i)
            if(this.headers['FIELDS'].split(' ')[i] == 'x')
                break;
            else this.inPointOffsetX += parseInt(this.headers['SIZE'].split(' ')[i]) * parseInt(this.headers['COUNT'].split(' ')[i]);

        // calculate byte offset for y field
        this.inPointOffsetY = 0;
        for(let i = 0; i < this.headers['FIELDS'].split(' ').length; ++i)
            if(this.headers['FIELDS'].split(' ')[i] == 'y')
                break;
            else this.inPointOffsetY += parseInt(this.headers['SIZE'].split(' ')[i]) * parseInt(this.headers['COUNT'].split(' ')[i]);

        // calculate byte offset for z field
        this.inPointOffsetZ = 0;
        for(let i = 0; i < this.headers['FIELDS'].split(' ').length; ++i)
            if(this.headers['FIELDS'].split(' ')[i] == 'z')
                break;
            else this.inPointOffsetZ += parseInt(this.headers['SIZE'].split(' ')[i]) * parseInt(this.headers['COUNT'].split(' ')[i]);
    }

    /** @return the number of cloud points in the file */
    countPoints()
    {
        return parseInt(this.headers['POINTS']);
    }

    /** @return the X, Y and Z value of the i-th point as a three-dimensional array */
    getPoint(i)
    {
        if(i < 0 || i > this.countPoints() - 1)
            throw 'invalid point: ' + i;

        if(this.headers['DATA'] == 'binary')
        {
            let offset = this.headerSize + i * this.pointSize;
            let x = this.buffer.readFloatLE(offset + this.inPointOffsetX); // TODO not necessarily float with four bytes
            let y = this.buffer.readFloatLE(offset + this.inPointOffsetY); // TODO not necessarily float with four bytes
            let z = this.buffer.readFloatLE(offset + this.inPointOffsetZ); // TODO not necessarily float with four bytes
            return [ x, y, z ];
        }

        // TODO ASCII format

        else throw this.headers['DATA'] + ' format not supported';
    }
}

module.exports = { PcdFile };
