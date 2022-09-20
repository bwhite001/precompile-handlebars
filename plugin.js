const HandlebarRenderer = require("./renderer");
const path = require("path");
const fs = require("fs");

function sanitizePath(filepath) {
    // convert windows path
    return filepath.replace(/\\/g, "/");
}
class HandlebarsRenderPlugin {

    constructor(options = {}) {

        this.options = Object.assign({
            inputDir:null,
            outputFile: null,
        }, options);

        this.firstCompilation = true;
        this.fileDependencies = [];
        this.assetsToEmit = {};
        this.prevTimestamps = {};
        this.startTime = Date.now();

        this.HB = new HandlebarRenderer(options, this);
    }

    /**
     * Webpack plugin hook - main entry point
     * @param  {Compiler} compiler
     */
    apply(compiler) {

        // COMPILE TEMPLATES
        const compile = (compilation, done) => {

            try {
                // wp >= v5
                if (compilation.fileTimestamps == null) {
                    if (this.dependenciesUpdated(compiler) === false) {
                        return done();
                    }
                }
                this.compileAllEntryFiles(compilation, done); // build all html pages
            } catch (error) {
                compilation.errors.push(error);
            }
            return undefined; // done();?
        };

        // REGISTER FILE DEPENDENCIES TO WEBPACK
        const emitDependencies = (compilation, done) => {
            try {
                // resolve file paths for webpack-dev-server
                const resolvedDependencies = this.fileDependencies.map(file => path.resolve(file));
                // register dependencies at webpack
                if (compilation.fileDependencies.add) {
                    // webpack@4
                    resolvedDependencies.forEach(compilation.fileDependencies.add, compilation.fileDependencies);
                } else {
                    compilation.fileDependencies = compilation.fileDependencies.concat(resolvedDependencies);
                }
                // emit generated html pages (webpack-dev-server)
                this.emitGeneratedFiles(compilation);
                return done();
            } catch (error) {
                compilation.errors.push(error);
            }
            return undefined; // done();?
        };

        // @wp >= 4
        if (compiler.hooks) {
            // use standard compiler hooks
            compiler.hooks.make.tapAsync("HandlebarsRenderPlugin", compile);
            compiler.hooks.emit.tapAsync("HandlebarsRenderPlugin", emitDependencies);
        } else {
            // @legacy wp < v4
            compiler.plugin("make", compile);
            compiler.plugin("emit", emitDependencies);
        }
    }

    /**
     * Returns contents of a dependent file
     * @param  {String} filepath
     * @return {String} filecontents
     */
    readFile(filepath) {
        this.addDependency(filepath);
        return fs.readFileSync(filepath, "utf-8");
    }

    /**
     * Registers a file as a dependency
     * @param {...[String]} args    - list of filepaths
     */
    addDependency(...args) {
        if (!args) {
            return;
        }
        args.forEach(filename => {
            filename = sanitizePath(filename);
            if (filename && !this.fileDependencies.includes(filename)) {
                this.fileDependencies.push(filename);
            }
        });
    }

    /**
     * Check if dependencies have been modified
     * @param  {Object} compiler
     * @return {Boolean} true, if a handlebars file or helper has been updated
     */
    dependenciesUpdated(compiler) {
        const modifiedFiles = compiler.modifiedFiles; // Set containing paths of modified files

        if (modifiedFiles == null) { // First run
            return true;
        }

        const fileDependencies = this.fileDependencies;

        for (let i = 0; i < fileDependencies.length; i++) {
            // path.resolve because paths in fileDependencies have '/' separators while paths
            // in modifiedFiles have '\' separators (on windows)
            if (modifiedFiles.has(path.resolve(fileDependencies[i]))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  {Array} list     - list of changed files as absolute paths
     * @return {Boolean} true, if a file is a dependency of this handlebars build
     */
    containsOwnDependency(list) {
        for (let i = 0; i < list.length; i += 1) {
            const filepath = sanitizePath(list[i]);
            if (this.fileDependencies.includes(filepath)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Register generated html files to support serving file with webpack-dev-server
     * @param  {String} filepath    - target filepath, where the file is created
     * @param  {String} content     - file contents
     */
    registerGeneratedFile(filepath, content) {
        this.assetsToEmit[path.basename(filepath)] = {
            source: () => content,
            size: () => content.length
        };
    }

    /**
     * Resets list of generated files
     */
    clearGeneratedFiles() {
        this.assetsToEmit = {};
    }

    /**
     * Notifies webpack-dev-server of generated files
     * @param  {Object} compilation
     */
    emitGeneratedFiles(compilation) {
        Object.keys(this.assetsToEmit).forEach(filename => {
            compilation.assets[filename] = this.assetsToEmit[filename];
        });
    }

    /**
     * @async
     * Generates all given handlebars templates
     * @param  {Object} compilation  - webpack compilation
     * @param  {Function} done
     */
    compileAllEntryFiles(compilation, done) {

        try{
            this.HB.run();
            const outputPath = compilation.compiler.outputPath;
            Object.keys(this.HB.assetsToEmit).forEach(filename => {
                //Adds to assets to track changes in webpack
                let targetFilepath = filename.replace(outputPath, "").replace(/^\/*/, "");
                this.assetsToEmit[targetFilepath] = this.HB.assetsToEmit[filename];
            });
        }
        catch(error) {
            compilation.errors.push(error);
        }

        done();
    }
}

module.exports = HandlebarsRenderPlugin;