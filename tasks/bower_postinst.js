/*
 * grunt-bower-postinst
 * https://github.com/krampstudio/grunt-bower-postinst
 *
 * Copyright (c) 2013 Bertrand Chevrier
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask('bower_postinst', 'Post Installation Tasks for Bower Components.', function() {
      
        var bower = require('bower'),
            util = require('util');
    
        var options = this.options({
            directory : bower.config.directory,
            components : []
        });
        
        options.components.forEach(function(component){
            var compDir =  options.directory + "/" + component;
            if(grunt.file.exists(compDir) && grunt.file.isDir(compDir)){
    
                //discover available actions
                var build = {
                    gitsm   : grunt.file.exists(compDir + "/.gitmodules"),
                    npm     : grunt.file.exists(compDir + "/package.json"),
                    grunt   : grunt.file.exists(compDir + "/Gruntfile.js"),
                    jake    : grunt.file.exists(compDir + "/Jakefile"),
                    make    : grunt.file.exists(compDir + "/Makefile")
                };
                
                grunt.log.debug("Entering " + compDir  + " -> " + util.inspect(build));
                
            } else {
                grunt.log.warn('Component "' + component + '" not found in ' + compDir );
            }
        });
    });
};
