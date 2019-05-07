import org.openkinect.processing.*;
import java.io.*;
// @see https://www.youtube.com/watch?v=E1eIg54clGo

Kinect kinect;

void setup()
{
  size(512, 424);

  kinect = new Kinect(this);
  kinect.initDepth();
  kinect.initVideo();
}

void draw()
{
  background(0);
  
  // draw rgb data
  final PImage img = kinect.getDepthImage();
  image(img, 0, 0);
}

PVector depthToPointCloudPos(int x, int y, float depthValue)
{
  final PVector point = new PVector();
  point.x = (x - CameraParams.cx) * point.z / CameraParams.fx;
  point.y = (y - CameraParams.cy) * point.z / CameraParams.fy;
  point.z = (depthValue);
  return point;
}

static class CameraParams // camera hardware information
{
  final static float cx =  254.8780000f;
  final static float cy =  205.3950000f;
  final static float fx =  365.4560000f;
  final static float fy =  365.4560000f;
  final static float k1 =    0.0905474f;
  final static float k2 = -  0.2681900f;
  final static float k3 =    0.0950862f;
  final static float p1 =    0.0000000f;
  final static float p2 =    0.0000000f;
}
