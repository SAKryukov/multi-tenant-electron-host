/*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

const getElements = () => {
    
    const elementSet = {
        main: document.querySelector("main"),
        mainMenu: document.querySelector("header > menu"),
        contextMenu: document.querySelector("main select"),
        statusBar: document.querySelector("footer"),
        summary: {
            title: document.querySelector("#summary-title"),
            created: document.querySelector("#summary-created"),
            updated: document.querySelector("#summary-updated"),
            description: document.querySelector("#summary-description"),
        }, //summary
        indicators: {
            readOnly: document.querySelector("#read-only"),
            modified: document.querySelector("#modified"),
        }, //indicators
        search: {
            searchPattern: document.querySelector("#search"),
            options: {
                matchCase: document.querySelector("#search-match-case"),
                wholeWord: document.querySelector("#search-whole-word"),
                useRegexp: document.querySelector("#search-regexp"),
            },
            searchResults: document.querySelector("#search-results"),
            buttonNext: document.querySelector("#search-next"),
        }, //search
        menuItems: {
            new: 0,
            open: 0,
            save: 0,
            saveAs: 0,
            insertRow: 0,
            removeRow: 0,
            addProperty: 0,
            insertProperty: 0,
            removeProperty: 0,
            viewStatusBar: "Status Bar",
            viewFullScreen: "Full Screen",
            copy: 0,
            paste: 0,
            editSelectedCell: 0,
            editPropertyName: 0,
            load: 0,
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            about: 0,
            sourceCode: 0,
        }, //menuItems
        getMenuShortcuts: function () {
            const result = {};
            result[this.menuItems.new] = definitionSet.menuShortcuts.fileNew;
            result[this.menuItems.open] = definitionSet.menuShortcuts.fileOpen;
            result[this.menuItems.saveAs] = definitionSet.menuShortcuts.fileSaveAs;
            result[this.menuItems.save] = definitionSet.menuShortcuts.fileSaveExisting;
            result[this.menuItems.about] = definitionSet.menuShortcuts.helpAbout;
            return result;
        }, //menuShortcuts
    }; //elementSet

    namespaces.initializeNames([elementSet.menuItems]);
    Object.freeze(elementSet);

    return elementSet;

};

