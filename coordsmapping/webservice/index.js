const pcd = require('./pcd.js'), math = require('mathjs');

let pcl = {"bestFitnessScore":0.000036,"R":[[0.122,0.169,-0.978],[0.935,-0.351,0.056],[-0.334,-0.921,-0.201]],"t":[-0.091,0.056,-0.247]};
// goal x=.55, y=.45

let model = new pcd.PcdFile('../../pcl/webservice/example_models/model5000.pcd');

for(let i = 0; i < model.countPoints(); ++i)
{
    let point = model.getPoint(i);
    let Tv = math.add(math.multiply(pcl.R, point), pcl.t);

    console.log(Tv);
}
