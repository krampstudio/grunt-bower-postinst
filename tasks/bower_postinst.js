/*
 * grunt-bower-postinst
 * https://github.com/krampstudio/grunt-bower-postinst
 *
 * Copyright (c) 2013 Bertrand Chevrier
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('bower_postinst', 'Post Installation Tasks for Bower Components.', function() {
      
    var bower = require('bower');

    var options = this.options({
        directory : bower.config.directory,
        components : []
    });
    
    
    
    /*

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
        
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });*/
  });

};
