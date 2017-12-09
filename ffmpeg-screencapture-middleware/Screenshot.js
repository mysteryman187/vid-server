const ffmpegPath = require('ffmpeg-downloader').path;
console.log('using ffmpeg @', ffmpegPath);
process.env.FFMPEG_PATH = ffmpegPath;
var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

module.exports = class Screenshot {
    constructor(path){
        this._filename = path;
    }
    snap(){
        return new Promise((resolve, reject) => {
            ffmpeg(this._filename)
            .on('filenames', filenames => this._snapFile = filenames[0])
            .on('end', () => {
                const readStreamFromFile = fs.createReadStream(__dirname + '/thumbs/' + this._snapFile);
                readStreamFromFile.on('end', () => {
                    fs.unlink(__dirname + '/thumbs/' + this._snapFile, err => {
                        if(err){
                            console.error(err);
                        }
                    });
                });
                resolve(readStreamFromFile);
            })
            .screenshots({
                count: 1,
                folder: __dirname + '/thumbs',
                filename: 'pre-' + Date.now() + '-%f'
            });
        })
    }
}