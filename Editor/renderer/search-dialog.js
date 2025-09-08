"use strict";

const createSearchDialog = (definitionSet, elementSet) => {

    const searchOptionSet = ((cssClassUp, cssClassDown) => {
        definitionSet.search.showBlock(elementSet.search.options.legend, false);
        const twoStateMatchCase =
            createTwoStateButton(elementSet.search.options.matchCase, cssClassUp, cssClassDown, true);
        const twoStateRegularExpression =
            createTwoStateButton(elementSet.search.options.useRegularExpression, cssClassUp, cssClassDown);
        const twoStateSpecial =
            createTwoStateButton(elementSet.search.options.useSpecialCharacters, cssClassUp, cssClassDown);
        twoStateSpecial.onchangeState = value => {
            definitionSet.search.showBlock(elementSet.search.options.legend, value);
            if (value) twoStateRegularExpression.value = false;
        } //twoStateSpecial.onchange
        twoStateRegularExpression.onchangeState = value => {
            if (value) {
                twoStateSpecial.value = false;
                definitionSet.search.showBlock(elementSet.search.options.legend, false);
            } //if
        } //twoStateRegularExpression.onchange
        return {
            matchCase: twoStateMatchCase,
            matchWholeWord: createTwoStateButton(elementSet.search.options.matchWholeWord, cssClassUp, cssClassDown),
            useRegularExpression: twoStateRegularExpression,
            useSpecialCharacters: twoStateSpecial,
            askConfirmation: createTwoStateButton(elementSet.search.options.askConfirmation, cssClassUp, cssClassDown, true),
        };
    })(definitionSet.search.optionClassName.up, definitionSet.search.optionClassName.down);
 
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

    const replace = () => {
        const value = elementSet.editor.value;
        if (!value) return;
        let searchString = elementSet.search.inputFind.value;
        if (!searchString) return findings;
        let replaceString = elementSet.search.inputReplace.value;
        if (!replaceString) return;
        if (searchOptionSet.useSpecialCharacters.value)
            for (const replacement of definitionSet.search.specialCharacterReplacements)
                replaceString = replaceString.replaceAll(replacement[0], replacement[1]);
        const ignoreCase = !searchOptionSet.matchCase.value;
        const useRegularExpression = searchOptionSet.useRegularExpression.value;
        const flags = definitionSet.search.regularExpressionFlags(ignoreCase);
        if (!useRegularExpression)
            searchString = RegExp.escape(searchString);
        searchString = new RegExp(searchString, flags);
        if (elementSet.editor.selectionStart != elementSet.editor.selectionEnd) {
            let value = elementSet.editor.value.slice(elementSet.editor.selectionStart, elementSet.editor.selectionEnd);
            value = value.replaceAll(searchString, replaceString);
            elementSet.editor.setRangeText(value);
        } else
            elementSet.editor.value = value.replaceAll(searchString, replaceString);
    }; //replace

    const canFindNext = () => {
        return findings && findings.length;
    }; //canFindNext

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
        elementSet.editor.focus();
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
            replace();
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
            definitionSet.search.showButton(searchOptionSet.askConfirmation.element, isReplaceView);
            if (!isShown)
                elementSet.search.dialog.show();
            elementSet.search.inputFind.focus();
            if (!isReplaceView)
                find();
            isShown = true;
        },
        find,
        canFindNext,
        findNext,
        replace,
    }; //searchDialog
    return searchDialog;

};
