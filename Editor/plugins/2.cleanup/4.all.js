"use strict";

pluginProcessor.registerPlugin({
    name: "All",
    description: "Cleanup all of the above",
    handler: api => {
        const oldLength = api.editor.textLength;
        const oldSelectionEnd = api.editor.selectionEnd; //SA???
        const lines = api.editor.value.split(api.newLine);
        const newLines = [];
        for (const line of lines) {
            let copy = line;
            const oldLength = copy.length;
            copy = copy.trimLeft();
            const shift = oldLength - copy.length;
            const left = line.slice(0, shift);
            let right = line.slice(shift);
            let previousLength = 0;
            while (true) {
                right = right.replaceAll(api.blankSpace + api.blankSpace, api.blankSpace);
                if (right.length == previousLength) break;
                previousLength = right.length;
            } //loop
            newLines.push((left + right).trimEnd());
        } //loop
        api.editor.value = newLines.join(api.newLine).trimEnd() + api.newLine;
        api.scrollTo(oldSelectionEnd, oldSelectionEnd); //SA???
        if (oldLength != api.editor.textLength)
            api.isModified = true;
    },
    isEnabled: () => true,
    menuItemIndent: cleanupGroupIndent,
});
