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

/** @see https://de.wikipedia.org/wiki/Drehmatrix */
function toRotationMatrix(rotationAxis, radiants)
{
    // TODO
    return [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ];
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
module.exports = async function(modelFile, sceneFile)
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
        if(isApproximatelyTheSame(highestPoint.coords[2], mapDepthToFloor(45, scene.getPoint(i)[0], scene.getPoint(i)[1], scene.getPoint(i)[2])))
            clusterTops.push(scene.getPoint(i));
    let instances = cluster(.10, clusterTops);

    // TODO cut irrelevant points from scene for each instance to speed up the procedure

    // find exact rotation and translation for each height-matching instance
    for(let instance of instances)
    {
        let a = instance.centroid, b = [ /* TODO */ ];

        let rotationAxis = // @see https://www.youtube.com/watch?v=NNdEZkvhxrc
        [
            0, // TODO
            0,
            0
        ];

        // rotate model sliding on the floor and find best fitting rotation
        for(let deg = 0; deg < 360; deg += 2)
        {
            let rotationMatrix = toRotationMatrix(rotationAxis, Math.PI / 180 * deg);
            let translationVector = [ 0, 0, 0 ]; // TODO
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
