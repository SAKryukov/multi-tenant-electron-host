pluginProcessor.registerPlugin({
    name: "Demo: to lower case, and add this name",
    description: "Test 1",
    bufferHandler: function(api) {
        if (!(api.editor.value && api.editor.value.trim().length > 0))
	    return "Nothing to edit.<br/>Add some text to the editor.";
	api.editor.value = `${api.editor.value.toLowerCase()}\n${this.name}`;
        api.isModified = true;
    },
    isEnabled: api => api.editor.textLength > 0,
});
