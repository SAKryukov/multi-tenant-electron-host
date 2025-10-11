"use strict";

({
    name: "Split (Ctrl+!)",
    description: "Split selection into words where the case is changed",
    handler: api => {
        const isLetter = sample => sample.toLowerCase() != sample.toUpperCase;
        const slice = api.editor.value.slice(api.editor.selectionStart, api.editor.selectionEnd);
        let newSlice = [];
        let previousLow = false;
        let isPreviousLetter = false;
        for (const letter of slice) {
            const isLow = letter.toLowerCase() == letter;
            if (isPreviousLetter && previousLow && !isLow)
                newSlice.push(api.blankSpace);
            previousLow = isLow;
            isPreviousLetter = isLetter(letter);
            newSlice.push(letter);
        } //loop
        api.editor.setRangeText(newSlice.join(api.empty));
        api.isModified = true;
        api.scrollToSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    shortcut: { key: "Digit1", prefix: ["ctrlKey"]},
    menuItemIndent: caseGroupIndent,
});
