// Handlebars/Webpack pre-compilation plugin
// This plugin is meant to precompile and concatenate handlebars templates into a single file.
//
// Plugin can take a single object or an array of objects each describing a pair of templates-directory and output-file.
// example:
//  plugins: [
//      new HandlebarsPlugin([
//          {
//              inputDir: "templates",
//              outputFile: "output/compiled-templates.js"
//          },
//          {
//              inputDir: "cached-templates",
//              outputFile: "output/compiled-cached-templates.js"
//          }
//      ])
//  ]
//

const fs = require('fs');
const path = require('path');
const extend = require('util')._extend;
const async = require('async');
const mkdirp = require('mkdirp');
const Handlebars = require('handlebars');

const preFile = 'this["Handlebars"] = this["Handlebars"] || {};\n\
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};\n\n';
const preTemplate1 = 'this["Handlebars"]["templates"]["';
const preTemplate2 = '"] = Handlebars.template(';
const postTemplate = ');\n\n';

const prePartialTemplate1 = 'Handlebars.registerPartial("';
const prePartialTemplate2 = '", Handlebars.template(';
const postPartial = '));\n\n';

function CompileHandlebars(options) {
    let tasks = Array.isArray(options) ? options : [options];

    this.options = tasks.map(function (taskOptions) {
        return extend({
            inputDir: "templates",
            outputFile: "output/compiled-templates.js"
        }, taskOptions);
    });
}

CompileHandlebars.prototype.apply = function (compiler) {
    let plugin = this;
    console.log("CompileHandlebars plugin is loading... " + JSON.stringify(plugin.options));

    compiler.plugin('run', function (compilation, callback) {
        async.parallel(plugin.options.map(function (options) {
            return function (cb) {
                doTask(options, cb);
            }
        }), callback);
    });

    function doTask(options, callback) {
        let index = 0;
        let outputFile = path.join(options.inputDir, options.outputFile);

        async.series([
            function (cb) {
                let outputDirectory = outputFile.match(/(.*)\/.*/)[1];
                console.log("outputFile " + outputFile + " outputDirectory " + outputDirectory);
                mkdirp(outputDirectory, function (err) {
                    if (err) console.error(err);
                    return cb(err);
                });
            },
            function (cb) {
                fs.writeFile(outputFile, preFile, function (err) {
                    return cb(err);
                })
            },
            function (cb) {
                fs.readdir(options.inputDir, function (err, files) {
                    if (err) {
                        console.error("Failed to read directory");
                        return;
                    }
                    files = files.filter(function (item) {
                        return /^.*\.handlebars/.test(item);
                    });
                    console.log("Number of templates to process: " + files.length);
                    async.whilst(function () {
                        return index < files.length;
                    }, function (cb) {
                        let fileName = files[index], shortFileName = fileName.match(/(.*)\..*/)[1];
                        let input = path.join(options.inputDir, fileName);
                        if (!fs.lstatSync(input).isFile()) {
                            setTimeout(function () {
                                index++;
                                cb();
                            }, 0);
                            return;
                        }
                        console.log(input);
                        fs.readFile(input, 'utf8', function (err, data) {
                            if (err) {
                                console.log(err);
                                return cb(err);
                            }
                            let templateSpec = Handlebars.precompile(data);
                            if (shortFileName[0] === '_') {
                                // handling partial
                                templateSpec = prePartialTemplate1 + shortFileName.slice(1) + prePartialTemplate2 + templateSpec + postPartial;
                            } else {
                                templateSpec = preTemplate1 + shortFileName + preTemplate2 + templateSpec + postTemplate;
                            }
                            console.log(templateSpec);
                            fs.appendFile(outputFile, templateSpec, function (err) {
                                index++;
                                cb(err);
                            });
                        });
                    }, cb);
                });
            },
            function (cb) {
                console.log("Precompiled " + index + " templates from " + options.inputDir + " to " + options.outputFile);
                cb();
            }
        ], callback);
    }
};

module.exports = CompileHandlebars;
