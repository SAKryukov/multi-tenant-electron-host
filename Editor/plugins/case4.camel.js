pluginProcessor.registerPlugin({
    name: "Camel",
    description: "Join words in selection with camel case",
    bufferHandler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd);
        let sequence = slice.split(api.blankSpace);
        const result = [];
        for (let index in sequence) {
            let word = sequence[index];
            if (word.length < 1) continue;
            if (index > 0)
                word = word[0].toUpperCase() + word.substring(1);
            result.push(word);
        } //loop
        api.editor.setRangeText(result.join(api.empty));
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    menuItemIndent: 3,
});
