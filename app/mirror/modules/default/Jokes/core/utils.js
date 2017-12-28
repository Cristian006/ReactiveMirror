import request from 'request';

export function getJoke(callback) {
  request({
    url: 'https://icanhazdadjoke.com/',
    headers: { Accept: 'application/json' }
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const info = JSON.parse(body);
      callback(info.joke);
    } else {
      callback('couldn\'t get any jokes');
    }
  });
}
