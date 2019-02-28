## System Requirements
1.  [Docker needs to be installed](https://medium.com/@calypso_bronte/installing-docker-in-kali-linux-2018-1-ef3a8ce3648)
2.  [Nvidia Drivers need to be installed](https://docs.kali.org/general-use/install-nvidia-drivers-on-kali-linux)
3.  Linux Distribution needs to be upgraded if problems with Nvidia drivers occur `apt-get update && apt-get upgrade && apt-get dist-upgrade`
4.  [Nvidia docker runtime needs to be installed](https://github.com/NVIDIA/nvidia-docker)

## Deployment
This project has been configured to automatically deploy changes of the `master` branch to the Nvidia server using [Gitlab CI](https://gitlab.leoregner.eu/leoregner/master-thesis/blob/master/.gitlab-ci.yml).

![Build Status](https://gitlab.leoregner.eu/leoregner/master-thesis/badges/master/build.svg)

-  https://docs.gitlab.com/runner/install/linux-manually.html
-  https://gitlab.com/gitlab-org/gitlab-runner/issues/1379#note_109693923