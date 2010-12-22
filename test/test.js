

// Qunit harness
// See http://twoguysarguing.wordpress.com/2010/11/02/make-javascript-tests-part-of-your-build-qunit-rhino/
// and http://twoguysarguing.wordpress.com/2010/11/26/qunit-cli-running-qunit-with-rhino/


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

   /**
    * Returns an array of elements with the given IDs, eg.
    * @example q("main", "foo", "bar")
    * @result [<div id="main">, <span id="foo">, <input id="bar">]
    */
   function q() {
      var r = [];

      for ( var i = 0; i < arguments.length; i++ ) {
	 r.push( document.getElementById( arguments[i] ) );
      }

      return r;
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
	      equals( aQuery.length, 0, "aQuery() === aQuery([])" );
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
	      test = aQuery(document);
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
	      equal(titleParents[0].attr("id"), "topic-1");
	   });

      test("get()", function() {
	      expect(1);
	      deepEqual( aQuery("//*[@id]").get(), q("topic-1", "sect-1"), "Get All Elements" );
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

