export default {
  kioskmode: false,
  electronOptions: {},
  language: 'en',
  timeFormat: 24,
  units: 'metric',
  zoom: 1,
  customCss: 'css/custom.css',
  modules: [
    {
      module: 'updatenotification',
      position: 'top_center'
    },
    {
      module: 'helloworld',
      position: 'upper_third',
      classes: 'large thin',
      config: {
        text: 'Magic Mirror<sup>2</sup>'
      }
    },
    {
      module: 'helloworld',
      position: 'middle_center',
      config: {
        text: 'Please create a config file.'
      }
    },
    {
      module: 'helloworld',
      position: 'middle_center',
      classes: 'small dimmed',
      config: {
        text: 'See README for more information.'
      }
    },
    {
      module: 'helloworld',
      position: 'middle_center',
      classes: 'xsmall',
      config: {
        text: 'If you get this message while your config file is already<br>created, your config file probably contains an error.<br>Use a JavaScript linter to validate your file.'
      }
    },
    {
      module: 'helloworld',
      position: 'bottom_bar',
      classes: 'xsmall dimmed',
      config: {
        text: 'www.michaelteeuw.nl'
      }
    },
  ],

  paths: {
    modules: 'modules',
    vendor: 'vendor'
  },
};
