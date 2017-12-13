import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const removeAllListeners = emitter.removeAllListeners.bind(emitter);

emitter.removeAllListeners = (...args) => {
  if (args.length === 0) {
    throw new Error('Specify Name');
  }
  removeAllListeners(...args);
};

emitter.on('error', () => {});

export default emitter;
