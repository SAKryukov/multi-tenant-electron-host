"use strict";

pluginProcessor.registerPlugin({
    name: "Test 2",
    description: "Test 2",
    handler: api => {
	api.editor.value = "This is the second plugin operation";
        api.isModified = true;
    },
    menuItemIndent: 3,
});