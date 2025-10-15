"use strict";

({

    name: `YYYY-MM-DD HH:MM-SS`,

    description: `Rationalized format, extended YYYY-MM-DD HH:MM-SS`,

    handler: api => {
        const utc = "UTC";
        const locale = "en-CA"; //sic!

        const time = new Date();
        const offsetMinutes = time.getTimezoneOffset();
        const sign = offsetMinutes > 0 ? String.fromCharCode(0x2212) : "+";
        const absOffsetMinutes = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffsetMinutes / 60);
        const minutes = absOffsetMinutes % 60;
        const formattedHours = String(hours).padStart(2, "0");
        const formattedMinutes = String(minutes).padStart(2, "0");
        const offset = `UTC${sign}${formattedHours}:${formattedMinutes}`;

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'longGeneric',
            hour12: false
        };

        const timeString = new Intl.DateTimeFormat(locale, options).format(time);

        options.timeZone = utc;
        const timemeStringUTC = new Intl.DateTimeFormat(locale, options).format(time);

        api.scrollTo(api.editor.selectionEnd, api.editor.selectionEnd);
        api.editor.setRangeText(api.newLine + timeString + api.blankSpace + offset
            + api.newLine + timemeStringUTC + api.blankSpace
        );
        api.isModified = true;
    }, //handler

    menuItemIndent: timeGroupIndent,

})
