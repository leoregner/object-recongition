# Start Using Docker
Using [Docker](https://www.docker.com/), all required dependencies are installed automatically.
All process tasks are deployed as web services in separate Docker containers and can be accessed through the published ports.

```bash
docker-compose up -d --build
```

# Start Services Locally
Alternatively, all services can be executed natively on the local machine.
All dependencies, libraries and programs that would be installed automatically within the Docker containers are a prerequisite then.

```bash
./raspberrypi.sh
```

# Launch Process
Navigate to the [process engine](http://processengine.localhost/) and drop the following JSON process model:

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
                    "name": "scanning position",
                    "method": "POST",
                    "url": "http://localhost:8084/scanpos",
                    "post": "sleep(5 * 1000);"
                },
                {
                    "type": "webservice",
                    "name": "scan scene",
                    "method": "GET",
                    "url": "http://localhost:8081/obj/universalrobot",
                    "pre": "request.expect = 'binary';",
                    "post": "storage.saveBinary('scene', responseBody);"
                }
            ],
            [
                {
                    "type": "webservice",
                    "name": "select object to find",
                    "method": "GET",
                    "url": "http://localhost:8082/example_models/cuboid5000.pcd",
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
        "url": "http://localhost:8082/bl?angle=90&height=.372",
        "pre": "request.data = new FormData();\nrequest.contentType = false;\nrequest.data.append('scene', storage.loadBinary('scene'), 'scene.obj');\nrequest.data.append('model', storage.loadBinary('model'), 'model.pcd');",
        "post": "storage.saveJSON('recognition', responseBody);"
    },
    {
        "type": "webservice",
        "name": "calculate robot coordinates",
        "method": "POST",
        "url": "http://localhost:8083/coords",
        "pre": "request.data = new FormData();\nrequest.contentType = false;\nrequest.data.append('recognition', this.recognition);",
        "post": "console.log('move clamshell to: ', responseBody);\nstorage.saveJSON('clamshell', responseBody);"
    },
    {
        "type": "webservice",
        "name": "move clamshell",
        "method": "POST",
        "url": "http://localhost:8084/pick",
        "pre": "request.data = new FormData();\nrequest.contentType = false;\nrequest.data.append('coordinates', this.clamshell);",
        "post": "console.log(responseBody);"
    }
]
```
