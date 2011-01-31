# aQuery #

_jQuery for the Arbortext Object Model (AOM)_

aQuery is the new, better way to manipulate XML in Arbortext Editor, and can be used both against documents and XUI dialogs.  It's a port of the popular [jQuery](http://www.jquery.com) Javascript library. 

The current version of aQuery is 0.9 alpha.  You can download it here.

The best source for documentation on how to use aQuery is the [jQuery documentation](http://docs.jquery.com/Main_Page) itself.  Most methods that make sense to use in an XML environment have been ported; a full list is below under API.

## How To Use ##

Add `aquery.js` and `aquery_utils.acl` to your `APTCUSTOM/scripts/` folder.  Source them both on Arbortext startup.  

To try it out, open a document and type the following on the javascript command line (to activate the Javascript command line, place your cursor in the command line and press F5):

    var $ = _$(Application.activeDocument);

This instantiates an aQuery object that you can use to query and manipulate the DOM of the active document.  A shortcut for this command is:

    var $ = _$();

## API ##

This is a summary of the jQuery API methods available in aQuery:

### Manipulation ###

* [.after()](http://api.jquery.com/after/)
* [.append()](http://api.jquery.com/append/)
* [.appendTo()](http://api.jquery.com/appendTo/)
* [.attr()](http://api.jquery.com/attr/)
* [.before()](http://api.jquery.com/before/)
* [.clone()](http://api.jquery.com/clone/)
* TODO: detach()
* [.empty()](http://api.jquery.com/empty/)
* [.xml() (.html() in jQuery)](http://api.jquery.com/html/)
* [.insertAfter()](http://api.jquery.com/insertAfter/)
* [.insertBefore()](http://api.jquery.com/insertBefore/)
* TODO: position()
* [.prepend()](http://api.jquery.com/prepend/)
* TODO: prependTo()
* [.remove()](http://api.jquery.com/remove/)
* [.removeAttr()](http://api.jquery.com/removeAttr/)
* [.replaceAll()](http://api.jquery.com/replaceAll/)
* [.text()](http://api.jquery.com/text/)
* [.unwrap()](http://api.jquery.com/unwrap/)
* TODO: val()
* [.wrap()](http://api.jquery.com/wrap/)
* [.wrapAll()](http://api.jquery.com/wrapAll/)
* [.wrapInner()](http://api.jquery.com/wrapInner/)


### Traversing ###

* [.add()](http://api.jquery.com/add)
* [.andSelf()](http://api.jquery.com/andSelf/)
* [.children()](http://api.jquery.com/children/)
* [.closest()](http://api.jquery.com/closest/)
* [.contents()](http://api.jquery.com/contents/)
* [.each()](http://api.jquery.com/each/)
* [.end()](http://api.jquery.com/end/)
* [.eq()](http://api.jquery.com/eq/)
* [.filter()](http://api.jquery.com/filter/)
* [.find()](http://api.jquery.com/find/)
* [.first()](http://api.jquery.com/first/)
* [.has()](http://api.jquery.com/has/)
* [.is()](http://api.jquery.com/is/)
* [.last()](http://api.jquery.com/last/)
* [.map()](http://api.jquery.com/map/)
* [.next()](http://api.jquery.com/next/)
* [.nextAll()](http://api.jquery.com/nextAll/)
* [.nextUntil()](http://api.jquery.com/nextUntil/)
* [.not()](http://api.jquery.com/not/)
* TODO: .offsetParent()
* [.parent()](http://api.jquery.com/parent/)
* [.parents()](http://api.jquery.com/parents/)
* [.parentsUntil()](http://api.jquery.com/parentsUntil/)
* [.prev()](http://api.jquery.com/prev/)
* [.prevAll()](http://api.jquery.com/prevAll/)
* [.prevUntil()](http://api.jquery.com/prevUntil/)
* [.siblings()](http://api.jquery.com/siblings/)
* [.slice()](http://api.jquery.com/slice/)


### Utilities ###

* [aQuery.contains()](http://api.jquery.com/jQuery.contains/)
* [aQuery.each()](http://api.jquery.com/jQuery.each/)
* [aQuery.extend()](http://api.jquery.com/jQuery.extend/)
* [aQuery.grep()](http://api.jquery.com/jQuery.grep/)
* [aQuery.inArray()](http://api.jquery.com/jQuery.inArray/)
* [aQuery.isArray()](http://api.jquery.com/jQuery.isArray/)
* [aQuery.isEmptyObject()](http://api.jquery.com/jQuery.isEmptyObject/)
* [aQuery.isFunction()](http://api.jquery.com/jQuery.isFunction/)
* [aQuery.isPlainObject()](http://api.jquery.com/jQuery.isPlainObject/)
* [aQuery.makeArray()](http://api.jquery.com/jQuery.makeArray/)
* [aQuery.map()](http://api.jquery.com/jQuery.map/)
* [aQuery.merge()](http://api.jquery.com/jQuery.merge/)
* [aQuery.noop()](http://api.jquery.com/jQuery.noop/)
* [aQuery.trim()](http://api.jquery.com/jQuery.trim/)
* [aQuery.type()](http://api.jquery.com/jQuery.type/)
* [aQuery.unique()](http://api.jquery.com/jQuery.unique/)


## License ##

aQuery (like jQuery, from which it is based) can be used either under the [http://www.opensource.org/licenses/mit-license.php](MIT) license or [http://www.opensource.org/licenses/gpl-2.0.php](GPL) license.  For most projects, the MIT license is best, since it places almost no restrictions on what you can do with the code.
