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
        var done = task.async();
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
            
        /**
         * Format cli args : manage spaces in paths
         * @param {Array} args - the arguments
         * @returns {Array} the formatted arguments
         */
        var unspaceArgs = function(args) {
            if (isWin) {
                args = args.map(function(item) {
                    if (item.indexOf(' ') >= 0) {
                        return '"' + item + '"';
                    }
                    else {
                        return item;
                    }
                });
            } else {
                // Unix: escape spaces in paths
                args = args.map(function(item) {
                    return item.replace(' ', '\\ ');
                });
            }
            return args;
        }
        
        Object.keys(options.components).forEach(function(component){
            var compDir =  options.directory + "/" + component,
                actions = options.components[component];
            if(grunt.file.exists(compDir) && grunt.file.isDir(compDir)){
    
                //discover available actions
                var detect = {
                    'git submodule'     : grunt.file.exists(compDir + "/.gitmodules"),
                    'npm'               : grunt.file.exists(compDir + "/package.json"),
                    'grunt'             : grunt.file.exists(compDir + "/Gruntfile.js"),
                    'jake'              : grunt.file.exists(compDir + "/Jakefile"),
                    'make'              : grunt.file.exists(compDir + "/Makefile")
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
                
                //transform the stack to an array of spawn function
                stack = stack.map(function(item){
                    return function(callback){
                        if(_.isArray(item) && item.length > 0){
                            var action = unspaceArgs(item);
                            var cmd = (isWin) ? 'cmd' : action[0];
                            var args = (isWin) ? ['/c'].concat(action) : action.slice(1);
                            
                            grunt.log.debug('Running on ' + compDir + ' : ' + cmd + ' ' + args.join(' '));
                            
                            var child = spawn(cmd, args, {
                                    windowsVerbatimArguments: isWin,
                                    cwd : compDir
                                });
                            child.stdout.on('data', function(data){
                                grunt.log.debug(data);
                            });
                            child.stderr.on('data', function(data){
                                grunt.log.debug("stderr" + data);
                            });
                            child.on('exit', function(code){
                                if(code === 0){
                                    callback(null, action[0] + ' on ' + compDir);
                                    grunt.log.write('Finnished : ' + action[0] + ' on ' + compDir);
                                } else {
                                    callback(new Error("Process exit with code " + code));
                                } 
                            });
                        }
                    }
                });
                
                //run them in parrallel
                grunt.util.async.series(stack, function(err, result){
                     if(err){
                        grunt.fail.warn(err);
                    } else {
                        grunt.log.write(result);
                    }
                    done(true);
                })
                
            } else {
                grunt.log.warn('Component "' + component + '" not found in ' + compDir );
            }
        });
    });
};
