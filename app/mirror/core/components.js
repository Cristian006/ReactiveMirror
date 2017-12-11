import config from '../config/config';
import React from 'react';

const { modules } = config;
const loaderHelp = require.context('common', true, /index.js$/);

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

export default function getModules() {
  const comps = {};
  const allMods = requireAll(loaderHelp);
  modules.filter((mod) => {
    return !mod.hide;
  }).map((item) => {
    for (let j = 0; j < allMods.length; j += 1) {
      if (item.name === allMods[j].moduleName) {
        const MOD = allMods[j];
        if (item.position in comps) {
          comps[item.position] = [
            ...comps[item.position],
            <MOD key={item.name} {...item} />
          ];
        } else {
          comps[item.position] = [<MOD key={item.name} {...item} />];
        }
        break;
      }
    }
  });
  return comps;
}
