let mix = require("laravel-mix");
const LaravelMixHandlebarsWebpack = require("./plugin");

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
        return new LaravelMixHandlebarsWebpack(this.config);
    }
}

mix.extend("handlebars", new LaravelMixHandlebars());
