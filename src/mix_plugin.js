const fs = require("fs");
const path = require("path");
const mix = require("laravel-mix");
const HandlebarRenderTask = require("./HandlebarRenderer");

class PrecompileHandlebarMixPlugin {

    constructor() {
        /**
		 * @type {HandlebarRenderer[]}
		 */
        this.tasks = [];
    }

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
        src_paths.filter(file => { return path.extname(file) == ".hbs" || path.extname(file) == ".handlebars"});
        if (!src_paths.length) throw new Error(`"${this.src}" didn't yield any results`);

        this.tasks.push(new HandlebarRenderTask(src_paths, target_file));
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

    apply(compiler) {
        compiler.hooks.done.tapAsync(PrecompileHandlebarMixPlugin.name, this.onCompilerDone.bind(this));
    }

    /**
	 * Called when the webpack compiler is done compiling.
	 *
	 * @param Stats {Object} The stats object.
	 * @param callback {Function} Callback to inform the webpack compiler that we're done.
	 */
    onCompilerDone(Stats, callback) {

        const taskPromises = this.tasks.map(task => task.run(Mix.manifest.manifest));

        Promise.all(taskPromises).then(targets => {
            for (const target of targets) {

                this.addAssetToManifest(target, Config.publicPath);

                this.addAssetToStats(Stats, target, Config.publicPath);
            }

            Mix.manifest.refresh();
            callback();
        });
    }

    /**
	 * Add an asset entry to the mix manifest object.
	 * @param path {Path} The asset's path.
	 * @param public_path {string} The public path.
	 */
    addAssetToManifest(path, public_path) {
        const path_from_public = path.publicUrl(public_path).substring(1);

        // Check if the user requested hash versioning
        if (Mix.components.has("version")) {
            Mix.manifest.hash(path_from_public);
        } else {
            Mix.manifest.add(path_from_public);
        }
    }

    /**
	 * Add an asset entry to the Stats object for better terminal output.
	 * @param Stats {Object} The webpack Stats object.
	 * @param path {Path} The asset's path.
	 * @param public_path {string} The public path.
	 */
    addAssetToStats(Stats, path, public_path) {
        Stats.compilation.assets[path.publicUrl(public_path)] = {
            size: () => fs.statSync(path.toString()).size,
            emitted: true,
        };
    }

}

module.exports = PrecompileHandlebarMixPlugin;