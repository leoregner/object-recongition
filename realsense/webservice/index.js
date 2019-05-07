const rs2 = require('node-librealsense');

const pc = new rs2.PointCloud();
const pipeline = new rs2.Pipeline();
pipeline.start();

const frameSet = pipeline.waitForFrames();
const pointsFrame = pc.calculate(frameSet.depthFrame);
pc.mapTo(frameSet.colorFrame);

let color = rameSet.colorFrame;
let points = pointsFrame;

if(points.vertices && points.textureCoordinates)
{
    console.log('size = ', points.size);
    console.log('data = ', new Uint8Array(points.vertices.buffer), new Uint8Array(points.textureCoordinates.buffer), color.data, color.width, color.height);
}

pc.destroy();
pipeline.stop();
pipeline.destroy();
rs2.cleanup();

/*let colorizer = new rs2.Colorizer();
let pipeline = new rs2.Pipeline();
pipeline.start();

for(let i = 0; i < 30; i++)
{
    pipeline.waitForFrames();
}

let frameset = pipeline.waitForFrames();

for(let i = 0; i < frameset.size; i++)
{
    let frame = frameset.at(i);
    
    if(frame instanceof rs2.VideoFrame)
    {
        if(frame instanceof rs2.DepthFrame)
        {
            frame = colorizer.colorize(frame);
        }
        
        let pngFile = 'rs-save-to-disk-output-' + rs2.stream.streamToString(frame.profile.streamType) + '.png';
        rs2.util.writeFrameToFile(pngFile, frame, 'png');
        console.log('Saved ', pngFile);
        
        let csvFile = 'rs-save-to-disk-output-' + rs2.stream.streamToString(frame.profile.streamType) + '-metadata.csv';
        rs2.util.writeFrameMetadataToFile(csvFile, frame);
    }
}

pipeline.stop();
pipeline.destroy();
rs2.cleanup();*/