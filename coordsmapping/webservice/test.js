const math = require('mathjs');

/*const instances = [{"R":[[-0.3907311284892738,0,-0.9205048534524403],[-0.9205048534524403,6.123233995736766e-17,0.3907311284892738],[5.636466611900672e-17,1,-2.3925381291581118e-17]],"t":[0.17216351296788102,0.020396599829887334,-0.37255809535131507],"quality":2.017335973745327}];

let bestInstance = { quality: 0 };
if(instances.length > 0)
{
    for(let instance of instances)
        if(instance.quality > bestInstance.quality)
            bestInstance = instance;
}
else throw 'no instances provided';

let x = bestInstance.t[0];
let y = bestInstance.t[1];
let z = bestInstance.t[2] + .005;

let p1 = math.add(math.multiply(bestInstance.R, [ 0, 0, 0 ]), bestInstance.t);
let p2 = math.add(math.multiply(bestInstance.R, [ 1, 1, 1 ]), bestInstance.t);

let deltaX = p2[0] - p1[0];
let deltaY = p2[1] - p1[1];
let deltaZ = p2[2] - p1[2];
let phi = Math.atan2(bestInstance.R[1][0], bestInstance.R[0][0]) + Math.PI / 2;//Math.atan(deltaY / deltaX);

console.log(p1, p2);
console.log({ x, y, z, phi, phi_deg: (phi * 180 / Math.PI) });*/

const instances = (
    [{"R":[[0.9975640502598242,0,0.0697564737441253],[0.0697564737441253,6.123233995736766e-17,-0.9975640502598242],[-4.2713521145274716e-18,1,6.108318105475815e-17]],"t":[0.1283362565365606,-0.030321343530263785,-0.3737586349229138],"quality":2.3289343899182966}]
);
let bestInstance = { quality: 0 };

// compensation if the object model's coordinate of origin is not the bottom center
const modelOff = (
{
    x:0,// Number.parseFloat(req.body.off_x || 0),
    y:0,// Number.parseFloat(req.body.off_y || 0),
    z:0// Number.parseFloat(req.body.off_z || 0)
});

if(instances.length > 0)
{
    for(let instance of instances)
        if(instance.quality > bestInstance.quality)
            bestInstance = instance;
}
else throw 'no instances provided';

let pointDistance = function(p1, p2)
{
    console.log(p1,p2);

    return Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
};

let M = [ 0, 0, 0 ];
let E = [ 1, 0, 0 ];
let K = math.multiply(bestInstance.R, E);
let a = pointDistance(E, M), b = pointDistance(K, M), c = pointDistance(K, E);

let phi = Math.acos((a * a + b * b - c * c) / (2 * a * b)) - Math.PI / 4;
console.log(phi + 'rad = ' + (phi * 180 / Math.PI) + 'deg');
