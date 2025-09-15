"use strict";

const createEditorAPI = (elementSet, searchAPI) => {

    elementSet.editorAPI = ((editor, searchAPI) => {

        let isModifiedFlag = false;
        const modifiedEventName = definitionSet.events.editorTextModified;
        const modifiedEvent = new Event(modifiedEventName);

        // ad-hoc Tab fix:
        window.addEventListener(definitionSet.events.keydown, event => {
            if (event.code != definitionSet.keys.Tab) return;
            if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.target != editor) return;
            const expectedTab = definitionSet.tabReplacement;
            event.target.setRangeText(expectedTab);
            const position = event.target.selectionStart + expectedTab.length;
            event.target.setSelectionRange(position, position);
            event.preventDefault();
        }); //window.addEventListener Tab fix

        const wordRegex = /[0123456789\w]+/g;
        const api = {
            subscribeToModified: handler => editor.addEventListener(modifiedEventName, handler),
            scrollTo: (start, end, select) =>
                adHocUtility.scrollTo(editor, start, end, select),
            scrollToSelection: () =>
                adHocUtility.scrollTo(
                    editor,
                    editor.selectionStart,
                    editor.selectionEnd),
            isCaseSensitive: text => text.toLowerCase() != text.toUpperCase(),
            find: pattern => searchAPI.find(pattern),
            findNext: () => searchAPI.findNextPrevious(false),
            findPrevious: () => searchAPI.findNextPrevious(true),
        }; //api

        editor.addEventListener(definitionSet.events.input, () => api.isModified = true);

        const getRangeLines = (start, end) => {
            const text = editor.value;
            let left = text.lastIndexOf(definitionSet.newLine, start - 1);
            if (left < 0) left = 0; else left += 1;
            let right = text.indexOf(definitionSet.newLine, end);
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
                get() { return editor;  },
            },
            currentLines: {
                get() { return getRangeLines(editor.selectionStart, editor.selectionEnd); },
            }, //currentLines
            nextLine: {
                get() { return gotoNextPreviousLine(1, 1, position => position >= editor.textLength); },
            }, //nextLine
            previousLine: {
                get() { return gotoNextPreviousLine(0, -1, position => position <= 0); },
            }, //previousLine
            currentWord: {
                get() {
                    if (editor.selectionStart >= editor.textLength - 1)
                        return [editor.selectionStart, editor.selectionEnd];
                    const lines = this.currentLines;
                    const slice = editor.value.slice(lines[0], lines[1]);
                    const position = editor.selectionStart - lines[0];
                    let array;
                    while ((array = wordRegex.exec(slice)) !== null) {
                        if (array.index <= position && position <= array.index + array[0].length)
                            return [lines[0] + array.index, lines[0] + array.index + array[0].length];
                    } //loop
                    return [editor.selectionStart, editor.selectionEnd];
                }, //currentWord getter
            }, //currentWord
            nextWord: {
                get() {
                   if (editor.selectionStart >= editor.textLength - 1)
                        return [editor.selectionStart, editor.selectionEnd];
                    const lines = this.currentLines;
                    const slice = editor.value.slice(lines[0], lines[1]);
                    const position = editor.selectionStart - lines[0];
                    let array;
                    while ((array = wordRegex.exec(slice)) !== null) {
                        if (array.index > position)
                            return [lines[0] + array.index, lines[0] + array.index + array[0].length];
                    } //loop
                    return [editor.selectionStart, editor.selectionEnd];
                 }, //nextWord getter
            }, //nextWord
            previousWord: {
                get() { throw "Error: to be implemented"; }, //return [editor.selectionStart, editor.selectionEnd]; },
            },
            newLine: { get() { return definitionSet.newLine; }},
            empty: { get() { return definitionSet.empty; }},
            blankSpace: { get() { return definitionSet.blankSpace; }},
            selectionLength: {
                get() { return editor.selectionEnd - editor.selectionStart; },
            }, //selectionLength
            selectedText: {
                get() { return editor.value.slice(editor.selectionStart, editor.selectionEnd); },
            }, //selectedText
            canFindNextPrevious: {
                get() { return searchAPI.canFindNextPrevious(); }
            }, //canFindNextPrevious
            isModified: {
                get() { return isModifiedFlag; },
                set(value) {
                    isModifiedFlag = value;
                    editor.dispatchEvent(modifiedEvent, isModifiedFlag);
                },
            }, //isModified
        }); // API properties

        return api;
        
    })(elementSet.editor, searchAPI);

};
