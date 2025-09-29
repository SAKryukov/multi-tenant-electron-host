"use strict";

const subscribe = (elementSet, menu, searchDialog, metadata) => {

    elementSet.copyright.innerHTML = metadata?.package?.metadata?.copyright;
    let currentFilename = null;
    const defaultPath = () => currentFilename == null ? definitionSet.empty : currentFilename;
    const filters = null; //SA??? [{ name: "Text files", extensions: ["json", "text"]}];

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

    elementSet.editorAPI.subscribeToModified(() => fileSystemStatus.isModified = true);
    const reportError = (error, errorKind) =>
        showMessage(definitionSet.errorHandling.format(errorKind, error.message), elementSet.editor);

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
            else {
                action();
                setTimeout(() => elementSet.editor.focus());
            } //if
        } //noSaveAction
        const cancelAction = () => elementSet.editor.focus();
        if (fileSystemStatus.isModified) {
            const message = closingApplication
                ? definitionSet.modifiedTextOperationConfirmation.messageClosingApplication
                : definitionSet.modifiedTextOperationConfirmation.message;
            modalDialog.show(
                message, {
                    buttons: definitionSet.modifiedTextOperationConfirmation.buttons(
                        saveBeforeAction, noSaveAction, cancelAction),
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
    }).subscribeToShortcut(definitionSet.menuShortcuts.fileNew); //file.newFile

    menu.subscribe(elementSet.menuItems.file.open.textContent, actionRequest => {
        if (!actionRequest) return true;
        actionOnConfirmation(() => {
            window.bridgeFileIO.openFile((filename, text, error) =>
            handleFileOperationResult(filename, text, error), definitionSet.fileDialog.titleOpenFile, defaultPath(), filters);
        });
        elementSet.editor.focus();
        return true;
    }).subscribeToShortcut(definitionSet.menuShortcuts.fileOpen); //file.open

    const saveAs = () =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            definitionSet.fileDialog.titleSaveFile, defaultPath(), filters, false);
    const saveAsAndContinue = action =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) => {
                action();
                handleFileOperationResult(filename, null, error, true);
            },
            definitionSet.fileDialog.titleSaveFileAndContinue, defaultPath(), filters, false);
    const saveAsAndCloseApplication = () =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            definitionSet.fileDialog.titleSaveFileAndClose, defaultPath(), filters, true);
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
    const saveExistingFileAndCloseApplication = () =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            elementSet.editor.value,
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            true);

    menu.subscribe(elementSet.menuItems.file.saveAs.textContent, actionRequest => {
        if (!actionRequest) return true;
        saveAs();
        elementSet.editor.focus();
        return true;
    }).subscribeToShortcut(definitionSet.menuShortcuts.fileSaveAs); //file.saveAs

    menu.subscribe(elementSet.menuItems.file.saveExisting.textContent, actionRequest => {
        if (!actionRequest) return fileSystemStatus.isModified;
        if (currentFilename)
            saveExistingFile();
        else
            saveAs();
        elementSet.editor.focus();
        return true;
    }).subscribeToShortcut(definitionSet.menuShortcuts.fileSaveExisting); //file.saveExisting

    // Macro:

    const macroProcessor = createMacroProcessor(elementSet.editor, elementSet.statusBar.macroFlag, elementSet.editorAPI);
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
        elementSet.editor.setRangeText(definitionSet.empty);
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
    viewStatusBarItem.setCheckedCheckBox();
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
    }).subscribeToShortcut(definitionSet.search.shorcutFind); //search.Find

    menu.subscribe(elementSet.menuItems.search.replace.textContent, actionRequest => {
        if (!actionRequest) return true;
        searchDialog.show(true);
        return false;
    }).subscribeToShortcut(definitionSet.search.shorcutReplace); //search.Replace

    menu.subscribe(elementSet.menuItems.search.findNext.textContent, actionRequest => {
        if (!actionRequest) return searchDialog.canFindNext();
        searchDialog.findNext(false);
    }).subscribeToShortcut(definitionSet.search.shorcutFindNext); //search.findNext
    menu.subscribe(elementSet.menuItems.search.findPrevious.textContent, actionRequest => {
        if (!actionRequest) return searchDialog.canFindNext();
        searchDialog.findNext(true);
    }).subscribeToShortcut(definitionSet.search.shorcutFindPrevious); //edit.findPrevious

    menu.subscribe(elementSet.menuItems.search.goto.textContent, actionRequest => {
        if (!actionRequest) return elementSet.editor.textLength > 0;
        adHocUtility.goto();
    }); //search.goto

    // Help:

    menu.subscribe(elementSet.menuItems.help.about.textContent, actionRequest => {
        if (!actionRequest) return true;
        showMessage(definitionSet.aboutDialog(metadata), elementSet.editor);
        return true;
    }).subscribeToShortcut(definitionSet.menuShortcuts.helpAbout); //help.about

    menu.subscribe(elementSet.menuItems.help.sourceCode.textContent, actionRequest => {
        if (!actionRequest) return true;
        window.bridgeMetadata.showSource();
        elementSet.editor.focus();
        return true;
    }); //help.sourceCode

    if (GravitySensor) {
        navigator.permissions.query({ name: definitionSet.status.gravitySensor.permissionName }).then(permission => {
            if (permission.state == definitionSet.status.gravitySensor.permissionState) {
                let shown = false;
                const sensor = new GravitySensor({ frequency: definitionSet.status.gravitySensor.frequency });
                const showTilt = (x, y) => {
                    const tilt = definitionSet.status.gravitySensor.tilt(x, y);
                    if (!shown)
                        definitionSet.ui.showInline(elementSet.statusBar.tiltFlag, !shown);
                    elementSet.statusBar.tiltFlag.textContent = tilt;
                    shown = true;
                }; //showTilt
                sensor.addEventListener(definitionSet.events.reading, event => showTilt(event.target.x, event.target.y)); sensor.start();
                sensor.start();
            } //if granted
        }); //permissions query
    } //if GravitySensor

}; //subscribe
