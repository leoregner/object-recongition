# Dependencies, Libraries & Frameworks
This project uses the following third party software:

*  TODO - list all third party software, there licenses and successfully tested version numbers

# Start Using Docker
Using [Docker](https://www.docker.com/), the dependencies are installed automatically.
All process tasks are deployed as web services in separate Docker containers and can be addressed through a central proxy service.

```bash
docker-compose up -d --build
```

# Start Services Locally
Alternatively, all services can be executed natively on the local machine.
All dependencies, libraries and programs that would be installed automatically within the Docker containers are a prerequisite then.

```bash
./raspberrypi.sh
```

## Launch Process
Navigate to the HTTP port of the [process engine](http://processengine.thesis.leoregner.eu/) and drop the following JSON process model:

```json
[
    {
        "type": "parallel",
        "name": "",
        "branches":
        [
            [
                {
                    "type": "webservice",
                    "name": "scan scene",
                    "method": "GET",
                    "url": "http://realsense.thesis.leoregner.eu/obj",
                    "pre": "request.expect = 'binary';",
                    "post": "storage.saveBinary('scene', responseBody);"
                }
            ],
            [
                {
                    "type": "webservice",
                    "name": "select model",
                    "method": "GET",
                    "url": "http://pcl.thesis.leoregner.eu/example_models/model5000.pcd",
                    "pre": "request.expect = 'binary';",
                    "post": "storage.saveBinary('model', responseBody);"
                }
            ]
        ]
    },
    {
        "type": "webservice",
        "name": "object recognition",
        "method": "POST",
        "url": "http://pcl.thesis.leoregner.eu/ta",
        "pre": "request.data = new FormData();\nrequest.contentType = false;\nrequest.data.append('scene', storage.loadBinary('scene'), 'scene.obj');\nrequest.data.append('model', storage.loadBinary('model'), 'model.pcd');",
        "post": "storage.saveJSON('recognition', responseBody);"
    }
]
```
