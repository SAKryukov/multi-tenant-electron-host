"use strict";

const pluginProcessor = (() => {

    let lastError = null;
    window.onerror = (message, source, line, column, error) =>
        lastError = { message, source, line, column, error };

    const isValidPlugin = plugin => {
        if (!plugin.name) return false;
        if (plugin.handler && !(plugin.handler instanceof Function && plugin.handler.length <= 1)) return false;
        if (plugin.isEnabled && !(plugin.isEnabled instanceof Function && plugin.isEnabled.length <= 1)) return false;
        return true;
    }; //isValidPlugin
    
    const processPlugins = (definitionSet, elementSet, menu, plugins) => {
        let validPlugins = [];
        let invalidPlugins = [];
        let exceptionThrowingPlugins = [];
        const pluginRegistry = [];
        for (const plugin of plugins) {
            lastError = null;
            window.window.bridgePlugin.loadPlugin(plugin, (result, error) => {
                if (result) {
                    if (isValidPlugin(result))
                        validPlugins.push({ plugin, result });
                    else
                        invalidPlugins.push({ plugin, result, unregistered: true });
                } else if (error)
                    exceptionThrowingPlugins.push({ plugin, error: lastError });
                else
                    invalidPlugins.push({ plugin, result: true, unregistered: true });
            });
        } //loop
        for (const plugin of validPlugins)
            pluginRegistry.push(plugin);
        for (const plugin of invalidPlugins)
            pluginRegistry.push(plugin);
        for (const plugin of exceptionThrowingPlugins)
            pluginRegistry.push(plugin);
        validPlugins = null;
        invalidPlugins = null;
        exceptionThrowingPlugins = null;
        for (let index = 0; index < pluginRegistry.length; ++index) {
            const plugin = pluginRegistry[index];
            const item = menu.subscribe(
                index.toString(),
                (actionRequested, _itemAction, itemData) => {
                    if (!actionRequested) {
                        if (plugin.error) return true;
                        if (plugin.unregistered) return true;
                        if (plugin.result && !plugin.result.handler) return false;
                        if (plugin.result.isEnabled)
                            return plugin.result.isEnabled(elementSet.editorAPI);
                        return true;
                    } //if
                    if (plugin.unregistered)
                        showMessage(definitionSet.plugin.unregisteredExplanation(itemData.filename, itemData.error), elementSet.editor);
                    else if (plugin.result && plugin.result.handler) {
                        try {
                            elementSet.editorAPI.clearSelectionStack();
                            const pluginReturn = plugin.result.handler(elementSet.editorAPI);
                            if (pluginReturn != null)
                                showMessage(definitionSet.plugin.returnResult(plugin.name, pluginReturn.toString()), elementSet.editor);
                        } catch (e) {
                            showMessage(definitionSet.plugin.returnResult(plugin.name, e.toString(), true), elementSet.editor);
                        } //exception
                    } else if (plugin.error)
                        showMessage(definitionSet.plugin.exceptionExplanation(itemData.filename, itemData.error), elementSet.editor);
                    if (plugin.result && !plugin.result.stayOnMenu)
                        elementSet.editor.focus();
                    return true;
                }, //menu item handler
                { filename: plugin.plugin, error: plugin.error });
            if (plugin.result) {
                if (plugin.result.shortcut)
                    item.subscribeToShortcut(plugin.result.shortcut);
                if (plugin.result.name && !plugin.unregistered) {
                    item.changeText(plugin.result.name);
                    if (!plugin.result.handler)
                        definitionSet.plugin.styleMenuItem(item, true, false);
                } else {
                    item.changeText(definitionSet.plugin.invalid);
                    definitionSet.plugin.styleMenuItem(item, false, true);
                } //if
                if (plugin.result.menuItemIndent && !plugin.unregistered)
                    item.indent = plugin.result.menuItemIndent
            } else {
                item.changeText(definitionSet.plugin.exception);
                definitionSet.plugin.styleMenuItem(item, false, true);
            } //if
            const title = plugin?.result?.description;
            if (title)
                item.title = title;
        } //item
        window.onerror = null;
        replaceTitlesWithHints();
    }; //processPlugins

    return processPlugins;

})();
