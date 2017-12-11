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
  const classes = position.replace('_', ' ');
  const parentWrapper = document.getElementsByClassName(classes);
  if (parentWrapper.length > 0) {
    const wrapper = parentWrapper[0].getElementsByClassName('container');
    if (wrapper.length > 0) {
      return wrapper[0];
    }
  }
}

export const positions = [
  'top_ bar',
  'top_left',
  'top_center',
  'top_right',
  'upper_third',
  'middle_center',
  'lower_third',
  'bottom_left',
  'bottom_center',
  'bottom_right',
  'bottom_bar',
  'fullscreen_above',
  'fullscreen_below'
];
