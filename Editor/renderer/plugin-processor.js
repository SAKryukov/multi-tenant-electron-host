"use strict";

const pluginProcessor = (() => {

    let definitionSet = null;
    let elementSet = null;
    let menu = null;
    let currentPluginIndex = 0;
    const validPluginMenuItemSet = new Set();
    const pluginMenuItemSet = new Map();

    const processPlugins = (theDefinitionSet, theElementSet, theMenu, plugins) => {
        definitionSet = theDefinitionSet;
        elementSet = theElementSet;
        menu = theMenu;
        let index = 0;
        const loadScript = () => {
            const plugin = plugins[index++];
            if (index >= plugins.length) return;
            const scriptElement = document.createElement(definitionSet.elements.script);
            scriptElement.src = plugin;
            scriptElement.onload = () => loadScript(); // this way, the order is preserved as in plugins
            document.head.appendChild(scriptElement);
        }; //loadScript
        loadScript();
        for (let index = 0; index < plugins.length; ++index) {
            const item = menu.subscribe(index.toString(), null);
            pluginMenuItemSet.set(index.toString(), { item: item, file: plugins[index] });
        } //item
    }; //processPlugins

    const normalizeInvalidPlugins = () => {
        if (pluginMenuItemSet.empty) return;
        pluginMenuItemSet.forEach((element, index) => {
            if (!validPluginMenuItemSet.has(index)) {
                element.item.changeText(definitionSet.plugin.invalid);
                menu.subscribe(index, actionRequested => {
                    if (actionRequested)
                        modalDialog.show(definitionSet.plugin.invalidExplanation(element.file));        
                });
            } //if
        });
        pluginMenuItemSet.clear();
        validPluginMenuItemSet.clear();
    } //normalizeInvalidPlugins

    const registerPlugin = plugin => {
        const isValidPlugin = plugin && plugin.name;
        const index = currentPluginIndex;
        const item = menu.subscribe(index.toString(), actionRequested => {
            if (!actionRequested) {
                normalizeInvalidPlugins();
                if (!isValidPlugin) return true;
                if (plugin.isEnabled) return plugin.isEnabled(elementSet.editorAPI);
                return true;
            } //if
            if (isValidPlugin && plugin.bufferHandler) {
                try
                {
                const pluginReturn = plugin.bufferHandler(elementSet.editorAPI);
                    if (pluginReturn != null)
                        modalDialog.show(definitionSet.plugin.returnResult(plugin.name, pluginReturn.toString()));
                } catch(e) {
                    modalDialog.show(definitionSet.plugin.returnResult(plugin.name, e.toString(), true));
                } //exception
            } //if
            elementSet.editor.focus();
            return true;
        }); //item
        currentPluginIndex++;
        if (isValidPlugin)
            validPluginMenuItemSet.add(index.toString());
        const name = isValidPlugin
            ? definitionSet.plugin.nameInMenu(plugin.name)
            : definitionSet.plugin.invalid;
        item.changeText(name);
    }; //registerPlugin

    return { processPlugins, registerPlugin };

})();
