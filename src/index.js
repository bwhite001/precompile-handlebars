let mix = require("laravel-mix");
let PrecompileHandlebarMixPlugin = require("./plugin");
/**
 * precompile handlebar templates into output file javascript and append
 * corresponding values from the `mix-manifest.json`.
 * @param {string} src_files A path to a source file. *.hbs and *.handlebar files
 * @param {string} target_dir The target directory inside the public path.
 */
mix.extend("handlebars", PrecompileHandlebarMixPlugin);