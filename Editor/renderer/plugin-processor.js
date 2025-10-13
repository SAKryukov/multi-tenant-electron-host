"use strict";

const pluginProcessor = (() => {

    const pluginRegistry = [];
    const indexInRegistryProperty = Symbol();
    const menuItemProperty = Symbol();
    let lastPluginIndex = -1;
    let currentPluginIndex = -1;

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

    const executePlugin = pluginObject => {
        try {
            elementSet.editorAPI.clearSelectionStack();
            const pluginReturn = pluginObject.handler(elementSet.editorAPI);
            if (pluginReturn != null)
                showMessage(definitionSet.plugin.returnResult(pluginObject.name, pluginReturn.toString()), elementSet.editor);
            lastPluginIndex = pluginObject[indexInRegistryProperty];
            return true;
        } catch (e) {
            showMessage(definitionSet.plugin.returnResult(pluginObject.name, e.toString(), true), elementSet.editor);
        } //exception
        return false;
    }; //executePlugin
    
    const processPlugins = (definitionSet, elementSet, menu, plugins) => {
        let lastError = null;
        window.onerror = (message, source, line, column, error) =>
            lastError = { message, source, line, column, error };
        let validPlugins = [];
        let invalidPlugins = [];
        let exceptionThrowingPlugins = [];
        const allPlugins = [];
        for (const filename of plugins) {
            lastError = null;
            window.window.bridgePlugin.loadPlugin(filename, (result, error) => {
                if (result) {
                    if (isValidPlugin(result))
                        validPlugins.push({ filename, result });
                    else
                        invalidPlugins.push({ filename, result, unregistered: true });
                } else if (error)
                    exceptionThrowingPlugins.push({ filename, error: lastError });
                else
                    invalidPlugins.push({ filename, result: true, unregistered: true });
            });
        } //loop
        for (const plugin of validPlugins)
            allPlugins.push(plugin);
        for (const plugin of invalidPlugins)
            allPlugins.push(plugin);
        for (const plugin of exceptionThrowingPlugins)
            allPlugins.push(plugin);
        validPlugins = null;
        invalidPlugins = null;
        exceptionThrowingPlugins = null;
        for (let index = 0; index < allPlugins.length; ++index) {
            const plugin = allPlugins[index];
            if (plugin.result?.handler) {
                plugin.result[indexInRegistryProperty] = pluginRegistry.length;
                pluginRegistry.push(plugin.result);
            } //if
            const item = menu.subscribe(
                index.toString(),
                (actionRequested, _itemAction, itemData) => {
                    if (!actionRequested) {
                        if (itemData?.result)
                            currentPluginIndex = itemData.result[indexInRegistryProperty];
                        if (plugin.error) return true;
                        if (plugin.unregistered) return true;
                        if (plugin.result && !plugin.result.handler) return false;
                        if (plugin.result.isEnabled)
                            return plugin.result.isEnabled(elementSet.editorAPI);
                        return true;
                    } //if
                    if (plugin.unregistered)
                        showMessage(definitionSet.plugin.unregisteredExplanation(itemData.filename, itemData.error), elementSet.editor);
                    else if (plugin.result && plugin.result.handler)
                        executePlugin(plugin.result);
                    else if (plugin.error)
                        showMessage(definitionSet.plugin.exceptionExplanation(itemData.filename, itemData.error), elementSet.editor);
                    if (!(plugin?.result?.stayOnMenu && plugin.result.stayOnMenu(elementSet.    editorAPI)))
                        elementSet.editor.focus();
                    return true;
                }, //menu item handler
                { filename: plugin.filename, error: plugin.error, result: plugin.result });                
            if (plugin.result) {
                if (!plugin.unregistered)
                    plugin.result[menuItemProperty] = item;
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
            if (plugin.result)
                Object.seal(plugin.result);
        } //loop
        window.onerror = null;
    }; //processPlugins

    const pluginAPI = {
        executePlugin: index => {
            const plugin = pluginRegistry[index];
            if (!plugin) return false;
            if (plugin.isEnabled && !plugin.isEnabled(elementSet.editorAPI)) return false;
            return executePlugin(plugin);
        }, //executePlugin
        getMenuItemText: index => {
            const plugin = pluginRegistry[index];
            if (!plugin) return null;
            return plugin[menuItemProperty].text;
        }, //getMenuItemText
        setMenuItemText: (index, text) => {
            const plugin = pluginRegistry[index];
            if (!plugin) return;
            plugin[menuItemProperty].changeText(text);
        }, //getMenuItemText
    }; //pluginAPI
    Object.defineProperties(pluginAPI, {
        lastPluginIndex: {
            get() { return lastPluginIndex; },
            enumerable: true,
        },
        currentPluginIndex: {
            get() { return currentPluginIndex; },
            enumerable: true,
        },
        lastPluginName: {
            get() { return pluginRegistry[lastPluginIndex].name; },
            enumerable: true,
        },
        isLastPluginEnabled: {
            get() {
                if (lastPluginIndex < 0) return false;
                const plugin = pluginRegistry[lastPluginIndex];
                if (!plugin.isEnabled) return true;
                return plugin.isEnabled(elementSet.editorAPI);
            },
            enumerable: true,
        },
    }); //pluginAPI properties
    Object.freeze(pluginAPI);

    const result = { processPlugins, pluginAPI };
    Object.freeze(result);

    return result;

})();
