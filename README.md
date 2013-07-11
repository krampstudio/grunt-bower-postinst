# grunt-bower-postinst [![Build Status](https://travis-ci.org/krampstudio/grunt-bower-postinst.png?branch=master)](https://travis-ci.org/krampstudio/grunt-bower-postinst)]

> Execute post install action on bower components

Some bower components needs additionnal actions once [Bower][bower] has retrieved the source from the repository. This plugin helps you to automate theses tasks in order to provide you the last step to your client-side dependency manager. 

## Getting Started

This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Grunt Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:


```shell
npm install grunt-bower-postinst --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bower-postinst');
```

## The "bower_postinst" task

### Overview
In your project's Gruntfile, add a section named `bower_postinst` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  bower_postinst: {
        dist: {
            options: {
                components: {
                    'jquery.ui': ['npm', {'grunt': 'build'}],
                    'bootstrap': ['npm', {'make': 'bootstrap' }]
                }
            }
        }
    }
})
```

### Options

#### options.directory
Type: `String`
Default value: `bower.config.directory`

The directory where the bower components are installed. We use by default the current bower configuration.

#### options.actions
Type: `String`
Default value: 
```js
{
    'git submodule' : ['update'],
    'npm' : ['install'],
    'grunt' : [],
    'jake' : [],
    'make' : ['install']
}
```

This options define the default behavior for the predefined commands. 


#### options.components
Type: `Object`
Default value: `none`

#### options.components.component
Type: `Array`
Default value: `none`

An array of commands to be executed against the component. The values of the array can be either :
 - a string that match a predefined command (`'npm'` stands for `npm install` as in `options.actions`).
 - an object with the key as a  predefined command and the value the additionnals arguments

### Execution

The commands for a component are executed in series, in the order defined in `options.components.compoenent`.

If there is more than one component then the staks of commands are executed in parrallel by component.

### Usage Example

#### Bower 
In this example, the project needs the following [Bower][bower] components: `jquery`, `jquery.ui` and `bootstrap`. The components `jquery.ui` and `bootstrap` need extra commands to get an aggregated and minimified version of the scripts and stylesheet. 
We use the task `bower` from `grunt-bower-task` to perform the install of the components, then the `bower_postinst` task from the current plugin to run the required commands.

```js
grunt.initConfig({
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
        }    
    });
    
    //Load the plugin's task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-bower-postinst');
    
    grunt.registerTask('install', ['clean', 'bower', 'bower_postinst']);
```

These example will execute:
```bash
bower install

#stack 1 in parallel with stack2
cd components/bootstrap
npm install
make bootstrap

#stack2
cd components/jquery.ui
npm install
grunt build
```

## Issues

To help you to resolve your issues, please provide:
 - the versions of node.js, grunt and grunt-bower-postinst
 - the content of your Gruntfile.js
 - the result of the grunt command with the debug option (`grunt task --debug`) (in a [gist](https://gist.github.com/))
 - A pull request, if you think something is wrong.
 

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* _0.1.0_ First release


[bower]: https://bower.io