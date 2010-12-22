/*
 * aQuery - jQuery for the Arbortext Object Model
 * http://bitbucket.org/jasulak/aquery/
 * Copyright (c) 2010 James Sulak

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

// Instructions:
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


   // Utility function for retreiving the text value of an array of DOM nodes
   // From Sizzle.getText()
   function getText( elems ) {
      var ret = "", elem;

      for (var i = 0; i < elems.length; i++) {
	 // This silliness is because we have to handle
	 // both aquery arrays and DOM nodelists, which don't use indexes
	 if (elems.item != null) {
	    elem = elems.item(i);
	 } else {
	    elem = elems[i];
	 }

	 // Get the text from text nodes and CDATA nodes
	 if (elem.nodeType === 3 || elem.nodeType === 4) {
	    ret += elem.nodeValue;
	 // Traverse everything else, except comment nodes
	 } else if (elem.nodeType !== 8) {
	    ret += getText(elem.childNodes);
	 }
      }

      return ret;
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
	    // TODO: Allow this to work with a context
	    // Will probably have to check if it is a document or a node
	    var oidNodesString = Acl.func("aquery_utils::get_doc_xpath_oids",
					  selector,
					  document.getAclId());
	    var oids = oidNodesString.split("-");
	    var result = aQuery();
	    for (var i = 0; i < oids.length; i++) {
	       result.push(Acl.getDOMOID(oids[i]));
	    }
	    result.selector = selector;
	    result.context = document;
	    return result;
	 }

	 // Otherwise return all elements in document with the
	 // $("tagname")
	 else {
	    this.selector = selector;
	    this.context = document;
	    selector = document.getElementsByTagName(selector);
	    return aQuery.fn.merge(this, selector);
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

      children : function(name) {
	 var result = aQuery();
	 for (var i = 0; i < this.length; i++) {
	    var elem = this[i];
	    for (var child = elem.firstChild; child != null; child = child.nextSibling) {
	       if (child.nodeType == child.ELEMENT_NODE && (name == null || child.getNodeName() == name)) {
		  result.push(child);
	       }
	    }
	 }
	 result.context = this[0];
	 result.selector = name;
	 return result;
      },

      parent : function(name) {
	 var result = aQuery();
	 for (var i = 0; i < this.length; i++) {
	    var parent = this[i].parentNode;
	    if (parent) {
	       result.push(elem.getParentnode());
	    }
	 }
	 result.context = this[0];
	 result.selector = name;
	 return result;
      },

      // Gets or sets the content of an element
      text : function(text) {
	 if (text != null && text != "") {
	    for (var i = 0; i < this.length; i++) {
	       var elem = this[i];
	       for (var child = elem.firstChild; child != null; child = child.nextSibling) {
		  elem.removeChild(child);
	       }
	       elem.appendChild(document.createTextNode(text));
	    }
	    return this;
	 } else {
	    return getText(this);
	 }
      },


      merge: function( first, second ) {
	 var i = first.length,
	     j = 0;

	 if ( typeof second.length === "number" ) {
	    if (typeof second.item === "function") {
	       for (var l = second.length; j < l; j++) {
		  first[i++] = second.item(j);
	       }

	    } else {
	       for (var l = second.length; j < l; j++) {
		  first[i++] = second[j];
	       }
	    }

	 } else {
	    while (second[j] !== undefined) {
	       first[i++] = second[j++];
	    }
	 }

	 first.length = i;

	 return first;
      },

      // Start with an empty selector
      selector: "",

      // The default length of an aQuery object is 0
      length: 0,

      // Make array methods avaliable
      // TODO: later do this in some more automated way

      push : Array.prototype.push,
      slice : Array.prototype.slice,
      forEach : Array.prototype.forEach,
      map : Array.prototype.map,
      reduce : Array.prototype.reduce,
      filter : Array.prototype.filter,
      indexOf : Array.prototype.indexOf,
      join : Array.prototype.join
   };

   // Give the init function the aQuery prototype for later instantiation
   aQuery.fn.init.prototype = aQuery.fn;

   return aQuery;
};


