/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

function extendConf(conf, api) {

  // register boot files
  if (api.prompts.types.includes('address')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-address.js');
  }
  if (api.prompts.types.includes('autocomplete')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-autocomplete.js');
  }
  if (api.prompts.types.includes('date')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-date.js');
  }
  if (api.prompts.types.includes('extended')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-extended.js');
  }
  if (api.prompts.types.includes('list')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-list.js');
  }
  if (api.prompts.types.includes('pers-photo')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-pers-photo.js');
  }
  if (api.prompts.types.includes('select')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-select.js');
  }
  if (api.prompts.types.includes('address')) {
    conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-upload.js');
  }

  conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input-text.js');
  conf.boot.push('~quasar-app-extension-db-input/src/boot/register-db-input.js');

  // transpile
  conf.build.transpileDependencies.push(/quasar-app-extension-db-input[\\/]src/)

  // css goes through webpack to avoid ssr issues
  conf.css.push('~quasar-app-extension-db-input/src/component/DbInput.styl')
}

module.exports = function (api) {
  // (Optional!)
  // Quasar compatibility check; you may need
  // hard dependencies, as in a minimum version of the "quasar"
  // package or a minimum version of "@quasar/app" CLI
  api.compatibleWith('quasar', '^1.8.0')
  api.compatibleWith('@quasar/app', '^1.5.0')

  // Here we extend /quasar.conf.js, so we can add
  // a boot file which registers our new UI component;
  // "extendConf" will be defined below (keep reading the tutorial)
  api.extendQuasarConf(extendConf, api)
}
