const mix = require("laravel-mix");

require("precompile-handlebars");

const dirs = {
    npm: "node_modules",
    js: "resources/assets/js"
};
const publicPath = "dist";


// handle the import of the Handlebars runtime and precompile of the templates with versioning
mix.combine(dirs.npm + "/handlebars/dist/handlebars.runtime.js", publicPath + "/handlebars.js");
mix.handlebars("resources/views/templates", publicPath + "demo.js").version([publicPath + "demo.js"]);