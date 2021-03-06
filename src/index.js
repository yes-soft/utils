'use strict';
angular.module('yes.utils', ['yes.auth', 'yes.settings','oc.lazyLoad']);
angular.module('yes.utils').provider('utils', ['settingsProvider',
    function (settingsProvider) {
        var self = this;

        var services = {};
        self.settings = settingsProvider.getSettings();
        self.getSettings = settingsProvider.getSettings;
        self.setSettings = settingsProvider.setSettings;
        services.settings = self.settings;
        self.getService = function (name) {
            var injector = angular.element('body').injector();
            if (injector.has(name))
                return injector.get(name);
            return {};
        };

        self.addModule = function (name, service) {
            services[name] = service;
        };

        this.$get = function () {

            return services;
        };
    }]);