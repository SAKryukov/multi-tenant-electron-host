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
        return definitionSet.standaloneExecutionProtection.show();

    fixAccessKeyAttributes();

    const elements = getElements();

    const commandSet = createCommandSet(
        new Table(elements.main),
        new Summary(elements),
        elements.menuItems,
        metadata);
    const commonCommandSet = commandSet.commonCommandSet;

    commonCommandSet.table.doubleClickHandler = commandSet.doubleClickHandler;
    const mainMenu = new menuGenerator(elements.mainMenu, commonCommandSet.table);

    const contextMenu = new menuGenerator(elements.contextMenu, commonCommandSet.table);
    (() => { //menu:
        mainMenu.subscribe(commonCommandSet);
        mainMenu.subscribe(commandSet.aboutCommandSet);
        mainMenu.subscribe(commandSet.fileCommandSet);
        contextMenu.subscribe(commonCommandSet);
        (() => { //shortcuts
            const shortcuts = elements.getMenuShortcuts();
            for (const key in shortcuts) 
                mainMenu.get(key).subscribeToShortcut(shortcuts[key]);
        })(); //shortcuts
        const onMenuCancel = () => setTimeout(() => commonCommandSet.table.focus());
        mainMenu.onCancel = onMenuCancel;
        contextMenu.onCancel = onMenuCancel;
        viewMenuSubscription( // from shared
            mainMenu,
            elements.menuItems.viewStatusBar,
            elements.menuItems.viewFullScreen,
            elements.menuItems.zoomIn, elements.menuItems.zoomOut, elements.menuItems.zoomReset,
            elements.statusBar,
            definitionSet.CSS.view.statusBarStyle);
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
        const value = commonCommandSet.table.isReadOnly;
        elements.indicators.readOnly.textContent = definitionSet.eventHandler.readOnlyIndicator[value ? 1 : 0];
    });
    window.addEventListener(definitionSet.eventHandler.modifiedEvent, event =>
        elements.indicators.modified.textContent = event.detail.isModified
            ? definitionSet.eventHandler.modifiedIndicator
            : null);

    commonCommandSet.table.isReadOnly = false;

    new Search(
        elements,
        (pattern, matchCase, wholeWord, isRegexp) => commonCommandSet.table.find(pattern, matchCase, wholeWord, isRegexp),
        () => commonCommandSet.table.hideFound(),
        () => commonCommandSet.table.findNext()
    );

    replaceTitlesWithHints();

    window.onkeydown = event => {
        if (event.key == definitionSet.keyboard.findNext) {
            commonCommandSet.table.findNext();
            event.preventDefault();
        } //if
    }; //window.onkeydown

}); //window.onload
