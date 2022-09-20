const Task = require("laravel-mix/src/tasks/Task");
const path = require("path");
const fs = require("fs");
let Log = require("laravel-mix/src/Log");

const preFile = "this[\"App\"] = this[\"App\"] || {};\n\
this[\"App\"][\"templates\"] = this[\"App\"][\"templates\"] || {};\n\n";
const preTemplate1 = "this[\"App\"][\"templates\"][\"";
const preTemplate2 = "\"] = Handlebars.template(";
const postTemplate = ");\n\n";

const prePartialTemplate1 = "Handlebars.registerPartial(\"";
const prePartialTemplate2 = "\", Handlebars.template(";
const postPartial = "));\n\n";

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
        this.src = path.resolve(params.inputDir);
        this.dist_file = path.resolve(params.outputFile);
        let outputDirectory = path.dirname(this.dist_file);
        this.variables = params.variables;
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, {recursive: true});
        }
        else if (fs.existsSync(this.dist_file)) {
            fs.rmSync(this.dist_file);
        }
        this.Handlebars = require("handlebars");
        this.glob = require("glob");
        process.chdir(this.src);
        this.compile();
        fs.writeFileSync(this.dist_file, this.file_string);
        process.chdir(cwd);
    }

    compile() {
        this.file_string = preFile;
        const files = fs.readdirSync(this.src);
        for (const file of files) {
            try {
                if(path.extname(file) != ".hbs" && path.extname(file) != ".handlebars") {
                    continue;
                }
                let fileName = file, shortFileName = path.parse(file).name;
                let input = path.join(this.src, fileName);
                if (!fs.lstatSync(input).isFile()) {
                    continue;
                }
                let content = fs.readFileSync(input, "utf8");
                this.file_string += this.addTemplate(shortFileName, content);
            } catch (e) {
                throw new Error(
                    `could not render template ${file}: ${e.message || e}`
                );
            }
        }
    }

    addTemplate(shortFileName, data) {
        let templateSpec = this.Handlebars.precompile(data);
        if (shortFileName[0] === "_") {
            // handling partial
            templateSpec = prePartialTemplate1 + shortFileName.slice(1) + prePartialTemplate2 + templateSpec + postPartial;
        } else {
            templateSpec = preTemplate1 + shortFileName + preTemplate2 + templateSpec + postTemplate;
        }
        return templateSpec;
    }

    saveToOutputFile(content) {
        try {
            fs.writeFileSync(this.dist_file, content);
        } catch(e) {
            throw new Error(
                `could not save file at ${this.dist_file}: ${e.message || e}`
            );
        }
    }
}

module.exports = HandlebarTask;
