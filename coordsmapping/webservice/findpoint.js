const pcd = require('./pcd.js'), k = (v) => parseInt(v * 1000);

// preparation for experiment

let model = new pcd.PcdFile('../../pcl/webservice/example_models/cuboid5000.pcd');
for(let i = 0; i < model.countPoints(); ++i)
{
    let point = model.getPoint(i);

    if(k(point[0]) == k(.0158676) && k(point[1]) == k(-.0160079) && k(point[2]) == k(.0489236))
        console.log('cuboid5000.pcd', 'point1', i, point);

    if(k(point[0]) == k(-.0158073) && k(point[1]) == k(.0157058) && k(point[2]) == k(.0000518932))
        console.log('cuboid5000.pcd', 'point2', i, point);
}

model = new pcd.PcdFile('../../pcl/webservice/example_models/cylinder5000.pcd');
for(let i = 0; i < model.countPoints(); ++i)
{
    let point = model.getPoint(i);

    if(k(point[0]) == k(.000478199) && k(point[1]) == k(-.000508029) && k(point[2]) == k(.0510038))
        console.log('cylinder5000.pcd', 'point1', i, point);

    if(k(point[0]) == k(-.00000670552) && k(point[1]) == k(.000156516) && k(point[2]) == k(.00000592334))
        console.log('cylinder5000.pcd', 'point2', i, point);
}

console.log(model.getPoint(2901));
