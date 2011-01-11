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


// Source the aquery utils
Acl.execute("source aquery_utils.acl");


var _$ = function(document) {

   var aQuery = function(selector, context) {
      // The aQuery object is actually just the init constructor "enhanced."
      return new aQuery.fn.init(selector, context);
   },

   // Save a reference to some core methods
   hasOwn = Object.prototype.hasOwnProperty,

   // [[Class]] -> type pairs
   class2type = {},

   // Used for trimming whitespace
   trimLeft = /^\s+/,
   trimRight = /\s+$/;

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

	 // Handle strings
	 if (typeof selector === "string") {

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
	       return aQuery.merge(this, selector);
	    }

	 }

	 if (selector.selector !== undefined) {
	    this.selector = selector.selector;
	    this.context = selector.context;
	 }

	 return aQuery.makeArray(selector, this);

      },

      remove : function() {
	 this.forEach(function(elem) {
			 var parent = elem.getParentNode();
			 parent.removeChild(elem);
		      });
      },

      attr : function(name, value) {
	 if (value == null) {
	    return new String(this[0].getAttribute(name));
	 }
	 else {
	    this.forEach(function(elem) { elem.setAttribute(name, value); });
	    return this;
	 }
      },

      // TODO: Right now, these only filter on name, instead of usual selectors
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
	    var parent = this[i].getParentNode();
	    if (parent) {
	       result.push(parent);
	    }
	 }

	 // TODO: Check to make sure this is right
	 result.context = this;
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

      get: function(num) {
	return num == null ?

	   // Return to a 'clean' array
	   this.toArray() :

	   // Return just the object
	   (num < 0 ? this.slice(num)[0] : this[num]);
      },

      toArray: function() {
	 return this.slice.call(this, 0);
      },

      bind: function(type, data, fn) {

	 if (aQuery.isFunction(data) || data === false) {
	    fn = data;
	    data = undefined;
	 }

	 for (var i = 0, l = this.length; i < l; i++) {
	    var item = this[i];
	    var o = { handleEvent: fn };
	    var listener = Packages.org.w3c.dom.events.EventListener(o);
	    item.addEventListener(type, listener, false);
	 }

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



   // args is for internal usage only
   aQuery.each = function( object, callback, args ) {
      var name, i = 0,
	 length = object.length,
	 isObj = length === undefined || aQuery.isFunction(object);

      if ( args ) {
	 if ( isObj ) {
	    for ( name in object ) {
	       if ( callback.apply( object[ name ], args ) === false ) {
		  break;
	       }
	    }
	 } else {
	    for ( ; i < length; ) {
	       if ( callback.apply( object[ i++ ], args ) === false ) {
		  break;
	       }
	    }
	 }

	 // A special, fast, case for the most common use of each
      } else {
	 if ( isObj ) {
	    for ( name in object ) {
	       if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
		  break;
	       }
	    }
	 } else {
	    for ( var value = object[0];
		  i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
	 }
      }

      return object;
   };

   // Results is for internal usage only
   // TODO: Stubbed out "type" (and other stuff), need to put back in
   aQuery.makeArray = function( array, results ) {
      var ret = results || [];

      if ( array != null ) {
	 // The window, strings (and functions) also have 'length'

	 var type = aQuery.type(array);

	 if ( array.length == null || type === "string" || type === "function" || type === "regexp" ) {
	    aQuery.fn.push.call( ret, array );
	 } else {
	    aQuery.merge( ret, array );
	 }
      }

      return ret;
   };


   aQuery.merge = function ( first, second ) {
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
   };


   aQuery.type = function( obj ) {
      return obj == null ?
	 String( obj ) :
	 class2type[ toString.call(obj) ] || "object";
   };


   aQuery.trim = function ( text ) {
      return text == null ?
 	 "" :
  	 text.toString().replace( trimLeft, "").replace( trimRight, "");
   };

   aQuery.isFunction = function( obj ) {
      // TODO: Set this up like jquery
      return aQuery.type(obj) === "function";
      //return toString.call(obj) === "[object Function]";
   };

   aQuery.isPlainObject = function( obj ) {
      // Must be an Object.
      // Because of IE, we also have to check the presence of the constructor property.
      // Make sure that DOM nodes and window objects don't pass through, as well
      // xxx Removed isWindow test.
      if ( !obj || aQuery.type(obj) !== "object" || obj.nodeType) {
	 return false;
      }

      // Not own constructor property must be Object
      if ( obj.constructor &&
	   !hasOwn.call(obj, "constructor") &&
	   !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
	 return false;
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.

      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
   };



   // Populate the class2type map
   aQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		  class2type[ "[object " + name + "]" ] = name.toLowerCase();
	       });


   return aQuery;
};





