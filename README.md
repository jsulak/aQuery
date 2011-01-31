# aQuery #

_jQuery for the Arbortext Object Model (AOM)_

aQuery is the new, better way to manipulate XML in Arbortext Editor, and can be used both against documents and XUI dialogs.  It's a port of the popular [http://www.jquery.com](jQuery) Javascript library. 

The current version of aQuery is 0.9 alpha.  You can download it here.

The best source for documentation on how to use aQuery is the [http://docs.jquery.com/Main_Page](jQuery documentation) itself.  Most methods that make sense to use in an XML environment have been ported; a full list is below under API.

## How To Use ##

Add `aquery.js` and `aquery_utils.acl` to your `APTCUSTOM/scripts/` folder.  Source them both on Arbortext startup.  

To try it out, open a document and type the following on the javascript command line (to activate the Javascript command line, place your cursor in the command line and press F5):

    var $ = _$(Application.activeDocument);

This instantiates an aQuery object that you can use to query and manipulate the DOM of the active document.  A shortcut for this command is:

    var $ = _$();

## API ##

This is a summary of the jQuery API methods available in aQuery:

### Manipulation ###

* [http://api.jquery.com/after/](.after())
* [http://api.jquery.com/append/](.append())
* [http://api.jquery.com/appendTo/](.appendTo())
* [http://api.jquery.com/attr/](.attr())
* [http://api.jquery.com/before/](.before())
* [http://api.jquery.com/clone/](.clone())
* TODO: detach()
* [http://api.jquery.com/empty/](.empty())
* [http://api.jquery.com/html/](.xml()) (.html() in jQuery)
* [http://api.jquery.com/insertAfter/](.insertAfter())
* [http://api.jquery.com/insertBefore/](.insertBefore())
* TODO: position()
* [http://api.jquery.com/prepend/](.prepend())
* TODO: prependTo()
* [http://api.jquery.com/remove/](.remove())
* [http://api.jquery.com/removeAttr/](.removeAttr())
* [http://api.jquery.com/replaceAll/](.replaceAll())
* [http://api.jquery.com/text/](.text())
* [http://api.jquery.com/unwrap/](.unwrap())
* TODO: val()
* [http://api.jquery.com/wrap/](.wrap())
* [http://api.jquery.com/wrapAll/](.wrapAll())
* [http://api.jquery.com/wrapInner/](.wrapInner())


### Traversing ###

* [http://api.jquery.com/add](.add())
* [http://api.jquery.com/andSelf/](.andSelf())
* [http://api.jquery.com/children/](.children())
* [http://api.jquery.com/closest/](.closest())
* [http://api.jquery.com/contents/](.contents())
* [http://api.jquery.com/each/](.each())
* [http://api.jquery.com/end/](.end())
* [http://api.jquery.com/eq/](.eq())
* [http://api.jquery.com/filter/](.filter())
* [http://api.jquery.com/find/](.find())
* [http://api.jquery.com/first/](.first())
* [http://api.jquery.com/has/](.has())
* [http://api.jquery.com/is/](.is())
* [http://api.jquery.com/last/](.last())
* [http://api.jquery.com/map/](.map())
* [http://api.jquery.com/next/](.next())
* [http://api.jquery.com/nextAll/](.nextAll())
* [http://api.jquery.com/nextUntil/](.nextUntil())
* [http://api.jquery.com/not/](.not())
* TODO: .offsetParent()
* [http://api.jquery.com/parent/](.parent())
* [http://api.jquery.com/parents/](.parents())
* [http://api.jquery.com/parentsUntil/](.parentsUntil())
* [http://api.jquery.com/prev/](.prev())
* [http://api.jquery.com/prevAll/](.prevAll())
* [http://api.jquery.com/prevUntil/](.prevUntil())
* [http://api.jquery.com/siblings/](.siblings())
* [http://api.jquery.com/slice/](.slice())


### Utilities ###

* [http://api.jquery.com/jQuery.contains/](aQuery.contains())
* [http://api.jquery.com/jQuery.each/](aQuery.each())
* [http://api.jquery.com/jQuery.extend/](aQuery.extend())
* [http://api.jquery.com/jQuery.grep/](aQuery.grep())
* [http://api.jquery.com/jQuery.inArray/](aQuery.inArray())
* [http://api.jquery.com/jQuery.isArray/](aQuery.isArray())
* [http://api.jquery.com/jQuery.isEmptyObject/](aQuery.isEmptyObject())
* [http://api.jquery.com/jQuery.isFunction/](aQuery.isFunction())
* [http://api.jquery.com/jQuery.isPlainObject/](aQuery.isPlainObject())
* [http://api.jquery.com/jQuery.makeArray/](aQuery.makeArray())
* [http://api.jquery.com/jQuery.map/](aQuery.map())
* [http://api.jquery.com/jQuery.merge/](aQuery.merge())
* [http://api.jquery.com/jQuery.noop/](aQuery.noop())
* [http://api.jquery.com/jQuery.trim/](aQuery.trim())
* [http://api.jquery.com/jQuery.type/](aQuery.type())
* [http://api.jquery.com/jQuery.unique/](aQuery.unique())


## License ##

aQuery (like jQuery, from which it is based) can be used either under the [http://www.opensource.org/licenses/mit-license.php](MIT) license or [http://www.opensource.org/licenses/gpl-2.0.php](GPL) license.  For most projects, the MIT license is best, since it places almost no restrictions on what you can do with the code.
