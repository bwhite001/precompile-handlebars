const fs = require("fs");
const path = require("path");
const mix = require("laravel-mix");
const HandlebarRenderTask = require("./renderer");
const { Component } = require("laravel-mix/src/components/Component");
const File = require("laravel-mix/src/File");
module.exports = class PrecompileHandlebarMixPlugin  extends Component {
    /**
	 * Register new tasks based on the provided glob pattern.
	 *
	 * Called when the user uses this extension in the `webpack.mix.js`.
	 *
	 * @param {string} src A shell glob pattern, or just a path to a source folder.
	 * @param {string} target_file The target directory path.
	 */
    register(src, target_file = "") {
        this.src = src;
        this.target_file = target_file;
        const src_paths = fs.readdirSync(this.src);
        src_paths.filter(file => { return path.extname(file) == ".hbs" || path.extname(file) == ".handlebars";});
        if (!src_paths.length) throw new Error(`"${this.src}" didn't yield any results`);
        this.output = new File(this.target_file);
        this.context.addTask(
            new HandlebarRenderTask(this.src, src_paths, this.output, this.context)
        );
    }

    /**
	 * This method is triggered after the
	 * user's webpack.mix.js file has executed.
	 */
    boot() {
        mix.override(webpackConfig => {
            const plugins = webpackConfig.plugins;

            if (plugins)
                plugins.push(this);
            else {
                webpackConfig.plugins = [this];
            }
        });
    }

    apply() {
        // compiler.hooks.done.tapAsync(PrecompileHandlebarMixPlugin.name, this.onCompilerDone.bind(this));
    }

};