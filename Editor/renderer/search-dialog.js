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
    let findings, currentFinding, replacementIndex;
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

    const prepareRegexp = (searchString, global) => {
        const ignoreCase = !searchOptionSet.matchCase.value;
        const useRegularExpression = searchOptionSet.useRegularExpression.value;
        const flags = definitionSet.search.regularExpressionFlags(ignoreCase, global);
        if (!useRegularExpression)
            searchString = RegExp.escape(searchString);
        if (searchOptionSet.matchWholeWord.value)
            searchString = definitionSet.search.regularExpressionWholeWord(searchString);
        searchString = new RegExp(searchString, flags);
        return searchString;
    }; //prepareRegexp

    const replaceAll = replaceString => {
        let searchString = prepareRegexp(elementSet.search.inputFind.value, true); //global
        if (!searchString) return findings;
        if (elementSet.editor.selectionStart != elementSet.editor.selectionEnd) {
            let value = elementSet.editor.value.slice(elementSet.editor.selectionStart, elementSet.editor.selectionEnd);
            value = value.replaceAll(searchString, replaceString);
            elementSet.editor.setRangeText(value);
        } else
            elementSet.editor.value = elementSet.editor.value.replaceAll(searchString, replaceString);
    }; //replaceAll

    const confirmationReplacer = (() => {
        let replaceString = definitionSet.empty;
        definitionSet.search.replaceConfirmation.subscribeToReplaceConfirmation(
            elementSet.editor,
            () => { //handler
                if (replacementIndex >= findings.length) {
                    const pattern = prepareRegexp(elementSet.search.inputFind.value, false); // non-global
                    for (let index = findings.length - 1; index >= 0; --index) {
                        const finding = findings[index];
                        if (!finding[2]) continue; // false, that is, not confirmed
                        const sliceFirst = elementSet.editor.value.substring(0, finding[0]);
                        let sliceSecond = elementSet.editor.value.substring(finding[0]);
                        sliceSecond = sliceSecond.replace(pattern, replaceString);
                        elementSet.editor.value = sliceFirst + sliceSecond;
                    } //loop
                    resetFindings();
                    return;
                } //if
                const finding = findings[replacementIndex];
                const line = definitionSet.search.replaceConfirmation.formatLineToReplace(
                    elementSet.editor.value, finding[0], finding[1]);
                modalDialog.show(definitionSet.search.replaceConfirmation.dialogMessage(line), {
                    buttons: definitionSet.search.replaceConfirmation.dialogButtons(
                        () => {
                            findings[replacementIndex++].push(true);
                            elementSet.editor.dispatchEvent(
                                elementSet.editor.dispatchEvent(definitionSet.search.replaceConfirmation.event));
                        },
                        () => {
                            findings[replacementIndex++].push(true);
                            elementSet.editor.dispatchEvent(
                                elementSet.editor.dispatchEvent(definitionSet.search.replaceConfirmation.event));
                        })
                }); //modalDialog.show
            } //handler
        ); //subscribeToReplaceConfirmation
        //
        const replaceOneByOne = () => {
            find(true);
            if (!findings) return;
            if (!findings.length) return;
            replacementIndex = 0;
            elementSet.editor.dispatchEvent(definitionSet.search.replaceConfirmation.event);
        }; //replaceOneByOne
        // prepare replacer:        
        const replacer = { replaceOneByOne };
        Object.defineProperties(replacer, {
            replaceString: {
                get() { return replaceString; },
                set(value) { replaceString = value; },
            }, //replaceString
        });
        return replacer;
    })(); //confirmationReplacer

    const replace = () => {
        if (!elementSet.editor.value) return;
        if (!elementSet.search.inputFind.value) return;
        let replaceString = elementSet.search.inputReplace.value;
        if (!replaceString) return;
        if (searchOptionSet.useSpecialCharacters.value)
            for (const replacement of definitionSet.search.specialCharacterReplacements)
                replaceString = replaceString.replaceAll(replacement[0], replacement[1]);
        if (searchOptionSet.askConfirmation.value) {
            confirmationReplacer.replaceString = replaceString;
            confirmationReplacer.replaceOneByOne();
        } else
            replaceAll(replaceString);
    }; //replace

    const canFindNext = () => {
        return findings && findings.length;
    }; //canFindNext

    const findNext = previous => {
        if (!findings) return;
        if (!findings.length) return;
        const delta = previous ? -1 : 1;
        if (currentFinding < 0 || currentFinding >= findings.length)
            currentFinding = previous ? findings.length - 1 : 0;
        currentFinding += delta;
        if (currentFinding < 0 || currentFinding >= findings.length)
            currentFinding = previous ? findings.length - 1 : 0;
        elementSet.editor.setSelectionRange(findings[currentFinding][0], findings[currentFinding][1]);
        elementSet.editor.focus();
        scrollToSelection();
    }; //findNext

    const findAll = pattern => {
        const result = [];
        let matches, shift = 0;
        if (elementSet.editor.selectionStart != elementSet.editor.selectionEnd) {
            const aSlice = elementSet.editor.value.slice(elementSet.editor.selectionStart, elementSet.editor.selectionEnd);
            matches = [...aSlice.matchAll(pattern)];
            shift = elementSet.editor.selectionStart;
        } else
            matches = [...elementSet.editor.value.matchAll(pattern)];
        for (const match of matches)
            result.push([match.index + shift, match.index + match[0].length + shift]);
        return result;
    }; //result

    const find = notFinal => {
        const value = elementSet.editor.value;
        if (!value) return;
        let searchString = elementSet.search.inputFind.value;
        if (!searchString) return;
        searchString = prepareRegexp(elementSet.search.inputFind.value, true); //global
        if (!searchString) return findings;
        findings = findAll(searchString);
        if (notFinal) return;
        if (findings) {
            elementSet.editor.focus();
            elementSet.editor.setSelectionRange(findings[0][0], findings[0][1]);
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

    elementSet.search.dialog.onclose = () => isShown = false;

    const searchDialog = {
        show: isReplaceView => {
            definitionSet.search.showElement(elementSet.search.inputReplace, isReplaceView);
            definitionSet.search.showButton(searchOptionSet.askConfirmation.element, isReplaceView);
            if (!isShown)
                elementSet.search.dialog.show();
            const focusControl = isReplaceView && !!elementSet.search.inputFind.value
                ? elementSet.search.inputReplace : elementSet.search.inputFind;
            focusControl.focus();
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
