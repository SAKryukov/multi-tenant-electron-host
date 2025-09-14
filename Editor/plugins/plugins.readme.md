# Plugins

A plugin is a JavaScript file placed in this directory.

A valid plugin should call `pluginProcessor.registerPlugin`.
It should define `name` to be valid.
However, `description` is optional, and `handler` is optional.

For example,
~~~
pluginProcessor.registerPlugin({
    name: "Demo",
    description: "Demonstration of plugin operation",
    handler: api => {
	    api.editor.value = "Plugin operation";
        api.isModified = true;
    },
    isEnabled: api => api.selectionLength > 0,
    menuItemIndent: 3,
});
~~~

### Registration

Files are added to the system in lexicographic order. This way, the plugin execution order is determined by the names of their JavaScript files. Thus, later JavaScript files in the order depend on earlier ones. For example, an earlier file might contain APIs for later ones.

The registration method `pluginProcessor.registerPlugin` accepts one argument, the object with the following properties:

1. `name`: string that defines the title of a menu item, representing a plugin
1. `description`: ???
1. `handler` ???
1. `isEnabled`: a function
1. `menuItemIndent`: integer value determine the additional indent of the menu item represenging plugin; it can be used to structurize plugins in the menu.

### Editor API

The argument passed to `handler` and `isEnabled` (in the example above, `api`) has the following properties:

1. `editor`
1. `isMofified`
1. ???

### Known bugs

Do the round-trip starting with a word ***prepended by a blankspace***: Split -> Camel -> Split, The result is wrong.

The bug is in the split. To reproduce, start with

~~~
constCreateSearchDialog
~~~

If selected is `CreateSearchDialog`, the result is unexpected.