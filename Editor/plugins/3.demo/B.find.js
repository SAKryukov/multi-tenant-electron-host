"use strict";

pluginProcessor.registerPlugin({
    name: "Find Selected",
    description: "Find all occurrences of the selected pattern",
    handler: api => {
        const pattern = api.selectedText;
        api.editor.setSelectionRange(api.editor.selectionStart, api.editor.selectionStart);
        api.find(pattern);
        api.scrollTo(0, 0);
    },
    isEnabled: api =>  api.selectionLength > 0,
    menuItemIndent: demoGroupIndent,
});
