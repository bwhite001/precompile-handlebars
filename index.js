let mix = require("laravel-mix");
const HandlebarTask = require("./task");

class LaravelMixHandlebars {
    dependencies() {
        this.requiresReload = true;
        return ["fs","path","handlebars"];
    }
    name () {
        return "Handlebars";
    }

    register(inputDir, outputFile) {
        const config =
            {
                inputDir: inputDir,
                outputFile: outputFile
            };
        Mix.api.before(() => {
            let task = new HandlebarTask(config);
            task.run();
        })
        Mix.api.js(config.outputFile, config.outputFile);
    }
}

mix.extend("handlebars", new LaravelMixHandlebars());
