pluginProcessor.registerPlugin({
    name: "Change Case: Upper",
    description: "",
    bufferHandler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd).toUpperCase();
        api.editor.setRangeText(slice);
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
});
