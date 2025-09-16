"use strict";

let elementSet;
const definitionSet = getDefinitionSet();
window.addEventListener(definitionSet.events.DOMContentLoaded, async () => {

    elementSet = getElementSet(document);

    if (window.bridgePlugin)
        window.bridgePlugin.subscribeToPlugin(async (plugins, pluginsKeyword) => {
            const metadata = window.bridgeMetadata.pushedMetadata();
            for (let index = 0; index < plugins.length; ++index) {
                const option = document.createElement(definitionSet.elements.option);
                const name = index.toString();
                option.textContent = name;
                elementSet.menuItems.pluginParent.appendChild(option);
            } //loop
            if (plugins.length < 1)
                elementSet.menuItems.pluginParent.parentElement.remove();
            const menu = new menuGenerator(elementSet.menu);
            const searchDialogObject = createSearchDialog(definitionSet, elementSet);
            createEditorAPI(elementSet, searchDialogObject.api);
            subscribe(elementSet, menu, searchDialogObject.searchDialog, metadata);
            pluginProcessor.processPlugins(definitionSet, elementSet, menu, plugins, pluginsKeyword);
        });

    if (!window.bridgePlugin)
        return definitionSet.standaloneExecutionProtection();
    elementSet.editor.addEventListener(definitionSet.events.selectionchange, event => {
        elementSet.statusBar.cursorPositionIndicator.innerHTML =
            definitionSet.status.cursorPosition(event.target.value, event.target.selectionStart);
    }); //editor.onselectionchange
    
    elementSet.editor.focus();

}); //DOMContentLoaded
