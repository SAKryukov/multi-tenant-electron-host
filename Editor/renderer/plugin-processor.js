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
        const loadScript = plugin => {
            const scriptElement = document.createElement(definitionSet.elements.script);
            scriptElement.src = plugin;
            document.head.appendChild(scriptElement);
        }; //loadScript
        for (const plugin of plugins)
            loadScript(plugin);
        for (let index = 0; index < plugins.length; ++index) {
            const item = menu.subscribe(index.toString(), null);
            pluginMenuItemSet.set(index.toString(), { item: item, file: plugins[index] });
        } //item
    }; //processPlugins

    const normalizeInvalidPlugins = value => {
        const result = undefined ? true : value;
        if (pluginMenuItemSet.empty) return result;
        pluginMenuItemSet.forEach((element, index) => {
            console.log(element, index);
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
        return result;
    } //normalizeInvalidPlugins

    const registerPlugin = plugin => {
        const isValidPlugin = plugin && plugin.name;
        const index = currentPluginIndex;
        const item = menu.subscribe(index.toString(), actionRequested => {
            if (!actionRequested) return normalizeInvalidPlugins();
            if (isValidPlugin && plugin.bufferHandler) {
                const pluginReturn = plugin.bufferHandler(elementSet.editor);
                    if (pluginReturn != null)
                        modalDialog.show(definitionSet.plugin.returnResult(plugin.name, pluginReturn.toString()));
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
