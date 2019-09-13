const bla = require('./baselinealgo.js');

(async function()
{
    let timeBefore = new Date().getTime();

    // === PROBLEM CASES - 45 DEGREES ANGLE ===
    //let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd"); // minor angle problem (2% tolerance)
    //let result = await bla('example_models/cuboid5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd"); // major angle problem - wrong location with 5 mm
    //let result = await bla('example_models/cylinder5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd"); // minor angle problem (2% tolerance)
    //let result = await bla('example_models/ring5000x90.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd"); // wrong location detected (2% tolerance)

    // === GOOD TEST CASES - BIRD'S EYE VIEW ===
    //let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_o.pcd", 90);// perfect fit
    //let result = await bla('example_models/ring5000x90.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_o.pcd", 90);// perfect fit (2%) - wrong location with 5 mm

    // === TEST CASES UNIVERSAL ROBOT ===
    //let result = await bla('example_models/cuboid5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot2.pcd", 90, .02, .373);// good fit 5 mm tolernace
    let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot2.pcd", 90, .02, .373);// good fit 5 mm tolerance
    //let result = await bla('example_models/cylinder5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot2.pcd", 90, .02, .372);// good fit 5 mm tolerance
    //let result = await bla('example_models/cuboid5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot5.pcd", 90, .02, .372);// perfect fit 5 mm tolerance
    //let result = await bla('example_models/cuboid5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot6.pcd", 90, .02, .372);// perfect fit 5 mm tolerance
    //let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot6.pcd", 90, .02, .372);// perfect fit 5 mm tolerance
    //let result = await bla('example_models/cylinder5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot6.pcd", 90, .02, .372);// perfect fit 5 mm tolerance
    //let result = await bla('example_models/cuboid5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot7.pcd", 90, .02, .372, .003);// good fit 3 mm tolerance
    //let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot7.pcd", 90, .02, .372, .003);// wrong location with 3 mm
    //let result = await bla('example_models/cylinder5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/seestadt/universalrobot7.pcd", 90, .02, .372, .005);// wrong location with 3/5 mm

    let timeAfter = new Date().getTime();

    console.log(JSON.stringify(result));
    console.log();
    console.log((timeAfter - timeBefore) / 1000 + ' seconds');

    if(result.length > 0)
    {
        // extract instance with highest quality value
        let highestQuality = Math.max.apply(null, result.map((instance) => instance.quality));
        let bestInstances = result.filter((instance) => instance.quality == highestQuality);

        // print 4x4 transformation matrix for applying rotation in CloudCompare using "Edit > Apply Transformation > 4x4 Matrix" | @see https://bit.ly/2YOhrea
        for(let instance of bestInstances)
        {
            console.log();
            console.log(instance.R[0][0] + ' ' + instance.R[0][1] + ' ' + instance.R[0][2] + ' ' + instance.t[0]);
            console.log(instance.R[1][0] + ' ' + instance.R[1][1] + ' ' + instance.R[1][2] + ' ' + instance.t[1]);
            console.log(instance.R[2][0] + ' ' + instance.R[2][1] + ' ' + instance.R[2][2] + ' ' + instance.t[2]);
            console.log('0 0 0 1');
        }
    }
})();
