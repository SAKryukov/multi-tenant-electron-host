"use strict";

const createSearchDialog = (definitionSet, elementSet) => {
 
    let isShown = false;
    let findings, currentFinding;
    const resetFindings = () => {
        findings = [];
        currentFinding = -1;
        elementSet.search.findingsIndicator.textContent = definitionSet.empty;
    }; //resetFindings
    resetFindings();

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

    const findNext = previous => {
        if (!findings) return;
        if (!findings.length) return;
        const delta = previous ? -1 : 1;
        const searchStringLength = elementSet.search.inputFind.value.length;
        if (currentFinding < 0) {
            if (previous) {
                for (let index = findings.length - 1; index >= 0; --index) {
                    const finding = findings[index];
                    if (finding <= elementSet.editor.selectionEnd) {
                        currentFinding = findingIndex;
                        elementSet.editor.setSelectionRange(finding, finding + searchStringLength);
                        break;
                    } //if
                } //loop
            } else {
                for (const findingIndex in findings) {
                    const finding = findings[findingIndex];
                    if (finding >= elementSet.editor.selectionStart) {
                        currentFinding = findingIndex;
                        elementSet.editor.setSelectionRange(finding, finding + searchStringLength);
                        break;
                    } //if
                } //loop
            } //if
        } //if
        currentFinding += delta;
        const marginCheck = previous
            ? () => currentFinding >= 0
            : () => currentFinding < findings.length;
        const rollover = previous
            ? findings.length - 1
            : 0
        if (marginCheck())
            elementSet.editor.setSelectionRange(findings[currentFinding], findings[currentFinding] + searchStringLength);
        else
            currentFinding = rollover;
        scrollToSelection();
    }; //findNext

    const find = () => {
        findings = [];
        const value = elementSet.editor.value;
        if (!value) return;
        const searchString = elementSet.search.inputFind.value;
        if (!value) return;
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
    }; //find

    elementSet.search.inputFind.oninput = resetFindings;
    elementSet.editor.addEventListener(definitionSet.events.input, resetFindings);
    elementSet.search.inputFind.onkeydown = event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutPerform)) {
            find();
            event.preventDefault();
        } //if
    }; //elementSet.search.inputFind.onkeydown
    elementSet.search.inputReplace.onkeydown = event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutPerform)) {
            replace(true);
            event.preventDefault();
        } //if
    }; //elementSet.search.inputReplace.onkeydown

    window.addEventListener(definitionSet.events.keydown, event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutFindNext))
            findNext();
        else if (definitionSet.isShortcut(event, definitionSet.search.shorcutFindPrevious))
            findNext(true);
        else if (definitionSet.isShortcut(event, definitionSet.search.shorcutClose))
            elementSet.search.dialog.close();
    }); //window on keydown
    elementSet.search.closeCross.onclick = () =>
        elementSet.search.dialog.close();

    elementSet.search.dialog.onclose = () =>  isShown = false;

    const searchDialog = {
        show: isReplaceView => {
            definitionSet.search.showElement(elementSet.search.inputReplace, isReplaceView);
            if (!isShown)
                elementSet.search.dialog.show();
            elementSet.search.inputFind.focus();
            if (!isReplaceView)
                find();
            isShown = true;
        },
        find: find,
        findNext: findNext,
        replace,
    }; //searchDialog
    return searchDialog;

};
