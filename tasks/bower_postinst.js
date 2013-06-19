/*
 * grunt-bower-postinst
 * https://github.com/krampstudio/grunt-bower-postinst
 *
 * Copyright (c) 2013 Bertrand Chevrier
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask('bower_postinst', 'Post Installation Tasks for Bower Components.', function bowerPostInstTask () {
        
        var bower = require('bower');
        var spawn = require('child_process').spawn;
        var util = require('util');
        var isWin = process.platform === 'win32';
        var task = grunt.task.current;
        var _ = grunt.util._;
        
        var options = task.options({
                directory : bower.config.directory,
                actions : {
                    'git submodule' : ['update'],
                    'npm' : ['install'],
                    'grunt' : [],
                    'jake' : [],
                    'make' : ['install']
                },
                components : []
            });
        
        Object.keys(options.components).forEach(function(component){
            var compDir =  options.directory + "/" + component,
                actions = options.components[component];
            if(grunt.file.exists(compDir) && grunt.file.isDir(compDir)){
    
                //discover available actions
                var detect = {
                    'git submodule'  : grunt.file.exists(compDir + "/.gitmodules"),
                    'npm'     : grunt.file.exists(compDir + "/package.json"),
                    'grunt'   : grunt.file.exists(compDir + "/Gruntfile.js"),
                    'jake'    : grunt.file.exists(compDir + "/Jakefile"),
                    'make'    : grunt.file.exists(compDir + "/Makefile")
                };
                
                grunt.log.debug("Entering " + compDir  + " -> " + util.inspect(detect));
                
                //build the postinst commands stack to run, merging the user defined and the default actions
                var stack = [];
                actions.forEach(function(action){
                    if(_.isString(action) && _.isArray(options.actions[action])){
                        action = _.object([action], options.actions[action]);
                    }
                    if(_.isPlainObject(action)){
                        Object.keys(action).forEach(function(key){
                            //check if the config file for the action has been detected
                            if(detect[key] !== undefined && detect[key] === false){
                                grunt.fail.warn("Asked to run '" + key + "' but no valid configuration is detected in '" + component + "'");
                            }
                            stack.push(_.flatten([key].concat(action[key])));
                        });
                    }
                });
                
                
                stack.forEach(function(action){
                    if(action.length > 0){
                        var cmd = (isWin) ? 'cmd' : action[0];
                        var args = (isWin) ? ['/c'].concat(action) : action.slice(1);
                        
                        grunt.log.debug(cmd + ' ' + args.join(' '));
                    }
                });
                
                
                
            } else {
                grunt.log.warn('Component "' + component + '" not found in ' + compDir );
            }
        });
    });
};
