"use strict";

const pluginProcessor = (() => {

    const isValidPredicate = predicate => {
        if (!predicate) return true;
        if (!(predicate instanceof Function)) return false;
        if (predicate.length > 1) return false;
        return true;
    }; //isValidPredicate

    const isValidIdString = value => {
        if (value == null) return true;
        if (value.constructor != String) return false;
        if (value.trim().length < 1) return false;
        return true;
    }; //isValidIdString

    const isValidIndent = value => {
        if (value == null) return true;
        if (value.constructor != Number) return false;
        if (value < 0) return false;
        return true;
    }; //isValidIndent

    const isValidShorcut = value => {
        if (value == null) return true;
        if (!value.key && !value.keys) return false;
        if (value.key && value.key.toString().trim().length < 1) return false;
        if (value.keys) {
            if (!(value.keys instanceof Array)) return false;
            for (const key of value.keys) {
                if (!key) return false;
                if (key.toString().trim().length < 1) return false;
            } //loop
        } //if
        if (!value.prefix) return false;
        if (!(value.prefix instanceof Array)) return false;
        for (const prefixKey of value.prefix) {
            if (!prefixKey) return false;
            if (prefixKey.toString().trim().length < 1) return false;
        } //loop
        return true;            
    }; //isValidShorcut
    
    const isValidPlugin = plugin => {
        if (!plugin.name) return false;
        if (!isValidIdString(plugin.name)) return false;
        if (!isValidIdString(plugin.description)) return false;
        if (plugin.handler && !(plugin.handler instanceof Function && plugin.handler.length == 1)) return false;
        if (!isValidPredicate(plugin.isEnabled)) return false;
        if (!isValidPredicate(plugin.stayOnMenu)) return false;
        if (!isValidIndent(plugin.menuItemIndent)) return false;
        if (!isValidShorcut(plugin.shortcut)) return false;
        return true;
    }; //isValidPlugin
    
    const processPlugins = (definitionSet, elementSet, menu, plugins) => {
        let lastError = null;
        window.onerror = (message, source, line, column, error) =>
            lastError = { message, source, line, column, error };
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
                    if (!(plugin?.result?.stayOnMenu && plugin.result.stayOnMenu(editorAPI)))
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
    }; //processPlugins

    return processPlugins;

})();
