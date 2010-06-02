// This is a very limited knockoff of jquery for the AOM
//
// To use it on the current document:
//    var $ = _$(Application.activeDocument);
//
// You can get elements by id:
//    var elem = $("#idname")
//
// You can get all the elements in a document with a particular name:
//    var elems = $("chapter")
//
// You can get the children of an element w/ a particular name:
//    var children = #("idname").children("section")
//
// You can get/set attributes:
//    $("#idname").attr("class") or
//    #("#idname").attr("toc", "no")
//
// If you need to escape to the actual AOM node, use the "elem" property:
//    $("#idname").elem.appendChild(newElement)


// The AQuery object inherits from the array object
// TODO: Later, we may want to explicitly say which methods we want to keep

var aQueryCreator = function(document) {
   // Define AQuery as an array so we get all the methods
   var AQuery = {};
   AQuery.push = Array.prototype.push;
   AQuery.slice = Array.prototype.slice;
   AQuery.forEach = Array.prototype.forEach;
   AQuery.map = Array.prototype.map;
   AQuery.indexOf = Array.prototype.indexOf;

   AQuery.remove = function() {
      this.forEach(function(elem) {
		      var parent = elem.getParentNode();
		      parent.removeChild(elem);
		   });
   };

   AQuery.attr = function(name, value) {
      if (value == null) {
	 return this[0].getAttribute(name);
      }
      else {
	 this.forEach(function(elem) { elem.setAttribute(name, value); });
	 return this;
      }
   };

   return AQuery;
};


// Implement _element functions on the entire array
// TODO: Fix this.  This is a total hack. Ideally,
// there would be one implementation, that functioned
// only on the array.

var _$ = function(document) {

   var _element = function(elem) {
      return {
	 // TODO: update to return all children if name is blank
	 children : function(name) {
	    var result = aQueryCreator();
	    for (var child = elem.firstChild; child != null; child = child.nextSibling) {
	       if (child.nodeType == child.ELEMENT_NODE && child.getNodeName() == name) {
		  result.push(child);
	       }
	    }
	    return result;
	 }
      };
   };

   return function(term) {
      // If it starts with "#", then we want to match ids
      if (term.match(/^#/)) {
	 var id = term.substr(1);
	 return document.getElementById(id);
      }

      // If it is a valid xpath expression, then do that
      else if (term.indexOf("/") != -1 && Acl.func("xpath_valid", term)) {
	 // TODO: later implement this more natively

	 var oidNodesString = Acl.func("jmp_utils::get_doc_xpath_oids",
				       term,
				       Acl.func("current_doc"));
	 var oids = oidNodesString.split("-");
	 var result = aQueryCreator();
	 for (var i = 0; i < oids.length; i++ ) {
	    result.push(Acl.DOMOID(oids[i]));
	 }
	 return result;
      }

      // Otherwise return all elements in document with the
      // provided name
      else {
	 var nodes = document.getElementsByTagName(term);
	 var result = aQueryCreator();
	 for (var i = 0; i < nodes.length; i++) {
	    result.push(nodes.item(i));
	 }
	 return result;
      }
   };
};
