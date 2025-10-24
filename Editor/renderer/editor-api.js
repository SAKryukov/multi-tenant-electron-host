"use strict";

const createEditorAPI = (elementSet, searchAPI, pluginAPI) => {

    elementSet.editorAPI = ((editor, searchAPI, pluginAPI) => {

        let isModifiedFlag = false;
        const modifiedEventName = definitionSet.events.editorTextModified;
        const modifiedEvent = new Event(modifiedEventName);
        const selectionStack = [];

        // ad-hoc Tab fix:
        window.addEventListener(definitionSet.events.keydown, event => {
            if (event.code != definitionSet.keys.Tab) return;
            if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target != editor) return;
            const expectedTab = definitionSet.editorAPI.tabReplacement;
            event.target.setRangeText(expectedTab);
            editor.dispatchEvent(modifiedEvent, true);
            const position = event.target.selectionStart + expectedTab.length;
            event.target.setSelectionRange(position, position);
            event.preventDefault();
        }); //window.addEventListener Tab fix

        const api = {
            subscribeToModified: handler => editor.addEventListener(modifiedEventName, handler),
            cursorToPosition: (line, column) => {
                if (line < 0) line = 1;
                if (column < 0) column = 1;
                const lines = editor.value.substring(0).split(definitionSet.characters.newLine);
                if (line > lines.length)
                    line = lines.length;
                if (lines < 1) return;
                let position = 0;
                for (let index = 0; index < line - 1; ++index)
                    position += lines[index].length + 1;
                const maxLength = lines[line - 1].length;
                if (column > maxLength)
                    column = maxLength + 1;
                position += column - 1;
                return position;
            }, //cursorToPosition
            positionToCursor: position => {
                const lines = editor.value.substring(0, position).split(definitionSet.characters.newLine);
                const row = lines.length;
                const column = lines[lines.length-1].length + 1;
                return [row, column];
            }, //positionToCursor
            scrollTo: (start, end) =>
                adHocUtility.scrollTo(editor, start, end),
            scrollToSelection: () =>
                adHocUtility.scrollTo(
                    editor,
                    editor.selectionStart,
                    editor.selectionEnd),
            find: pattern => searchAPI.find(pattern),
            findNext: () => searchAPI.findNextPrevious(false),
            findPrevious: () => searchAPI.findNextPrevious(true),
            pushSelection: () => selectionStack.push([editor.selectionStart, editor.selectionEnd]),
            popSelection: toMove => {
                const location = selectionStack.pop();
                if (toMove)
                    adHocUtility.scrollTo(editor, location[0], location[1]);
                return location;
            }, //popSelection
            clearSelectionStack: () => selectionStack.length = 0,
        }; //api

        editor.addEventListener(definitionSet.events.input, () => api.isModified = true);

        const getRangeLines = (start, end) => {
            const text = editor.value;
            let left = text.lastIndexOf(definitionSet.characters.newLine, start - 1);
            if (left < 0) left = 0; else left += 1;
            let right = text.indexOf(definitionSet.characters.newLine, end);
            if (right < 0) right = editor.textLength - 1;
            return [left, right];
        }; //getRangeLines

        const gotoNextPreviousLine = (currentIndex, increment, condition) => {
            const current = api.currentLines;
            let position = current[currentIndex] + increment;
            if (condition(position))
                return current;
            return getRangeLines(position, position);
        }; //gotoNextPreviousLine

        Object.defineProperties(api, {
            editor: {
                get() { return editor; },
                enumerable: true,
            },
            currentLines: {
                get() { return getRangeLines(editor.selectionStart, editor.selectionEnd); },
                enumerable: true,
            }, //currentLines
            nextLine: {
                get() { return gotoNextPreviousLine(1, 1, position => position >= editor.textLength); },
                enumerable: true,
            }, //nextLine
            previousLine: {
                get() { return gotoNextPreviousLine(0, -1, position => position <= 0); },
                enumerable: true,
            }, //previousLine
            currentWord: {
                get() {
                    if (editor.selectionStart >= editor.textLength - 1)
                        return [editor.selectionStart, editor.selectionEnd];
                    const lines = this.currentLines;
                    const slice = editor.value.slice(lines[0], lines[1]);
                    const position = editor.selectionStart - lines[0];
                    let array;
                    const wordRegex = definitionSet.editorAPI.newGlobalRegExp();
                    while ((array = wordRegex.exec(slice)) !== null) {
                        if (array.index <= position && position <= array.index + array[0].length)
                            return [lines[0] + array.index, lines[0] + array.index + array[0].length];
                    } //loop
                    return [editor.selectionStart, editor.selectionEnd];
                }, //currentWord getter
                enumerable: true,
            }, //currentWord
            nextWord: {
                get() {
                   if (editor.selectionStart >= editor.textLength - 1)
                        return [editor.selectionStart, editor.selectionEnd];
                    const lines = this.currentLines;
                    const slice = editor.value.slice(lines[0], lines[1]);
                    const position = editor.selectionStart - lines[0] + 1;
                    let array;
                    const wordRegex = definitionSet.editorAPI.newGlobalRegExp();
                    while ((array = wordRegex.exec(slice)) !== null) {
                        if (array.index >= position)
                            return [lines[0] + array.index, lines[0] + array.index + array[0].length];
                    } //loop
                    return [editor.selectionStart, editor.selectionEnd];
                 }, //nextWord getter
                enumerable: true,
            }, //nextWord
            previousWord: {
                get() {
                   if (editor.selectionStart >= editor.textLength - 1)
                        return [editor.selectionStart, editor.selectionEnd];
                    const lines = this.currentLines;
                    const slice = editor.value.slice(lines[0], lines[1]);
                    const position = editor.selectionStart - lines[0] - 1;
                    let array;
                    const findings = [];
                    const wordRegex = definitionSet.editorAPI.newGlobalRegExp();
                    while ((array = wordRegex.exec(slice)) !== null)
                        findings.push({ index: array.index, length: array[0].length });
                    if (findings.length < 0)
                        return [editor.selectionStart, editor.selectionEnd];
                    for (let index = findings.length - 1; index >= 0; --index) {
                        const finding = findings[index];
                        if (finding.index <= position)
                            return [lines[0] + finding.index, lines[0] + finding.index + finding.length];
                    } //loop
                    return [editor.selectionStart, editor.selectionEnd];
                }, //previousWord getter
                enumerable: true,
            }, //previousWord
            newLine: { get() { return definitionSet.characters.newLine; }, enumerable: true, },
            empty: { get() { return definitionSet.characters.empty; }, enumerable: true, },
            blankSpace: { get() { return definitionSet.characters.blankSpace; }, enumerable: true, },
            defaultIndent: { get() { return definitionSet.editorAPI.tabReplacement; }, enumerable: true, },
            selectionLength: {
                get() { return editor.selectionEnd - editor.selectionStart; },
                enumerable: true,
            }, //selectionLength
            selectedText: {
                get() { return editor.value.slice(editor.selectionStart, editor.selectionEnd); },
                enumerable: true,
            }, //selectedText
            canFindNextPrevious: {
                get() { return searchAPI.canFindNextPrevious(); },
                enumerable: true,
            }, //canFindNextPrevious
            isModified: {
                get() { return isModifiedFlag; },
                set(value) {
                    isModifiedFlag = value;
                    editor.dispatchEvent(modifiedEvent, isModifiedFlag);
                },
                enumerable: true,
            }, //isModified
            pluginAPI: {
                get() { return pluginAPI; },
                enumerable: true,
            }, //pluginAPI
        }); // API properties

        return api;

    })(elementSet.editor, searchAPI, pluginAPI);

};
