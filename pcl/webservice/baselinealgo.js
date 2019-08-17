const pcd = require('./pcd.js'), math = require('mathjs');

/** @return whether the given values are approximately the same */
function isApproximatelyTheSame(reference, value)
{
    const tolerance = 2; // per cent
    return value > reference * (1 - tolerance / 100) && value < reference * (1 + tolerance / 100);
}

/** @see copy of same function in pointcloud.js */
function mapDepthToFloor(angle, x, y, depth)
{
    if(angle == 0)
        return depth + .19;

    if(angle == 45)
        return .0307012186 * x + .8044191429 * y + .8287873915 * depth + .19;

    throw 'depth mapping not defined for an angle of ' + angle + ' degrees';
}

/** @return the Euclidean distance between the two given three-dimensional points */
function distance(pointA, pointB)
{
    let sqrdDist = Math.pow(Math.abs(pointA[0] - pointB[0]), 2) + Math.pow(Math.abs(pointA[1] - pointB[1]), 2) + Math.pow(Math.abs(pointA[2] - pointB[2]), 2);
    return Math.sqrt(sqrdDist);
}

/** divide points into clusters, whereas each cluster has a minimum distance between every other cluster of `minClusterDistance` */
function cluster(minClusterDistance, points)
{
    let clusters = [ { points: [ points[0] ] } ];
    points.splice(0, 1);

    // points go in the cluster, which has a member point less than `minClusterDistance` away
    while(points.length > 0)
    {
        outter:
        for(let k = 0; k < points.length; ++k)
            for(let i = 0; i < clusters.length; ++i)
                for(let j = 0; j < clusters[i].points.length; ++j)
                    if(distance(clusters[i].points[j], points[k]) < minClusterDistance)
                    {
                        clusters[i].points.push(points[k]);
                        points.splice(k, 1);
                        --k; continue outter;
                    }

        // if no more point could have been added to any existing cluster, but there are still points left, open a new cluster
        if(points.length > 0)
        {
            clusters.push({ points: [ points[0] ] });
            points.splice(0, 1);
        }
    }

    // calculate centroid for every cluster
    for(let i = 0; i < clusters.length; ++i)
    {
        clusters[i].centroid = [ 0, 0, 0 ];
        for(let j = 0; j < clusters[i].points.length; ++j)
        {
            clusters[i].centroid[0] += clusters[i].points[j][0] / clusters[i].points.length;
            clusters[i].centroid[1] += clusters[i].points[j][1] / clusters[i].points.length;
            clusters[i].centroid[2] += clusters[i].points[j][2] / clusters[i].points.length;
        }
    }

    return clusters;
}

/** @see https://en.wikipedia.org/wiki/Rotation_matrix#Conversion_from_and_to_axis%E2%80%93angle */
function toRotationMatrix(rotationAxis, rad)
{
    let u = math.divide(rotationAxis, math.norm(rotationAxis));

    return (
    [
        [
            Math.cos(rad) + Math.pow(u[0], 2) * (1 - Math.cos(rad)),
            u[0] * u[1] * (1 - Math.cos(rad)) - u[2] * Math.sin(rad),
            u[0] * u[2] * (1 - Math.cos(rad)) + u[1] * Math.sin(rad)
        ],
        [
            u[1] * u[0] * (1 - Math.cos(rad)) + u[2] * Math.sin(rad),
            Math.cos(rad) + Math.pow(u[1], 2) * (1 - Math.cos(rad)),
            u[1] * u[2] * (1 - Math.cos(rad)) - u[0] * Math.sin(rad)
        ],
        [
            u[2] * u[0] * (1 - Math.cos(rad)) - u[1] * Math.sin(rad),
            u[2] * u[1] * (1 - Math.cos(rad)) + u[0] * Math.sin(rad),
            Math.cos(rad) + Math.pow(u[2], 2) * (1 - Math.cos(rad))
        ]
    ]);
}

/** @return the sum of all distances between each rotated model point and their closest correspondences in the scene */
function closestPointsDistanceSum(model, r, t, scene)
{
    let distanceSum = 0;

    // select points as features and determine their distance to scene
    for(let i = 0; i < model.countPoints(); i += 100)
    {
        const translated = math.add(math.multiply(r, model.getPoint(i)), t);
        let closestDistance = Infinity;

        // find closest point in scene
        for(let j = 0; j < scene.countPoints(); ++j)
        {
            let d = distance(scene.getPoint(j), translated);
            if(d < closestDistance)
                closestDistance = d;
        }

        distanceSum += closestDistance;
    }

    return distanceSum;
}

/** my baseline algorithm for object recognition */
module.exports = function(modelFile, sceneFile, angle = 45)
{
    let model = new pcd.PcdFile(modelFile);
    let scene = new pcd.PcdFile(sceneFile);

    // find highest point in model
    let highestPoint = null;
    for(let i = 0; i < model.countPoints(); ++i)
        if(highestPoint == null || model.getPoint(i)[2] > highestPoint.coords[2])
            highestPoint = { i, coords: model.getPoint(i) };

    // find (clusters of) points with same height in scene and assume that there's an instance
    let clusterTops = [];
    for(let i = 0; i < scene.countPoints(); i += 5)
        if(isApproximatelyTheSame(highestPoint.coords[2], mapDepthToFloor(angle, scene.getPoint(i)[0], scene.getPoint(i)[1], scene.getPoint(i)[2])))
            clusterTops.push(scene.getPoint(i));
    const instances = cluster(.10, clusterTops);

    // calculate rotation matrix for pre rotation around X axis to apply the view angle
    let preRotation = (angle == 0) ? [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] : toRotationMatrix([ 1, 0, 0 ], Math.PI / 180 * angle);

    // find exact rotation and translation for each height-matching instance
    for(let instance of instances)
    {
        // cut irrelevant points from scene for each instance to speed up the procedure
        // TODO

        // rotate model around Y axis (sliding on the floor) to find best fitting rotation
        for(let deg = 0; deg < 360; deg += 2)
        {
            let translationVector = instance.centroid; // FIXME
            let rotationMatrix = math.multiply(preRotation, toRotationMatrix([ 0, 1, 0 ], Math.PI / 180 * deg));
            let quality = 1 / closestPointsDistanceSum(model, rotationMatrix, translationVector, scene);

            if(quality > (instance.quality || 0))
            {
                instance.R = rotationMatrix;
                instance.t = translationVector;
                instance.quality = quality;
            }
        }

        // to save bandwith, delete instance properties that are no longer needed
        delete instance.points;
        delete instance.centroid;
    }

    return instances;
};
