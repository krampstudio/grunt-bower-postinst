/**
 * @fileoverview NodeUnit test 
 * @copyright Bertrand Chevrier 2012
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license MIT
 * 
 * @module test/bower_postinst_test
 */

var fs = require('fs');

/**
 * This function enables you to extract 
 * the declared arguments from a function.
 * @param {Function} fn - the function to extract the arguments for
 * @returns {Array} the list of arguments
 * @throw {Error} in case of wrong argument given
 */
var extractArgs = function(fn){
    'use strict';

	if(typeof fn !== 'function'){
		throw new Error('TypeError : The extractArgs function requires the fn argument to be a function!');
	}
	return fn.toString ().match (/function\s+\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
};

/**
 * NodeUnit group of test that check the result once the task has been launched
 * 
 * @see https://github.com/caolan/nodeunit/
 * 
 * @class BowerPostInstTaskTest
 */
module.exports = {
    
    /**
	 * @memberOf BowerPostInstTaskTest
	 * @param {Function} done - to call once the setup is done.
	 */
	setUp: function(done) {
		'use strict';

        this.bptask = require('../tasks/bower_postinst');
		this.expected = {
            'components/bootstrap' : ['node_modules/.bin/uglifyjs', 'boostrap/js/bootstrap.min.js', 'boostrap/css/bootstrap.min.css'],
            'components/jquery.ui' : ['node_modules/grunt/bin/grunt', 'dist/jquery-ui.min.js', 'dist/jquery-ui.min.css'],
            'components/leaflet' :  ['node_modules/jake', 'dist/leaflet.js']
        };
		done();
	},
    
    /**
     * Check the task is loaded and complies with the grunt requirements.
	 * @memberOf BowerPostInstTaskTest
	 * @param {Object} test - the node unit test context
	 */
	'taskCheck' : function(test){
		'use strict';	
	
		test.notStrictEqual(this.bptask, undefined, 'the task should be set up');
		test.equal(typeof this.bptask, 'function', 'the task must be a function');	
		
		var taskArgs = extractArgs(this.bptask);
		test.ok(taskArgs.length > 0 && taskArgs[0] === 'grunt', 'the task must declare the grunt context as 1st parameter');
		
		test.done();
	}, 
    
	/**
	 * @memberOf BowerPostInstTaskTest
	 * @param {Object} test - the node unit test context
	 */
	'bowerCheck' : function(test){
		'use strict';	
        var self = this,
            components = Object.keys(this.expected),
            length = components.length;
        
        test.expect(length);

        components.forEach(function(componentDir){
            fs.exists(componentDir, function(result){
                test.ok(result === true, 'The component destination ' + componentDir + ' must have been created');
                if(--length <= 0){
                    test.done();
                }
            });
        });
	}

};
