

// Qunit harness
// See http://twoguysarguing.wordpress.com/2010/11/02/make-javascript-tests-part-of-your-build-qunit-rhino/
// and http://twoguysarguing.wordpress.com/2010/11/26/qunit-cli-running-qunit-with-rhino/

// To use, source the file, then run aQueryTests.Go({path to test data})


var aQueryTests = function() {


   function Setup() {
      Acl.execute("source qunit.js");

      // TODO: Update this path
      Acl.execute("source b:/workspace/aquery/aquery.js");

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
      	      expect(3);
      	      equal(aQuery("p").length, 61);
      	      equal(aQuery("/topic/title").text(), "The Waste Land");
      	      equal(aQuery("sdfsdf").length, 0, "No hits in XPath, then zero length");
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
      	      expect(12);

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


      // TODO: Implement these tests once more of the traversal methods are implemented
      // test("end()", function() {
      // 	      expect(3);
      // 	      equals( 'Yahoo', aQuery('#yahoo').parent().end().text(), 'Check for end' );
      // 	      ok( aQuery('#yahoo').end(), 'Check for end with nothing to end' );

      // 	      var x = aQuery('#yahoo');
      // 	      x.parent();
      // 	      equals( 'Yahoo', aQuery('#yahoo').text(), 'Check for non-destructive behaviour' );
      // 	   });

      test("length", function() {
      	      expect(1);
      	      equals( aQuery("data").length, 9, "Get Number of Elements Found" );
      	   });

      test("size()", function() {
      	      expect(1);
      	      equals( aQuery("data").size(), 9, "Get Number of Elements Found" );
      	   });

      test("get()", function() {
      	      expect(1);
      	      // For some reason, deep equal doesn't seem to work on arrays of elements.
      	      equal( aQuery("*[@id]").get().length, 2 );
      	   });

      test("get(1)", function() {
      	      expect(1);
      	      // TODO: this whole Java string vs. javascript string thing is annoying
      	      equal( new String(aQuery("*[@id]").get(0).tagName), "topic");
      	   });

      test("get(-1)", function() {
      	      expect(1);
      	      equal(new String(aQuery("data").get(-1).getAttribute("name")), "copyright-status");
      	   });
      //equals( toString.call(aQuery.makeArray(/a/)[0]), "[object RegExp]", "Pass makeArray a regex" );
      test("toArray()", function() {
      	      expect(2);
      	      var a = aQuery("data").toArray();
      	      equal ( toString.call(a), "[object Array]", "Convert Query object to array");
      	      equal ( a.length, 9, "Convert Query object to array");
      	   });

      test("each(Function)", function() {
      	      expect(1);
      	      var data = aQuery("data");
      	      data.each(function(){aQuery(this).attr("foo", "zoo");});
      	      var pass = true;
      	      for ( var i = 0; i < data.size(); i++ ) {
      		 if ( aQuery(data.get(i)).attr("foo") != "zoo" ) pass = false;
      	      }
      	      ok( pass, "Exectue a function, Relative" );
      	   });

      test("slice()", function() {
      	      expect(5);

      	      var $data = aQuery("data");

      	      // Note: have to use .equals because of rhino/AOM weirdness that causes == not to work
      	      equals( $data.slice(1,2).attr("name"), 'etext-no.', "slice(1,1)" );
      	      ok( $data.slice(1,2).get()[0].equals(aQuery("data[@name = 'etext-no.']")[0]), "slice(1,1)" );
      	      ok( $data.slice(-1).get()[0].equals(aQuery("data[@name = 'copyright-status']")[0]), "slice(-1)" );
      	      equals($data.slice(-1).length, 1, "slice(-1)");
      	      equals($data.slice(1).length, 8, "slice(1)");
      	   });


      test("first()/last()", function() {
      	      expect(4);

      	      var $data = aQuery("data"), $none = aQuery("asdf");

      	      equals( $data.first().attr("name"), "project-gutenberg-metadata" , "first()" );
      	      same( $data.last().attr("name"), "copyright-status", "last()" );

      	      same( $none.first().get(), [], "first() none" );
      	      same( $none.last().get(), [], "last() none" );
      	   });


      test("map()", function() {
      	      expect(2);

      	      same(
      		 aQuery("data").map(function(){
      				       return aQuery(this).attr("name");
      				    }).get(),
      		 ['project-gutenberg-metadata', 'etext-no.', 'release-date', 'loc-class', 'subject',
      		  'base-directory', 'language', 'creator', 'copyright-status'],
      		 "Array Map"
      	      );

      	      same(
      		 aQuery("data").first().map(function(){
      					       return aQuery(this).attr("name");
      					    }).get(),
      		 ["project-gutenberg-metadata"],
      		 "Single Map"
      	      );

      	   });

      test("end()", function() {
      	      var data = aQuery("data[data]");
      	      equals(data.children().end().length, 1, "end");
      	   });

      test("aQuery.merge()", function() {
      	      expect(8);

      	      var parse = aQuery.merge;

      	      same( parse([],[]), [], "Empty arrays" );

      	      same( parse([1],[2]), [1,2], "Basic" );
      	      same( parse([1,2],[3,4]), [1,2,3,4], "Basic" );

      	      same( parse([1,2],[]), [1,2], "Second empty" );
      	      same( parse([],[1,2]), [1,2], "First empty" );

      	      // Fixed at [5998], #3641
      	      same( parse([-2,-1], [0,1,2]), [-2,-1,0,1,2], "Second array including a zero (falsy)");

      	      // After fixing #5527
      	      same( parse([], [null, undefined]), [null, undefined], "Second array including null and undefined values");
      	      same( parse({length:0}, [1,2]), {length:2, 0:1, 1:2}, "First array like");
      	   });

      test("aQuery.extend(Object, Object)", function() {
      	      expect(27);

      	      var settings = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
      	      options = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
      	      optionsCopy = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
      	      merged = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "x", xxx: "newstring" },
      	      deep1 = { foo: { bar: true } },
      	      deep1copy = { foo: { bar: true } },
      	      deep2 = { foo: { baz: true }, foo2: document },
      	      deep2copy = { foo: { baz: true }, foo2: document },
      	      deepmerged = { foo: { bar: true, baz: true }, foo2: document },
      	      arr = [1, 2, 3],
      	      nestedarray = { arr: arr };

      	      aQuery.extend(settings, options);
      	      same( settings, merged, "Check if extended: settings must be extended" );
      	      same( options, optionsCopy, "Check if not modified: options must not be modified" );

      	      aQuery.extend(settings, null, options);
      	      same( settings, merged, "Check if extended: settings must be extended" );
      	      same( options, optionsCopy, "Check if not modified: options must not be modified" );

      	      aQuery.extend(true, deep1, deep2);
      	      same( deep1.foo, deepmerged.foo, "Check if foo: settings must be extended" );
      	      same( deep2.foo, deep2copy.foo, "Check if not deep2: options must not be modified" );
      	      equals( deep1.foo2, document, "Make sure that a deep clone was not attempted on the document" );

      	      ok( aQuery.extend(true, [], arr) !== arr, "Deep extend of array must clone array" );
      	      ok( aQuery.extend(true, {}, nestedarray).arr !== arr, "Deep extend of object must clone child array" );

      	      var empty = {};
      	      var optionsWithLength = { foo: { length: -1 } };
      	      aQuery.extend(true, empty, optionsWithLength);
      	      same( empty.foo, optionsWithLength.foo, "The length property must copy correctly" );

      	      empty = {};
      	      var optionsWithDate = { foo: { date: new Date } };
      	      aQuery.extend(true, empty, optionsWithDate);
      	      same( empty.foo, optionsWithDate.foo, "Dates copy correctly" );

      	      var myKlass = function() {};
      	      var customObject = new myKlass();
      	      var optionsWithCustomObject = { foo: { date: customObject } };
      	      empty = {};
      	      aQuery.extend(true, empty, optionsWithCustomObject);
      	      ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly (no methods)" );

      	      // Makes the class a little more realistic
      	      myKlass.prototype = { someMethod: function(){} };
      	      empty = {};
      	      aQuery.extend(true, empty, optionsWithCustomObject);
      	      ok( empty.foo && empty.foo.date === customObject, "Custom objects copy correctly" );

      	      var ret = aQuery.extend(true, { foo: 4 }, { foo: new Number(5) } );
      	      ok( ret.foo == 5, "Wrapped numbers copy correctly" );

      	      var nullUndef;
      	      nullUndef = aQuery.extend({}, options, { xnumber2: null });
      	      ok( nullUndef.xnumber2 === null, "Check to make sure null values are copied");

      	      nullUndef = aQuery.extend({}, options, { xnumber2: undefined });
      	      ok( nullUndef.xnumber2 === options.xnumber2, "Check to make sure undefined values are not copied");

      	      nullUndef = aQuery.extend({}, options, { xnumber0: null });
      	      ok( nullUndef.xnumber0 === null, "Check to make sure null values are inserted");

      	      var target = {};
      	      var recursive = { foo:target, bar:5 };
      	      aQuery.extend(true, target, recursive);
      	      same( target, { bar:5 }, "Check to make sure a recursive obj doesn't go never-ending loop by not copying it over" );

      	      var ret = aQuery.extend(true, { foo: [] }, { foo: [0] } ); // 1907
      	      equals( ret.foo.length, 1, "Check to make sure a value with coersion 'false' copies over when necessary to fix #1907" );

      	      var ret = aQuery.extend(true, { foo: "1,2,3" }, { foo: [1, 2, 3] } );
      	      ok( typeof ret.foo != "string", "Check to make sure values equal with coersion (but not actually equal) overwrite correctly" );

      	      var ret = aQuery.extend(true, { foo:"bar" }, { foo:null } );
      	      ok( typeof ret.foo !== 'undefined', "Make sure a null value doesn't crash with deep extend, for #1908" );

      	      var obj = { foo:null };
      	      aQuery.extend(true, obj, { foo:"notnull" } );
      	      equals( obj.foo, "notnull", "Make sure a null value can be overwritten" );

      	      function func() {}
      	      aQuery.extend(func, { key: "value" } );
      	      equals( func.key, "value", "Verify a function can be extended" );

      	      var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
      	      defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
      	      options1 = { xnumber2: 1, xstring2: "x" },
      	      options1Copy = { xnumber2: 1, xstring2: "x" },
      	      options2 = { xstring2: "xx", xxx: "newstringx" },
      	      options2Copy = { xstring2: "xx", xxx: "newstringx" },
      	      merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };

      	      var settings = aQuery.extend({}, defaults, options1, options2);
      	      same( settings, merged2, "Check if extended: settings must be extended" );
      	      same( defaults, defaultsCopy, "Check if not modified: options1 must not be modified" );
      	      same( options1, options1Copy, "Check if not modified: options1 must not be modified" );
      	      same( options2, options2Copy, "Check if not modified: options2 must not be modified" );
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

      	      equals( toString.call(aQuery.makeArray(/a/)[0]), "[object RegExp]", "Pass makeArray a regex" );

      	      // For #5610
      	      deepEqual( aQuery.makeArray({'length': '0'}), [], "Make sure object is coerced properly.");
      	      deepEqual( aQuery.makeArray({'length': '5'}), [], "Make sure object is coerced properly.");


      	      // TODO: Add actual DOM tests

      	   });


      test("aQuery.isEmptyObject", function(){
      	      expect(2);

      	      equals(true, aQuery.isEmptyObject({}), "isEmptyObject on empty object literal" );
      	      equals(false, aQuery.isEmptyObject({a:1}), "isEmptyObject on non-empty object literal" );
      	   });


      test("aQuery.proxy", function(){
      	      expect(4);

      	      var test = function(){ equals( this, thisObject, "Make sure that scope is set properly." ); };
      	      var thisObject = { foo: "bar", method: test };

      	      // Make sure normal works
      	      test.call( thisObject );

      	      // Basic scoping
      	      aQuery.proxy( test, thisObject )();

      	      // Make sure it doesn't freak out
      	      equals( aQuery.proxy( null, thisObject ), undefined, "Make sure no function was returned." );

      	      // Use the string shortcut
      	      aQuery.proxy( thisObject, "method" )();
      	   });


      test("Parent & Parents", function() {
      	      expect(6);
      	      var titleParents = aQuery("title").parent();
      	      var attr = titleParents.attr("id");
      	      equals(attr, "topic-1");
      	      equals(aQuery("p").first().parents().length, 2);
      	      equals(aQuery("p").parents().length, 10);
      	      equals(aQuery("p").parent().length, 8);
      	      equals(aQuery("p").parents("topic").length, 2);
      	      equals(aQuery("title").parents("topic[title]").length, 2);

      	   });

      test("Next & Prev", function() {
      	      expect(8);
      	      equals(aQuery("data[@name = 'etext-no.']").next().attr("name"), "release-date", "Simple next");
      	      equals(aQuery("data[@name = 'release-date']").prev().attr("name"), "etext-no.", "Simple prev");
      	      equals(aQuery("data[@name = 'etext-no.']").nextAll().length, 7, "nextAll");
      	      equals(aQuery("data").last().prevAll().length, 7, "prevAll");

      	      // Test with selectors
      	      equals(aQuery("data/data").next("data[@name = 'release-date']").attr("name"), "release-date", "next() with selector");

      	      equals(aQuery("data/data").last().prevAll("jjj").length, 0, "prevAll with selector");
      	      equals(aQuery("data/data").last().prevAll("data[@name]").length, 7, "prevAll with selector");

      	      equals(aQuery("data/data").first().nextUntil("data[@name = 'base-directory']").length, 3, "nextUntil");
      	   });

      test("Is", function() {
      	      expect(6);
      	      equals(aQuery("data").is("data"), true);
      	      equals(aQuery("data").is("*"), true);

      	      ok( !aQuery('#foo').is(0), 'Expected false for an invalid expression - 0' );
      	      ok( !aQuery('#foo').is(null), 'Expected false for an invalid expression - null' );
      	      ok( !aQuery('#foo').is(''), 'Expected false for an invalid expression - ""' );
      	      ok( !aQuery('#foo').is(undefined), 'Expected false for an invalid expression - undefined' );

      	   });

      test("Children", function() {
      	      expect(3);
      	      equals(aQuery("data").first().children().length, 8, "Simple children");
      	      equals(aQuery("data").children("data").length, 8, "Filtered children of multiple elements");
      	      equals(aQuery("data").first().children("data[@name = 'base-directory']").length, 1, "Filter children with xpath");
      	   });

      test("Attributes", function() {
      	      expect(9);

      	      equals(aQuery("data[@name = 'etext-no.']").attr("name"), "etext-no.");
      	      var data = aQuery("data").eq(1);

      	      // Set and get on single elements
      	      data.attr("foo", "bar");
      	      equals(data.attr("foo"), "bar");

      	      // Set multiple values
      	      data.attr({
      		 foo_a : "bar_a",
      		 foo_b : "bar_b"
      		 });
      	      equals(data.attr("foo_a"), "bar_a");
      	      equals(data.attr("foo_b"), "bar_b");

      	      // Set value on single element using function
      	      data.attr("name-computed", function() { return aQuery(this).attr("name") + "_hello"; });
      	      equals(data.attr("name-computed"), "etext-no._hello");

      	      var datas = aQuery("data");
      	      datas.attr("name-computed-2", function() { return aQuery(this).attr("name") + "_howdy"; });
      	      equals(datas.map(function() { return aQuery(this).attr("name-computed-2"); }).length, 9);

      	      var pass = true;
      	      for ( var i = 0; i < data.size(); i++ ) {
      		 if ( datas.eq(i).attr("name-computed-2") != datas.eq(i).attr("name") + "_howdy" ) pass = false;
      	      }
      	      ok(pass, "Setting multiple attributes with a function");

      	      // Test removing attributes
      	      datas.removeAttr("name-computed-2");
      	      equals(aQuery("data[@name-computed-2]").length, 0, "removing multiple attributes");
      	      data.removeAttr("foo_a");
      	      equals(data.attr("foo_a"), undefined, "removing a single attribute");

      	   });


      test("inArray", function() {
      	      var data = aQuery("data");
      	      equals(aQuery.inArray(data[0], data.get()), 0);
      	      equals(aQuery.inArray(aQuery("topic")[0], data.get()), -1);
      	   });


      test("filter", function() {
      	      var data = aQuery("data");
      	      equals(data.filter("data[@name]").length, data.length, "Filter (removing none)");
      	      equals(data.filter("data[@hello]").length, 0, "Filter (get none)");
      	      equals(data.filter("data/data").length, 8, "Filter (getting some)");
      	      equals(data.filter(function() { return aQuery(this).attr("name") == "release-date"; }).length, 1, "Filter using function");
      	      equals(data.filter(data[0]).length, 1, "Filter with element");
      	      equals(data.filter(aQuery("data/data")).length, 8, "Filter with aQuery object");

      	   });

      test("not", function() {
      	      var data = aQuery("data");
      	      equals(data.not("data/data").length, 1, "Not (selector)");
      	      equals(data.not(data[0]).length, 8, "Not (element)");
      	      equals(data.not(data.get()).length, 0, "Not (elements)");
      	      equals(data.not(function() { return aQuery(this).attr("name") != "release-date"; }).length, 1, "Not (function)");

      	   });

      test("has", function() {
      	      expect(3);
      	      equals(aQuery("data").has("data").length, 1, "has (direct child)");
      	      equals(aQuery("data").has(aQuery("data").get(2)).length, 1, "has (direct child element)");
      	      equals(aQuery("data").has(aQuery("data")).length, 1, "has (aQuery object)");
      	   });

      test("contains", function() {
      	      expect(2);
      	      var data = aQuery("data").first();
      	      var d2 = aQuery("data/data").first();
      	      equals(aQuery.contains(data[0], d2[0]), true);
      	      equals(aQuery.contains(d2[0], data[0]), false);
      	   });

      test("index()", function() {
      	      expect(1);
      	      equals(aQuery("data[@name = 'release-date']").index(), 1, "Returns the index of a child among its siblings");
      	   });

      test("index(Object|String|undefined)", function() {
      	      expect(6);

      	      var data = aQuery("data/data");
      	      var root = aQuery("/*");

      	      // Passing a node
      	      equals(data.index(data[1]), 1, "Check for index of element.");
      	      equals(data.index(root[0]), -1, "Check for missing element.");

      	      // Passing an aQuery object
      	      equals(data.index(data), 0, "Pass in aQuery object");
      	      equals(data.index(data.eq(1)), 1, "Pass in aQuery object");

      	      // Passing a selector
      	      equals(aQuery(data[0]).index("data/data"), 0, "Chcek for index among returned results");
      	      equals(aQuery("data/data[2]").index("data"), 2, "Check for index among returned results");
      	   });

      test("add(String|Element|Array|undefined", function() {
      	      expect(9);

      	      var data = aQuery("data/data");
      	      var prologs = aQuery("prolog");

      	      // Add an aquery object
      	      equals(data.add(prologs).length, data.length + prologs.length, "Add aquery object");
      	      equals("" + data.add(prologs).first()[0].getTagName(), "prolog", "Add aquery object");

      	      // Add a selector
      	      equals(data.add("prolog").length, data.length + 1, "Add selector");
      	      equals("" + data.add("prolog")[0].getTagName(), "prolog", "Add selector");

      	      // Add an actual Element
      	      equals(data.add(prologs[0]).length, data.length + 1, "Add element");
      	      equals("" + data.add(prologs[0])[0].getTagName(), "prolog", "Add element");

      	      // Make sure that the elements are only added once
      	      equals(data.add("data/data").length, data.length, "Add identical elements");

      	      same(["etext-no.", "release-date", "loc-class", "subject", "base-directory", "language", "creator", "copyright-status"],
      		   data.add("data/data").map(function() { return aQuery(this).attr("name"); }).get());

      	      var notDefined;
      	      equals( aQuery([]).add(notDefined).length, 0, "Check that undefined adds nothing" );

      	   });

      test("addSelf", function() {
      	      expect(2);
      	      var data = aQuery("data[data]");
      	      equals(data.children().andSelf().length, 9, "andSelf");
      	      equals(data.children("data[@name = 'copyright-status']").andSelf().length, 2, "andSelf");
      	   });

      test("find()", function() {
      	      var data = aQuery("data[data]");
      	      equals(data.find("data").length, 8, "Find - simple element, one level");
      	      equals(aQuery("/topic").find("data").length, 9, "Find - simple element, deep");
      	      same(["etext-no.", "release-date", "loc-class", "subject", "base-directory", "language", "creator", "copyright-status"],
      		   aQuery("/topic").find("data/data").map(function() { return aQuery(this).attr("name"); }).get(),
      		   "Find - xpath, deep");
      	      equals(aQuery("topic").find("title").length, 11, "Find - deep, multiple source elements");

      	      // TODO:  Is this the proper behavior?
      	      equals(aQuery("/topic").find("topic/title").length, 1, "Find - deep, xpath");
      	      equals(aQuery("data").find("topic").length, 0, "Find - none expected");
      	      equals(aQuery("data").find("topic/title").length, 0, "Find - xpath, none expected");
      	      equals(aQuery("/topic").find("#notes-on-the-wasteland").length, 1, "Find - id");

      	   });

      test("closest()", function() {
      	      var data = aQuery("data/data");
      	      equals(data.closest("data").attr("name"), "etext-no.");
      	      equals("" + data.closest("prolog")[0].getTagName(), "prolog");
      	      equals(aQuery("i").first().closest("topic/body").length, 1);

      	      // TODO: Context


      	      // TODO: Array of contexts

      	   });


      test("append()", function() {
      	      expect(6);

      	      // Append plain text
      	      var p = aQuery("p").first();

      	      equals(p.append("hello").text().substr(-5), "hello", "Append plain text");

      	      // Append a dom node
      	      var n = document.createElement("b");
      	      equals(p.append(n).children("b").length, 1, "Append DOM element");

      	      // Append a jquery object
      	      equals(p.append(aQuery(document.createElement("b")))
      		      .children("b").length, 2, "Append aQuery object");

      	      // Append using a function
      	      equals(p.append(function() { return document.createElement("i"); })
      		      .children("i").length, 1, "Append DOM element using function");

      	      // Append using a string
      	      equals(p.append("<b>howdy</b>")
      		      .children("b").length, 3, "Append markup string");
      	      equals(p.text().substr(-5) , "howdy", "Append markup string");

      	      // TODO: Figure out why text doesn't work here.
      	      p.xml("T. S. Eliot");
      	 });


      test("prepend()", function() {
      	      expect(6);

      	      var p = aQuery("p").eq(1);
      	      var clone = p.clone();

      	      equals(p.prepend("hello").text().substr(0, 5), "hello", "Append plain text");
      	      var n = document.createElement("b");
      	      equals(p.prepend(n).children("b").length, 1, "Append DOM element");
      	      equals(p.prepend(aQuery(document.createElement("b")))
      		      .children("b").length, 2, "Prepend aQuery object");
      	      equals(p.prepend(function() { return document.createElement("b"); })
      		      .children("b").length, 3, "Append DOM element using function");

      	      equals(p.prepend("<b>howdy</b>")
      		      .children("b").length, 4, "Append a markup string");
      	      equals(p.text().substr(0, 5), "howdy", "Append a markup string");

      	      // Remove markup string
      	      p.replaceWith(clone);
      	 });

      test("before()", function() {
      	      expect(4);
      	      var p = aQuery("p").first();
      	      var note = document.createElement("note");
      	      p.before(note);
      	      equals(p.prevAll("note").length, 1, "Add DOM element");

      	      var n = aQuery(document.createElement("note"));
      	      p.before(n);
      	      equals(p.prevAll("note").length, 2, "Add aQuery object");

      	      equals(p.before(function() { return document.createElement("note"); })
      		      .prevAll("note").length, 3, "Add DOM element using function");

      	      p.before("<note />");
      	      equals(p.prevAll("note").length, 4, "Add markup string");

      	      aQuery("note").remove();

      	   });

      test("after()", function() {
      	      expect(4);

      	      var p = aQuery("p").first();
      	      var note = document.createElement("note");
      	      p.after(note);
      	      equals(p.nextAll("note").length, 1, "Add DOM element");

      	      var n = aQuery(document.createElement("note"));
      	      p.after(n);
      	      equals(p.nextAll("note").length, 2, "Add aQuery object");

      	      equals(p.after(function() { return document.createElement("note"); })
      		      .nextAll("note").length, 3, "Add DOM element using function");

      	      p.after("<note />");
      	      equals(p.nextAll("note").length, 4, "Add markup string");

      	      aQuery("note").remove();
      	   });


      test("remove()", function() {
      	      expect(3);

      	      var p = aQuery("p");
      	      p.before(document.createElement("note"));
      	      equals(aQuery("note").length, 61, "Counting notes");
      	      aQuery("note").remove();
      	      equals(aQuery("note").length, 0, "Remove notes");

      	      var beforeCount = aQuery("*").length;
      	      p.before(document.createElement("note"));
      	      aQuery("*").remove("note");
      	      equals(aQuery("*").length, beforeCount, "Remove items using a selector");
      	   });

      test("empty()", function() {
      	      expect(4);

      	      var p = aQuery("p").eq(1);
      	      var cloned = p.clone();
      	      cloned.empty();
      	      equals(cloned.children().length, 0, "Node has no children");
      	      equals(cloned.text().length, 0, "Node has no text");

      	      var s = aQuery("section").first().clone();
      	      var count = s.children().length;
      	      equals(s.children().empty().text().length, 0, "Check text is removed");
      	      equals(s.children().length, count, "Check elements are not removed");
      	   });

      test("clone()", function() {
      	      expect(2);

      	      var p = aQuery("p").eq(1);
      	      var cloned = p.clone();
      	      ok(cloned.text().indexOf("Sibyllam") > -1, "Node is cloned");
      	      aQuery("p").first().before(cloned);
      	      equals(aQuery("p[contains(., 'Sibyllam')]").length, 2, "Cloned node is copied");
      	      aQuery("p[contains(., 'Sibyllam')]").eq(0).remove();
      	   });

      test("replaceWith()", function() {
      	      expect(7);

      	      var aClone = aQuery("author").clone();
      	      aQuery("author").replaceWith(document.createElement("publisher"));
      	      equals(aQuery("author").length, 0, "tag removed");
      	      equals(aQuery("publisher").length, 1, "new tag inserted");
      	      equals("" + aQuery("prolog").first().children().first()[0].tagName, "publisher", "Tag inserted into correct position");

      	      aQuery("publisher").replaceWith(aClone);
      	      equals(aQuery("publisher").length, 0, "tag removed");
      	      equals(aQuery("author").length, 1, "aQuery object inserted");

      	      aQuery("author").replaceWith("<publisher />");
      	      equals(aQuery("publisher").length, 1, "new tag inserted");
      	      equals("" + aQuery("prolog").first().children().first()[0].tagName, "publisher", "Tag inserted into correct position");

      	      aQuery("publisher").replaceWith(aClone);
      	   });



      test("wrapAll()", function() {
      	      expect(2);
      	      var p = aQuery("p").slice(0, 2);
      	      p.wrapAll("<note/>");
      	      equals("" + aQuery("body").first().children().first()[0].tagName, "note");
      	      equals(aQuery("note").children().length, 2);
      	      p.unwrap();
      	   });

      test("wrapInner()", function() {
      	      var p = aQuery("p").first();

      	      // Insert markup string
      	      p.wrapInner("<b><i></i></b>");

      	      equals(p.text(), "T. S. Eliot", "Check text");
      	      ok(p.children().first().is("b"), "Bold inserted");
      	      equals(p.children().length, 1, "Bold is the only child");
      	      ok(p.children().first().children().first().is("i"), "Italic inserted");

      	      p.children().remove();
      	      p.text("T. S. Eliot");

      	      // Insert DOM element
      	      var bold = document.createElement("b");
      	      p.wrapInner(bold);

      	      equals(p.text(), "T. S. Eliot", "Check text");
      	      ok(p.children().first().is("b"), "Bold inserted");
      	      equals(p.children().length, 1, "Bold is the only child");

      	      p.children().remove();
      	      p.text("T. S. Eliot");

      	      // Insert function
      	      p.wrapInner(function() { return document.createElement("b"); });

      	      equals(p.text(), "T. S. Eliot", "Check text");
      	      ok(p.children().first().is("b"), "Bold inserted");
      	      equals(p.children().length, 1, "Bold is the only child");

      	      p.children().remove();
      	      p.text("T. S. Eliot");

      	      // Insert aQuery object
      	      bold = aQuery("<b/>");
      	      p.wrapInner(bold);

      	      equals(p.text(), "T. S. Eliot", "Check text");
      	      ok(p.children().first().is("b"), "Bold inserted");
      	      equals(p.children().length, 1, "Bold is the only child");

      	      p.children().remove();
      	      p.text("T. S. Eliot");

      	   });


      test("wrap()", function() {
      	      expect(26);
      	      var p = aQuery("p").slice(0, 2);

      	      // Insert markup string
      	      p.wrap("<note />");
      	      equals(aQuery("note").length, 2, "Elements wrapped by on-the-fly XML");
      	      equals(aQuery("note").filter("*[p]").length, 2, "Both notes contain a paragraph");
      	      equals(aQuery("body").first().children().slice(0, 2).filter("note").length, 2, "First two children are notes.");
      	      equals(aQuery("note").first().text(), "T. S. Eliot", "Check text");

      	      aQuery("note/p").unwrap();
      	      equals(aQuery("note").length, 0, "Notes unwrapped");

      	      // Insert DOM node
      	      var note = document.createElement("note");
      	      p.wrap(note);
      	      equals(aQuery("note").length, 2, "Elements wrapped by DOM element");
      	      equals(aQuery("note").filter("*[p]").length, 2, "Both notes contain a paragraph");
      	      equals(aQuery("body").first().children().slice(0, 2).filter("note").length, 2, "First two children are notes.");
      	      equals(aQuery("note").first().text(), "T. S. Eliot", "Check text");

      	      aQuery("note/p").unwrap();
      	      equals(aQuery("note").length, 0, "Notes unwrapped");

      	      // Insert function
      	      p.wrap(function() { return document.createElement("note"); });
      	      equals(aQuery("note").length, 2, "Elements wrapped by function");
      	      equals(aQuery("note").filter("*[p]").length, 2, "Both notes contain a paragraph");
      	      equals(aQuery("body").first().children().slice(0, 2).filter("note").length, 2, "First two children are notes.");
      	      equals(aQuery("note").first().text(), "T. S. Eliot", "Check text");

      	      aQuery("note/p").unwrap();
      	      equals(aQuery("note").length, 0, "Notes unwrapped");

      	      aQuery("body").first().prepend("<note />");
      	      equals(aQuery("note").length, 1, "Note added");

      	      // Insert aQuery object
      	      p.wrap(aQuery("note"));
      	      aQuery("note").first().remove();
      	      equals(aQuery("note").length, 2, "Elements wrapped by aQuery object");
      	      equals(aQuery("note").filter("*[p]").length, 2, "Both notes contain a paragraph");
      	      equals(aQuery("body").first().children().slice(0, 2).filter("note").length, 2, "First two children are notes.");
      	      equals(aQuery("note").first().text(), "T. S. Eliot", "Check text");

      	      aQuery("note/p").unwrap();
      	      equals(aQuery("note").length, 0, "Notes unwrapped");

      	      aQuery("body").first().prepend("<note />");

      	      // Insert selector expression
      	      p.wrap("note");
      	      aQuery("note").first().remove();
      	      equals(aQuery("note").length, 2, "Elements wrapped by selector expression");
      	      equals(aQuery("note").filter("*[p]").length, 2, "Both notes contain a paragraph");
      	      equals(aQuery("body").first().children().slice(0, 2).filter("note").length, 2, "First two children are notes.");
      	      equals(aQuery("note").first().text(), "T. S. Eliot", "Check text");

      	      aQuery("note/p").unwrap();
      	      equals(aQuery("note").length, 0, "Notes unwrapped");
      });


      test("xml()", function() {
      	      expect(7);
      	      var p = aQuery("p").first();


      	      equals(p.xml(), "T. S. Eliot", "Get string");
      	      equals("<q><i>Nam Sibyllam quidem Cumis ego ipse oculis meis vidi in ampulla pendere, et cum illi           pueri dicerent: Sibylla ti theleis; respondebat illa: apothanein thelo.</i></q>", aQuery("p").eq(1).xml(), "Get string");

      	      // Set
      	      p.xml("Hello!");
      	      equals(p.text(), "Hello!", "Set string");
      	      p.xml("<b>Howdy!</b>");
      	      equals(p.children().length, 1, "Set markup string");
      	      equals("" + p.children()[0].tagName, "b", "Set markup string");
      	      equals(p.text(), "Howdy!", "Set markup string");

      	      p.xml(function() { return "Aloha!"; });
      	      equals(p.text(), "Aloha!", "Set function");

      	      p.text("T. S. Eliot");
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

