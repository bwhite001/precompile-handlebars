const Task = require('laravel-mix/src/tasks/Task');
const path = require("path");
const fs = require("fs");
let Log = require('laravel-mix/src/Log');

const preFile = 'this["App"] = this["App"] || {};\n\
this["App"]["templates"] = this["App"]["templates"] || {};\n\n';
const preTemplate1 = 'this["App"]["templates"]["';
const preTemplate2 = '"] = Handlebars.template(';
const postTemplate = ');\n\n';

const prePartialTemplate1 = 'Handlebars.registerPartial("';
const prePartialTemplate2 = '", Handlebars.template(';
const postPartial = '));\n\n';

class HandlebarTask extends Task {

    run() {
        this.precompile();
    }

    onChange(updatedFile) {
        this.precompile();
        Log.line(`Update ${updatedFile}`);
    }

    precompile() {
        const params = this.data;
        const cwd = process.cwd();

        this.src = cwd + '/' + params.inputDir;
        this.dist_file = cwd + '/' + params.outputFile;
        let outputDirectory = this.dist_file.match(/(.*)\/.*/)[1];
        this.variables = params.variables;
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, {recursive: true});
        }
        this.Handlebars = require('handlebars');
        this.glob = require('glob');

        process.chdir(this.src)
        this.compile();
        process.chdir(cwd);
    }

    compile() {
        const files = this.glob.sync(this.src + '/' + '/^.*\\.hbs/');
        if (!fs.lstatSync(this.dist_file).isFile()) {
            throw new Error(
                `could not create file at ${this.dist_file}: ${e.message || e}`
            );
        }
        fs.writeFileSync(this.dist_file, preFile)
        for (const file of files) {
            try {
                let fileName = file, shortFileName = fileName.match(/(.*)\..*/)[1];
                let input = path.join(this.data.inputDir, fileName);
                if (!fs.lstatSync(input).isFile()) {
                    continue;
                }
                let content = fs.readFileSync(input, 'utf8');
                this.saveFile(shortFileName, content)
            } catch (e) {
                throw new Error(
                    `could not render template ${file}: ${e.message || e}`
                );
            }
        }
    }

    saveFile(shortFileName, data) {
        let templateSpec = this.Handlebars.precompile(data);
        if (shortFileName[0] === '_') {
            // handling partial
            templateSpec = prePartialTemplate1 + shortFileName.slice(1) + prePartialTemplate2 + templateSpec + postPartial;
        } else {
            templateSpec = preTemplate1 + shortFileName + preTemplate2 + templateSpec + postTemplate;
        }
        // console.log(templateSpec);
        fs.appendFileSync(this.dist_file, templateSpec);
    }
}

module.exports = HandlebarTask;
