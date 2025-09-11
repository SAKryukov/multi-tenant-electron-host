"use strict";

const subscribe = (elementSet, menu, searchDialog, metadata) => {

    let currentFilename = null;

    const fileSystemStatus = (() => {
        elementSet.statusBar.modifiedFlag.innerHTML = definitionSet.status.modified;
        let isModified = false;
        const handler = {};
        Object.defineProperties(handler, {
            isModified: {
                get() { return isModified; },
                set(value) {
                    isModified = value;
                    definitionSet.ui.showInline(elementSet.statusBar.modifiedFlag, isModified);
                },
            },
        });
        return handler;
    })(); //fileSystemStatus

    // File I/O:

    elementSet.editor.addEventListener(definitionSet.events.input, () => fileSystemStatus.isModified = true);
    const reportError = (error, errorKind) =>
        modalDialog.show(definitionSet.errorHandling.format(errorKind, error.message));

    const handleFileOperationResult = (filename, text, error, isSave) => {
        if (!error) {
            currentFilename = filename;
            if (text) elementSet.editor.value = text;
            elementSet.editor.setSelectionRange(0, 0);
            fileSystemStatus.isModified = false;
            elementSet.editor.focus();
        } else
            reportError(error, isSave ? definitionSet.errorHandling.save : definitionSet.errorHandling.open);
    }; //handleFileOperationResult

    window.bridgeFileIO.subscribeToCommandLine((filename, text, error) =>
        handleFileOperationResult(filename, text, error));

    const actionOnConfirmation = (action, closingApplication) => {
        const saveBeforeAction = () => {
            if (closingApplication) {
                if (currentFilename == null)
                    saveAsAndCloseApplication();
                else
                    saveExistingFileAndCloseApplication();
            } else {
                if (currentFilename == null)
                    saveAsAndContinue(action);
                else
                    saveExistingFileAndContinue(action);
            } //if
        }; //saveBeforeAction
        const noSaveAction = () => {
            if (closingApplication)
                window.bridgeFileIO.closeApplication();
            else
                action();
        } //noSaveAction
        if (fileSystemStatus.isModified) {
            const message = closingApplication
                ? definitionSet.modifiedTextOperationConfirmation.messageClosingApplication
                : definitionSet.modifiedTextOperationConfirmation.message;
            modalDialog.show(
                message, {
                    buttons: definitionSet.modifiedTextOperationConfirmation.buttons(
                        saveBeforeAction, noSaveAction),
                });
        } else
            action();
    }; //actionOnConfirmation

    window.bridgeUI.subscribeToApplicationClose(() => {
        if (!fileSystemStatus.isModified) return true;
        actionOnConfirmation(() => { permitted = true; }, true);
        return !fileSystemStatus.isModified;
    }); //subscribeToApplicationClose

    menu.subscribe(elementSet.menuItems.file.newFile.textContent, actionRequest => {
        if (!actionRequest) return fileSystemStatus.isModified || currentFilename != null;
        actionOnConfirmation(() => {
            currentFilename = null;
            elementSet.editor.value = null;
            elementSet.editor.focus();
            fileSystemStatus.isModified = false;
            window.bridgeFileIO.resetApplicationTitle();
        }); //actionOnConfirmation
        return true;
    }); //file.newFile

    menu.subscribe(elementSet.menuItems.file.open.textContent, actionRequest => {
        if (!actionRequest) return true;
        actionOnConfirmation(() => {
            window.bridgeFileIO.openFile((filename, text, error) =>
            handleFileOperationResult(filename, text, error));
        });
        return true;
    }); //file.open

    const saveAs = () =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            false);
    const saveAsAndContinue = action =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) => {
                action();
                handleFileOperationResult(filename, null, error, true);
            },
            false);
    const saveAsAndCloseApplication = () =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            true);
    const saveExistingFile = () =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            false);
    const saveExistingFileAndContinue = action =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            elementSet.editor.value,
            (filename, error) => {
                action();
                handleFileOperationResult(filename, null, error, true);
            },
            false);    
    const saveExistingFileAndCloseApplication  = () =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            true);

    menu.subscribe(elementSet.menuItems.file.saveAs.textContent, actionRequest => {
        if (!actionRequest) return true;
        saveAs();
        return true;
    }); //file.saveAs

    menu.subscribe(elementSet.menuItems.file.saveExisting.textContent, actionRequest => {
        if (!actionRequest) return fileSystemStatus.isModified;
        if (currentFilename)
            saveExistingFile();
        else
            saveAs();
        return true;
    }); //file.saveExisting

    // Help:

    menu.subscribe(elementSet.menuItems.help.about.textContent, actionRequest => {
        if (!actionRequest) return true;
        modalDialog.show(definitionSet.aboutDialog(metadata));
        return true;
    }); //help.about

    menu.subscribe(elementSet.menuItems.help.sourceCode.textContent, actionRequest => {
        if (!actionRequest) return true;
        window.bridgeMetadata.showSource();
        return true;
    }); //help.sourceCode

    // Macro:

    const macroProcessor = createMacroProcessor(elementSet.editor, elementSet.statusBar.macroFlag);
    menu.subscribe(elementSet.menuItems.macro.startRecording.textContent, actionRequest => {
        if (!actionRequest) return macroProcessor.canRecord();
        elementSet.editor.focus();
        macroProcessor.setRecordingState(true);
        return true;
    }); //file.newFile

    menu.subscribe(elementSet.menuItems.macro.stopRecording.textContent, actionRequest => {
        if (!actionRequest) return macroProcessor.canStopRecording();
        macroProcessor.setRecordingState(false);
        elementSet.editor.focus();
        return true;
    }); //file.newFile

    menu.subscribe(elementSet.menuItems.macro.play.textContent, actionRequest => {
        if (!actionRequest) return macroProcessor.canPlay();
        macroProcessor.playMacro();
        return true;
    }); //file.newFile

    // Edit:

    const selectionToClipboard = length =>
        navigator.clipboard.writeText(elementSet.editor.value.substr(elementSet.editor.selectionStart, length));

    menu.subscribe(elementSet.menuItems.edit.cut.textContent, actionRequest => {
        const length = elementSet.editor.selectionEnd - elementSet.editor.selectionStart;
        if (!actionRequest) return length > 0;
        selectionToClipboard(length);
        elementSet.editor.setRangeText("");
        elementSet.editor.focus();
        return true;
    }); //edit.cut

    menu.subscribe(elementSet.menuItems.edit.copy.textContent, actionRequest => {
        const length = elementSet.editor.selectionEnd - elementSet.editor.selectionStart;
        if (!actionRequest) return length > 0;
        selectionToClipboard(length);
        elementSet.editor.focus();
        return true;
    }); //edit.copy

    menu.subscribe(elementSet.menuItems.edit.paste.textContent, actionRequest => {
        if (!actionRequest) return true;
        elementSet.editor.focus();
        navigator.clipboard.readText().then(value =>
            elementSet.editor.setRangeText(value));
        return true;
    }); //edit.paste

    menu.subscribe(elementSet.menuItems.edit.selectAll.textContent, actionRequest => {
        if (!actionRequest) return elementSet.editor.textLength > 0;
        elementSet.editor.focus();
        elementSet.editor.select();
        return true;
    }); //edit.selectAll

    window.addEventListener(definitionSet.events.keydown, event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutFind))
            searchDialog.show(false);
        else if (definitionSet.isShortcut(event, definitionSet.search.shorcutReplace))
            searchDialog.show(true);
    }); //window.addEventListener

    // View:

    let isStatusBarVisible = true;
    let isFullscreen = false;
    let viewStatusBarItem, viewFullscreenItem, viewWordWrapItem;
    let isWordWrap = false;
    viewStatusBarItem = menu.subscribe(elementSet.menuItems.view.statusBar.textContent, actionRequest => {
        if (!actionRequest) return true;
        isStatusBarVisible = !isStatusBarVisible;
        if (isStatusBarVisible)
            viewStatusBarItem.setCheckedCheckBox();
        else
            viewStatusBarItem.setCheckBox();
        elementSet.statusBar.all.style.display = definitionSet.view.statusBarStyle(isStatusBarVisible);
        return true;
    }); //view.statusBar
    viewStatusBarItem.setCheckBox();
    //setCheckedCheckBox

    viewFullscreenItem = menu.subscribe(elementSet.menuItems.view.fullscreen.textContent, actionRequest => {
        if (!actionRequest) return true;
        isFullscreen = !isFullscreen;
        if (isFullscreen)
            viewFullscreenItem.setCheckedCheckBox();
        else
            viewFullscreenItem.setCheckBox();
        window.bridgeUI.fullscreenToggle();
        return true;
    }); //view.fullscreen
    viewFullscreenItem.setCheckBox();

    viewWordWrapItem = menu.subscribe(elementSet.menuItems.view.wordWrap.textContent, actionRequest => {
        if (!actionRequest) return true;
        isWordWrap = !isWordWrap;
        if (isWordWrap)
            viewWordWrapItem.setCheckedCheckBox();
        else
            viewWordWrapItem.setCheckBox();
        elementSet.editor.style.textWrap = definitionSet.view.textWrapStyle(isWordWrap);
    }); //view.wordWrap
    viewWordWrapItem.setCheckBox();

    // Search:

    menu.subscribe(elementSet.menuItems.search.find.textContent, actionRequest => {
        if (!actionRequest) return true;
        searchDialog.show(false);
    }); //search.Find

    menu.subscribe(elementSet.menuItems.search.replace.textContent, actionRequest => {
        if (!actionRequest) return true;
        searchDialog.show(true);
        return false;
    }); //search.Replace

    menu.subscribe(elementSet.menuItems.search.findNext.textContent, actionRequest => {
        if (!actionRequest) return searchDialog.canFindNext();
        searchDialog.findNext(false);
    }); //search.findNextс
    menu.subscribe(elementSet.menuItems.search.findPrevious.textContent, actionRequest => {
        if (!actionRequest) return searchDialog.canFindNext();
        searchDialog.findNext(true);
    }); //edit.findPrevious

    menu.subscribe(elementSet.menuItems.search.goto.textContent, actionRequest => {
        if (!actionRequest) return elementSet.editor.textLength > 0;
        adHocUtility.goto(elementSet.editor);
    }); //search.goto

}; //subscribe
