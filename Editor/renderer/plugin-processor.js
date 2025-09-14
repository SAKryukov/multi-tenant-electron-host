"use strict";

const pluginProcessor = (() => {

    let definitionSet = null;
    let elementSet = null;
    let menu = null;
    let currentPluginIndex = 0;
    const pluginMap = new Map();
    const pluginFileNamesWithError = [];

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
            const fixedName = definitionSet.plugin.filenameToURL(plugins[index]);
            pluginMap.set(fixedName, { index, item, status: {} });
        } //item
    }; //processPlugins

    const normalizeInvalidPlugins = () => {
        if (pluginMap.size < 1) return;
        for (let index = 0; index < pluginFileNamesWithError.length; ++index) {
            const name = pluginFileNamesWithError[index]
            const mapItem = pluginMap.get(name);
            let error;
            if (mapItem) {
                error = mapItem.status.error;
            } //if
            const menuItem = menu.subscribe(currentPluginIndex.toString(), actionRequested => {
                if (actionRequested)
                    modalDialog.show(definitionSet.plugin.invalidExplanation(name, error));
            });
            currentPluginIndex++;
            menuItem.changeText(definitionSet.plugin.excepton);
        } //loop
        for (let index = currentPluginIndex; index < pluginMap.size; ++index) {
            console.log(index);
            const menuItem = menu.subscribe(index.toString(), actionRequested => {
                if (actionRequested)
                    modalDialog.show(definitionSet.plugin.invalidExplanation());
            });
            menuItem.changeText(definitionSet.plugin.invalid);
        } //loop
        pluginMap.clear();
    }; //normalizeInvalidPlugins

    window.onerror = (message, source, line, column, error) => {
        pluginFileNamesWithError.push(source);
        const mapItem = pluginMap.get(source);
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
        const item = menu.subscribe(index.toString(), actionRequested => {
            if (!actionRequested) {
                normalizeInvalidPlugins();
                if (!isValidPlugin) return true;
                if (plugin.isEnabled) return plugin.isEnabled(elementSet.editorAPI);
                return true;
            } //if
            if (plugin.bufferHandler) {
                try
                {
                const pluginReturn = plugin.bufferHandler(elementSet.editorAPI);
                    if (pluginReturn != null)
                        modalDialog.show(definitionSet.plugin.returnResult(plugin.name, pluginReturn.toString()));
                } catch(e) {
                    modalDialog.show(definitionSet.plugin.returnResult(plugin.name, e.toString(), true));
                } //exception
            } else //SA???
                modalDialog.show(definitionSet.plugin.invalidExplanation(""));
            elementSet.editor.focus();
            return true;
        }); //item
        currentPluginIndex++;
        item.changeText(definitionSet.plugin.nameInMenu(plugin.name));
        item.title = plugin.description;
        if (plugin.menuItemIndent != null)
            item.indent = plugin.menuItemIndent;
    }; //registerPlugin

    return { processPlugins, registerPlugin };

})();
