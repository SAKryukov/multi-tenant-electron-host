/*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

const createCommandSet = (table, summary, menuItems, metadata) => {

    const commonCommandSet = new Map();
    const fileCommandSet = new Map();
    commonCommandSet.table = table;
    let currentFilename = null;
    const defaultPath = () => currentFilename == null ? definitionSet.characters.empty : currentFilename;

    const reportError = (error, errorKind = definitionSet.errorHandling.other) =>
        showMessage(definitionSet.errorHandling.format(errorKind, error.message), table);

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
        if (table.isModified) {
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

    fileCommandSet.set(menuItems.new, actionRequest => {
        if (!actionRequest) return true;
        actionOnConfirmation(() => {
            commonCommandSet.table.reset();
            currentFilename = null;
        });
    }); //menuItems.new

    const tableToText = () => {
        try {
            const data = commonCommandSet.table.store();
            summary.updateData(data);
            const json = JSON.stringify(data);
            return definitionSet.scripting.wrapJson(json);
        } catch (ex) { reportError(ex); }
    }; //tableToText

    const loadDatabase = (text, readonly = false) => {
        definitionSet.scripting.checkupSignature(text);
        const json = definitionSet.scripting.extractJson(text);
        const data = JSON.parse(json);
        commonCommandSet.table.load(data);
        summary.populate(data);
        commonCommandSet.table.isReadOnly = readonly;
    }; //loadDatabase

    const handleFileOperationResult = (filename, text, error, isSave = false, readonly = false) => {
        if (!error) {
            currentFilename = filename;
            if (text)
                loadDatabase(text, readonly)
            table.isModified = false;
            commonCommandSet.table.focus();
        } else
            reportError(error, isSave ? definitionSet.errorHandling.save : definitionSet.errorHandling.open);
    }; //handleFileOperationResult

    window.bridgeFileIO.subscribeToCommandLine((filename, text, error) => {
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

    fileCommandSet.set(menuItems.open, actionRequest => {
        if (!actionRequest) return true;
        actionOnConfirmation(() => {
            window.bridgeFileIO.openFile(
                (filename, text, error) => {
                    try {
                        handleFileOperationResult(filename, text, error, false);
                    } catch (exception) { reportError(exception); }
                },
                definitionSet.persistence.fileDialog.titleOpen,
                defaultPath(),
                definitionSet.persistence.fileDialog.fileTypeFilters);
        });
    }); //menuItems.open

    fileCommandSet.set(menuItems.save, actionRequest => {
        if (!actionRequest) return table.isModified && !table.isReadOnly;
        if (currentFilename)
            saveExistingFile();
        else
            saveAs();
    }); //menuItems.save

    fileCommandSet.set(menuItems.saveAs, actionRequest => {
        if (!actionRequest) return true;
        saveAs();
    }); //menuItems.saveAs

    const exporter = createExporter(
        metadata, table,
        error => reportError(error, definitionSet.export.errorTitle));

    fileCommandSet.set(menuItems.export, actionRequest => {
        if (!actionRequest) return exporter.canExport;
        exporter.exportAll(currentFilename, defaultPath());
        table.focus();
    }); //menuItems.exportSelection

    fileCommandSet.set(menuItems.exportSelection, actionRequest => {
        if (!actionRequest) return exporter.canExportSelected();
        exporter.exportSelected(currentFilename, defaultPath());
        table.focus();
    }); //menuItems.exportSelection
    
    fileCommandSet.set(menuItems.exportFound, actionRequest => {       
        if (!actionRequest) return exporter.canExportFound();
        exporter.exportFound(currentFilename, defaultPath());
        table.focus();
    }); //menuItems.exportFound

    commonCommandSet.set(menuItems.insertRow, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canInsertRow;
        commonCommandSet.table.insertRow();
    }); //menuItems.insertRow
    
    commonCommandSet.set(menuItems.removeRow, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canRemoveRow;
        commonCommandSet.table.removeRow();
    }); //menuItems.removeRow

    commonCommandSet.set(menuItems.addProperty, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canAddProperty;
        commonCommandSet.table.addProperty()
    });
    commonCommandSet.set(menuItems.insertProperty, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canInsertProperty;
        commonCommandSet.table.insertProperty();
    });
    commonCommandSet.set(menuItems.removeProperty, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canRemoveProperty;
        commonCommandSet.table.removeProperty()
    });
    
    commonCommandSet.set(menuItems.copy, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canCopyToClipboard;
        try {
            commonCommandSet.table.toClipboard();
        } catch (ex) { reportError(ex); }
    });    

    commonCommandSet.set(menuItems.paste, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canPasteFromClipboard;
        try {
            commonCommandSet.table.fromClipboard();
        } catch (ex) { reportError(ex); }
    });
    
    commonCommandSet.set(menuItems.editSelectedCell, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canEditSelectedCell;
        if (commonCommandSet.table.editingMode)
            setTimeout( () => { commonCommandSet.table.commitEdit() });
        else
            setTimeout( () => { commonCommandSet.table.editSelectedCell() });
    });

    commonCommandSet.set(menuItems.editPropertyName, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canEditProperty;
        if (commonCommandSet.table.editingMode)
            setTimeout( () => { commonCommandSet.table.cancelEdit(); });
        else
            setTimeout( () => { commonCommandSet.table.editProperty(); });
    });

    const loadWebPage = (actionRequest) => {
        const uri = commonCommandSet.table.selectedUri;
        if (!actionRequest) return !!uri;
        if (!uri) return false;
        window.bridgeUI.showExternalUri(uri);
        return true;
    } //loadWebPage
    
    commonCommandSet.set(menuItems.load, loadWebPage);

    commonCommandSet.set(menuItems.up, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canShuffleRow(true);
        commonCommandSet.table.shuffleRow(true)
    });    
    commonCommandSet.set(menuItems.down, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canShuffleRow(false);
        commonCommandSet.table.shuffleRow(false)
    });    
    commonCommandSet.set(menuItems.left, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canShuffleColumn(true);
        commonCommandSet.table.shuffleColumn(true)
    });    
    commonCommandSet.set(menuItems.right, actionRequest => {
        if (!actionRequest) return commonCommandSet.table.canShuffleColumn(false);
        commonCommandSet.table.shuffleColumn(false)
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
        if (!table.isModified) return true;
        actionOnConfirmation(() => { permitted = true; }, true);
        return !table.isModified;
    }); //subscribeToApplicationClose

    return { commonCommandSet, fileCommandSet, aboutCommandSet, doubleClickHandler: loadWebPage, loadDatabase };

};
