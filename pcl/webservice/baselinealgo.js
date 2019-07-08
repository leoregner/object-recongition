const pcd = require('./pcd.js');

function isApproximatelyTheSame(reference, value)
{
    const tolerance = 5; // per cent
    return value > reference * (1 - tolerance / 100) && value < reference * (1 + tolerance / 100);
}

/** @see copy of same function in pointcloud.js */
function mapDepthToFloor(angle, x, y, depth)
{
    if(angle == 0)
        return depth;

    if(angle == 45)
        return .0307012186 * x + .8044191429 * y + .8287873915 * depth;

    throw 'depth mapping not defined for an angle of ' + angle + ' degrees';
}

module.exports = async function(modelFile, sceneFile)
{
    const instances = [];

    let model = new pcd.PcdFile(modelFile);
    let scene = new pcd.PcdFile(sceneFile);

    // find highest point in model
    let highestPoint = null;
    for(let i = 0; i < model.countPoints(); ++i)
        if(highestPoint == null || model.getPoint(i)[2] < highestPoint.coords[2])
            highestPoint = { i, coords: model.getPoint(i) };

    // find same height in scene and assume that there's an instance
    for(let j = 0; j < scene.countPoints(); ++j)
        if(isApproximatelyTheSame(highestPoint.coords[2], mapDepthToFloor(scene.getPoint(j)[2])))
        {
            let bestFit = { intersectingVolume: 0 };

            // rotate model on floor and find best fit
            for(let deg = 0; i < 360; ++i)
            {
                let rotationMatrix = [ [], [], [], [] ]; // TODO
                let translationVector = []; // TODO

                let intersectingVolume = 0; // TODO

                if(intersectingVolume > bestFit.intersectingVolume)
                    bestFit = { "R": rotationMatrix, "t": translationVector, intersectingVolume };
            }

            instances.push({ "R": bestFit.R, "t": bestFit.t });
        }

    return instances;
};
