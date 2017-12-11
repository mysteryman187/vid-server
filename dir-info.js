
const fs = require('fs');
const isVideo = fileName => fileName.match(/\.(mkv|avi|mpg|mpeg|mp4)$/);

const clean = require('./clean-path');

module.exports = (dir) => new Promise((resolve, reject) => {
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
                            file: clean(file),
                            path: clean(path.substring(1, path.length)),
                            dir: stat.isDirectory(),
                            video: !stat.isDirectory() && isVideo(file)
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