const nodePath = require("path");

/**
 * A class that provides some handy methods for path manipulation.
 */
class Path {

    /**
	 * @param path {string|Path}
	 */
    constructor(path = "") {
        this._path = Path.normalize(path);
        this.basename = nodePath.basename(this._path);
    }

    /**
	 * Returns a normalized path string.
	 * @param path {string|Path} The path to normalize.
	 * @returns {string} The normalized path.
	 */
    static normalize(path = "") {
        if (path instanceof Path) {
            return path._path;
        }

        path = path.toString();

        if (nodePath.sep === "/") {
            // We are on linux, backslashes are interpreted as normal characters not as directory separators.
            path = path.replace(/\\+/g, "/");
        }

        return nodePath.resolve(path);
    }

    /**
	 * Returns a new fast forwarded `Path` object to `target`.
	 *
	 * The common root is removed from the current path and the left over is joined with the target.
	 *
	 * @param target {string|Path} The target to use when fast forwarding.
	 * @returns {Path}
	 */
    fastForward(target = "") {
        target = Path.normalize(target);

        const leftover = nodePath.relative(target, this._path)
		                         .replace(/^(?:\.\.[\/\\])+/g, "")
		                         .replace(/^..$/g, "");

        return new Path(nodePath.join(target, leftover));
    }

    /**
	 * Returns a new Path object representing a public url with `public_path` as the root directory.
	 *
	 * @param public_path {string|Path} The public path that will be the root of the url.
	 * @returns {string} The public url.
	 * @throws {Error} If `public_path` is not a parent directory of this path.
	 */
    publicUrl(public_path = "") {
        public_path = Path.normalize(public_path);

        const relative_path = nodePath.relative(public_path, this._path);

        if (relative_path.startsWith("..")) {
            throw new Error(`"public_path" must be a parent of "${this._path}"`);
        }

        return "/" + relative_path.replace(/\\/g, "/");
    }

    /**
	 * Joins the current path with the provided paths.
	 * @param paths {string|Path} The paths to join.
	 */
    join(...paths) {
        const segments = paths.reduce(
            (accumulator, path) => {
                const local_segments = path.toString().split(/[\\/]+/g);
                accumulator.push(...local_segments);
                return accumulator;
            },
            [],
        );

        const full_path = nodePath.join(this._path, ...segments);

        return new Path(full_path);
    }

    /**
	 * Returns the underlying path string.
	 *
	 * @returns {string}
	 */
    toString() {
        return this._path;
    }
}

module.exports = Path;