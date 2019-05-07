import org.openkinect.processing.*;
import java.io.*;
// @see https://www.youtube.com/watch?v=E1eIg54clGo

Kinect kinect;

void setup()
{
  //size(512, 424);
  println("work dir: " + System.getProperty("user.dir"));

  kinect = new Kinect(this);
  kinect.initDepth();
  kinect.initVideo();

  // define distance threshold in mm
  final int minThreshold = 0;
  final int maxThreshold = 1000;
  
  // get depth data
  final int[] depth = kinect.getRawDepth();

  // get rgb data
  final PImage img = kinect.getVideoImage();
  img.loadPixels();

  // get depth and color data for every pixel
  final ArrayList<CloudPoint> points = new ArrayList<CloudPoint>();

  for (int x = 0; x < kinect.width; ++x)
    for (int y = 0; y < kinect.height; ++y)
    {
      final int index = x + y * kinect.width, d = depth[index];
      final color c = img.pixels[index];

      if (minThreshold <= d && maxThreshold >= d)
      {
        final CloudPoint p = new CloudPoint();
        p.x = x;
        p.y = y;
        p.z = d;
        p.r = (int) red(c);
        p.g = (int) green(c);
        p.b = (int) blue(c);
        points.add(p);
      }
    }

  final StringBuffer data = new StringBuffer();
  data.append("ply\n");
  data.append("\t\tformat ascii 1.0\n");
  data.append("\t\telement vertex " + points.size() + "\n");
  data.append("\t\tproperty float x\n");
  data.append("\t\tproperty float y\n");
  data.append("\t\tproperty float z\n");
  data.append("\t\tproperty uchar red\n");
  data.append("\t\tproperty uchar green\n");
  data.append("\t\tproperty uchar blue\n");
  data.append("\t\tend_header\n\t\t");

  for (int i = 0; i < points.size(); ++i)
    data.append(points.get(i));

  file_put_contents("3d.ply", data.toString());

  exit();
}

void file_put_contents(String fileName, String data)
{
  try
  {
    final BufferedWriter writer = new BufferedWriter(new FileWriter(fileName));
    writer.write(data);
    writer.close();
  }
  catch(IOException x)
  {
    print("Error: " + x.getMessage());
  }
}

static class CloudPoint
{
  float x, y, z;
  int r, g, b;

  String toString()
  {
    return x + " " + y + " " + z + " " + r + " " + g + " " + b + "\n";
    //return "{\"x\":" + (int) x + ",\"y\":" + (int) y + ",\"depth\": " + (int) z + ",\"color\":\"#" + c + "\"},";
  }
}

/*void draw()
 {
 background(0);
 stroke(255);
 strokeWeight(2);
 beginShape(POINTS);
 
 int[] depth = kinect.getRawDepth();
 final int skip = 4;
 
 for(int x = 0; x < kinect.width; x += skip)
 for(int y = 0; y < kinect.height; y += skip)
 {
 int index = x + y * kinect.width;
 int d = depth[index];
 
 println(d);
 
 final PVector point = depthToPointCloudPos(x, y, d);
 vertex(point.x, point.y, point.z);
 }
 
 endShape();
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
 }*/
