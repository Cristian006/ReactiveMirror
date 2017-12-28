export const defaultCompliments = {
  anytime: [
    'Hey there beautiful!'
  ],
  morning: [
    'Good morning, !',
    'Enjoy your day!',
    'How was your sleep?'
  ],
  afternoon: [
    'Hello, beauty!',
    'You look gorgeous!',
    'Looking good today!'
  ],
  evening: [
    'Wow, you look great!',
    'You look nice!',
    'Hi, hot stuff!'
  ]
};

export function getRandom(length: number) {
  return Math.floor(Math.random() * length);
}

export function complimentFile(remoteFile, callback) {
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', remoteFile, true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState === 4 && xobj.status === '200') {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

export const weatherIconTable = {
  '01d': 'day_sunny',
  '02d': 'day_cloudy',
  '03d': 'cloudy',
  '04d': 'cloudy_windy',
  '09d': 'showers',
  '10d': 'rain',
  '11d': 'thunderstorm',
  '13d': 'snow',
  '50d': 'fog',
  '01n': 'night_clear',
  '02n': 'night_cloudy',
  '03n': 'night_cloudy',
  '04n': 'night_cloudy',
  '09n': 'night_showers',
  '10n': 'night_rain',
  '11n': 'night_thunderstorm',
  '13n': 'night_snow',
  '50n': 'night_alt_cloudy_windy'
};
