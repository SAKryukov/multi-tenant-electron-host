"use strict";

({
    name: `Repeat Last Plugin (Meta+Alt+F5)`,
    description: "Repeat last plugin",
    handler: api => {
        const lastIndex = api.pluginAPI.lastPluginIndex;
        api.pluginAPI.executePlugin(lastIndex);
    },
    isEnabled: api => {
        const result = api.pluginAPI.isLastPluginEnabled;
        if (result) {
            let lastText = api.pluginAPI.getMenuItemText(api.pluginAPI.lastPluginIndex);
            const shortcutTextIndex = lastText.indexOf("(");
            if (shortcutTextIndex >= 0)
                lastText = lastText.substring(0, shortcutTextIndex);
            api.pluginAPI.setMenuItemText(
                api.pluginAPI.currentPluginIndex,
                `Repeat ${String.fromCharCode(0x201C)}${lastText}${String.fromCharCode(0x201D)} (Meta+Alt+F5)`);
        } //if
        return result; 
    }, //isEnabled
    shortcut: { key: "F5", prefix: ["metaKey", "altKey"]},
});
