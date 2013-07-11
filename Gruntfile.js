/*
 * grunt-bower-postinst
 * https://github.com/krampstudio/grunt-bower-postinst
 *
 * Copyright (c) 2013 Bertrand Chevrier
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'tasks/*.js', '<%= nodeunit.tests %>'],
            options: {
                jshintrc: '.jshintrc',
            }
        },
        
        clean : ['components'],
        
        bower : {
            install : {}  
        },
        
        bower_postinst: {
            dist: {
                options: {
                    components: {
                        'jquery.ui': ['npm', {'grunt': 'build'}],
                        'bootstrap': ['npm', {'make': 'bootstrap' }]
                    }
                }
            }
        },
        
        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js'],
        }
    
    });
    
    //Load the plugin's task.
    grunt.loadTasks('tasks');
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-bower-task');
    
    grunt.registerTask('bower-full', ['clean', 'bower', 'bower_postinst']);
    grunt.registerTask('test', ['bower-full', 'nodeunit']);
    grunt.registerTask('default', ['jshint', 'test']);

};
  