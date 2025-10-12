"use strict";

let elementSet;
window.addEventListener(definitionSet.events.DOMContentLoaded, async () => {

    elementSet = getElementSet(document);
    elementSet.statusBar.cursorPositionIndicator.innerHTML =
        definitionSet.status.cursorPosition(); // initial default, to reduce flicker

    if (window.bridgePlugin)
        window.bridgePlugin.subscribeToPlugin(async plugins => {
            elementSet.editor.addEventListener(definitionSet.events.selectionchange, event => {
                const start = elementSet.editorAPI.positionToCursor(event.target.selectionStart);
                const end = elementSet.editorAPI.positionToCursor(event.target.selectionEnd);
                elementSet.statusBar.cursorPositionIndicator.innerHTML =
                    definitionSet.status.cursorPosition(start, end);
            }); //editor.onselectionchange
            const metadata = window.bridgeMetadata.pushedMetadata();
            for (let index = 0; index < plugins.length; ++index) {
                const option = document.createElement(definitionSet.elements.option);
                const name = index.toString();
                option.textContent = name;
                elementSet.menuItems.pluginParent.appendChild(option);
            } //loop
            if (plugins.length < 1)
                elementSet.menuItems.pluginParent.parentElement.remove();
            const menu = new menuGenerator(elementSet.menu, elementSet.editor);
            const searchDialogObject = createSearchDialog(definitionSet, elementSet);
            createEditorAPI(elementSet, searchDialogObject.api);
            subscribe(elementSet, menu, searchDialogObject.searchDialog, metadata);
            pluginProcessor(definitionSet, elementSet, menu, plugins);
            replaceTitlesWithHints();
        });
    else 
        return definitionSet.standaloneExecutionProtection.show();

    elementSet.editor.focus();

}); //DOMContentLoaded
