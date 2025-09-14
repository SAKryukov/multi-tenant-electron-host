pluginProcessor.registerPlugin({
    name: "Select current Line",
    description: "Select current Line",
    bufferHandler: api => {
        const point = api.currentLines;
        api.scrollTo(point[0], point[1], true);
    },
    isEnabled: api => api.editor.textLength > 0,
    menuItemIndent: 3,
});
