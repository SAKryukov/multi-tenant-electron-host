/*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

window.addEventListener(extensibleDefinitionSet.events.DOMContentLoaded, () => { //SA???

    let metadata;
    if (window.bridgeMetadata)
        metadata = window.bridgeMetadata.pushedMetadata();
    else
        console.log("SA??? Prevent standalone here?");

    fixAccessKeyAttributes();

    const elements = getElements();

    const commandSet = createCommandSet(
        new Table(elements.main),
        new Summary(elements),
        elements.menuItems,
        metadata);
    const commandSetMap = commandSet.commandSetMap;

    commandSetMap.table.doubleClickHandler = commandSet.doubleClickHandler;
    const mainMenu = new menuGenerator(elements.mainMenu, commandSetMap.table);

    const contextMenu = new menuGenerator(elements.contextMenu, commandSetMap.table);
    (() => { //menu:
        mainMenu.options = { afterActionBehavior: { hide: true } };
        mainMenu.subscribe(commandSetMap);
        mainMenu.subscribe(commandSet.aboutCommandSet);
        contextMenu.subscribe(commandSetMap);
        (() => { //shortcuts
            const shortcuts = elements.getMenuShortcuts();
            for (const key in shortcuts) 
                mainMenu.get(key).subscribeToShortcut(shortcuts[key]);
        })(); //shortcuts
        const onMenuCancel = () => setTimeout(() => commandSetMap.table.focus());
        mainMenu.onCancel = onMenuCancel;
        contextMenu.onCancel = onMenuCancel;
    })(); //menu

    (() => { //context menu activation:
        let lastPointerX = 0;
        let lastPointerY = 0;
        window.onpointermove = event => {
            lastPointerX = event.clientX;
            lastPointerY = event.clientY;
        }; //window.onpointermove
        window.oncontextmenu = event => {
            const isPointer = event.button >= 0;
            if (isPointer)
                contextMenu.activate(event.clientX, event.clientY);
            else
                contextMenu.activate(lastPointerX, lastPointerY);
            event.preventDefault();
        }; //window.oncontextmenu    
    })(); //

    window.addEventListener(definitionSet.eventHandler.readOnlyEvent, () => {
        const value = commandSetMap.table.isReadOnly;
        elements.indicators.readOnly.textContent = definitionSet.eventHandler.readOnlyIndicator[value ? 1 : 0];
    });
    window.addEventListener(definitionSet.eventHandler.modifiedEvent, () => {
        elements.indicators.modified.textContent = definitionSet.eventHandler.modifiedIndicator;
    });
    window.addEventListener(definitionSet.eventHandler.storedEvent, () => {
        commandSetMap.table.isModified = false;
        elements.indicators.modified.textContent = null;
    });

    commandSetMap.table.isReadOnly = false;

    new Search(
        elements,
        (pattern, matchCase, wholeWord, isRegexp) => commandSetMap.table.find(pattern, matchCase, wholeWord, isRegexp),
        () => commandSetMap.table.hideFound(),
        () => commandSetMap.table.findNext()
    );

    replaceTitlesWithHints();

    window.onkeydown = event => {
        if (event.key == definitionSet.keyboard.findNext) {
            commandSetMap.table.findNext();
            event.preventDefault();
        } //if
    }; //window.onkeydown

}); //window.onload
