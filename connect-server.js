var program = require('commander');
 
program
  .version('0.1.0')
  .option('-p, --port <n>', 'port to serve http on')
  .parse(process.argv);

const http = require('http');
const ffmpegPath = require('ffmpeg-downloader').path;
process.env.FFMPEG_PATH = ffmpegPath;
var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const connect = require('connect');
var query = require('qs-middleware');
const handlebarsMiddleware = require('./handlebars-middleware');
const staticMiddleware = require('./node-static-middleware');
const dirInfo = require('./dir-info');
var app = connect();
// let f = 0;
// app.use((req, resp, next) => {
//     f++;
//     console.log(req.url, f);
//     resp.on('close', () => {
//         f--;
//         console.log('inFlight=', f);
//     });
//     resp.on('closed', () => {
//         f--;
//         console.log('inFlight=', f);
//     });
//     resp.on('finish', () => {
//         f--;
//         console.log('inFlight=', f);
//     });
//     next();
// })
app.use(query());
app.use(handlebarsMiddleware({
    templates: [
        `${__dirname}/templates/browser.html`,
        `${__dirname}/templates/watch.html`,
    ]
}));

app.use(staticMiddleware({
    path: './'
}));
app.use(staticMiddleware({
    path: __dirname
}));

const screenCaptureMiddleware = require('./ffmpeg-screencapture-middleware');
app.use('/preview', screenCaptureMiddleware({
    getPath: request => `.${request.query.path}`
}));

app.use('/watch', (request, response) => {
    // seems safe enough! What could go wrong?
    response.renderTemplate('watch', request.query);
});

const { spawn } = require('child_process');
app.use('/streams', function (request, response) {
    const query = request.query;
    
    const path = query.path;
    console.log('------------stream file', path);

    response.writeHead(200, {
         "Connection": "keep-alive",
         "Content-Type": "video/mp4",
         "Accept-Ranges": "bytes",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '0'
    });
    const ffmpeg = spawn(ffmpegPath, [
         "-i", `.${path}`, "-vcodec", "libx264", "-f", "mp4", "-movflags", "frag_keyframe+empty_moov", 
         "-reset_timestamps", "1", "-vsync", "1","-flags", "global_header", "-bsf:v", "dump_extra", "-y", "-"   // output to stdout
    ], {detached: false});

    ffmpeg.stdout.pipe(response);

    ffmpeg.stdout.on("data",function(data) {
        //console.log(data);
    });

    ffmpeg.stderr.on("data", function (data) {
        console.error(data.toString());
    });
    ffmpeg.on("exit", function (code) {
        console.log('exit with  exit code=', code);;
    });
    ffmpeg.on("error", function (e) {
        console.error('process error', e);
    });

     //TODO: Stream is only shut when the browser has exited, so switching screens in the client app does not kill the session
    // response.on("close", function () {
    //     console.log("resp close");
    //     ffmpeg.kill();
    // });

    //  response.on("finish", function () {
    //     console.log("resp finish");
    //     ffmpeg.kill();
    // });

    request.on("close", function () {
        console.log("req closed");
        ffmpeg.kill();
    });
    
    request.on("end", function () {
        console.log("req ended");
        ffmpeg.kill();
    });
});

;

const clean = require('./clean-path');
// browser page
app.use((request, response) => {
    const url  = decodeURIComponent(request.url);
    const dir = '.' + url; // url.substring(1, url.length);
    console.log('browser service', dir);
    dirInfo(dir)
    .then(({videos, folders}) => {
        const parent = clean(dir.substring(1, dir.lastIndexOf('/')) || '/');
        response.renderTemplate('browser', {
            title: clean(dir),
            videos,
            folders,
            parent
        });
    })
    .catch(err => {
        console.error(err);
        response.statusCode = 404;
        response.end();
    });
});


console.log('starting on ', program.port || 8080);
http.createServer(app).listen(program.port || 8080);
