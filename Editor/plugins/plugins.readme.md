# Plugins

A plugin is a JavaScript file placed in this directory.

Each plugin file is represented by a corresponding menu item in the `Plugins` menu.

A valid plugin should call `pluginProcessor.registerPlugin`.
It should define the property `name` to be valid. All other properties of the argument passed to `pluginProcessor.registerPlugin` are optional.

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

Files are added to the system in lexicographic order. This way, the plugin execution order is determined by the names of their JavaScript files. Thus, later JavaScript files in this order depend on earlier ones. For example, an earlier file might contain APIs that are used in later ones.

The registration method `pluginProcessor.registerPlugin` accepts one argument, the object with the following properties:

1. `name`: a string used to define the text of the menu item, mandatory
1. `description`: a string used to define the title of the menu item; the title is shown by hovering over the menu item
1. `handler`: a function accepting the editor API used to perform the job with the editor
1. `isEnabled`: a function accepting the editor API used to enable or disable the menu item, depending on the current condition of the editor
1. `menuItemIndent`: integer value determines the additional indent of the menu item; it can be used to structure plugins in the menu.

A plugin can be registered if `handler` is `undefined` (or `null`). In this case, the menu item is always disabled, and the return of the `isEnabled` function, if any, is ignored. Such a plugin could be used as a group header for the plugins found lexicographically below it. In this case, it is shown in the menu in a special, recognizable style.

### Editor API

The argument passed to `handler` and `isEnabled` (in the example above, `api`) has the following properties and methods:

Properties:

1. `editor`: read-only instance of `HTMLTextAreaElement`
1. `isModified`: read-write boolean property
1. `currentLines`: read-only array
1. `nextLine`: read-only array
1. `previousLine`: read-only array
1. `currentWord`: read-only array
1. `nextWord`: read-only array
1. `previousWord`: read-only array
1. `newLine`: the string constant
1. `empty`: the string constant
1. `blankSpace`: the string constant
1. `selectionLength`: read-only string value
1. `selectedText`: read-only integer value
1. `canFindNextPrevious`: boolean property

Methods:

1. `find(pattern)`
1. `findNext()`
1. `findPrevious()`
1. `scrollTo(start, end, select)`
1. `scrollToSelection()`
1. `subscribeToModified(handler)`, where the single parameter, the editor's *modified* state is passed to the `handler`; the `handler` is invoked every time `isModified` flag is changed to `true` or `false`.

The properties `currentLines`, `nextLine`, `previousLine`, `currentWord`, `nextWord`, and `previousWord` return the array of two integer elements: the start and the end of the editor position for the found word or line. These properties always return valid positions. If the requested word or line is not found, the current editor selection is returned.

The property `isModified` returns the current modified state of the editor. The plugins are supposed to determine if their operations modify the editor text and assign `true` to the property `isModified`. This is an extremely important point, because the modified state affects the operations where the editor text could be potentially lost, for example, opening a file, or the termination of the application.

The values returned by the property `canFindNextPrevious` depends on the state of the search system. It is updated by the call to the method `find`, depending on the number of occurences found, and when the editor text is modified. Normally, this property is used to disable or enable the menu item that invokes the `handler` where the methods `findNext` or `findPrevious` can be used.

The methods `find`, `findNext` and `findPrevious` reproduces the behavior of the Find dialog.
