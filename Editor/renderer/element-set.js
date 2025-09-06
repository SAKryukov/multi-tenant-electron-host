"use strict";

const getElementSet = document => {
    return {
        editor: document.querySelector("textarea"),
        menu: document.querySelector("menu"),
        search: {
            dialog: document.querySelector("dialog#id-search-dialog"),
        }, //search
        statusBar: {
            all: document.querySelector("footer"),
            modifiedFlag: document.querySelector("span#id-modified-flag"),
            macroFlag: document.querySelector("span#id-macro-flag"),
            cursorPositionIndicator: document.querySelector("span#id-position-indicator"), // to implement
        },
        menuItems: {
            file: {
                newFile: document.querySelector("#menu-new"),
                open: document.querySelector("#menu-open"),
                saveAs: document.querySelector("#menu-save-as"),
                saveExisting: document.querySelector("#menu-save-existing"),
            },
            help: {
                about: document.querySelector("#menu-about"),
                sourceCode: document.querySelector("#menu-source-code"),
            },
            edit: {
                cut: document.querySelector("#menu-cut"),
                copy: document.querySelector("#menu-copy"),
                paste: document.querySelector("#menu-paste"),
                selectAll: document.querySelector("#menu-select-all"),
            },
            macro: {
                startRecording: document.querySelector("#menu-start-macro-recoding"),
                stopRecording: document.querySelector("#menu-stop-macro-recoding"),
                play: document.querySelector("#menu-play-macro"),
            },
            view: {
                statusBar: document.querySelector("#menu-status-bar"),
                fullscreen: document.querySelector("#menu-full-screen"),
                wordWrap: document.querySelector("#menu-word-wrap"),
            },
            pluginParent: document.querySelector("#menu-plugins"),
        },
    };
}; //elementSet


