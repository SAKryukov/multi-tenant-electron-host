# Plugins

A plugin is a JavaScript file placed in this directory.

Each plugin file is represented by a corresponging menu item in the `Plugins` menu.

A valid plugin should call `pluginProcessor.registerPlugin`.
It should define `name` to be valid. All other properties of the argument passed to `pluginProcessor.registerPlugin` are optional.

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

1. `name`: a string used to define the text of the menu item
1. `description`: a string used to define the title of the menu item; the title is shown by hovering over the menu item
1. `handler` a function accepting the editor API used to perform the job with the editor
1. `isEnabled`: a function accepting the editor API used to enable or disable the menu item, depending on the current condition of the editor
1. `menuItemIndent`: integer value determine the additional indent of the menu item represenging plugin; it can be used to structurize plugins in the menu.

A plugin can be registered if `handler` is `undefined` (or `null`). In this case, the menu item is always disabled, and the return of the function `isEnabled`, if any, is ignored. Such a plugin could be used as a group header for the plugins found lexicographically below it. In this case, it is shown in the menu in a special recognizeable style.

### Editor API

The argument passed to `handler` and `isEnabled` (in the example above, `api`) has the following properties:

1. `scrollTo(start, end, select)`
1. `scrollToSelection`
1. `editor` read-only
    `isModified`
1. `currentLines` read-only
1. `nextLine` read-only
1. `previousLine` read-only
1. `currentWord` read-only
1. `nextWord` read-only
1. `previousWord` read-only
1. `newLine` read-only
1. `empty` read-only
1. `blankSpace` read-only
1. `selectionLength` read-only
