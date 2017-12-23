import React from 'react';
export function shorten(stringToShorten: string, maxLength: number = 25, wrapEvents: boolean) {
  if (wrapEvents) {
    let temp = '';
    let currentLine = '';
    const words = stringToShorten.split(' ');

    words.forEach((word) => {
      if (currentLine.length + word.length < maxLength - 1) { // max - 1 to account for a space
        currentLine += `${word} `;
      } else {
        if (currentLine.length > 0) {
          temp += (<span>{currentLine}<br />{word} </span>);
        } else {
          temp += (<span>{word}<br /></span>);
        }
        currentLine = '';
      }
    });
    return (temp + currentLine).trim();
  }

  if (stringToShorten.length > maxLength) {
    return `${stringToShorten.trim().slice(0, maxLength)}&hellip;`;
  }

  return stringToShorten.trim();
}

export function capFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function titleTransform(title, configReplacements, maxTitleLength, wrapEvents) {
  for (let needle in configReplacements) {
    const replacement = configReplacements[needle];

    const regParts = needle.match(/^\/(.+)\/([gim]*)$/);
    if (regParts) {
      // the parsed pattern is a regexp.
      needle = new RegExp(regParts[1], regParts[2]);
    }

    title = title.replace(needle, replacement);
  }
  title = shorten(title, maxTitleLength, wrapEvents);
  return title;
}

export function isFullDayEvent(event) {
  if (event.start.length === 8) {
    return true;
  }

  const start = event.start || 0;
  const startDate = new Date(start);
  const end = event.end || 0;
  if (end - start === 24 * 60 * 60 * 1000 && startDate.getHours() === 0 && startDate.getMinutes() === 0) {
    // Is 24 hours, and starts on the middle of the night.
    return true;
  }

  return false;
}
