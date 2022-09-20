const path = require("path");
const fs = require("fs");

const preFile = "this[\"App\"] = this[\"App\"] || {};\n\
this[\"App\"][\"templates\"] = this[\"App\"][\"templates\"] || {};\n\n";
const preTemplate1 = "this[\"App\"][\"templates\"][\"";
const preTemplate2 = "\"] = Handlebars.template(";
const postTemplate = ");\n\n";

const prePartialTemplate1 = "Handlebars.registerPartial(\"";
const prePartialTemplate2 = "\", Handlebars.template(";
const postPartial = "));\n\n";

class HandlebarRenderer {

    constructor(options, plugin){
        this.options = options;
        this.plugin = plugin;
    }

    run() {
        this.assetsToEmit = this.plugin.assetsToEmit;
        this.precompile();
    }

    precompile() {
        const params = this.options;
        this.src = path.resolve(params.inputDir);
        this.output_file = params.outputFile;
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
        this.compile();
        this.saveToOutputFile(this.file_string);
    }

    compile() {
        this.file_string = preFile;
        const files = fs.readdirSync(this.src);
        for (const file of files) {
            try {
                if(path.extname(file) != ".hbs" && path.extname(file) != ".handlebars") {
                    continue;
                }
                this.plugin.addDependency(file);
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
            this.assetsToEmit[this.dist_file] = {
                source: () => content,
                size: () => content.length
            };
        } catch(e) {
            throw new Error(
                `could not save file at ${this.dist_file}: ${e.message || e}`
            );
        }
    }
}

module.exports = HandlebarRenderer;
