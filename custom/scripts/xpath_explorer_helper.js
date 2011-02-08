var explorerHelper = function(document) {
   var $dialog = $$(document);

   // This method is called whenever "Find" is pressed.
   var go = function() {

      // get xpath expression
      var xpathexp = $dialog("#xpath").text();

      // Find nodes
      var results = $(xpathexp);

      // Update dialog
      $dialog("#nhits").attr("label", results.length + " matches found");
      var listbox = $dialog("listbox");
      listbox.empty();

      results.each(function(i) {
      		      var target = $(this);
      		      var text = target.text().substr(0, 50);
      		      text = text.replace(/\s+/g, ' ') + (text.length == 50 ? "..." : "");
      		      var label = (i + 1) + ". " + text;
      		      listbox.append("<listitem label='" + label + "' appdata='" + target.oid() + "' />");
      		   });
   };

   // Bind events to dialog
   $dialog("listbox").bind("DOMActivate", function(e) {
			     var target = e.target.getAttribute("value");

			     var oid = $dialog("listitem[@label = '" + target + "']").attr("appdata");
			     Acl.func("goto_oid", oid);
			     Acl.func("oid_select", oid, 1, 1, 1);
			  });

   $dialog("#gobutton").bind("DOMActivate", go);
};