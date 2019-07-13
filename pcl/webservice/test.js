const bla = require('./baselinealgo.js');

(async function()
{
    let result = await bla('example_models/model5000.pcd', "/home/leo/Dropbox/19_SS/Master's Thesis/work files/scene scans/scene_300frames.pcd");
    console.log(result);
})();
