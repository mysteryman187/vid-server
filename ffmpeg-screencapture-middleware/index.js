

const ScreenCapture = require('./Screenshot');
module.exports = (options) => (request, response) => {
    const path = options.getPath(request);
    new ScreenCapture(path)
    .snap()
    .then(screenStream => screenStream.pipe(response, {end:true}))
    .catch((err) => {
        console.error(err);
        response.status = 500;
        response.end();
    });
}
