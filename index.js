let mix = require("laravel-mix");

class LaravelMixHandlebars {
    dependencies() {
        this.requiresReload = true;
        return ['glob', 'handlebars']
    }
    name () {
        return 'Handlebars';
    }

    register(inputDir, outputFile) {
        this.config =
            {
                inputDir: inputDir,
                outputFile: outputFile
            };
        const HandlebarTask = require('./task');
        Mix.addTask(
            new HandlebarTask(this.config)
        )
    }

}

mix.extend('handlebars', new LaravelMixHandlebars());
