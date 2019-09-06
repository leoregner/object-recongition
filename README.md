<!---
## System Requirements
1.  [Docker needs to be installed](https://medium.com/@calypso_bronte/installing-docker-in-kali-linux-2018-1-ef3a8ce3648)
2.  [Nvidia Drivers need to be installed](https://docs.kali.org/general-use/install-nvidia-drivers-on-kali-linux)
3.  Linux Distribution needs to be upgraded if problems with Nvidia drivers occur `apt-get update && apt-get upgrade && apt-get dist-upgrade`
4.  [Nvidia docker runtime needs to be installed](https://github.com/NVIDIA/nvidia-docker)

## Deployment
This project has been configured to automatically deploy changes of the `master` branch to the Nvidia server using
[Gitlab CI](https://gitlab.leoregner.eu/leoregner/master-thesis/blob/master/.gitlab-ci.yml).

-  https://docs.gitlab.com/runner/install/linux-manually.html
-  https://gitlab.com/gitlab-org/gitlab-runner/issues/1379#note_109693923
--->
![Build Status](https://gitlab.leoregner.eu/leoregner/master-thesis/badges/master/build.svg)

# Dependencies, Libraries & Frameworks
TODO - list all third party software, there licenses and successfully tested version numbers

# Start
Using [Docker](https://www.docker.com/), the dependencies are installed automatically.
All process tasks are deployed as web services in separate Docker containers.

```bash
docker-compose up -d --build
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
