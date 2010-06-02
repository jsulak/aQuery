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

var _$ = function(document) {
   var aQuery = function(selector, context) {
      // The aQuery object is actually just the init constructor "enhanced."
      return new aQuery.fn.init(selector, context);
   };

   // ================================
   // Private functions
   // ================================

   // Merges the second array into the first array
   function merge( first, second ) {
      var i = first.length, j = 0;

      if (typeof second.length === "number") {
	 for (var l = second.length; j < l; j++) {
	    first[i++] = second[j];
	 }
      } else {
	 while (second[j] !== undefined ) {
	    first[i++] = second[j++];
	 }
      }
      first.length = i;
      return first;
   }


   aQuery.fn = aQuery.prototype = {

      init : function(selector, context) {
	 var elem;

	 // Handle $(""), $(null), or $(undefined)
	 if (!selector) {
	    return this;
	 }

	 // Handle $(DOMElement)
	 if (selector.nodeType) {
	    this.context = this[0] = selector;
	    this.length = 1;
	    return this;
	 }

	 // Handle ID matching: $("#id")
	 if (selector.match(/^#/)) {
	    var id = selector.substr(1);
	    elem = document.getElementById(id);
	    this.length = 1;
	    this[0] = elem;
	    this.context = document;
	    this.selector = selector;
	    return this;
	 }

	 // If it is a valid xpath expression, then do that
	 else if (selector.indexOf("/") != -1 && Acl.func("xpath_valid", selector)) {
	    // TODO: later implement this more natively

	    var oidNodesString = Acl.func("jmp_utils::get_doc_xpath_oids",
					  selector,
					  Acl.func("current_doc"));
	    var oids = oidNodesString.split("-");
	    var result = aQuery();
	    for (var i = 0; i < oids.length; i++ ) {
	       result.push(Acl.DOMOID(oids[i]));
	    }
	    return result;
	 }

	 // Otherwise return all elements in document with the
	 // $("tagname")
	 else {
	    this.selector = selector;
	    this.context = document;
	    var nodes = document.getElementsByTagName(selector);
	    selector = [];
	    for (var i = 0; i < nodes.length; i++) {
	       this.push(nodes.item(i));
	    }
	    // TODO: Real jquery uses this merge.  Not sure why.
	    //return merge(this, selector);
	    return this;
	 }
      },

      remove : function() {
	 this.forEach(function(elem) {
			 var parent = elem.getParentNode();
			 parent.removeChild(elem);
		      });
      },

      attr : function(name, value) {
	 if (value == null) {
	    return this[0].getAttribute(name);
	 }
	 else {
	    this.forEach(function(elem) { elem.setAttribute(name, value); });
	    return this;
	 }
      },

      // Start with an empty selector
      selector: "",


      // Make array methods avaliable
      // TODO: later do this in some more automated way

      push : Array.prototype.push,
      slice : Array.prototype.slice,
      forEach : Array.prototype.forEach,
      map : Array.prototype.map,
      indexOf : Array.prototype.indexOf
   };

   //aQuery.prototype.howdy = "aloha";

   // Give the init function the aQuery prototype for later instantiation
   aQuery.fn.init.prototype = aQuery.fn;

   return aQuery;
};


// Implement _element functions on the entire array
// TODO: Fix this.  This is a total hack. Ideally,
// there would be one implementation, that functioned
// only on the array.
/*
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

*/