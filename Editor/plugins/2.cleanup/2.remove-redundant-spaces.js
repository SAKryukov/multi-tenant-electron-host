"use strict";

pluginProcessor.registerPlugin({
    name: "Remove Repeated Blankspaces",
    description: "Remove repeated blankspaces but preserve line indentation",
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
            let right = copy.slice(shift);
            let previousLength = 0;
            while (true) {
                right = right.replaceAll(api.blankSpace + api.blankSpace, api.blankSpace);
                if (right.length == previousLength) break;
                previousLength = right.length;
            } //loop
            newLines.push(line.slice(0, shift) + right);
        } //loop
        api.editor.value = newLines.join(api.newLine);
        api.scrollTo(oldSelectionEnd, oldSelectionEnd, true); //SA???
        if (oldLength != api.editor.textLength)
            api.isModified = true;        
    },
    isEnabled: api => true,
    menuItemIndent: cleanupGroupIndent,
});
