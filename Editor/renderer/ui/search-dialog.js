"use strict";

const createSearchDialog = (definitionSet, elementSet) => {
 
    let findings, currentFinding;
    const resetFindings = () => {
        findings = [];
        currentFinding = -1;
        elementSet.search.findingsIndicator.textContent = 0;
    }; //resetFindings
    resetFindings();

    elementSet.search.closeCross.onclick = () =>
        elementSet.search.dialog.close();

    const searchDialog = {
        show: isReplaceView => {
            definitionSet.search.showElement(elementSet.search.buttonReplace, isReplaceView);
            definitionSet.search.showElement(elementSet.search.buttonReplaceAll, isReplaceView);
            definitionSet.search.showElement(elementSet.search.inputReplace, isReplaceView);
            elementSet.search.dialog.show();
        },
    }; //searchDialog

    const scrollToSelection = () => {
        const columns = elementSet.editor.cols;
        const selectionRow =
            (elementSet.editor.selectionStart -
            (elementSet.editor.selectionStart % columns)) / columns;
        const lineHeight = elementSet.editor.clientHeight / elementSet.editor.rows;
        elementSet.editor.scrollTop = lineHeight * selectionRow;
    }; //scrollToSelection

    const replace = all => {
        const value = elementSet.editor.value;
        if (!value) return;
        const searchString = elementSet.search.inputFind.value;
        if (!searchString) return findings;
        const replaceString = elementSet.search.inputReplace.value;
        if (!replaceString) return;
        elementSet.editor.value = all
            ? value.replaceAll(searchString, replaceString)
            : value.replace(searchString, replaceString);        
    }; //replace

    const findNext = () => {
        if (!findings) return;
        if (!findings.length) return;
        const searchStringLength = elementSet.search.inputFind.value.length;
        if (currentFinding < 0) {
            for (const findingIndex in findings) {
                const finding = findings[findingIndex];
                if (finding >= elementSet.editor.selectionStart) {
                    currentFinding = findingIndex;
                    elementSet.editor.setSelectionRange(finding, finding + searchStringLength);
                    break;
                } //if
            } //loop
        } else {
            currentFinding++;
            if (currentFinding < findings.length)
                elementSet.editor.setSelectionRange(findings[currentFinding], findings[currentFinding] + searchStringLength);
            else
                currentFinding = 0;
        } //if
        scrollToSelection();
    }; //findNext

    elementSet.search.buttonFind.onclick = () => {
        findings = [];
        const value = elementSet.editor.value;
        if (!value) return findings;
        const searchString = elementSet.search.inputFind.value;
        if (!value) return findings;
        const searchStringLength = searchString.length;
        let index, position = 0;
        while ((index = value.indexOf(searchString, position)) > -1) {
            findings.push(index);
            position = index + searchStringLength;
        } //loop
        elementSet.search.findingsIndicator.textContent = findings.length;
        if (findings.length > 0) {
            elementSet.editor.setSelectionRange(findings[0], findings[0] + searchStringLength);
            scrollToSelection();
            elementSet.editor.focus();
        } //if
    }; //elementSet.search.buttonFind.onclick

    elementSet.search.inputFind.oninput = () => resetFindings();
    elementSet.editor.addEventListener(definitionSet.events.input, () => resetFindings());
    elementSet.search.buttonReplace.onclick = () => replace(false);
    elementSet.search.buttonReplaceAll.onclick = () => replace(true);

    window.addEventListener(definitionSet.events.keydown, event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutFindNext))
            findNext();
        else if (definitionSet.isShortcut(event, definitionSet.search.shorcutFindPrevious))
            findNext(true);
    }); //window on keydown

    return searchDialog;

};
