"use strict";

({

    name: `Custom, From Selected Locale`,

    description: `Current time with optional locale in selection.
        <br/>Example: highlight ${String.fromCharCode(0x201C)}en-GB${String.fromCharCode(0x201D)}
        <br/>If no locale code is specified, default system format is assumed.`,

    handler: api => {

        api.pushSelection();
        const utc = "UTC";

        const getLocale = () => {
            let locale = api.selectedText.trim();
            if (!locale)
                locale = new Intl.Locale(navigator.language).region;
            return locale;
        }; //getLocaleAndUTC
        const locale = getLocale();

        const time = new Date();
        const offsetMinutes = time.getTimezoneOffset();
        const sign = offsetMinutes > 0 ? String.fromCharCode(0x2212) : "+";
        const absOffsetMinutes = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffsetMinutes / 60);
        const minutes = absOffsetMinutes % 60;
        const formattedHours = String(hours).padStart(2, "0");
        const formattedMinutes = String(minutes).padStart(2, "0");
        const offset = `UTC${sign}${formattedHours}:${formattedMinutes}`;
        const options = { dateStyle: "full", timeStyle: "full" };

        const timeString = new Intl.DateTimeFormat(locale, options).format(time);

        options.timeZone = utc;
        const timemeStringUTC = new Intl.DateTimeFormat(locale, options).format(time);

        api.scrollTo(api.editor.selectionEnd, api.editor.selectionEnd);
        api.editor.setRangeText(api.newLine + timeString + api.blankSpace + offset
            + api.newLine + timemeStringUTC + api.blankSpace
        );
        api.popSelection(true);
        api.isModified = true;
    }, //handler

    menuItemIndent: timeGroupIndent,

})
