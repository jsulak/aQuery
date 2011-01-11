

// Qunit harness
// See http://twoguysarguing.wordpress.com/2010/11/02/make-javascript-tests-part-of-your-build-qunit-rhino/
// and http://twoguysarguing.wordpress.com/2010/11/26/qunit-cli-running-qunit-with-rhino/

// To use, source the file, then run aQueryTests.Go({path to test data})


var aQueryTests = function() {

   function Setup() {

      var ret;
      ret = Acl.execute("source extensions.js");
      ret = Acl.execute("source qunit.js");
      // TODO: Update this path
      ret = Acl.execute("source b:/workspace/aquery/aquery.js");
      ret = Acl.execute("source b:/workspace/aquery/aquery_utils.acl");

      QUnitSetup();
   }



   // TODO: This is called both here and in edit init.  Should there be a seperate file, maybe qunit_harness.js?
   function QUnitSetup() {
      QUnit.init();
      QUnit.config.blocking = false;
      QUnit.config.autorun = true;
      QUnit.config.updateRate = 0;
      QUnit.log = function(result, message) {
	 var cleanMessage = message;
	 if (message.indexOf(">") > -1 && message.indexOf("<span") > -1) {
	    cleanMessage = cleanMessage.substring(cleanMessage.indexOf(">") + 1);
	    cleanMessage = cleanMessage.substring(0, cleanMessage.indexOf("<"));
	 }
	 print(result ? 'PASS: ' : 'FAIL: ', cleanMessage);
      };
      QUnit.testStart = function(name, testEnvironment) {
	 print("");
	 print("----- " + name + " -----");
      };


      // Handle rhino errors correctly
      var current_object_parser = QUnit.jsDump.parsers.object;
      QUnit.jsDump.setParser('object', function(obj) {
				if(typeof obj.rhinoException !== 'undefined') {
				   return obj.name + " { message: '" + obj.message + "', fileName: '" + obj.fileName + "', lineNumber: " + obj.lineNumber + " }";
				}
				else {
				   return current_object_parser(obj);
				}
			     });
   }





   function ExecuteTests(testdir) {
      // Setup test environment
      var document = Application.openDocument(testdir + "\\ts_eliot_wasteland.xml");
      var aQuery = _$(document);


      print("");
      print("=========================");
      print("        BEGIN TESTS      ");
      print("=========================");


      test("Basic requirements", function() {
	      expect(6);
	      ok( Array.prototype.push, "Array.push()" );
	      ok( Function.prototype.apply, "Function.apply()" );
	      ok( document.getElementById, "getElementById" );
	      ok( document.getElementsByTagName, "getElementsByTagName" );
	      ok( RegExp, "RegExp" );
	      ok( aQuery, "aQuery" );
	   });

      test("Test initalization", function() {
	      expect(6);

	      // Basic constructor behavior

	      ok( aQuery, "aQuery object exists" );
	      equals( aQuery().length, 0, "aQuery() === aQuery([])" );
	      equals( aQuery(undefined).length, 0, "aQuery(undefined) === aQuery([])" );
	      equals( aQuery(null).length, 0, "aQuery(null) === aQuery([])" );
	      equals( aQuery("").length, 0, "aQuery('') === aQuery([])" );

	      var obj = aQuery("body");
	      equals( aQuery(obj).selector, "body", "aQuery(aQueryObj) == aQueryObj" );
	   });

      test("selector state", function() {
	      expect(12);

	      var test;

	      test = aQuery(undefined);
	      equals( test.selector, "", "Empty aQuery Selector" );
	      equals( test.context, undefined, "Empty aQuery Context" );

	      test = aQuery(document);
	      equals( test.selector, "", "Document Selector" );
	      equals( test.context, document, "Document Context" );

	      test = aQuery("#topic-1");
	      equals( test.selector, "#topic-1", "#topic-1 Selector" );
	      equals( test.context, document, "#topic-1 Context" );

	      test = aQuery("#notfoundnono");
	      equals( test.selector, "#notfoundnono", "#notfoundnono Selector" );
	      equals( test.context, document, "#notfoundnono Context" );

	      // TODO: I don't think this is actually implemented yet.
	      test = aQuery("#topic-1", document);
	      equals( test.selector, "#topic-1", "#topic-1 Selector" );
	      equals( test.context, document, "#topic-1 Context" );

	      // Test cloning
	      test = aQuery("#topic-1");
	      test = aQuery(test);
	      equals( test.selector, "#topic-1", "#topic-1 Selector" );
	      equals( test.context, document, "#topic-1 Context" );

	      // TODO: Implement the remaining selector state tests from core.js

	   });


      test("Test accessors", function() {
	      expect(2);
	      equal(aQuery("p").length, 61);
	      equal(aQuery("/topic/title").text(), "The Waste Land");
	   });

      test("Test traversals", function() {
	      expect(1);
	      var titleParents = aQuery("title").parent();
	      var attr = titleParents.attr("id");
	      print("gotten");
	      print(attr);
	      equals(attr, "topic-1");
	   });

      test("get()", function() {
	      expect(1);
	      // For some reason, deep equal doesn't seem to work on arrays of elements.
	      equal( aQuery("//*[@id]").get().length, 2 );
	   });

      test("get(1)", function() {
	      expect(1);
	      print( aQuery("//*[@id]").get(0).tagName);
	      // TODO: this whole Java string vs. javascript string thing is annoying
	      equal( new String(aQuery("//*[@id]").get(0).tagName), "topic");
	   });


      test("aQuery.makeArray", function() {
	      expect(10);

	      equals( aQuery.makeArray([1,2,3]).join(""), "123", "Pass makeArray a real array" );

	      equals( aQuery.makeArray().length, 0, "Pass nothing to makeArray and expect an empty array" );

	      equals( aQuery.makeArray( 0 )[0], 0 , "Pass makeArray a number" );

	      equals( aQuery.makeArray( "foo" )[0], "foo", "Pass makeArray a string" );

	      equals( aQuery.makeArray( true )[0].constructor, Boolean, "Pass makeArray a boolean" );

	      equals( aQuery.makeArray( {length:2, 0:"a", 1:"b"} ).join(""), "ab", "Pass makeArray an array like map (with length)" );

	      // function, is tricky as it has length
	      equals( aQuery.makeArray( function(){ return 1;} )[0](), 1, "Pass makeArray a function" );

	      equals( aQuery.makeArray(/a/)[0].constructor, RegExp, "Pass makeArray a regex" );

	      // For #5610
	      deepEqual( aQuery.makeArray({'length': '0'}), [], "Make sure object is coerced properly.");
	      deepEqual( aQuery.makeArray({'length': '5'}), [], "Make sure object is coerced properly.");


	      // TODO: Add actual DOM tests

	   });


      test("aQuery.each(Object, Function)", function() {
	      expect(13);

	      aQuery.each( [0,1,2], function(i, n){
		 equals( i, n, "Check array iteration" );
	      });

	      aQuery.each( [5,6,7], function(i, n){
		 equals( i, n - 5, "Check array iteration" );
	      });

	      aQuery.each( { name: "name", lang: "lang" }, function(i, n){
		 equals( i, n, "Check object iteration" );
	      });

	      var total = 0;
	      aQuery.each([1,2,3], function(i,v){ total += v; });
	      equals( total, 6, "Looping over an array" );
	      total = 0;
	      aQuery.each([1,2,3], function(i,v){ total += v; if ( i == 1 ) return false; });
	      equals( total, 3, "Looping over an array, with break" );
	      total = 0;
	      aQuery.each({"a":1,"b":2,"c":3}, function(i,v){ total += v; });
	      equals( total, 6, "Looping over an object" );
	      total = 0;
	      aQuery.each({"a":3,"b":3,"c":3}, function(i,v){ total += v; return false; });
	      equals( total, 3, "Looping over an object, with break" );

	      var f = function(){};
	      f.foo = 'bar';
	      aQuery.each(f, function(i){
			     f[i] = 'baz';
			  });
	      equals( "baz", f.foo, "Loop over a function" );
	   });


      test("trim", function() {
	      expect(9);

	      var nbsp = String.fromCharCode(160);

	      equals( aQuery.trim("hello  "), "hello", "trailing space" );
	      equals( aQuery.trim("  hello"), "hello", "leading space" );
	      equals( aQuery.trim("  hello   "), "hello", "space on both sides" );
	      equals( aQuery.trim("  " + nbsp + "hello  " + nbsp + " "), "hello", "&nbsp;" );

	      equals( aQuery.trim(), "", "Nothing in." );
	      equals( aQuery.trim( undefined ), "", "Undefined" );
	      equals( aQuery.trim( null ), "", "Null" );
	      equals( aQuery.trim( 5 ), "5", "Number" );
	      equals( aQuery.trim( false ), "false", "Boolean" );
	   });


      test("isPlainObject", function() {
	      expect(14);

	      stop();

	      // The use case that we want to match
	      ok(aQuery.isPlainObject({}), "{}");

	      // Not objects shouldn't be matched
	      ok(!aQuery.isPlainObject(""), "string");
	      ok(!aQuery.isPlainObject(0) && !aQuery.isPlainObject(1), "number");
	      ok(!aQuery.isPlainObject(true) && !aQuery.isPlainObject(false), "boolean");
	      ok(!aQuery.isPlainObject(null), "null");
	      ok(!aQuery.isPlainObject(undefined), "undefined");

	      // Arrays shouldn't be matched
	      ok(!aQuery.isPlainObject([]), "array");

	      // Instantiated objects shouldn't be matched
	      ok(!aQuery.isPlainObject(new Date), "new Date");

	      var fn = function(){};

	      // Functions shouldn't be matched
	      ok(!aQuery.isPlainObject(fn), "fn");

	      // Again, instantiated objects shouldn't be matched
	      ok(!aQuery.isPlainObject(new fn), "new fn (no methods)");

	      // Makes the function a little more realistic
	      // (and harder to detect, incidentally)
	      fn.prototype = {someMethod: function(){}};

	      // Again, instantiated objects shouldn't be matched
	      ok(!aQuery.isPlainObject(new fn), "new fn");

	      // DOM Element
	      ok(!aQuery.isPlainObject(document.createElement("div")), "DOM Element");

	      // TODO: Enable these tests.
	      // Window
	      // ok(!aQuery.isPlainObject(window), "window");

	      // var iframe = document.createElement("iframe");
	      // document.body.appendChild(iframe);

	      // window.iframeDone = function(otherObject){
	      // 	 // Objects from other windows should be matched
	      // 	 ok(aQuery.isPlainObject(new otherObject), "new otherObject");
	      // 	 document.body.removeChild( iframe );
	      // 	 start();
	      // };

	      // var doc = iframe.contentDocument || iframe.contentWindow.document;
	      // doc.open();
	      // doc.write("<body onload='window.parent.iframeDone(Object);'>");
	      // doc.close();
	   });


      test("isFunction", function() {
	      expect(13);

	      // Make sure that false values return false
	      ok( !aQuery.isFunction(), "No Value" );
	      ok( !aQuery.isFunction( null ), "null Value" );
	      ok( !aQuery.isFunction( undefined ), "undefined Value" );
	      ok( !aQuery.isFunction( "" ), "Empty String Value" );
	      ok( !aQuery.isFunction( 0 ), "0 Value" );

	      // Check built-ins
	      // Safari uses "(Internal Function)"
	      ok( aQuery.isFunction(String), "String Function("+String+")" );
	      ok( aQuery.isFunction(Array), "Array Function("+Array+")" );
	      ok( aQuery.isFunction(Object), "Object Function("+Object+")" );
	      ok( aQuery.isFunction(Function), "Function Function("+Function+")" );

	      // When stringified, this could be misinterpreted
	      var mystr = "function";
	      ok( !aQuery.isFunction(mystr), "Function String" );

	      // When stringified, this could be misinterpreted
	      var myarr = [ "function" ];
	      ok( !aQuery.isFunction(myarr), "Function Array" );

	      // When stringified, this could be misinterpreted
	      var myfunction = { "function": "test" };
	      ok( !aQuery.isFunction(myfunction), "Function Object" );

	      // Make sure normal functions still work
	      var fn = function(){};
	      ok( aQuery.isFunction(fn), "Normal Function" );

	      // TODO:  Add DOM tests

	   });

      // Destroy test environment
      document.close();
   }


   return {
      Go: function(testdir) {
	 Setup();
	 ExecuteTests(testdir);
      }
   };

}();

