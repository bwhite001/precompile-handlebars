precompile-handlebars
===

A webpack plug-in to precompile handlebar templates directories into concatenated files.

## Installation

`npm install precompile-handlebars --save-dev`

## Usage

You can provide an object or an array of objects containing the following precompilation directives:

* `inputDir` - the directory where the handlebars templates reside
* `outputFile` - the output file name of concatenated precompiled templates

#### Partials

Template files names that are prefixed with an underscore are treated as partials (i.e., `_partial1.handlebars`).

### Example
in your webpack.mix.js

```javascript
mix.combine(npm_dir + "/handlebars/dist/handlebars.runtime.js", publicPath + "/js/lib.js")
mix.handlebars("resources/views/templates", publicPath + "/js/templates.js")
.version([publicPath + "/js/templates.js"]);

```

## License

MIT License

Copyright (c) 2017 Capriza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
