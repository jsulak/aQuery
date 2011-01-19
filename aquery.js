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

   // If no document is passed in, then use the active document
   document = document || Application.activeDocument;

   var aQuery = function(selector, context) {
      // The aQuery object is actually just the init constructor "enhanced."
      return new aQuery.fn.init(selector, context);
   },

   // Save a reference to some core methods
   hasOwn = Object.prototype.hasOwnProperty,
   push = Array.prototype.push,
   slice = Array.prototype.slice,

   // [[Class]] -> type pairs
   class2type = {},

   // Check for non-word characters
   rnonword = /\W/,

   // Used for trimming whitespace
   trimLeft = /^\s+/,
   trimRight = /\s+$/,

   // Test for full XPath
   fullXPath = /^\//;

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

	    // Otherwise return all elements in document with the
	    // $("tagname")
	    else if ( !rnonword.test( selector ) ) {
	       this.selector = selector;
	       this.context = document;
	       selector = document.getElementsByTagName(selector);
	       return aQuery.merge(this, selector);
	    }


	    // If it is a valid xpath expression, then do that
	    else if (Acl.func("xpath_valid", selector)) {
	       // TODO: Allow this to work with a context
	       var oidNodesString = Acl.func("aquery_utils::get_doc_xpath_oids",
					     fullXPath.test ( selector ) ?
						selector :
						"//" + selector,
					     document.getAclId());
	       var oids = oidNodesString.split("-");

	       this.selector = selector;
	       this.context = document;

	       if (oids[0] == "" && oids.length == 1) {
		  return this;
	       }

	       var result = aQuery.map(oids, function(e) { return Acl.getDOMOID(e); } );

	       return aQuery.merge(this, result);
	    }


	 }

	 if (selector.selector !== undefined) {
	    this.selector = selector.selector;
	    this.context = selector.context;
	 }

	 return aQuery.makeArray(selector, this);

      },

      // Start with an empty selector
      selector: "",

      // Current version of aQuery being used
      aquery: "0.3",

      // The default length of an aQuery object is 0
      length: 0,

      // The number of elements contained in the matched element set
      size: function() {
	 return this.length;
      },

      toArray: function() {
	 return slice.call(this, 0);
      },

      // Get the Nth element in the matched element set OR
      // Get the whole matched element set as a clean array
      get: function(num) {
	return num == null ?

	   // Return to a 'clean' array
	   this.toArray() :

	   // Return just the object
	   (num < 0 ? this.slice(num)[0] : this[num]);
      },

      // Take an array of elements and push it onto the stack
      // (returning the new matched element set)
      pushStack: function( elems, name, selector ) {
	 // Build a new aQuery matched element set
	 var ret = aQuery();

	 if ( aQuery.isArray( elems ) ) {
	    push.apply( ret, elems );

	 } else {
	    aQuery.merge( ret, elems );
	 }

	 // Add the old object onto the stack (as a reference)
	 ret.prevObject = this;

	 ret.context = this.context;

	 if ( name === "find" ) {
	    ret.selector = this.selector + (this.selector ? " " : "") + selector;
	 } else if ( name ) {
	    ret.selector = this.selector + "." + name + "(" + selector + ")";
	 }

	 // Return the newly-formed element set
	 return ret;
      },

      // Execute a callback for every element in the matched set.
      // (You can seed the arguments with an array of args, but this is
      // only used internally.)
      each: function( callback, args ) {
	 return aQuery.each( this, callback, args );
      },

      eq: function( i ) {
	 return i === -1 ?
	    this.slice( i ) :
	    this.slice( i, +i + 1 );
      },

      first: function() {
	 return this.eq( 0 );
      },

      last: function() {
	 return this.eq( -1 );
      },

      slice: function() {
	 return this.pushStack(slice.apply(this, arguments),
			       "slice", slice.call(arguments).join("," ));
      },

      map: function( callback ) {
	 return this.pushStack( aQuery.map(this, function( elem, i ) {
					      return callback.call( elem, i, elem );
					   }));
      },

      end: function() {
	 return this.prevObject || aQuery(null);
      },

      push: push,
      sort: [].sort,
      splice: [].splice,

      remove: function() {
	    this.forEach(function(elem) {
			 var parent = elem.getParentNode();
			 parent.removeChild(elem);
		      });
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

      }
   };

   // Give the init function the aQuery prototype for later instantiation
   aQuery.fn.init.prototype = aQuery.fn;


   aQuery.extend = aQuery.fn.extend = function() {
      var options, name, src, copy, copyIsArray, clone,
          target = arguments[0] || {},
	  i = 1,
	  length = arguments.length,
	  deep = false;

      // Handle a deep copy situation
      if ( typeof target === "boolean" ) {
	 deep = target;
	 target = arguments[1] || {};
	 // skip the boolean and the target
	 i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if ( typeof target !== "object" && !aQuery.isFunction(target) ) {
	 target = {};
      }

      // extend aQuery itself if only one argument is passed
      if ( length === i ) {
	 target = this;
	 --i;
      }

      for ( ; i < length; i++ ) {
	 // Only deal with non-null/undefined values
	 if ( (options = arguments[ i ]) != null ) {
	    // Extend the base object
	    for ( name in options ) {
	       src = target[ name ];
	       copy = options[ name ];

	       // Prevent never-ending loop
	       if ( target === copy ) {
		  continue;
	       }

	       // Recurse if we're merging plain objects or arrays
	       if ( deep && copy && ( aQuery.isPlainObject(copy) || (copyIsArray = aQuery.isArray(copy)) ) ) {
		  if ( copyIsArray ) {
		     copyIsArray = false;
		     clone = src && aQuery.isArray(src) ? src : [];

		  } else {
		     clone = src && aQuery.isPlainObject(src) ? src : {};
		  }

		  // Never move original objects, clone them
		  target[ name ] = aQuery.extend( deep, clone, copy );

		  // Don't bring in undefined values
	       } else if ( copy !== undefined ) {
		  target[ name ] = copy;
	       }
	    }
	 }
      }

      // Return the modified object
      return target;
   };


   aQuery.extend({
      // MISSING: Does it make any sense to have noConflict, ready, bindReady?

      // TODO:  Add equals() method of some sort to handle issue with DOM node equality.

      isFunction: function( obj ) {
	 return aQuery.type(obj) === "function";
      },

      isArray:  function ( obj ) {
	 return aQuery.type(obj) === "array";
      },

      // MISSING: isNaN, isWindow (probably don't need)

      type: function( obj ) {
	 return obj == null ?
	    String( obj ) :
	    class2type[ toString.call(obj) ] || "object";
      },

      isPlainObject: function( obj ) {
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
      },

      isEmptyObject: function( obj ) {
	 for ( var name in obj ) {
	    return false;
	 }
	 return true;
      },

      error: function( msg ) {
	 throw msg;
      },

      // MISSING: parseJSON needed?

      noop: function() {},

      // MISSING: globalEval, nodeName

      // args is for internal usage only
      each: function( object, callback, args ) {
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
      },

      trim: function ( text ) {
	 return text == null ?
	    "" :
  	    text.toString().replace( trimLeft, "").replace( trimRight, "");
      },

      // Results is for internal usage only
      // TODO: Stubbed out "type" (and other stuff), need to put back in
      makeArray: function( array, results ) {
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
      },

      inArray: function( elem, array ) {
	 if ( !elem.nodeType && array.indexOf ) {
	    return array.indexOf( elem );
	 }

	 for ( var i = 0, length = array.length; i < length; i++ ) {
	    if ( ( array[ i ].nodeType && array[ i ].equals( elem ) ) || ( array[ i ] === elem ) ) {
	       return i;
	    }
	 }

	 return -1;
      },


      merge: function ( first, second ) {
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

      grep: function( elems, callback, inv ) {
	 var ret = [], retVal;
	 inv = !!inv;

	 // Go through the array, only saving the items
	 // that pass the validator function
	 for ( var i = 0, length = elems.length; i < length; i++ ) {
	    retVal = !!callback( elems[ i ], i );
	       if ( inv !== retVal ) {
		  ret.push( elems[ i ] );
	       }
	 }

	 return ret;
      },

      // arg is for internal usage only
      map: function( elems, callback, arg ) {
	 var ret = [], value;

	 // Go through the array, translating each of the items to their
	 // new value (or values).
	 for ( var i = 0, length = elems.length; i < length; i++ ) {
	    value = callback( elems[ i ], i, arg );

	    if ( value != null ) {
	       ret[ ret.length ] = value;
	    }
	 }

	 return ret.concat.apply( [], ret );
      },

      // A global GUID counter for objects
      guid: 1,

      proxy: function( fn, proxy, thisObject ) {
	 if ( arguments.length === 2 ) {
	    if ( typeof proxy === "string" ) {
	       thisObject = fn;
	       fn = thisObject[ proxy ];
	       proxy = undefined;

	    } else if ( proxy && !aQuery.isFunction( proxy ) ) {
	       thisObject = proxy;
	       proxy = undefined;
	    }
	 }

	 if ( !proxy && fn ) {
	    proxy = function() {
	       return fn.apply( thisObject || this, arguments );
	    };
	 }

	 // Set the guid of unique handler to the same of original handler, so it can be removed
	 if ( fn ) {
	    proxy.guid = fn.guid = fn.guid || proxy.guid || aQuery.guid++;
	 }

	 // So proxy can be declared as an argument
	 return proxy;
      },

      // Mutifunctional method to get and set values to a collection
      // The value/s can be optionally by executed if its a function
      access: function( elems, key, value, exec, fn, pass ) {
	 var length = elems.length;

	 // Setting many attributes
	 if ( typeof key === "object" ) {
	    for ( var k in key ) {
	       aQuery.access( elems, k, key[k], exec, fn, value );
	    }
	    return elems;
	 }

	 // Setting one attribute
	 if ( value !== undefined ) {
	    // Optionally, function values get executed if exec is true
	    exec = !pass && exec && aQuery.isFunction(value);

	    for ( var i = 0; i < length; i++ ) {
	       fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
	    }

	    return elems;
	 }

	 // Getting an attribute
	 return length ? fn( elems[0], key ) : undefined;
      },

      now: function() {
	 return (new Date()).getTime();
      },

      unique: function ( results ) {

	 results.sort(sortOrder);

	 // TODO: jquery has a way to avoid this loop if the sort function didn't find any duplicates.
	 for ( var i = 1; i < results.length; i++ ) {
	    if ( results[i].equals( results[i - 1] ) ) {
	       results.splice(i--, 1);
	    }
	 }

	 return results;
      }

   });


   // Populate the class2type map
   aQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		  class2type[ "[object " + name + "]" ] = name.toLowerCase();
	       });

   var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/;
	//POS = aQuery.expr.match.POS;

   var sortOrder = function( a, b ) {
      var al, bl,
      ap = [],
      bp = [],
      aup = a.parentNode,
      bup = b.parentNode,
      cur = aup;

      // The nodes are identical, we can exit early
      if ( a.equals(b) ) {
	 hasDuplicate = true;
	 return 0;

      // If the nodes are siblings (or identical) we can do a quick check
      } else if ( aup.equals(bup) ) {
	 return siblingCheck( a, b );

      // If no parents were found then the nodes are disconnected
      } else if ( !aup ) {
	 return -1;

      } else if ( !bup ) {
	 return 1;
      }

      // Otherwise they're somewhere else in the tree so we need
      // to build up a full list of the parentNodes for comparison
      while ( cur ) {
	 ap.unshift( cur );
	 cur = cur.parentNode;
      }

      cur = bup;

      while ( cur ) {
	 bp.unshift( cur );
	 cur = cur.parentNode;
      }

      al = ap.length;
      bl = bp.length;

      // Start walking down the tree looking for a discrepancy
      for ( var i = 0; i < al && i < bl; i++ ) {
	 if ( !(ap[i].equals(bp[i])) ) {
	    return siblingCheck( ap[i], bp[i] );
	 }
      }

      // We ended someplace up the tree so do a sibling check
      return i == al ?
	 siblingCheck( a, bp[i], -1 ) :
	 siblingCheck( ap[i], b, 1 );
   };

   var siblingCheck = function( a, b, ret ) {
      if ( a.equals(b) ) {
	 return ret;
      }

      var cur = a.nextSibling;

      while ( cur ) {
	 if ( cur.equals(b) ) {
	    return -1;
	 }

	 cur = cur.nextSibling;
      }

      return 1;
   };


   aQuery.fn.extend({

      find: function( selector ) {
	 var ret = this.pushStack( "", "find", selector ),
 	     length = 0;

	 for ( var i = 0, l = this.length; i < l; i++ ) {
	    length = ret.length;
	    aQuery.find( selector, this[i], ret );

	    if ( i > 0 ) {
	       // Make sure that the results are unique
	       for ( var n = length; n < ret.length; n++ ) {
		  for ( var r = 0; r < length; r++ ) {
		     if ( ret[r].equals(ret[n]) ) {
			ret.splice(n--, 1);
			break;
		     }
		  }
	       }
	    }
	 }

	 return ret;
      },

      has: function( target ) {
	 var targets = aQuery( target );
	 return this.filter(function() {
	    for ( var i = 0, l = targets.length; i < l; i++ ) {
	       if ( aQuery.contains( this, targets[i] ) ) {
		  return true;
	       }
	    }
	 });
      },

      not: function ( selector ) {
	 return this.pushStack( winnow(this, selector, false), "not", selector);
      },

      filter: function ( selector ) {
	 return this.pushStack( winnow(this, selector, true), "filter", selector);
      },

      is: function( selector ) {
	 return !!selector && aQuery.filter( selector, this ).length > 0;
      },

      closest: function( selectors, context ) {
	 var ret = [], i, l, cur = this[0];

	 if ( aQuery.isArray( selectors ) ) {
	    var match, selector,
	    matches = {},
	    level = 1;

	    if ( cur && selectors.length ) {
	       for ( i = 0, l = selectors.length; i < l; i++ ) {
		  selector = selectors[i];

		  if ( !matches[selector] ) {
		     matches[selector] = aQuery.expr.match.POS.test( selector ) ?
			aQuery( selector, context || this.context ) :
			selector;
		  }
	       }

	       while ( cur && cur.ownerDocument && cur !== context ) {
		  for ( selector in matches ) {
		     match = matches[selector];

		     if ( match.aquery ? match.index(cur) > -1 : aQuery(cur).is(match) ) {
			ret.push({ selector: selector, elem: cur, level: level });
		     }
		  }

		  cur = cur.parentNode;
		  level++;
	       }
	    }

	    return ret;
	 }

	 // TODO: I took out pos for now

	 for ( i = 0, l = this.length; i < l; i++ ) {
	    cur = this[i];

	    while ( cur ) {
	       // TODO:  I took out pos for now.
	       if ( aQuery.find.matchesSelector(cur, selectors) ) {
		  ret.push( cur );
		  break;
	       } else {
		  cur = cur.parentNode;
		  if ( !cur || !cur.ownerDocument || cur === context ) {
		     break;
		  }
	       }
	    }
	 }

	 ret = ret.length > 1 ? aQuery.unique(ret) : ret;

	 return this.pushStack( ret, "closest", selectors );
      },


      // Determine the position of an element within
      // the matched set of elements
      index: function( elem ) {
	 if ( !elem || typeof elem === "string" ) {
	    return aQuery.inArray( this[0],
	    // If it receives a string, the selector is used
            // If it receives nothing, the siblings are used
	    elem ? aQuery( elem ) : this.parent().children() );
	 }
	 // Locate the position of the desired element
	 return aQuery.inArray(
	    // If it receives a aQuery object, the first element is used
	    elem.aquery ? elem[0] : elem, this );
      },

      add: function( selector, context ) {
	 var set = typeof selector === "string" ?
		      aQuery( selector, context || this.context ) :
		      aQuery.makeArray( selector ),
	    all = aQuery.merge( this.get(), set );

	 return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
				all :
				aQuery.unique( all ) );
      },

      andSelf: function() {
	 return this.add( this.prevObject );
      }


   });

   // A painfully simple check to see if an element is disconnected
   // from a document (should be improved, where feasible).
   function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
   }


   aQuery.extend({
      // In jQuery, this is a Sizzle method that relies on the DOM
      // method .contains(), which doesn't exist in Arbortext.
      contains: function ( container, contained ) {
	 var parent = contained.parentNode;
	 while (parent) {
	    if (parent.equals(container)) {
	       return true;
	    }
	    parent = parent.parentNode;
	 }
	 return false;
      }
   });

   aQuery.each({
	parent: function( elem ) {
	   var parent = elem.parentNode;
	   return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
	   return aQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
	    return aQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
	   return aQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
	   return aQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
	   return aQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
	   return aQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
	    return aQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
	    return aQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
	   return aQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
	   return aQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
	   return aQuery.nodeName( elem, "iframe" ) ?
	      elem.contentDocument || elem.contentWindow.document :
	      aQuery.makeArray( elem.childNodes );
	}
   }, function( name, fn ) {
	aQuery.fn[ name ] = function( until, selector ) {
	   var ret = aQuery.map( this, fn, until );

	   if ( !runtil.test( name ) ) {
	      selector = until;
	   }

	   if ( selector && typeof selector === "string" ) {
	    	ret = aQuery.filter( selector, ret );
	   }

	   ret = this.length > 1 ? aQuery.unique( ret ) : ret;

	   if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
	      ret = ret.reverse();
	   }

	   return this.pushStack( ret, name, slice.call(arguments).join(",") );
	};
   });

   aQuery.extend({
	filter: function( expr, elems, not ) {
	   return elems.length === 1 ?
	      aQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
	      aQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
	   var matched = [],
	   cur = elem[ dir ];

	   while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !aQuery( cur ).is( until )) ) {
	      if ( cur.nodeType === 1 ) {
		 matched.push( cur );
	      }
	      cur = cur[dir];
	   }
	   return matched;
	},

	nth: function( cur, result, dir, elem ) {
	   // TODO: I'm not sure why the original form didn't work
	   if (result == null) {
	      result = 1;
	   }
	   var num = 0;

	   for ( ; cur; cur = cur[dir] ) {
	      if ( cur.nodeType == 1 && ++num === result ) {
		 break;
	      }
	   }

	   return cur;
	},

	sibling: function( n, elem ) {
	   var r = [];

	   for ( ; n; n = n.nextSibling ) {
	      if ( n.nodeType === 1 && n !== elem ) {
		 r.push( n );
	      }
	   }

	   return r;
	}
   });


   aQuery.fn.extend({
      attr: function ( name, value ) {
 	 return aQuery.access( this, name, value, true, aQuery.attr );
      },

      removeAttr: function( name, fn ) {
	 return this.each(function(){
	    aQuery.attr( this, name, "" );
	       if ( this.nodeType === 1 ) {
		  this.removeAttribute( name );
	       }
	    });
      }
   });

   aQuery.extend({
      attr: function( elem, name, value, pass ) {
	 // don't set attributes on text and comment nodes
	 if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
	    return undefined;
	 }

	 // Whether we are setting (or getting)
	 var set = value !== undefined;

	 if ( set ) {
	    elem.setAttribute( name, value );
	 }

	 // Since getAttribute of a missing attribute returns "", we need special logic
	 if ( !elem.attributes[ name ] && (elem.hasAttribute && !elem.hasAttribute( name )) ) {
	    return undefined;
	 }

	 var attr = new String(elem.getAttribute( name ));

	 // Non-existent attributes return null, we normalize to undefined
	 return attr === null ? undefined : attr;
      }
   });


   // Implement the identical functionality for filter and not
   function winnow( elements, qualifier, keep ) {
      if ( aQuery.isFunction( qualifier ) ) {
	 return aQuery.grep(elements, function( elem, i ) {
			       var retVal = !!qualifier.call( elem, i, elem );
			       return retVal === keep;
			    });

      } else if ( qualifier.nodeType ) {
	 return aQuery.grep(elements, function( elem, i ) {
			       return (qualifier.equals(elem)) === keep;
			    });

      } else if ( typeof qualifier === "string" ) {
	 var filtered = aQuery.grep(elements, function( elem ) {
				       return elem.nodeType === 1;
				    });

	// if ( isSimple.test( qualifier ) ) {
	//    return aQuery.filter(qualifier, filtered, !keep);
	// } else {
	 qualifier = aQuery.filter( qualifier, filtered );
	// }
      }

      return aQuery.grep(elements, function( elem, i ) {
			    return (aQuery.inArray( elem, qualifier ) >= 0) === keep;
			 });
   }

   // Simmer is an XPath version of the Sizzle selector engine.
   var Simmer = function( selector, context, results, seed ) {
      results = results || [];
      context = context || document;

      var origContext = context;

      if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
	 return results;
      }

      if ( !selector || typeof selector !== "string" ) {
	 return results;
      }

      // Handle ID matching: #ID
      if (selector.match(/^#/)) {
	 // TODO: If the context is an element, make sure that it is actually a descendant
	 var id = selector.substr(1);
	 results.push(document.getElementById(id));
      }

      else if ( !rnonword.test( selector ) ) {
	 results = aQuery.merge(results, context.getElementsByTagName(selector));
      }

      // If it is a valid xpath expression, then do that
      else if (Acl.func("xpath_valid", selector)) {
	 var oidNodesString;

	 // If we have a context element, then use it
	 if (context.nodeType === 1) {
	    oidNodesString = Acl.func("aquery_utils::get_xpath_oids",
				      context.getFirstOID(),
				      fullXPath.test(selector) ?
					 selector :
					 ".//" + selector);
	 } else {
	    oidNodesString = Acl.func("aquery_utils::get_doc_xpath_oids",
				      fullXPath.test(selector) ?
					 selector :
					 "//" + selector,
				      document.getAclId());
	 }

	 var oids = oidNodesString.split("-");
	 if (oids[0] == "" && oids.length == 1) {
	    return results;
	 }

	 results = aQuery.merge(results, aQuery.map(oids, function(e) { return Acl.getDOMOID(e); } ));
      }

      // If we've been passed a seed, then filter to only include items that are part of the original seed
      if (seed && results.length > 0) {
	 var filteredResults = [];
	 for (var i = 0; i < seed.length; i++) {
	    for (var j = 0; j < results.length; j++) {
	       if (seed[i].equals(results[j])) {
		  filteredResults.push(seed[i]);
		  break;
	       }
	    }
	 }
	 return filteredResults;
      }

      return results;
   };


   Simmer.matches = function( expr, set ) {
      return Simmer( expr, null, null, set );
   };

   Simmer.matchesSelector = function( node, expr ) {
      return Simmer( expr, null, null, [node] ).length > 0;
   };


   aQuery.find = Simmer;

   return aQuery;
};





