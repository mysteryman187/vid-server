
const fs = require('fs');
const ScreenCapture = require('./Screenshot');

module.exports = (options) => (request, response) => {
    const path = options.getPath(request);
    fs.access(path, fs.constants.R_OK, (err) => {
        if(err){
            response.statusCode = 404;
            response.end();
        } else {
            new ScreenCapture(path)
            .snap()
            .then(screenStream => screenStream.pipe(response, {end:true}))
            .catch((err) => {
                console.error(err);
                response.statusCode = 500;
                response.end();
            });
        }
    });
}
