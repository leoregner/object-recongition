const math = require('mathjs');

// distance to error-prone measurement of origin point location
const observationalError = { x: .008131, y: .009809133977976614, z: -.005212169212641837 };

/** @see copy of same function in pointcloud.js */
function mapDepthToFloor(angle, x, y, depth)
{
    if(angle == 0)
        return depth;

    if(angle == 45)
        return .0307012186 * x + .8044191429 * y + .8287873915 * depth;

    throw 'depth mapping not defined for an angle of ' + angle + ' degrees';
}

/** coordinates mapping function */
module.exports = function(point, r, t)
{
    const translated = math.add(math.multiply(r, point), t);
    let angle = 45, x = translated[0], y = translated[1], z = translated[2];

    return [
        x + observationalError.x,
        y * Math.sin(Math.PI * (180 - 90 - angle) / 180) + observationalError.y,
        mapDepthToFloor(angle, x, y, z) + .19 + observationalError.z
    ];
};
