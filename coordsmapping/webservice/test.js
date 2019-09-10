const math = require('mathjs');

const instances = [{"R":[[-0.3907311284892738,0,-0.9205048534524403],[-0.9205048534524403,6.123233995736766e-17,0.3907311284892738],[5.636466611900672e-17,1,-2.3925381291581118e-17]],"t":[0.17216351296788102,0.020396599829887334,-0.37255809535131507],"quality":2.017335973745327}];

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
console.log({ x, y, z, phi, phi_deg: (phi * 180 / Math.PI) });
