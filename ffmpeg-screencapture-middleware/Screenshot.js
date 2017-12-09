const ffmpegPath = require('ffmpeg-downloader').path;
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
                resolve(fs.createReadStream(this._snapFile));
            })
            .screenshots({
                count: 1
            });
        })
    }
    stream (stream){
        // ffmpeg -i input.mov -vcodec h264 -acodec aac -strict -2 output.mp4

        // ffmpeg -i input.mov -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis output.webm
        
        return ffmpeg(this._filename)
             .format('mp4')

//              .audioCodec('libfaac')
//  *     .videoCodec('libx264')
//  * 
// //              //.preset('flashvideo')
//              .videoBitrate('1024k')
//              .videoCodec('libx264')
//             // .size('720x?')
//             .size('640x480')
//              .fps(24)
//               .audioBitrate('128k')
//               .audioChannels(2)
//              .audioCodec('aac')
            // .outputOptions(['-vtag DIVX'])
            // setup event handlers
            .output(stream)
            .on('end', function() {
                console.log('file has been converted succesfully');
            })
            .on('error', function(err) {
                console.log('an error happened: ', err);
            })         
    }
}