import config from '../config/config';

export function getConfig(moduleName: string) {
  const { modules } = config;
  for (let i = 0; i < modules.length; i += 1) {
    if (moduleName === modules[i].module) {
      return modules[i];
    }
  }
  return {};
}
