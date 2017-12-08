const fs = require('fs');
const Handlebars = require('handlebars');
const templateSrc = fs.readFileSync(__dirname + '/watch.html');
module.exports = Handlebars.compile(templateSrc.toString());