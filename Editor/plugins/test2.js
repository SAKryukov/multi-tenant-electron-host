pluginProcessor.registerPlugin({
    name: "Test 2",
    description: "Test 2",
    bufferHandler: api => {
	api.editor.value = "This is the second plugin operation";
        api.isModified = true;
    },
});