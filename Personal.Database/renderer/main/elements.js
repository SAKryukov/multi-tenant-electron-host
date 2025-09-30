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
        product: document.querySelector("#product"),
        mainMenu: document.querySelector("header > menu"),
        contextMenu: document.querySelector("main select"),
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
        menuShortcuts: {
            fileNew: { key: "KeyN", prefix: ["ctrlKey"] },
            fileOpen: { key: "KeyO", prefix: ["ctrlKey"] },
            fileSaveAs: { key: "KeyS", prefix: ["ctrlKey", "shiftKey"] },
            fileSaveExisting: { key: "KeyS", prefix: ["ctrlKey"] },
            helpAbout: { key: "F1", prefix: [] },
        }, //menuShortcuts
    }; //elementSet

    namespaces.initializeNames([elementSet.menuItems]);
    Object.freeze(elementSet);

    return elementSet;

};

