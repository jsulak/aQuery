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


var _$ = function(document) {

   var _element = function(elem) {
      return {
	 elem : elem,
	 attr : function(name, value) {
	    if (value == null) {
	       return elem.getAttribute(name);
	    } else {
	       return elem.setAttribute(name, value);
	    }
	 },
	 children : function(name) {
	    var result = [];
	    for (var child = elem.firstChild; child != null; child = child.nextSibling) {
	       if (child.nodeType == child.ELEMENT_NODE && child.getNodeName() == name) {
		  result.push(_element(child));
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
	 return _element(document.getElementById(id));
      }

      // If it is a valid xpath expression, then do that
      else if (term.indexOf("/") != -1 && Acl.func("xpath_valid", term)) {
	 // TODO: later implement this more natively

	 var oidNodesString = Acl.func("jmp_utils::get_doc_xpath_oids",
				       term,
				       Acl.func("current_doc"));
	 var oids = oidNodesString.split("-");
	 var result = oids.map(function(x) {
				 return _element(Acl.DOMOID(x));
			       });
	 return result;
      }

      // Otherwise return all elements in document with the
      // provided name
      else {
	 var nodes = document.getElementsByTagName(term);
	 var result = [];
	 for (var i = 0; i < nodes.length; i++) {
	    result.push(_element(nodes.item(i)));
	 }
	 return result;
      }
   };
};
