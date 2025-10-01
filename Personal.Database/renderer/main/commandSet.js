    /*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

const createCommandSet = (table, summary, menuItems, metadata) => {

    const commandSetMap = new Map();
    commandSetMap.table = table;
    let currentFilename = null;
    const defaultPath = () => currentFilename == null ? definitionSet.characters.empty : currentFilename;

    const storedEvent = new CustomEvent(definitionSet.eventHandler.storedEvent);
    const notifyStored = () => window.dispatchEvent(storedEvent);

    const errorMessageBox = message =>
        modalDialog.show(
            message,
            { options: {
                focusAfterAction: commandSetMap.table.element,
                cssClasses: definitionSet.eventHandler.dataModifiedRequestStyles.cssClass } });
    const showException = exception =>
        errorMessageBox(exception.toString());
    const showPreloadException = (message, fileName) =>
        errorMessageBox(definitionSet.persistence.formatPersistenceErrorMessage(message, fileName));

    commandSetMap.actConfirmed = function (action) {
        if (this.table.isModified) {
            modalDialog.show(
                definitionSet.eventHandler.dataModifiedRequest,
                { options: { focusAfterAction: this.table },
                  buttons: [
                    { text: definitionSet.eventHandler.dataModifiedRequestButtonConfirm, action: action, },
                    { text: definitionSet.eventHandler.dataModifiedRequestButtonCancel, isEscape: true, }
                  ], });
        } else
            action();
    }; //commandSet.actConfirmed

    commandSetMap.set(menuItems.new, actionRequest => {
        if (!actionRequest) return true;
        commandSetMap.actConfirmed(() => commandSetMap.table.reset() );
    });

    const handleFileOperationResult = (filename, text, error, isSave = false, readonly = false) => {
        if (!error) {
            currentFilename = filename;
            commandSetMap.table.isReadOnly = readonly;
            commandSetMap.table.focus();
        } else
            showException(error); //SA???
        //reportError(error, isSave ? definitionSet.errorHandling.save : definitionSet.errorHandling.open);
    }; //handleFileOperationResult

    const tableToText = () => {
        try {
            const data = commandSetMap.table.store();
            summary.updateData(data);
            const json = JSON.stringify(data);
            return definitionSet.scripting.wrapJson(json);
        } catch (ex) { showException(ex); }
    }; //tableToText

    const loadDatabase = (text, readonly = false) => {
        definitionSet.scripting.checkupSignature(text);
        const json = definitionSet.scripting.extractJson(text);
        const data = JSON.parse(json);
        commandSetMap.table.load(data);
        summary.populate(data);
        commandSetMap.table.isReadOnly = readonly;
        notifyStored();
    }; //loadDatabase

    window.bridgeFileIO.subscribeToCommandLine((filename, text, error) => {
        loadDatabase(text, true); //readonly
        handleFileOperationResult(filename, text, error, false, true); //readonly
    }); //window.bridgeFileIO.subscribeToCommandLine

    const saveAs = () =>
        window.bridgeFileIO.saveFileAs(tableToText(),
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            definitionSet.persistence.fileDialog.titleSaveFile,
            defaultPath(),
            definitionSet.persistence.fileDialog.fileTypeFilters,
            false);
    const saveAsAndContinue = action =>
        window.bridgeFileIO.saveFileAs(tableToText(),
            (filename, error) => {
                action();
                handleFileOperationResult(filename, null, error, true);
            },
            definitionSet.persistence.fileDialog.titleSaveFileAndContinue,
            defaultPath(),
            definitionSet.persistence.fileDialog.fileTypeFilters,
            false);
    const saveAsAndCloseApplication = () =>
        window.bridgeFileIO.saveFileAs(tableToText(),
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            definitionSet.persistence.fileDialog.titleSaveFileAndClose,
            defaultPath(),
            definitionSet.persistence.fileDialog.fileTypeFilters,
            true);
    const saveExistingFile = () =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            tableToText(),
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            false);
    const saveExistingFileAndContinue = action =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            tableToText(),
            (filename, error) => {
                action();
                handleFileOperationResult(filename, null, error, true);
            },
            false);
    const saveExistingFileAndCloseApplication = () =>
        window.bridgeFileIO.saveExistingFile(currentFilename,
            tableToText(),
            (filename, error) =>
                handleFileOperationResult(filename, null, error, true),
            true);

    commandSetMap.set(menuItems.open, actionRequest => {
        if (!actionRequest) return true;
        commandSetMap.actConfirmed(() => {
            window.bridgeFileIO.openFile(
                (filename, text, error) => {
                    try {
                        loadDatabase(text);
                        handleFileOperationResult(filename, text, error, false);
                    } catch (exception) { showException(exception); }
                },
                definitionSet.persistence.fileDialog.titleOpen,
                defaultPath(),
                definitionSet.persistence.fileDialog.fileTypeFilters);
        });
    }); //menuItems.open

    commandSetMap.set(menuItems.save, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canStore; //SA???
        if (currentFilename)
            saveExistingFile();
        else
            saveAs();
    }); //menuItems.save

    commandSetMap.set(menuItems.saveAs, actionRequest => {
        if (!actionRequest) return true;
        saveAs();
    }); //menuItems.saveAs

    commandSetMap.set(menuItems.insertRow, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canInsertRow;
        commandSetMap.table.insertRow();
    }); //menuItems.insertRow
    
    commandSetMap.set(menuItems.removeRow, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canRemoveRow;
        commandSetMap.table.removeRow();
    }); //menuItems.removeRow

    commandSetMap.set(menuItems.addProperty, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canAddProperty;
        commandSetMap.table.addProperty()
    });
    commandSetMap.set(menuItems.insertProperty, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canInsertProperty;
        commandSetMap.table.insertProperty();
    });
    commandSetMap.set(menuItems.removeProperty, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canRemoveProperty;
        commandSetMap.table.removeProperty()
    });
    
    commandSetMap.set(menuItems.copy, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canCopyToClipboard;
        try {
            commandSetMap.table.toClipboard();
        } catch (ex) { showException(ex); }
    });    

    commandSetMap.set(menuItems.paste, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canPasteFromClipboard;
        try {
            commandSetMap.table.fromClipboard();
        } catch (ex) { showException(ex); }
    });
    
    commandSetMap.set(menuItems.editSelectedCell, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canEditSelectedCell;
        if (commandSetMap.table.editingMode)
            setTimeout( () => { commandSetMap.table.commitEdit() });
        else
            setTimeout( () => { commandSetMap.table.editSelectedCell() });
    });

    commandSetMap.set(menuItems.editPropertyName, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canEditProperty;
        if (commandSetMap.table.editingMode)
            setTimeout( () => { commandSetMap.table.cancelEdit(); });
        else
            setTimeout( () => { commandSetMap.table.editProperty(); });
    });

    const loadWebPage = (actionRequest) => {
        const uri = commandSetMap.table.selectedUri;
        if (!actionRequest) return !!uri;
        if (!uri) return false;
        window.bridgeUI.showExternalUri(uri);
        return true;
    } //loadWebPage
    
    commandSetMap.set(menuItems.load, loadWebPage);

    commandSetMap.set(menuItems.up, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canShuffleRow(true);
        commandSetMap.table.shuffleRow(true)
    });    
    commandSetMap.set(menuItems.down, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canShuffleRow(false);
        commandSetMap.table.shuffleRow(false)
    });    
    commandSetMap.set(menuItems.left, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canShuffleColumn(true);
        commandSetMap.table.shuffleColumn(true)
    });    
    commandSetMap.set(menuItems.right, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canShuffleColumn(false);
        commandSetMap.table.shuffleColumn(false)
    });    

    const aboutCommandSet = new Map();
    aboutCommandSet.set(menuItems.about, actionRequest => {
        if (!actionRequest) return true;
        showMessage(definitionSet.aboutDialog(metadata, definitionSet.paths.image), table);
        return true;
    }); //menuItems.about
    aboutCommandSet.set(menuItems.sourceCode, actionRequest => {
        if (!actionRequest) return true;
        window.bridgeMetadata.showSource();
        table.focus();
        return true;
    }); //menuItems.sourceCode

    table.focus();

    window.bridgeUI.subscribeToApplicationClose(() => {
        return true; //!table.isModified; //SA???
    }); //subscribeToApplicationClose

    return { commandSetMap, aboutCommandSet, doubleClickHandler: loadWebPage, loadDatabase, showPreloadException };

};
