const Handlebars = require('handlebars');;
const fs = require('fs')
const path = require('path');

Handlebars.registerHelper('uriDecode', function(value) {
    return decodeURIComponent(value);
});

module.exports = options => {
    const templates = options.templates.map((template) => {
        const templateKey = path.parse(template).name;
        const templateSrc = fs.readFileSync(template);
        return { [templateKey] : Handlebars.compile(templateSrc.toString()) } ;
    }).reduce( (prev, cur) => {
        const templateKey = Object.keys(cur)[0];
        console.log('registered handlebars template:', templateKey);
        prev[templateKey] = cur[templateKey];
        return prev;
    }, {});
    
    return (req, res, next) => {
        res.renderTemplate = (template, data) => {
            res.end(templates[template](data));
        };
        next();
    };  
};
