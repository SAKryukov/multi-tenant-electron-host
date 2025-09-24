"use strict";

const createSearchDialog = (definitionSet, elementSet) => {

    const searchOptionSet = ((cssClassUp, cssClassDown) => {
        const twoStateMatchCase =
            createTwoStateButton(elementSet.search.options.matchCase, cssClassUp, cssClassDown, true);
        const twoStateRegularExpression =
            createTwoStateButton(elementSet.search.options.useRegularExpression, cssClassUp, cssClassDown);
        const twoStateSpecial =
            createTwoStateButton(elementSet.search.options.useSpecialCharacters, cssClassUp, cssClassDown);
        twoStateSpecial.onchangeState = value => {
            definitionSet.search.showLegend(elementSet.search.options.specialCaseLegend, value);
            if (value) {
                twoStateRegularExpression.value = false;
                definitionSet.search.showLegend(elementSet.search.options.regularExpressionReplacementLegend, false);
            } //if
        }; //twoStateSpecial.onchange
        const adjustRegularExpressionReplacementLegendVisibility = () => {
            definitionSet.search.showLegend(elementSet.search.options.regularExpressionReplacementLegend,
                twoStateRegularExpression.value && elementSet.search.inputReplace.checkVisibility());
        }; //adjustRegularExpressionReplacementLegendVisibility
        twoStateRegularExpression.onchangeState = value => {
            definitionSet.search.showLegend(elementSet.search.options.regularExpressionReplacementLegend,
                value && elementSet.search.inputReplace.checkVisibility());
            if (value) {
                twoStateSpecial.value = false;
                definitionSet.search.showLegend(elementSet.search.options.specialCaseLegend, false);
            } //if
        }; //twoStateRegularExpression.onchange
        return {
            matchCase: twoStateMatchCase,
            matchWholeWord: createTwoStateButton(elementSet.search.options.matchWholeWord, cssClassUp, cssClassDown),
            useRegularExpression: twoStateRegularExpression,
            useSpecialCharacters: twoStateSpecial,
            askConfirmation: createTwoStateButton(elementSet.search.options.askConfirmation, cssClassUp, cssClassDown, true),
            adjustRegularExpressionReplacementLegendVisibility,
        };
    })(definitionSet.search.optionClassName.up, definitionSet.search.optionClassName.down);

    const replaceSpecialCharacters = value => {
        for (const replacement of definitionSet.search.specialCharacterReplacements)
            value = value.replaceAll(replacement[0], replacement[1]);
        return value;
    }; //replaceSpecialCharacters

    let isShown = false;
    let findings, replacementIndex;
    const resetFindings = () => {
        findings = [];
        elementSet.search.findingsIndicator.textContent = definitionSet.empty;
    }; //resetFindings
    resetFindings();

    const prepareRegexp = (pattern, global) => {
        const ignoreCase = !searchOptionSet.matchCase.value;
        const useRegularExpression = searchOptionSet.useRegularExpression.value;
        const useSpecialCharacters = searchOptionSet.useSpecialCharacters.value;
        const flags = definitionSet.search.regularExpressionFlags(ignoreCase, global);
        if (useSpecialCharacters)
            pattern = replaceSpecialCharacters(pattern);
        if (!useRegularExpression)
            pattern = RegExp.escape(pattern);
        if (searchOptionSet.matchWholeWord.value)
            pattern = definitionSet.search.regularExpressionWholeWord(pattern);
        try {
            pattern = new RegExp(pattern, flags);
        } catch (exception) {
            definitionSet.search.regularExpressionException(exception, elementSet.editor);
            return null;
        } //exception
        return pattern;
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
        elementSet.editorAPI.isModified = true;
    }; //replaceAll

    const confirmationReplacer = (() => {
        let replaceString = definitionSet.empty;
        definitionSet.search.replaceConfirmation.subscribeToReplaceConfirmation(
            elementSet.editor,
            () => { //handler
                if (replacementIndex >= findings.length) {
                    const pattern = prepareRegexp(elementSet.search.inputFind.value, false); // non-global
                    if (pattern)
                        for (let index = findings.length - 1; index >= 0; --index) {
                            const finding = findings[index];
                            if (!finding[2]) continue; // false, that is, not confirmed
                            const sliceFirst = elementSet.editor.value.substring(0, finding[0]);
                            let sliceSecond = elementSet.editor.value.substring(finding[0]);
                            sliceSecond = sliceSecond.replace(pattern, replaceString);
                            elementSet.editor.value = sliceFirst + sliceSecond;
                            elementSet.editorAPI.isModified = true;
                        } //loop
                    resetFindings();
                    elementSet.editor.focus();
                    adHocUtility.scrollTo(elementSet.editor, 0, 0);                   
                    return;
                } //if
                const finding = findings[replacementIndex];
                const replacementPresentation = definitionSet.search.replaceConfirmation.replacementPresentation(
                    elementSet.editor.value, finding[0], finding[1]);
                const findingPositionStart = definitionSet.status.line(elementSet.editor.value, finding[0]);
                const findingPositionEnd = definitionSet.status.line(elementSet.editor.value, finding[1]);
                let findingLines = [findingPositionStart, findingPositionEnd];
                findingLines = definitionSet.search.replaceConfirmation.dialogMessageFormatLines(
                    [findingPositionStart, findingPositionEnd]);
                const baseAction = () => elementSet.editor.dispatchEvent(
                    definitionSet.search.replaceConfirmation.event);
                adHocUtility.replaceConfirmation(replacementPresentation.line, findingLines, replacementPresentation.finding,
                    () => { //yesAction
                        findings[replacementIndex++].push(true); baseAction(); },
                    () => { //noAction
                        replacementIndex++;  baseAction(); },
                    () => { //breakAction
                        replacementIndex = findings.length;  baseAction(); },
                ); //adHocUtility.replaceConfirmation                
            } //handler
        ); //subscribeToReplaceConfirmation
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
            replaceString = replaceSpecialCharacters(replaceString);
        if (searchOptionSet.askConfirmation.value) {
            confirmationReplacer.replaceString = replaceString;
            confirmationReplacer.replaceOneByOne();
        } else
            replaceAll(replaceString);
    }; //replace

    const canFindNext = () => {
        return findings && findings.length;
    }; //canFindNext

    const binaryBestSearch = (point, direction) => {
        const isGood = index =>
            direction
                ? findings[index][1] <= point
                : findings[index][0] >= point;
        const iteration = slice => {
            const length = slice[1] - slice[0];
            const trialPoint = direction
                ? slice[1] - Math.floor(length / 2)
                : slice[0] + Math.floor(length / 2);
            if (direction)
                return isGood(trialPoint)
                    ? [trialPoint, slice[1]]
                    : [slice[0], trialPoint - 1];
            else
                return isGood(trialPoint)
                    ? [slice[0], trialPoint]
                    : [trialPoint + 1, slice[1]];
        }; //iteration
        let slice = [0, findings.length - 1];
        while ((slice[1] - slice[0]) > 0)
            slice = iteration(slice);
        return isGood(slice[0])
            ? slice[0]
            : null;
    }; //binaryBestSearch
    const findNext = previous => {
        if (!findings) return;
        if (!findings.length) return;
        const location = previous ? elementSet.editor.selectionStart : elementSet.editor.selectionEnd;
        const bestIndex = binaryBestSearch(location, previous);
        if (bestIndex == null)
            return false;
        elementSet.editor.focus();
        adHocUtility.scrollTo(elementSet.editor, findings[bestIndex][0], findings[bestIndex][1]);
        return true;
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
        elementSet.search.findingsIndicator.textContent = result.length;
        return result;
    }; //result

    const findAllAPI = pattern => {
        findings = findAll(pattern);
    }; //findAllAPI

    const find = notFinal => {
        const value = elementSet.editor.value;
        if (!value) return;
        let searchString = elementSet.search.inputFind.value;
        if (!searchString) return;
        searchString = prepareRegexp(elementSet.search.inputFind.value, true); //global
        if (!searchString) return findings;
        findings = findAll(searchString);
        if (notFinal) return;
        if (!findings) return;
        if (!findings.length) return;
        if (elementSet.editor.selectionEnd != elementSet.editor.selectionStart)
            elementSet.editor.selectionEnd = elementSet.editor.selectionStart;
        if (!findNext()) findNext(true);
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

    const closeDialog = () => {
        elementSet.search.dialog.close();
        elementSet.editor.focus();
    }; //closeDialog

    window.addEventListener(definitionSet.events.keydown, event => {
        if (definitionSet.isShortcut(event, definitionSet.search.shorcutClose))
            closeDialog();
    }); //window on keydown
    elementSet.search.closeCross.onclick = closeDialog;

    elementSet.search.dialog.onclose = () => isShown = false;

    const searchDialog = {
        show: isReplaceView => {
            definitionSet.search.showInput(elementSet.search.inputReplace, isReplaceView);
            definitionSet.search.showButton(searchOptionSet.askConfirmation.element, isReplaceView);
            searchOptionSet.adjustRegularExpressionReplacementLegendVisibility();
            if (!isShown)
                elementSet.search.dialog.show();
            const focusControl = isReplaceView && !!elementSet.search.inputFind.value
                ? elementSet.search.inputReplace : elementSet.search.inputFind;
            focusControl.focus();
            isShown = true;
        },
        find,
        canFindNext,
        findNext,
        replace,
    }; //searchDialog
    
    return { searchDialog, api: { find: findAllAPI, canFindNextPrevious: canFindNext, findNextPrevious: findNext } };

};
