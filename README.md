precompile-handlebars
===

A webpack plug-in to precompile handlebar templates directories into concatenated files.

## Installation

`npm install git@github.com:ixa-devstuff/precompile-handlebars.git --save-dev`

## Usage

You can provide an object or an array of objects containing the following precompilation directives:

* `inputDir` - the directory where the handlebars templates reside
* `outputFile` - the output file name of concatenated precompiled templates

Note: only find Files with `*.hbs` and `*.handlebars` extensions

#### Partials

Template files names that are prefixed with an underscore are treated as partials (i.e., `_partial1.handlebars`).

### Example
in your webpack.mix.js

```javascript
mix.combine(npm + "/handlebars/dist/handlebars.runtime.js", publicPath + "/handlebars.js");
mix.handlebars("test/templates", publicPath + "/demo_templates.js")

```
