pluginProcessor.registerPlugin({
    name: "Change Case: Split",
    description: "Split selection into words where the case is changed",
    bufferHandler: api => {
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd);
        let newSlice = [];
        let previousLow = null;
        for (const letter of slice) {
            const isLow = letter.toLowerCase() == letter;
            if (previousLow == null)
                previousLow = isLow;
            if (previousLow != isLow)
                newSlice.push(api.blankSpace);
            newSlice.push(letter);
        } //loop
        api.editor.setRangeText(newSlice.join(api.empty));
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
});
