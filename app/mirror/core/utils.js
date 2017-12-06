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

export function getWrapperStyle(position: string) {
  let classes = position.replace('_', ' ');
  var parentWrapper = document.getElementsByClassName(classes);
  if (parentWrapper.length > 0) {
    var wrapper = parentWrapper[0].getElementsByClassName('container');
    if (wrapper.length > 0) {
      return wrapper[0];
    }
  }
}
