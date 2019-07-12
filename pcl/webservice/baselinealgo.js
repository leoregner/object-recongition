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

    // find (clusters of) points with same height in scene and assume that there's an instance
    for(let j = 0; j < scene.countPoints(); ++j)
        if(isApproximatelyTheSame(highestPoint.coords[2], mapDepthToFloor(scene.getPoint(j)[2])))
        {
            // TODO instances.push({ ... });
        }

    // find exact rotation and translation for each height-matching instance
    for(let instance of instances)
    {
        let centerOfRotation = [ 0, 0, 0 ];

        // TODO

        // rotate model sliding on the floor and find best fitting rotation
        for(let deg = 0; i < 360; ++i)
        {
            let rotationMatrix = [ [], [], [], [] ]; // TODO
            let translationVector = []; // TODO

            let quality = 0; // TODO

            if(quality > instance.quality)
            {
                instance.R = rotationMatrix;
                instance.t = translationVector;
                instance.quality = quality;
            }
        }
    }

    return instances;
};
