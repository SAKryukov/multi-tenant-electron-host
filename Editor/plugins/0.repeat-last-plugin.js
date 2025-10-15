"use strict";

({
    name: `Repeat Last Plugin (Meta+Alt+F5)`,
    description: "Repeat last plugin",
    handler: api => {
        const lastPlugin = api.pluginAPI.lastPluginIndex;
        api.pluginAPI.executePlugin(lastPlugin);
        return api.pluginAPI.noRepeat; // prevents this plugin from repeating itself
    },
    isEnabled: api => {
        const lastPlugin = api.pluginAPI.lastPluginIndex;
        const currentPlugin = api.pluginAPI.currentPluginIndex;
        const result = api.pluginAPI.isLastPluginEnabled;
        if (result) {
            let lastText = api.pluginAPI.getMenuItemText(lastPlugin);
            const shortcutTextIndex = lastText.indexOf("(");
            if (shortcutTextIndex >= 0)
                lastText = lastText.substring(0, shortcutTextIndex);
            api.pluginAPI.setMenuItemText(
                currentPlugin,
                `Repeat ${String.fromCharCode(0x201C)}${lastText}${String.fromCharCode(0x201D)} (Meta+Alt+F5)`);
        } //if
        return result; 
    }, //isEnabled
    shortcut: { key: "F5", prefix: []},
});
