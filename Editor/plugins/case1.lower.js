pluginProcessor.registerPlugin({
    name: "Lower",
    description: "Change selection case to lower",
    bufferHandler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd).toLowerCase();
        api.editor.setRangeText(slice);
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    menuItemIndent: 3,
});
