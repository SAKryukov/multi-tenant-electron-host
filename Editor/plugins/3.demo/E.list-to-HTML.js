"use strict";

({
    name: "List to HTML",
    description: "Convert selected lines to HTML list",
    handler: api => {
        api.pushSelection();
        const domain = api.currentLines;
        const lines = api.editor.value.slice(domain[0], domain[1]).split(api.newLine);
        const starts = [];
        let position = domain[0];
        for (const line of lines) {
            starts.push(position);
            position += line.length + 1;
        } //loop
        for (let index = starts.length - 1; index >= 0; --index) {
            if (lines[index].trim().length < 1) continue;
            const start = starts[index];
            const left = "<li>"; const right = "</li>";
            const rightPosition = start + lines[index].length;
            api.editor.setSelectionRange(rightPosition, rightPosition);
            api.editor.setRangeText(right);
            api.editor.setSelectionRange(start, start);
            api.editor.setRangeText(left);
        } //loop
        api.popSelection();
    },
    isEnabled: api => api.selectionLength > 0,
    menuItemIndent: demoGroupIndent,
});
