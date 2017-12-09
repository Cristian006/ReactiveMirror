import config from '../config/config';

const { modules } = config;
const loaderHelp = require.context('common', true, /index.js$/);

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

export default function getModules() {
  const components = {};
  const allModules = requireAll(loaderHelp);
  // For each component in the config fiel into an object
  for (let i = modules.length - 1; i >= 0; i -= 1) {
    if (modules[i].hide) continue;
    for (let j = 0; j < allModules.length; j += 1) {
      if (modules[i].name === allModules[j].moduleName) {
        components[modules[i].name] = allModules[j];
        break;
      }
    }
  }
  return components;
}
