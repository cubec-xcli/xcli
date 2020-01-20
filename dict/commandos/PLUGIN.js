const enquirerSelectKeyMapInfo = require('../../core/utils/tools/std/enquirerSelectKeyMapInfo');
const enquirerInputKeyMapInfo = require('../../core/utils/tools/std/enquirerInputKeyMapInfo');

module.exports = {
  PLUGIN_SELECT_COMMAND_TYPE: "Select the type of command action",
  PLUGIN_UPDATE_COMMAND_INTERRUPTED: "plugin update process interrupted",
  PLUGIN_UPDATE_SELECT_REQUIRED: enquirerSelectKeyMapInfo("Select plugin for update"),
  PLUGIN_UPDATE_SUCCESS_COMPLETED: "all plugins were updated to latest version",
  PLUGIN_UPDATE_NOSELECT: "no select plugin for update",
  PLUGIN_UPDATE_NOEXIST_PLUGIN: "not find current plugin exist and install ",
  PLUGIN_UPDATE_ALREADY_LATEST_VERSION: "all plugins already hold on latest version",
  PLUGIN_UNINSTALL_SELECT_REQUIRED: enquirerSelectKeyMapInfo("Select plugins need uninstall"),
  PLUGIN_UNINSTALL_SUCCESSED: "uninstall plugins success",
  PLUGIN_UNINSTALL_NOPLUGINS_SELECTED: "no plugins selected for uninstall",
  PLUGIN_LIST_COMMAND_INTERRUPTED: "plugin list preview interrupted",
  PLUGIN_LIST_NOTPLUGIN_FOUND: "not plugins find install for xcli",
  PLUGIN_INSTALL_PLUGINNAME_REQUIRED: "Input plugin name for remote install",
  PLUGIN_INSATLL_REJECT_UN_ABCXJSON_CHECKER: "the plugin is not standard xcli plugin abcx.json, it can not be install",
  PLUGIN_INSTALL_CHOICE_PLUGINNAME: enquirerInputKeyMapInfo("Please select the plugin need to install"),
};
