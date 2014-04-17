/*
Notes:
- phantomjs and caspar via homebrew
- npm install phantomcss
- bower install phantomcss

[note i installed these locally via npm. @filtercake]
*/


/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/
var phantomcss = require('./../../phantomcss/phantomcss.js');

phantomcss.init({
	screenshotRoot: './test/visual/screenshots',
	failedComparisonsRoot: './test/visual/failures',
	/*
	casper: specific_instance_of_casper,
	*/
	// libraryRoot: './../../phantomcss'
	libraryRoot: './node_modules/phantomcss'
	/*
	fileNameGetter: function overide_file_naming(){},
	onPass: function passCallback(){},
	onFail: function failCallback(){},
	onTimeout: function timeoutCallback(){},
	onComplete: function completeCallback(){},
	hideElements: '#thing.selector',
	addLabelToFailedImage: true,
	outputSettings: {
		errorColor: {
			red: 255,
			green: 255,
			blue: 0
		},
		errorType: 'movement',
		transparency: 0.3
	}
	*/
});


/*
	The test scenario
*/
// casper.start( './demo/coffeemachine.html' );
casper.start( 'http://localhost:9000/#notes' );

casper.viewport(1024, 768);

casper.then(function(){
	phantomcss.screenshot('#header-title', '001-header-title');
});

// casper.then(function(){
// 	phantomcss.screenshot('#coffee-machine-button', '001.1 coffee machine button, button only');
// });

// casper.then(function(){
// 	casper.click('#coffee-machine-button');
	
// 	// wait for modal to fade-in 
// 	casper.waitForSelector('#myModal:not([style*="display: none"])',
// 		function success(){
// 			phantomcss.screenshot('#myModal', '002 coffee machine dialog');
// 		},
// 		function timeout(){
// 			casper.test.fail('Should see coffee machine');
// 		}
// 	);
// });

// casper.then(function(){
// 	casper.click('#cappuccino-button');
// 	phantomcss.screenshot('#myModal', '003 cappuccino success');
// });

// casper.then(function(){
// 	casper.click('#close');

// 	// wait for modal to fade-out
// 	casper.waitForSelector('#myModal[style*="display: none"]',
// 		function success(){
// 			phantomcss.screenshot('#coffee-machine-wrapper', '004 coffee machine close success');
// 		},
// 		function timeout(){
// 			casper.test.fail('Should be able to walk away from the coffee machine');
// 		}
// 	);
// });

casper.then( function now_check_the_screenshots(){
	// compare screenshots
	phantomcss.compareAll();
});

casper.then( function end_it(){
	casper.test.done();
});

/*
Casper runs tests
*/
casper.run(function(){
	console.log('\nTHE END.');
	phantom.exit(phantomcss.getExitStatus());
});

