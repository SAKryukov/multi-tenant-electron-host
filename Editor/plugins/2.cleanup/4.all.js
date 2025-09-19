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
            let copy = line.trimRight();
            const oldLength = copy.length;
            copy = copy.trimLeft();
            const shift = oldLength - copy.length;
            let right = copy.slice(shift);
            let previousLength = 0;
            while (true) {
                right = right.replaceAll(api.blankSpace + api.blankSpace, api.blankSpace);
                if (right.length == previousLength) break;
                previousLength = right.length;
            } //loop
            newLines.push(line.slice(0, shift) + right);
        } //loop
        let newValue = newLines.join(api.newLine);
        newValue = newValue.replace(/^\s+|\s+$/g, '') + api.newLine;
        api.editor.value = newValue;
        api.scrollTo(oldSelectionEnd, oldSelectionEnd); //SA???
        if (oldLength != api.editor.textLength)
            api.isModified = true;        
    },
    isEnabled: () => true,
    menuItemIndent: cleanupGroupIndent,
});
