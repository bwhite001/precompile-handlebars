const HandlebarTask = require("./task");
class LaravelMixHandlebarsWebpack {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        this.compiler = compiler;
        compiler.hooks.make.tap("LaravelMixHandlebarsWebpack", (compilation) => {
            let task = new HandlebarTask();
            task.run(compiler, this.options);
            //Precompiles to options.outputFile
            Object.keys(task.assetsToEmit).forEach(filename => {
                //Adds to assets to track changes in webpack
                compilation.assets[filename] = task.assetsToEmit[filename];
            });
        });
    }
}

module.exports = LaravelMixHandlebarsWebpack;