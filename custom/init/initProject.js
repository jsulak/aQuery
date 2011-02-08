
// Set this to the root of the aquery project folder
var aQueryDir = "b:/workspace/aquery/";

function initProject() {
   Acl.func("java_console");
   print("initProject");

   Acl.execute("source " + aQueryDir + "/aquery.js");
   Acl.execute("source " + aQueryDir + "/aquery_utils.acl");
   Acl.execute("source xpath_explorer_helper.js");
}

function initTests() {
   Acl.execute("source " + aQueryDir + "/test/test.js");
   aQueryTests.Go(aQueryDir);
}

// Let's get this party started
initProject();