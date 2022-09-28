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

class HandlebarRenderTask {
    constructor(src_dir, files, output_file, context) {
        this.mix = context;
        this.Handlebars = require("handlebars");
        this.src = src_dir;
        this.output_file = output_file;
        this.files = files;
    }


    async run() {
        this.assets = [];
        this.compile();
        this.output_file.write(this.file_string);
        this.assets.push(this.output_file);
    }

    compile() {
        this.file_string = preFile;
        for (const file of this.files) {
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
}

module.exports = HandlebarRenderTask;
