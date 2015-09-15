/*jshint*/
(function () {
    "use  strict";
    /**
     * Lint a JavaScript file
     *
     * @params  {string}    process.argv[2]     File to lint
     * @params  {string}    process.argv[3]     Linter (jslint or jshint). Defaults to linter specified in the file.
     *
     * @example Called from textmate with command:
     *      'node path/to/this/file/runjslint.js file/to/dolint.js jslint'
     */
    
    var fs = require('fs');
    
    var path = process.argv[2];
    var linter = process.argv[3];
    
    var jslintPath = "../lib/jslint.js";
    var jshintPath = "../lib/jshint.js";
    
    function printJSLintResults(results) {
        if (results.stop) {
            console.log("\nUnable to finish linting.");
        }
        if (!results.warnings) {
            return;
        }
        
        var i,
            warn,
            len = results.warnings.length;
        for (i = 0; i < len; i++) {
            warn = results.warnings[i];
            console.log(warn.message + " [Line " + warn.line + ", col. " + warn.column + "]");
        }
    }
    
    function printJSHintResults(results) {
        if (!results.errors) {
            return;
        }
        var i,
            error,
            len = results.errors.length;

        for (i = 0; i < len; i++) {
            error = results.errors[i];
            if (error === null) {
                // JSHint can put a null in the errors array...
                continue;
            }
            console.log(error.reason + " [Line " + error.line + ", col. " + error.character + "]");
        }
    }
    
    function lintFile(err, fileContents) {
        if (err) {
            return console.log(err);
        }
        
        // JSHint exports node module by default.
        // JSLint doesn't. The export was added in the version included by this bundle.
        if (linter === "jshint") {
            var jshint = require(jshintPath).JSHINT;
            jshint(fileContents);
            printJSHintResults(jshint.data());
        } else {
            var jslint = require(jslintPath).JSLINT;
            var results = jslint(fileContents);
            printJSLintResults(results);
        }
    }
    
    function onData(chunk) {  
        var firstLine = chunk.match(/^\/\*(jshint|jslint)/);
        if (firstLine && typeof firstLine[1] !== "undefined") {
            linter = firstLine[1];  
            process.stdin.pause();    
        } else {
            process.exit(); // No lint comment, don't lint the file
        }
    }
    
    function runLint() {
        if (!linter) {
            // If no linter was specified, search for it in the first line comment
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', onData);
			this.something = null;
        }
        fs.readFile(path, 'utf8', lintFile);
    }

    runLint();

}());
