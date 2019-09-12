const net = require('net'), fs = require('fs');

let client = net.createConnection({ host: '192.168.30.200', port: 30001 });
client.setTimeout(1000);
client.setEncoding('utf8');
client.on('data', function() { client.destroy() });

let script = fs.readFileSync('ur/scanpos.txt', 'utf8');
script = script.split('%%%ROBOT_X%%%').join(0.04807276960862707);
script = script.split('%%%ROBOT_Y%%%').join(-0.21985324760882186);
script = script.split('%%%ROBOT_Z%%%').join(-0.37100001320242826);
script = script.split('%%%ROBOT_RZ%%%').join(1.8325957145940461);
client.write(script);
