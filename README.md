
# vid-server
A simple http server and file browser with html5 video player to watch your video collection either remotely or on your home network from any browser. Use it to watch media files stored on you PC via a browser on your smart TV or blu-ray player. Or open up your home firewall and access your media remotely.

Any files already compatible with html5 video will be streamed to the client via the 'node-static' module. If a file is not compatible with html5 video it will be transcodeed on the fly using ffmpeg and the result is streamed to the client. ffmpeg is auto installed as part of npm-install so everything works out of the box!

## Getting started
* [Install node.js](http://nodejs.org/download/)
* Install npm package globally `npm -g install vid-server`
* Go to the folder you want to serve
* Run the server `vid-server`

## Options

    -p, --port <n>  the port to listen to for incoming HTTP connections

## Screens

![desktop screen](https://github.com/mysteryman187/vid-server/blob/master/screens/desktop.PNG?raw=true "Desktop")
![mobile screen](https://github.com/mysteryman187/vid-server/blob/master/screens/mobile.PNG?raw=true "Mobile")
![video screen](https://github.com/mysteryman187/vid-server/blob/master/screens/video.PNG?raw=true "Video")


## Known Issues
 - Seek wont work when transcoding with ffmpeg and streaming. (Good luck getting that working!)

## FAQ
* _Can I use this project in production environments?_ **Go for it!**
* _Can this server run php, ruby, python or any other cgi script?_ **No.**
* _Is this server ready to receive thousands of requests?_ **absolutely!.**