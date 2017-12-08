var program = require('commander');
 
program
  .version('0.1.0')
  .option('-p, --port <n>', 'port to serve http on')
  .parse(process.argv);


var static = require('node-static');
const path = './';
var fileServer = new static.Server(path);
const fs = require('fs');
const isVideo = fileName => fileName.match(/\.(mkv|avi|mpg|mpeg|mp4)$/);

const dirInfo = (dir) => new Promise((resolve, reject) => {
     fs.readdir(dir, function(err, files){
         if(err){
             reject(err);
         }else{
            return Promise.all(files.map(file => new Promise((resolve, reject) => {
                const getDir = dir => dir.lastIndexOf('/') === dir.length - 1 ? dir.substring(0, dir.length - 1) : dir;
                const path = `${getDir(dir)}/${file}`;
                 fs.stat(path, (err, stat) => {
                     if(err){
                         reject(err);
                     } else {
                         resolve({
                            file,
                            path: path.substring(1, path.length),
                            dir: stat.isDirectory(),
                            video: isVideo(file)
                         });
                     }
                 });
            }))).then((infos) => {

                const videos = infos.filter(i => i.video);
                const folders = infos.filter(i => i.dir);
                const files = infos.filter(i => !i.video && !i.dir);

                resolve({
                    videos,
                    folders,
                    files
                });
            }, e => {
                reject(e);
            });
         }
     })
});


const browser = require('./templates/browser');
const watch = require('./templates/watch');
const qs = require('qs');
const uri = require('uri-js');
var rootServer = new static.Server(__dirname);
require('http').createServer(function (request, response) {
    if(request.url.indexOf('/watch?path=') === 0 ){
        const q = qs.parse(uri.parse(request.url).query);
        const render = watch(q);
        response.end(render);
        return;
    }
    request.addListener('end', function () {
        fileServer.serve(request, response, function(err){
            if(err){
                 rootServer.serve(request, response, function(err){
                     if(err){
                        const url  = decodeURIComponent(request.url);
                        const dir = path + url.substring(1, url.length);
                        dirInfo(dir)
                        .then(({videos, folders}) => {
                        const parent = dir.substring(1, dir.lastIndexOf('/')) || '/';
                        
                        const render = browser({
                            title: dir,
                            videos,
                            folders,
                            parent
                        });
                        response.end(render);
                        }, function(e){
                            console.error(e);
                        });
                     }
                 });
            }
        });
    }).resume();
}).listen(program.port || 8080);
console.log('started on ', program.port || 8080);