let mix = require("laravel-mix");
const HandlebarsRenderPlugin = require("./plugin");

class LaravelMixHandlebars {
    dependencies() {
        return ["fs","path","handlebars"];
    }
    name () {
        return "Handlebars";
    }

    register(inputDir, outputFile) {
        this.config =
        {
            inputDir: inputDir,
            outputFile: outputFile
        };
    }

    webpackPlugins() {
        return new HandlebarsRenderPlugin(this.config);
    }
}

mix.extend("handlebars", new LaravelMixHandlebars());
