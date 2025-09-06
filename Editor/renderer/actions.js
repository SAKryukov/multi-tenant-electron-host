"use strict";

const subscribe = (elementSet, menu, searchDialog, metadata) => {

    //searchDialog.show(); //SA???

    const originalTitle = document.title;
    let currentFilename = null;
    let isModified = false;

    // File I/O:

    const reportError = (error, errorKind) =>
        modalDialog.show(definitionSet.errorHandling.format(errorKind, error.message));

    const updateModifiedFlag = flag => {
        isModified = flag;
        elementSet.statusBar.modifiedFlag.innerHTML = flag
            ? definitionSet.status.modified
            : null;
    }; //updateModifiedFlag
    elementSet.editor.addEventListener(definitionSet.events.input, () => updateModifiedFlag(true));
       
    const handleFileOperationResult = (filename, baseFilename, text, error, isSave) => {
        if (!error) {
            currentFilename = filename;
            document.title = definitionSet.fileNaming.title(baseFilename, originalTitle);
            if (text) elementSet.editor.value = text;        
            updateModifiedFlag(false);
        } else
            reportError(error, isSave ? definitionSet.errorHandling.save : definitionSet.errorHandling.open);
    }; //handleFileOperationResult

    window.bridgeFileIO.subscribeToCommandLine((filename, baseFilename, text, error) =>
        handleFileOperationResult(filename, baseFilename, text, error));

    const actionOnConfirmation = (action, closingApplication) => {
        const wrapper = () => {
            isModified = !closingApplication;
            window.close();
        }; //wrapper
        const effectiveAction = closingApplication ? wrapper : action;
        if (isModified) {
            const message = closingApplication
                ? definitionSet.modifiedTextOperationConfirmation.messageClosingApplication
                : definitionSet.modifiedTextOperationConfirmation.message;
            modalDialog.show(
                message, {
                    buttons: definitionSet.modifiedTextOperationConfirmation.buttons(saveAs, effectiveAction),
                });
        } else
            action();
    }; //actionOnConfirmation

    window.bridgeUI.subscribeToApplicationClose(() => {
        if (!isModified) return true;
        actionOnConfirmation(() => { permitted = true; }, true);
        return !isModified;
    }); //subscribeToApplicationClose

    menu.subscribe(elementSet.menuItems.file.newFile.textContent, actionRequest => {
        if (!actionRequest) return isModified || currentFilename != null;
        actionOnConfirmation(() => {
            elementSet.editor.value = null;
            elementSet.editor.focus();
            isModified = false;
        }); //actionOnConfirmation
        return true;
    }); //file.newFile

    menu.subscribe(elementSet.menuItems.file.open.textContent, actionRequest => {
        if (!actionRequest) return true;
        actionOnConfirmation(() => {
            window.bridgeFileIO.openFile((filename, baseFilename, text, error) =>
            handleFileOperationResult(filename, baseFilename, text, error));
        });
        return true;
    }); //file.open

    const saveAs = () =>
        window.bridgeFileIO.saveFileAs(elementSet.editor.value, (filename, baseFilename, error) =>
            handleFileOperationResult(filename, baseFilename, null, error, true));

    menu.subscribe(elementSet.menuItems.file.saveAs.textContent, actionRequest => {
        if (!actionRequest) return true;
        saveAs();
        return true;
    }); //file.saveAs

    menu.subscribe(elementSet.menuItems.file.saveExisting.textContent, actionRequest => {
        if (!actionRequest) return isModified;
        if (currentFilename)
            window.bridgeFileIO.saveExistingFile(currentFilename, elementSet.editor.value, (filename, baseFilename, error) =>
                handleFileOperationResult(filename, baseFilename, null, error, true));
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
        if (!actionRequest) return true; //SA???
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
    }); //selectAll.textContent

    // View:

    let isStatusBarVisible = true;
    let isFullscreen = false;
    let viewStatusBarItem, viewFullscreenItem;
    viewStatusBarItem = menu.subscribe(elementSet.menuItems.view.statusBar.textContent, actionRequest => {
        if (!actionRequest) return true;
        isStatusBarVisible = !isStatusBarVisible;
        if (isStatusBarVisible)
            viewStatusBarItem.setCheckedCheckBox();
        else
            viewStatusBarItem.setCheckBox();
        elementSet.statusBar.all.style.display = definitionSet.view.statusBarStyle(isStatusBarVisible);
        return true;
    }); //file.newFile
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
    }); //file.newFile
    viewFullscreenItem.setCheckBox();

}; //subscribe
