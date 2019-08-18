const bla = require('./baselinealgo.js');

(async function()
{
    let timeBefore = new Date().getTime();
    let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd");
    let timeAfter = new Date().getTime();

    console.log(JSON.stringify(result));
    console.log();
    console.log((timeAfter - timeBefore) / 1000 + ' seconds');

    // for applying rotation in "CloudCompare" using "Edit > Apply Transformation > 4x4 Matrix" | @see https://bit.ly/2YOhrea
    for(let instance of result)
    {
        console.log();
        console.log(instance.R[0][0] + ' ' + instance.R[0][1] + ' ' + instance.R[0][2] + ' ' + instance.t[0]);
        console.log(instance.R[1][0] + ' ' + instance.R[1][1] + ' ' + instance.R[1][2] + ' ' + instance.t[1]);
        console.log(instance.R[2][0] + ' ' + instance.R[2][1] + ' ' + instance.R[2][2] + ' ' + instance.t[2]);
        console.log('0 0 0 1');
    }
})();
