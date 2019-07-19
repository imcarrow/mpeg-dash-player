**Image docker container with stand from https://cloud.docker.com/repository/docker/imcarrow/mpeg-dash-player**

*1. Pull out the image of the container docker*
```
sudo docker pull imcarrow/mpeg-dash-player
```

*2. Run the image of the container docker*
```
docker run -p 80:80 -d imcarrow/mpeg-dash-player
```

*3. Running on http://localhost:80*



**Clone, settings, build and run a container from the current project**

*1. Clone project*
```
git clone git@bitbucket.org:imcarrow/mpeg-dash-player.git
```

*2. Configuring video streaming player*

Create a list of video streams with the name to file ~/mpeg-dash-player/data/video-items.json
```json
{
    "items":
    [
        {
            "name": "Video 1",
            "manifestUri": "https://demo.unified-streaming.com/video/tears-of-steel/tears-of-steel.ism/.mpd"
        },
        {
            "name": "Video 2",
            "manifestUri": "http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd"
        }
    ]
}
```

*3. Building the image*
```
docker build -t imcarrow/mpeg-dash-player .
```

*4. Run the image of the container docker*
```
docker run -p 80:80 -d imcarrow/mpeg-dash-player
```

*5. Running on http://localhost:80*