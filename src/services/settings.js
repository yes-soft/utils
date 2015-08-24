angular.module('yes.settings', []).provider('settings', [function () {

    var self = this;

    //default settings;
    self.settings = {
        version: "0.0.0",
        language: navigator.language || navigator.userLanguage,
        templates: {
            'layout': 'base/templates/layout.html',
            'login': 'base/templates/login.html',
            'dashboard': 'base/templates/dashboard.html',
            'list': 'base/templates/list.uigrid.html',
            'detail': 'base/templates/detail.html',
            'searchCommon': 'base/templates/search-common.html'
        },
        host: 'self',
        mock: true,
        debug: true,
        pageSize: {
            defaults: 20,
            more: 10
        },
        headers: {'Content-Type': 'application/json'},
        menuRoot: null,
        menuApi: 'base/menus',
        apiPath: "api",
        serverRoot: 'src',
        pluginFolder: 'plugins'
    };

    self.setSettings = function (settings) {
        self.settings = settings;
    };

    self.getSettings = function () {
        return self.settings;
    };

    this.$get = function () {
        return self.settings;
    };
}]);
