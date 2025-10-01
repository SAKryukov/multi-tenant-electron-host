/*
Personal Database

Copyright (c) 2017, 2023, 2025 by Sergey A Kryukov
http://www.SAKryukov.org
http://www.codeproject.com/Members/SAKryukov
*/

"use strict";

const createCommandSet = (table, summary, menuItems) => {
    
    const commandSetMap = new Map();
    commandSetMap.table = table;

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

    const fileIO = createFileIO(showException);
            
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

    const showTitle = data => {
        const title = data ? (data.summary ? data.summary.title : null) : null;
        document.title = definitionSet.titleFormat(title);
    }; //showTitle

    commandSetMap.set(menuItems.new, actionRequest => {
        if (!actionRequest) return true;
        commandSetMap.actConfirmed(() => commandSetMap.table.reset() );
    });

    const loadDatabase = data => {
        commandSetMap.table.load(data);
        summary.populate(data);
        showTitle(data);
    }; //loadDatabase

    commandSetMap.set(menuItems.open, actionRequest => {
        if (!actionRequest) return true;
        commandSetMap.actConfirmed(() => {
            fileIO.loadTextFile((_, text) => {
                try {
                    definitionSet.scripting.checkupSignature(text);
                    const json = definitionSet.scripting.extractJson(text);
                    const data = JSON.parse(json);
                    loadDatabase(data);
                    commandSetMap.table.isReadOnly = false;
                    notifyStored();
                } catch (ex) { showException(ex); }
            }, definitionSet.fileIO.filePickerOptions());
        });
    });

    const implementSave = alwaysDialog => {
        let content = null;
        try {
            const data = commandSetMap.table.store();
            summary.updateData(data);
            showTitle(data);
            const json = JSON.stringify(data);
            content = definitionSet.scripting.wrapJson(json);
        } catch (ex) { showException(ex); }
        if (fileIO.canSave && (!alwaysDialog))
            fileIO.saveExisting(definitionSet.fileIO.defaultSaveFilename(), content, definitionSet.fileIO.filePickerOptions());
        else
            fileIO.storeTextFile(definitionSet.fileIO.defaultSaveFilename(), content, definitionSet.fileIO.filePickerOptions());
    }; //implementSave

    commandSetMap.set(menuItems.save, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canStore; //SA???
        implementSave(false);
    });

    commandSetMap.set(menuItems.saveAs, actionRequest => {
        if (!actionRequest) return true;
        implementSave(true);
    });

    commandSetMap.set(menuItems.insertRow, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canInsertRow;
        commandSetMap.table.insertRow();
    });
    
    commandSetMap.set(menuItems.removeRow, actionRequest => {
        if (!actionRequest) return commandSetMap.table.canRemoveRow;
        commandSetMap.table.removeRow();
    });

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
        try {
            window.open(uri, definitionSet.URI.newTab);
        } catch (exception) {
            showException(exception);
        } //exception
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
        modalDialog.show("To be re-implemented<br/><br/>");
    });
    aboutCommandSet.set(menuItems.sourceCode, actionRequest => {
        if (!actionRequest) return true;
        window.open("https://www.github.com/SAKryukov/personal-database-dynamic-schema", definitionSet.URI.newTab);
    });

    table.focus();
    return { commandSetMap, aboutCommandSet, doubleClickHandler: loadWebPage, loadDatabase, showPreloadException };

};
