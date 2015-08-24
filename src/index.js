'use strict';
angular.module('yes.utils', ['yes.auth']);
angular.module('yes.utils').provider('utils', [
    function () {
        var self = this;
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
            runtime: {
                menuRoot: null,
                menuApi: 'base/menus',
                apiPath: "api",
                serverRoot: 'src',
                pluginFolder: 'plugins'
            }
        };

        var services = {};

        self.getSettings = function () {
            return self.settings;
        };

        self.getService = function (name) {
            var injector = angular.element('body').injector();
            if (injector.has(name))
                return injector.get(name);
            return {};
        };

        self.addModule = function (name, service) {
            services[name] = service;
        };

        var setSettings = function (settings) {
            self.settings = settings;
        };

        this.$get = function () {

            return services;
        };
    }]);