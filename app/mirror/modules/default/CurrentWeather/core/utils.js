/* function(temperature)
  * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
  *
  * argument temperature number - Temperature.
  *
  * return string - Rounded Temperature.
  */
export function roundValue(temperature, roundTemp) {
  const decimals = roundTemp ? 0 : 1;
  return parseFloat(temperature).toFixed(decimals);
}

/* ms2Beaufort(ms)
  * Converts m2 to beaufort (windspeed).
  *
  * see:
  *  http://www.spc.noaa.gov/faq/tornado/beaufort.html
  *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
  *
  * argument ms number - Windspeed in m/s.
  *
  * return number - Windspeed in beaufort.
  */
export function ms2Beaufort(ms) {
  const kmh = ((ms * 60 * 60) / 1000);
  const speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];

  for (let i = 0; i < speeds.length; i += 1) {
    const speed = speeds[speeds[i]];
    if (speed > kmh) {
      return speeds[i];
    }
  }
  return 12;
}

export function deg2Cardinal(deg) {
  if (deg > 11.25 && deg <= 33.75) {
    return 'NNE';
  } else if (deg > 33.75 && deg <= 56.25) {
    return 'NE';
  } else if (deg > 56.25 && deg <= 78.75) {
    return 'ENE';
  } else if (deg > 78.75 && deg <= 101.25) {
    return 'E';
  } else if (deg > 101.25 && deg <= 123.75) {
    return 'ESE';
  } else if (deg > 123.75 && deg <= 146.25) {
    return 'SE';
  } else if (deg > 146.25 && deg <= 168.75) {
    return 'SSE';
  } else if (deg > 168.75 && deg <= 191.25) {
    return 'S';
  } else if (deg > 191.25 && deg <= 213.75) {
    return 'SSW';
  } else if (deg > 213.75 && deg <= 236.25) {
    return 'SW';
  } else if (deg > 236.25 && deg <= 258.75) {
    return 'WSW';
  } else if (deg > 258.75 && deg <= 281.25) {
    return 'W';
  } else if (deg > 281.25 && deg <= 303.75) {
    return 'WNW';
  } else if (deg > 303.75 && deg <= 326.25) {
    return 'NW';
  } else if (deg > 326.25 && deg <= 348.75) {
    return 'NNW';
  } else {
    return 'N';
  }
}
