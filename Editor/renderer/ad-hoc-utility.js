"use strict";

const adHocUtility = (() => {

    let persistGotoLine = null, persistGotoLineColumn = null;

    const implementation = {
        measure: null,
        scrollTo: function(editor, start, end) {
            if (this.measure == null) {
                const measureBig = elementSet.search.measure.big;
                const measureSmall = elementSet.search.measure.small;
                let lineHeight = measureBig.offsetHeight - measureSmall.offsetHeight;
                const columnWidth = measureBig.offsetWidth - measureSmall.offsetWidth;
                this.measure = { lineHeight, columnWidth };
                Object.freeze(implementation);
            } //if
            const lineHeight = this.measure.lineHeight;
            const columnWidth = this.measure.columnWidth;
            const text = editor.value;
            let left = editor.value.lastIndexOf(definitionSet.newLine, start);
            if (left < 0) left = 0; else left += 1;
            const sliceX = text.slice(left, end);
            const sliceY = text.substring(0, end).split(definitionSet.newLine);
            let scrollTop = (sliceY.length + 2) * lineHeight;
            let scrollLeft = (sliceX.length + 1) * columnWidth;
            const editorHeight = editor.clientHeight;
            const editorWidth = editor.clientWidth;
            scrollTop = scrollTop - editorHeight;
            if (scrollTop < 0) scrollTop = 0;
            scrollLeft = scrollLeft - editorWidth;
            if (scrollLeft < 0) scrollLeft = 0;
            editor.scrollTop = scrollTop;
            editor.scrollLeft = scrollLeft;
            editor.setSelectionRange(start, end);
        }, //scrollTo
        decimalDidits: "0123456789",
        filterOut: (element, characters) =>
            element.onkeydown = event => {
                if (event.key && event.key.length == 1 && characters.indexOf(event.key) < 0)
                    event.preventDefault();
            }, //filter out
        goto: function() {
            const editor = elementSet.editor;
            const section = document.createElement(definitionSet.elements.section);
            const createLine = (text, title, value) => {
                const line = document.createElement(definitionSet.elements.p);
                const legend = document.createElement(definitionSet.elements.span);
                legend.textContent = text;
                const input = document.createElement(definitionSet.elements.input);
                input.value = value;
                input.title = title;
                input.placeholder = title;
                input.style.paddingLeft = input.style.paddingRight = "1em";
                this.filterOut(input, this.decimalDidits);
                line.style.display = "flex";
                line.style.flexDirection = "row";
                line.style.alignItems = "center";
                line.style.justifyContent = "space-between";
                line.style.marginTop = "0.2em";
                line.appendChild(legend);
                line.appendChild(input);
                return { line, input };
            }; //createLine
            const lineLine = createLine("Line: ", "Line to go",
                persistGotoLine ? persistGotoLine : null);
            const lineColumn = createLine("Column: ", "Column to go",
                persistGotoLineColumn ? persistGotoLineColumn : null);
            section.appendChild(lineLine.line);
            section.appendChild(lineColumn.line);
            section.appendChild(document.createElement(definitionSet.elements.br));
            modalDialog.show(section, {
                buttons: [
                    {   text: "Go to Line/Column",
                        isDefault: true, isEnter: true, 
                        action: () => {
                            let line = lineLine.input.value.trim();
                            let column = lineColumn.input.value.trim();
                            if (!line) line = 1;
                            if (!column) column = 1;
                            line = parseInt(line);
                            column = parseInt(column);
                            const position = elementSet.editorAPI.cursorToPosition(line, column);
                            editor.focus();
                            this.scrollTo(editor, position, position, true);
                            persistGotoLine = lineLine.input.value.trim();
                            persistGotoLineColumn = lineColumn.input.value.trim();
                            lineColumn.line.value = persistGotoLineColumn;
                        }, //goto action
                    }, // button Go to
                    { text: "Close", isEscape: true, action: () => editor.focus() },
                ],
                options: { initialFocus: lineLine.input },
            });
        }, //goto
        replaceConfirmation: function(line, findingLines, finding, yesAction, noAction, breakAction) {
            const lineFirst = line.slice(0, finding[0]);
            const middle = line.slice(finding[0], finding[1]);
            const lineLast = line.substring(finding[1]);
            const spanFirst = document.createElement(definitionSet.elements.span);
            spanFirst.textContent = lineFirst;
            const spanMiddle = document.createElement(definitionSet.elements.span);
            spanMiddle.textContent = middle;
            setTimeout(() =>  spanMiddle.scrollIntoView({ behavior: "smooth" })); 
            const spanLast = document.createElement(definitionSet.elements.span);
            spanLast.textContent = lineLast;
            const container = document.createElement(definitionSet.elements.p);
            const found = document.createElement(definitionSet.elements.p);
            found.textContent = `Found in ${findingLines}:`;
            const question = document.createElement(definitionSet.elements.p);
            question.textContent = "Replace?";
            const textArea = document.createElement(definitionSet.elements.pre);
            textArea.spellcheck = false;
            textArea.tabIndex = 0;
            textArea.readOnly = true;
            const fontFamily = "monospace";
            const textAreaVerticalGap = "0.2em"; 
            question.style.marginTop = "0.8em";
            question.style.marginBottom = "1em";
            for (const element of [textArea, spanFirst, spanMiddle, spanLast]) {
                element.style.fontFamily = fontFamily;
            } //loop
            textArea.style.fontSize = "140%";
            textArea.style.width = "40em"; // the problem is: it is critical but ad-hoc, depends on two properties above
            textArea.style.backgroundColor = "hsl(203, 92%, 96%, 100%)";
            textArea.style.border = "solid thin black";
            textArea.appendChild(spanFirst);
            textArea.appendChild(spanMiddle);
            textArea.appendChild(spanLast);
            spanMiddle.style.color = "yellow";
            spanMiddle.style.backgroundColor = "blue";
            container.style.margin = 0;
            textArea.style.margin = 0;
            textArea.style.height = "2em";
            textArea.style.overflowX = "scroll";
            textArea.style.padding = "1em";
            textArea.style.marginTop = textAreaVerticalGap;
            textArea.style.marginBottom = textAreaVerticalGap;
            container.appendChild(found);
            container.appendChild(textArea);
            container.appendChild(question);
            modalDialog.show(container, { buttons: [
                { text: "Yes", isDefault: true, action: yesAction, },
                { text: "No", action: noAction, },
                { text: "Complete Replacements", action: breakAction, },
                { isEscape: true, text: "Cancel All Replacements", action: () => elementSet.editor.focus() },
            ]});
        }, //replaceConfirmation
    }; //implementation

    return implementation;
    
})(); //adHocUtility
