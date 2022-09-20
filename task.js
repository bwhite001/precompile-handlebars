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

class HandlebarTask{
    run(compiler, config) {
        this.compiler = compiler;
        this.ofs = compiler.outputFileSystem;
        this.ifs = compiler.inputFileSystem;
        this.data = config;
        this.assetsToEmit = {};
        this.precompile();
    }

    precompile() {
        const params = this.data;
        this.src = path.resolve(params.inputDir);
        this.output_file = params.outputFile;
        this.dist_file = path.resolve(params.outputFile);
        let outputDirectory = path.dirname(this.dist_file);
        this.variables = params.variables;
        if (!this.ofs.existsSync(outputDirectory)) {
            this.ofs.mkdirSync(outputDirectory, {recursive: true});
        }
        else if (this.ofs.existsSync(this.dist_file)) {
            this.ofs.rmSync(this.dist_file);
        }
        this.Handlebars = require("handlebars");
        this.glob = require("glob");
        this.compile();
        this.saveToOutputFile(this.file_string);
    }

    compile() {
        this.file_string = preFile;
        const files = this.ifs.readdirSync(this.src);
        for (const file of files) {
            try {
                if(path.extname(file) != ".hbs" && path.extname(file) != ".handlebars") {
                    continue;
                }
                let fileName = file, shortFileName = path.parse(file).name;
                let input = path.join(this.src, fileName);
                if (!this.ofs.lstatSync(input).isFile()) {
                    continue;
                }
                let content = this.ifs.readFileSync(input, "utf8");
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
            //this.ofs.writeFileSync(this.dist_file, content);
            this.assetsToEmit[this.output_file] = {
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

module.exports = HandlebarTask;
