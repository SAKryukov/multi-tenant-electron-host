"use strict";

const getElementSet = document => {

    const elementSet = {
        editor: document.querySelector("textarea"),
        menu: document.querySelector("menu"),
        copyright: document.querySelector("#id-copyright"),
        search: {
            measure: { // measures for scrollTo(elementSet.editor...)
                big: document.querySelector("#measure-big"), //must be <span>aa<br>b</span>
                small: document.querySelector("#measure-small"), //must be <span>a</span>
            }, //measure
            dialog: document.querySelector("dialog#id-search-dialog"),
            closeCross: document.querySelector("#id-search-dialog-close"),
            inputFind: document.querySelector("dialog#id-search-dialog p:first-of-type input"),
            inputReplace: document.querySelector("dialog#id-search-dialog p:nth-of-type(2) input"),
            findingsIndicator: document.querySelector("#id-findings-indicator"),
            options: {
                matchCase: document.querySelector("#id-search-match-case"),
                matchWholeWord: document.querySelector("#id-search-whole-word"),
                useRegularExpression: document.querySelector("#id-search-regexp"),
                useSpecialCharacters: document.querySelector("#id-search-special"),
                askConfirmation: document.querySelector("#id-search-confirmation"),
                specialCaseLegend: document.querySelector("#id-search-special-legend"),
                regularExpressionReplacementLegend: document.querySelector("#id-search-replacement-legend"),
            }, //options
        }, //search
        statusBar: {
            all: document.querySelector("footer"),
            modifiedFlag: document.querySelector("span#id-modified-flag"),
            macroFlag: document.querySelector("span#id-macro-flag"),
            tiltFlag: document.querySelector("span#id-tilt-flag"),
            cursorPositionIndicator: document.querySelector("span#id-position-indicator"),
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
                zoomIn: document.querySelector("#menu-zoom-in"),
                zoomOut: document.querySelector("#menu-zoom-out"),
                zoomReset: document.querySelector("#menu-zoom-reset"),
            },
            search: {
                find: document.querySelector("#menu-find"),
                replace: document.querySelector("#menu-replace"),
                findNext: document.querySelector("#menu-find-next"),
                findPrevious: document.querySelector("#menu-find-previous"),
                goto: document.querySelector("#menu-goto"),
            },
            pluginParent: document.querySelector("#menu-plugins"),
        },
    };

    replaceTitlesWithHints();
    
    return elementSet;

}; //elementSet
