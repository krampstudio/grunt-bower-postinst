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
        var stacks = {}; 
        
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
        };
        
        Object.keys(options.components).forEach(function itComp(component){
            var compDir =  options.directory + "/" + component,
                actions = options.components[component];
            if(grunt.file.exists(compDir) && grunt.file.isDir(compDir)){
        
                //will contains the stack of actions to excute for the component
                var stack = [];
                
                //discover available actions
                var detect = {
                    'git submodule'     : grunt.file.exists(compDir + "/.gitmodules"),
                    'npm'               : grunt.file.exists(compDir + "/package.json"),
                    'grunt'             : grunt.file.exists(compDir + "/Gruntfile.js"),
                    'jake'              : grunt.file.exists(compDir + "/Jakefile") || grunt.file.exists(compDir + "/Jakefile.js"),
                    'make'              : grunt.file.exists(compDir + "/Makefile")
                };
                
                grunt.log.debug("Entering " + compDir  + " -> " + util.inspect(detect));
                
                
                //build the postinst commands stack to run, merging the user defined and the default actions
                actions.forEach(function itActions(action){
                    if(_.isString(action) && _.isArray(options.actions[action])){
                        action = _.object([action], options.actions[action]);
                    }
                    if(_.isPlainObject(action)){
                        Object.keys(action).forEach(function itActionName(key){
                            
                            //check if the config file for the action has been detected
                            if(detect[key] !== undefined && detect[key] === false){
                                grunt.fail.warn("Asked to run '" + key + "' but no valid configuration is detected in '" + component + "'");
                            }
                            stack.push(_.flatten([key].concat(action[key])));
                        });
                    }
                });
                
                //transform the stack to an array of spawnable function
                stack = stack.map(function spawnableStack(item){
                    return function(callback){
                        if(_.isArray(item) && item.length > 0){
                            var action = unspaceArgs(item);
                            var cmd = (isWin) ? 'cmd' : action[0];
                            var args = (isWin) ? ['/c'].concat(action) : action.slice(1);
                            
                            grunt.log.writeln('Running on ' + compDir + ' : ' + cmd + ' ' + args.join(' '));
                            
                            var child = spawn(cmd, args, {
                                    windowsVerbatimArguments: isWin,
                                    cwd : compDir
                                });
                            child.stdout.on('data', function(data){
                                grunt.log.debug(data);
                            });
                            child.stderr.on('data', function(data){
                                grunt.log.debug(data);
                            });
                            child.on('exit', function(code){
                                if(code === 0){
                                    callback(null, action[0] + ' on ' + compDir+ ' ran successfully');
                                } else {
                                    callback(new Error("Process exit with code " + code));
                                } 
                            });
                        }
                    };
                });
                
                stacks[component] = stack;
                
            } else {
                grunt.log.warn('Component "' + component + '" not found in ' + compDir );
            }
        });
        
        //once the stack is completed, format the stack to run series by component
        var series = Object.keys(stacks).map(function seriesStack(component){
            return function(cb){
                grunt.util.async.series(stacks[component], function serieDone(err, result){
                     if(err){
                        cb(err);
                    } else {
                        var executed = (result) ? result.length : 0;
                        if(executed > 0){
                            grunt.log.ok(component + ' postinst executed ' + executed + ' ' + grunt.util.pluralize(executed, 'action/actions') + ' successfully');
                        } else{
                            grunt.log.warn('No actions executed for ' + component);
                        }
                        cb(null, executed);
                    }
                });
            };
        });
        
        //then run all series in parrallel
        grunt.util.async.parallel(series, function parallelDone(err, result){
            if(err){
                grunt.fail.warn(err);
            } else {
                var totalActions = _.reduce(result, function reduceSum(sum, item){
                    return sum + item;
                });
                grunt.log.debug(totalActions + ' ' + grunt.util.pluralize(totalActions, 'action/actions') + ' executed');
                
                grunt.log.ok('bower posinst finished executing');
            }
            done(true);
        });
    });
};
