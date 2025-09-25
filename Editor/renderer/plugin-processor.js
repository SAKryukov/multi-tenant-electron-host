"use strict";

const pluginProcessor = (() => {

    let definitionSet = null;
    let elementSet = null;
    let menu = null;
    let currentPluginIndex = 0;
    const pluginMap = new Map();
    let pluginKeywordReference;

    const processPlugins = (theDefinitionSet, theElementSet, theMenu, plugins, pluginKeyword) => {
        pluginKeywordReference = pluginKeyword;
        definitionSet = theDefinitionSet;
        elementSet = theElementSet;
        menu = theMenu;
        let index = 0;
        const loadScript = () => {
            const plugin = plugins[index++];
            if (index > plugins.length) return;
            const scriptElement = document.createElement(definitionSet.elements.script);
            scriptElement.src = plugin;
            const previousPluginIndex = currentPluginIndex;
            scriptElement.onload = event => {
                if (previousPluginIndex == currentPluginIndex) {
                    const key = definitionSet.plugin.fileUriToKey(event.srcElement.src, pluginKeyword);
                    const mapItem = pluginMap.get(key);
                    if (mapItem)
                        mapItem.status.failedRegistration = true;
                }; //if
                loadScript();
            }; // this way, the order is preserved as in plugins
            document.head.appendChild(scriptElement);
        }; //loadScript
        loadScript();
        for (let index = 0; index < plugins.length; ++index) {
            const item = menu.subscribe(index.toString(), null);
            const key = definitionSet.plugin.fileUriToKey(plugins[index], pluginKeyword);
            pluginMap.set(key, { index, item, originalFilename: plugins[index], status: {} });
        } //item
    }; //processPlugins

    const showUnregisteredPlugins = () => {
        if (pluginMap.size < 1) return;
        for (let [key, value] of pluginMap) {
            if (value.status.error) { // priority over failedRegistration
                const errorMenuItem = menu.subscribe(currentPluginIndex.toString(), (actionRequested, _itemAction, itemData) => {
                    if (!actionRequested)
                        return true;
                    else
                        showMessage(definitionSet.plugin.exceptionExplanation(itemData.filename, itemData.error), elementSet.editor);
                }, { filename: value.originalFilename, error: value.status.error });
                errorMenuItem.changeText(definitionSet.plugin.excepton);
                definitionSet.plugin.styleMenuItem(errorMenuItem, false, true);
            } else if (value.status.failedRegistration) {
                const invalidMenuItem = menu.subscribe(currentPluginIndex.toString(), (actionRequested, _itemAction, itemData) => {
                    if (!actionRequested)
                        return true;
                    else
                        showMessage(definitionSet.plugin.unregisteredExplanation(itemData.filename, itemData.error), elementSet.editor);
                }, { filename: value.originalFilename });
                definitionSet.plugin.styleMenuItem(invalidMenuItem, false, true);
                invalidMenuItem.changeText(definitionSet.plugin.invalid);
                definitionSet.plugin.styleMenuItem(invalidMenuItem, false, true);
            } //if
            if (value.status.failedRegistration) ++currentPluginIndex;
        } //loop pluginMap
        pluginMap.clear();
    }; //showUnregisteredPlugins

    window.onerror = (message, source, line, column, error) => {
        const key = definitionSet.plugin.fileUriToKey(source, pluginKeywordReference);
        const mapItem = pluginMap.get(key);
        if (mapItem == null) return;
        mapItem.status.error = error;
        mapItem.status.errorMessage = message;
        mapItem.status.errorLine = line;
        mapItem.status.errorColumn = column;
    }; //window.onerror

    const registerPlugin = plugin => {
        const isValidPlugin = (plugin != null) && (plugin.name != null) && plugin.name.length > 0;
        const index = currentPluginIndex;
        if (!isValidPlugin) return;
        const menuItem = menu.subscribe(index.toString(), actionRequested => {
            if (!actionRequested) {
                showUnregisteredPlugins();
                if (!isValidPlugin) return true;
                if (!plugin.handler) return false; // sic! group label: no matter what plugin.isEnabled returns
                if (plugin.isEnabled) return plugin.isEnabled(elementSet.editorAPI);
                return true;
            } //if
            if (plugin.handler) {
                try {
                    elementSet.editorAPI.clearSelectionStack();
                    const pluginReturn = plugin.handler(elementSet.editorAPI);
                    if (pluginReturn != null)
                        showMessage(definitionSet.plugin.returnResult(plugin.name, pluginReturn.toString()), elementSet.editor);
                } catch (e) {
                    showMessage(definitionSet.plugin.returnResult(plugin.name, e.toString(), true), elementSet.editor);
                } //exception
            } //if
            elementSet.editor.focus();
            return true;
        }); //item
        currentPluginIndex++;
        menuItem.changeText(definitionSet.plugin.nameInMenu(plugin.name));
        menuItem.title = plugin.description;
        if (plugin.shortcut)
            menuItem.subscribeToShortcut(plugin.shortcut);
        if (!plugin.handler)
            definitionSet.plugin.styleMenuItem(menuItem, true, false);
        if (plugin.menuItemIndent != null)
            menuItem.indent = plugin.menuItemIndent;
    }; //registerPlugin

    return { processPlugins, registerPlugin };

})();
