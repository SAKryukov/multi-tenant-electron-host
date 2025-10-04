"use strict";

const createExporter = (metadata, table, resultHandler) => {

    const rows = new Set();

    const reportRow = (row, isHeader) => {
        const bra = isHeader
            ? definitionSet.export.headerCell.bra
            : definitionSet.export.cell.bra;
        const ket = isHeader
            ? definitionSet.export.headerCell.ket
            : definitionSet.export.cell.ket;
        const cells = [];
        for (let index = 1; index < row.cells.length - 1; ++index)
            cells.push(bra + row.cells[index].textContent + ket);
        const cellsHTML = cells.join(definitionSet.characters.empty);
        return definitionSet.export.row.bra + cellsHTML + definitionSet.export.row.ket;
    }; //reportRow

    const reportPropertiesRow = () =>
        reportRow(table.propertiesRow, true);

    const getSelectedContent = () => {
        const row = table.selectedRow;
        return reportPropertiesRow() + reportRow(row);
    }; //getSelectedContent
    
    const getFoundContent = () => {
        rows.clear();
        for (const cell of table.found) {
            const row = cell.parentElement.rowIndex;
            if (!rows.has(row))
                rows.add(row);
        } //loop
        const rowsText = [];
        for (const row of rows)
            rowsText.push(reportRow(table.rows[row - 1]));
        const rowsHTML = rowsText.join(definitionSet.characters.empty);
        return reportPropertiesRow() + rowsHTML;
    }; //getFoundContent

    const getAllContent = () => {
        const content = [];
        content.push(reportPropertiesRow());
        for (let index = 0; index < table.rows.length; ++index)
            content.push(reportRow(table.rows[index]));
        return content.join(definitionSet.characters.empty);
    }; //getAllContent

    const doExport = (filename, defaultPath, found, all) => {
        const filenameElement = definitionSet.export.html.filenameElement(filename);
        const bra = definitionSet.export.html.bra(metadata.package.description, filenameElement);
        const title = all
            ? definitionSet.export.title
            : (found
                ? definitionSet.export.dialogFoundTitle
                : definitionSet.export.dialogSelectedTitle);
        const content = all
            ? getAllContent()
            : (found           
                ? getFoundContent()
                : getSelectedContent());
        const htmlContent =
            bra
            + content
            + definitionSet.export.html.ket;
        window.bridgeFileIO.saveFileAs(htmlContent,
            (filename, error) =>
                resultHandler(filename, null, error, true),
            title,
            defaultPath,
            definitionSet.export.fileTypeFilters,
            false);
    }; //doExport

    const exportAll = (filename, defaultPath) => doExport(filename, defaultPath, false, true);
    const exportSelected = (filename, defaultPath) => doExport(filename, defaultPath, false);
    const exportFound = (filename, defaultPath) => doExport(filename, defaultPath, true);
    
    const canExport = () => true;
    const canExportSelected = () => true;
    const canExportFound = () => table.found.length > 0;
    
    return { canExport, canExportSelected, canExportFound, exportAll, exportSelected, exportFound };

};
