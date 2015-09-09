angular.module('yes.utils').factory('interpreter', ["$stateParams", "oPath", "utils",
    function ($stateParams, oPath, utils) {

        var settings = utils.settings;
        var injector = angular.element('body').injector();

        var getConfig = function (name, pageName) {
            var service = name + ".config";
            if (injector.has(service)) {

                var config = injector.get(service);
                if (config.hasOwnProperty(pageName))
                    return config[pageName];
            }
            return null;
        };

        var invoke = function (fn, context) {
            if (angular.isFunction(fn)) {
                injector.invoke(fn, context);
            } else if (angular.isArray(fn)) {
                angular.forEach(fn, function (f) {
                    invoke(f, context);
                });
            }
        };

        var explainOperations = function (config, scope) {

            var ops = oPath.get(config, 'operation', []);
            if (!ops)
                return config;

            var operations = [];
            var defaults = {
                add: {
                    'name': '新建',
                    'action': scope.action.create
                },
                del: {
                    'name': '删除',
                    'action': scope.action.del
                }
            };
            var context = {scope: scope};

            angular.forEach(ops, function (op, key) {
                if (op) {
                    var entry = defaults[key] || {'name': op.name, action: op.action};
                    if (angular.isFunction(op.action)) {
                        entry.action = function () {
                            injector.invoke(op.action, context);
                        };
                    }
                    operations.push(entry);
                }
            });
            config.operations = operations;
            return config;
        };

        var explainList = function (config, scope) {
            var context = {scope: scope, list: config.list};
            var resolves = oPath.get(config, 'list.resolves', []);
            invoke(resolves, context);
            return config
        };

        var overrideDefault = function (config, property, defaultValue) {
            if (config) {
                config[property] = config[property] || angular.copy(defaultValue);
            }
        };

        var overrideProperties = function (target, defaults) {
            if (!target)
                throw ('can not override properties with null');
            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    overrideDefault(target, prop, defaults[prop]);
                }
            }
        };

        var explainForm = function (config, scope) {

            var properties = oPath.get(config, 'schema.properties', {});
            if (angular.isArray(properties)) {
                config.schema.properties = utils.array2Object(properties, 'key');
            }

            var context = {scope: scope, form: config.form};

            if (angular.isArray(config.form)) {
                angular.forEach(config.form, function (form) {
                    angular.forEach(form.items, function (entry) {
                        if (entry.type == 'datepicker' || entry.type == 'datetimepicker') {
                            entry.title = entry.title || config.schema.properties[entry.key].title;
                            entry.open = function ($event) {
                                $event.preventDefault();
                                $event.stopPropagation();
                                entry.opened = true;
                            };
                        }
                        if (angular.isObject(entry)) {
                            entry.required = entry.required || config.schema.properties[entry.key].required;
                        }
                    });
                });
            }

            var resolves = oPath.get(config, 'resolves', []);
            invoke(resolves, context);
            return config;
        };

        var getFullTemplatePath = function (path) {

            if (angular.isUndefined(path))
                return;

            if (path.indexOf('http') == 0 || path.indexOf('plugins') > -1)
                return path;

            var template = [settings.pluginFolder, $stateParams.name, 'templates', path].join('/').replace(/\/\//g, '/');

            return [utils.root, template].join('/');
        };

        var getDefaultSettings = function () {
            var defaults = getConfig($stateParams.name, 'defaults') || {};
            defaults = angular.extend({list: {}, form: {}}, defaults);
            overrideDefault(defaults.form, 'template', [utils.root, settings.templates.detail].join('/'));
            overrideDefault(defaults.list, 'template', [utils.root, settings.templates.list].join('/'));
            overrideDefault(defaults.list, 'pageSize', settings.pageSize['defaults']);
            return defaults;
        };

        return {
            configuration: function (scope) {
                var defaultSettings = getDefaultSettings();
                var config = getConfig($stateParams.name, $stateParams.page) || {};

                overrideDefault(config, 'form', {});
                overrideDefault(config, 'list', {});

                overrideProperties(config.form, defaultSettings.form);
                overrideProperties(config.list, defaultSettings.list);


                config.list.template = getFullTemplatePath(config.list.template);
                config.form.template = getFullTemplatePath(config.form.template);

                config = explainOperations(config, scope);

                //config.form = explainOperations(config, scope);  //TODO;

                //validateAuthority(config.form.operations);
                //validateAuthority(config.list.operations);

                config = explainList(config, scope);
                config.form = explainForm(config.form, scope);
                return config
            }
        };

    }]);