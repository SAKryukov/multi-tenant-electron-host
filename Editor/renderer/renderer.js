"use strict";

const definitionSet = getDefinitionSet();
let elementSet = null;
if (window.bridgePlugin)
    window.bridgePlugin.subscribeToPlugin(async plugins => {        
        const metadata = await window.bridgeMetadata.metadata();
        for (let index = 0; index < plugins.length; ++index) {
            const option = document.createElement(definitionSet.elements.option);
            const name = index.toString();
            option.textContent = name;
            elementSet.menuItems.pluginParent.appendChild(option);
        } //loop
        if (plugins.length < 1)
            elementSet.menuItems.pluginParent.parentElement.remove();
        const menu = new menuGenerator(elementSet.menu);
        const searchDialog = createSearchDialog(definitionSet, elementSet);
        subscribe(elementSet, menu, searchDialog, metadata);
        pluginProcessor.processPlugins(definitionSet, elementSet, menu, plugins);
    });

window.addEventListener(definitionSet.events.DOMContentLoaded, async () => {
    elementSet = getElementSet(document);
    elementSet.editorAPI = (editor => {
            let isModifiedFlag = false;
            const modifiedEventName = definitionSet.events.editorTextModified;
            const modifiedEvent = new Event(modifiedEventName);
            const api = {
                subscribeToModified: handler => editor.addEventListener(modifiedEventName, handler),
            }; //api
            editor.addEventListener(definitionSet.events.input, () => api.isModified = true);
            Object.defineProperties(api, {
                isModified: {
                    get() { return isModifiedFlag; },
                    set(value) {
                        isModifiedFlag = value;
                        editor.dispatchEvent(modifiedEvent, isModifiedFlag);
                    },
                },
            });
            return api;
        })(elementSet.editor);
    Object.freeze(elementSet);
    if (!window.bridgePlugin)
        return definitionSet.standaloneExecutionProtection();
    elementSet.editor.addEventListener(definitionSet.events.selectionchange, event => {
        elementSet.statusBar.cursorPositionIndicator.innerHTML =
            definitionSet.status.cursorPosition(event.target.value, event.target.selectionStart);
    }); //editor.onselectionchange
    elementSet.editor.focus();
}); //DOMContentLoaded
