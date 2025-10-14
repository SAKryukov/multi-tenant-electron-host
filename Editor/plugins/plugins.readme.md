# Plugins

A plugin is a JavaScript file placed in this directory.

When the application is packaged, the plugins are copied to the uncompressed directory “editor.plugins” where they are used by the editor instead of the original directory. The user can directly add or remove plugins, or modify existing ones.

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
    shortcut: { key: "Insert", prefix: ["metaKey", "altKey"]},
    stayOnMenu: api => true,
    menuItemIndent: 3,
});
~~~

### Registration

Files are added to the system in lexicographic order. This way, the plugin execution order is determined by the names of their JavaScript files. Thus, later JavaScript files in this order depend on earlier ones. For example, an earlier file might contain APIs that are used in later ones.

The registration method `pluginProcessor.registerPlugin` accepts one argument, the object with the following properties:

1. `name`: a string used to define the text of the menu item, mandatory
1. `description`: a string used to define the title of the menu item; the title is shown by hovering over the menu item. It's trimmed length should be more than zero.
1. `handler`: a function accepting the editor API used to perform the job with the editor.
1. `isEnabled`: a function accepting the editor API used to enable or disable the menu item, depending on the current condition of the editor. By default, if this function is not defined, the plugin is considered permanently enabled.
1. `shortcut`: a structure used to define the shortcut for calling `isEnabled` and then `handler`.
1. `stayOnMenu`: a function accepting the editor API used to prevent focusing on the editor after execution of the `handler`.
1. `menuItemIndent`: an integer value determines the additional indent of the menu item, allowing for structured placement of plugins in the menu.

A plugin can be registered if `handler` is `undefined` (or `null`). In this case, the menu item is always disabled, and the return of the `isEnabled` function, if any, is ignored. Such a plugin could be used as a group header for the plugins found lexicographically below it. In this case, it is shown in the menu in a special, recognizable style.

The property `handler` is a function accepting exactly one argument, the editor API. This function can return a string. If a non-empty string is returned, it is shown in a modal dialog after the execution of the `handler`.

The properties `isEnabled` and `stayOnMenu` are predicate functions; they can accept either no arguments or one argument, the editor API.

The structure `shortcut` can have two or three properties: string `key`, an array of strings `keys`, and an array `prefix` with four valid items values: `metaKey`, `altKey`, `ctrlKey`, and `shiftKey`. The properties `key` and `keys` can be specified alternatively; `key` defines only one key, but `keys` define an array of alternative keys. If `key` and `keys` are both used, their key values are combined. The key values correspond to the string values of `KeyboardEvent.code`; they represent *physical* keys on the keyboard; this way, the shortcuts don't depend on culture-dependent keyboard layouts.

### Editor API

The argument passed to `handler` and `isEnabled` (in the example above, `api`) has the following properties and methods:

Properties:

1. `editor`: read-only instance of `HTMLTextAreaElement`
1. `isModified`: read-write `Boolean` property
1. `currentLines`: read-only array
1. `nextLine`: read-only array
1. `previousLine`: read-only array
1. `currentWord`: read-only array
1. `nextWord`: read-only array
1. `previousWord`: read-only array
1. `newLine`: the `String` constant
1. `empty`: the `String` constant
1. `blankSpace`: the `String` constant
1. `selectionLength`: read-only integer property
1. `selectedText`: read-only `String` property
1. `canFindNextPrevious`: read-only `Boolean` property
1. `pluginAPI`: read-only `Object` property

Methods:

1. `cursorToPosition(line, column)` calculates the position in the file based on the cursor position; if `line` or `column` values are incorrect, the closest position is returned
1. `positionToCursor(position)` calculates the cursor position as an array `[line, column]` based on the position in the file
1. `find(pattern)`
1. `findNext()`
1. `findPrevious()`
1. `scrollTo(start, end, select)`
1. `scrollToSelection()`
1. `pushSelection()` pushes the current selection onto the selection stack
1. `popSelection(toMove)` pops the current selection out of the selection stack and returns it as an array `[selectionStart, selectionEnd]`; if `toMove` is specified, the returned array is used to set the editor selection and scroll it to the selection
1. `clearSelectionStack()` removes all data from the selection stack; this is done before the `handler` call
1. `subscribeToModified(handler)`, where the single parameter, the editor's *modified* state, is passed to the `handler`; the `handler` is invoked every time `isModified` flag is changed to `true` or `false`.

The properties `currentLines`, `nextLine`, `previousLine`, `currentWord`, `nextWord`, and `previousWord` return the array of two integer elements: the start and the end of the editor position for the found word or line. These properties always return valid positions. If the requested word or line is not found, the current editor selection is returned.

The property `isModified` returns the current modified state of the editor. The plugins are supposed to determine if their operations modify the editor text and assign `true` to the property `isModified`. This is an extremely important point, because the modified state can affect the operations where the editor text could be potentially lost, for example, opening a file, or the termination of the application.

The value returned by the property `canFindNextPrevious` depends on the state of the search system. It is updated by the call to the method `find`, depending on the number of occurrences found, and when the editor text is modified. Normally, this property is used to disable or enable the menu item that invokes the `handler` that can potentially use the methods `findNext` or `findPrevious`.

The methods `find`, `findNext`, and `findPrevious` reproduce the behavior of the Find dialog.

### Plugin API

Plugin API is exposed through the Editor API to provide access to registered plugins and corresponding menu items.

Properties:

1. `lastPluginIndex`: read-only index property, returns the index of the last previously executed plugin.
1. `currentPluginIndex`: read-only index property, returns the index of the currently running plugin.
Normally, it should be called from `isEnabled`.
1. `lastPluginName`: read-only `String` property, the name of the last previously executed plugin.
1. `isLastPluginEnabled`: read-only `Boolean` property used to check if the last previously executed plugin is enabled.
1. `noRepeat`: read-only constant property with the unique `Symbol` value. It has to be used as a return value to prevent a plugin from being registered as the last previously executed plugin. It is important to prevent infinite recursion caused by the plugin used to repeat the execution of another plugin.

Methods:

1. `executePlugin(index)` executes a registered plugin by its index.
1. `getMenuItemText(index)` returns the text of the menu item corresponding to a registered plugin found by its index.
1. `setMenuItemText(index, text)` modifies the text of the menu item corresponding to a registered plugin found by its index.
