var static = require('node-static');

module.exports = options => {
    var fileServer = new static.Server(options.path);
    return (request, response, next) => {
        fileServer.serve(request, response, (err) => {
            if(err && err.status === 404) {
                next();
            }
        });
    };
}