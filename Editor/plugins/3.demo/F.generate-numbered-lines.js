"use strict";

({
    name: "Generate Numbered Lines",
    description: "Generate numbered lines for testing",
    handler: api => {
        const content = [];
        const max = 2 << 14;
        const pad = max.toString().length;
        for (let index = 1; index <= max; ++index)
            content.push(index.toString().padStart(pad, "0"));
        api.editor.value = content.join(api.newLine);
        api.isModified = true;
    },
    isEnabled: api => true,
    menuItemIndent: demoGroupIndent,
});
