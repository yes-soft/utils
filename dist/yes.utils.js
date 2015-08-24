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
angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var async = function (method, uri, entry, _headers) {

            var $http = utilsProvider.getService('$http');
            var $q = utilsProvider.getService('$q');
            var settings = utilsProvider.getSettings();

            var options = {
                "method": method,
                "url": uri,
                "cache": false,
                "headers": _headers || settings.headers
            };

            if (entry) {
                angular.forEach(entry, function (raw, key) {
                    if (raw == "") {
                        delete entry[key];
                    }
                });
            }

            if (entry
                && (method.toLowerCase() == "post" || method.toLowerCase() == "put" )
                && headers['Content-Type'].indexOf('json') > 0)
                options.data = entry;
            else if (entry)
                options.data = this.serialize(entry);

            var deferred = $q.defer();

            if (!uri)
                deferred.reject({"message": "Uri is empty!"});
            else {
                if (options.data && options.method.toLowerCase() == "get") {
                    options.url = options.url + "?" + options.data;
                }

                $http(options).success(function (res) {
                    if (res.error == 0 || !res.error) {
                        deferred.resolve(res);
                    } else if (res.message) {
                        deferred.reject(res);
                    } else {
                        deferred.reject({"message": "服务器异常"});
                    }
                }).error(function (error) {
                    deferred.reject({"message": "无法连接到服务器"});
                });
                return deferred.promise;
            }
        };

        utilsProvider.addModule("async", async);
    }]);
angular.module('yes.auth', []).factory('authInterceptor', ['$q', '$location', function ($q, $location) {
    var redirectOnce = true;
    return {
        request: function (config) {
            return config;
        },
        response: function (res) {
            return res || $q.when(res);
        },
        responseError: function (rejection) {
            if (rejection.status === 401 && redirectOnce) {
                redirectOnce = false;
                $location.path("/login").search('return', encodeURIComponent(location.hash));

                setTimeout(function () {
                    redirectOnce = true;
                }, 12000);
            }
            return $q.reject(rejection);
        }
    };
}]).config(["$httpProvider", function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('authInterceptor');
}]);

//angular.module('yes.utils').config(["$http", "$q", "$location", "utils",
//    function ($http, $q, $location, utils) {
//
//        var injector = angular.element(document.body).injector();
//
//        var settings = {
//            version: "0.0.0",
//            templates: {
//                'layout': 'base/templates/layout.html',
//                'login': 'base/templates/login.html',
//                'dashboard': 'base/templates/dashboard.html',
//                'list': 'base/templates/list.uigrid.html',
//                'detail': 'base/templates/detail.html',
//                'searchCommon': 'base/templates/search-common.html'
//            },
//            gateway: {
//                host: 'self'
//            },
//            runtime: {
//                "mock": true,
//                "menuRoot": null,
//                "menuApi": 'base/menus',
//                "language": navigator.language || navigator.userLanguage,
//                "apiPath": "api",
//                "serverRoot": 'src',
//                "pluginFolder": 'plugins',
//                "pageSize": {
//                    "default": 20,
//                    "more": 10
//                },
//                "debug": true
//            }
//        };
//
//        if (injector.has('settings'))
//            settings = injector.get('settings') || {};
//
//        var headers = settings.headers;
//
//        var gateway = settings.gateway;
//
//        var handles = {
//            async: function (method, uri, entry, _headers) {
//                var options = {
//                    "method": method,
//                    "url": uri,
//                    "cache": false,
//                    "headers": _headers || headers
//                };
//
//                if (entry) {
//                    angular.forEach(entry, function (raw, key) {
//                        if (raw == "") {
//                            delete entry[key];
//                        }
//                    });
//                }
//
//                if (entry
//                    && (method.toLowerCase() == "post" || method.toLowerCase() == "put" )
//                    && headers['Content-Type'].indexOf('json') > 0)
//                    options.data = entry;
//                else if (entry)
//                    options.data = this.serialize(entry);
//
//                var deferred = $q.defer();
//
//                if (!uri)
//                    deferred.reject({"message": "Uri is empty!"});
//                else {
//                    if (options.data && options.method.toLowerCase() == "get") {
//                        options.url = options.url + "?" + options.data;
//                    }
//
//                    $http(options).success(function (res) {
//                        if (res.error == 0 || !res.error) {
//                            deferred.resolve(res);
//                        } else if (res.message) {
//                            deferred.reject(res);
//                        } else {
//                            deferred.reject({"message": "服务器异常"});
//                        }
//                    }).error(function (error) {
//                        deferred.reject({"message": "无法连接到服务器"});
//                    });
//                    return deferred.promise;
//                }
//            },
//            serialize: function (data) {
//                if (!angular.isObject(data)) {
//                    return ( ( data == null ) ? "" : data.toString() );
//                }
//                var buffer = [];
//                for (var name in data) {
//                    if (!data.hasOwnProperty(name)) {
//                        continue;
//                    }
//                    var value = data[name];
//
//                    if (angular.isDate(value) && moment) {
//                        value = moment(value).format("YYYY-MM-DD HH:mm:ss");
//                    }
//
//                    buffer.push(
//                        encodeURIComponent(name) + "=" + encodeURIComponent(( value == null ) ? "" : value)
//                    );
//                }
//                var source = buffer.join("&");
//                return ( source );
//            },
//            createDoc: function (raw) {
//                if (raw && raw.properties && angular.isArray(raw.properties)) {
//                    angular.forEach(raw.properties, function (props) {
//                        raw[props.name] = props.value.length == 1 ? props.value[0] : props.value;
//                    });
//                    delete raw.properties;
//                }
//                return raw;
//            }
//        };
//
//        var extMap = {
//            defaults: 'ico ico-file ico-file-1',
//            xls: 'ico ico-file ico-file-2',
//            xlsx: 'ico ico-file ico-file-2',
//            doc: 'ico ico-file ico-file-3',
//            docx: 'ico ico-file ico-file-3',
//            ppt: 'ico ico-file ico-file-4',
//            pptx: 'ico ico-file ico-file-4',
//            rar: 'ico ico-file ico-file-6',
//            zip: 'ico ico-file ico-file-7',
//            html: 'ico ico-file ico-file-10',
//            js: 'ico ico-file ico-file-11',
//            xml: 'ico ico-file ico-file-12',
//            css: 'ico ico-file ico-file-12',
//            pdf: 'ico ico-file ico-file-17',
//            txt: 'ico ico-file ico-file-22',
//            jpg: 'ico ico-file ico-file-31',
//            gif: 'ico ico-file ico-file-32',
//            png: 'ico ico-file ico-file-33',
//            bmp: 'ico ico-file ico-file-34'
//        };
//
//        var createEvents = function () {
//            var events = {};
//            return {
//                on: function (names, handler) {
//                    names.split(' ').forEach(function (name) {
//                        if (!events[name]) {
//                            events[name] = [];
//                        }
//                        events[name].push(handler);
//                    });
//                    return this;
//                },
//                once: function (names, handler) {
//                    names.split(' ').forEach(function (name) {
//                        events[name] = [];
//                        events[name].push(handler);
//                    });
//                    return this;
//                },
//                trigger: function (name, args) {
//                    angular.forEach(events[name], function (handler) {
//                        handler.call(null, args);
//                    });
//                    return this;
//                }
//            };
//        };
//
//        var __events = new createEvents();
//
//        var findInjectServices = function (name) {
//            try {
//                return angular.element(document.body).injector().get(name);
//            } catch (ex) {
//                return null;
//            }
//        };
//
//        var host = (gateway.host !== "self") ? gateway.host : (location.protocol + "//" + location.host);
//        var root = host + location.pathname.substr(0, location.pathname.lastIndexOf("/"));
//
//        var getMockResourceUrl = function (uri) {
//
//            var arr = uri.split('/');
//            if (settings.runtime.mock && arr.length)
//                return 'data/' + arr.slice(3).join('.') + ".json";
//
//            return uri;
//        };
//
//        var getAbsUrl = function (path) {
//
//            var uri = path;
//            if (path.indexOf('http') == 0) {
//                uri = path;
//            } else {
//                if (path.indexOf(settings.runtime.apiPath) !== 0) {
//                    uri = [settings.runtime.apiPath, path].join('/').replace(/\/\//g, '/');
//                }
//                uri = [host, uri].join('/');
//            }
//            return uri;
//        };
//
//        return {
//            settings: settings,
//            alert: function (msg, btnText) {
//                console.log(msg, btnText);
//            },
//            root: root,
//            host: host,
//            getAbsUrl: getAbsUrl,
//            serialize: handles.serialize,
//            format: function (format) {
//                var args = Array.prototype.slice.call(arguments, 1);
//                if (!format)
//                    return "";
//                return format.replace(/{(\d+)}/g, function (match, number) {
//                    return typeof args[number] != 'undefined'
//                        ? args[number]
//                        : match
//                        ;
//                });
//            },
//            capitalize: function (string) {
//                return string.charAt(0).toUpperCase() + string.slice(1);
//            },
//            createEvents: function () {
//                return new createEvents();
//            },
//            events: __events,
//            changeTitle: function (title) {
//                __events.trigger("changeTitle", title);
//            },
//            currentPage: function () {
//                var p = $location.search()[p];
//                return parseInt(p) || 1;
//            },
//            async: function (method, path, options) {
//                var uri = getAbsUrl(path);
//                uri = getMockResourceUrl(uri);
//                return handles.async(method, uri, options);
//            },
//            findViewConfig: function (stateName, page) {
//                return findInjectServices(stateName + ".config")[page];
//            },
//            disableScroll: function () {
//                document.body.style.overflow = "hidden";
//                angular.element(window).trigger('resize');
//            },
//            resetScroll: function () {
//                document.body.style.overflow = null;
//                angular.element(window).trigger('resize');
//            },
//            getFileExtCss: function (fileName) {
//                var re = /(?:\.([^.]+))?$/;
//                var ext = re.exec(fileName)[1];
//                return extMap.hasOwnProperty(ext) ? extMap[ext] : extMap.defaults;
//            },
//            dialogUpload: function (options) {
//                //ngDialog.open({
//                //    template: 'base/templates/dialog-container.html',
//                //    controller: function ($scope) {
//                //        $scope.options = options;
//                //    }
//                //});
//            }
//        };
//    }]);
//

angular.module('yes.utils').config(['utilsProvider',
    function (utilsProvider) {

        var units = 'BKMGTPEZY'.split('');

        function equals(a, b) {
            return a && a.toLowerCase() === b.toLowerCase()
        }

        function getSize(bytes, options) {
            bytes = typeof bytes == 'number' ? bytes : 0;
            options = options || {};
            options.fixed = typeof options.fixed == 'number' ? options.fixed : 2;
            options.spacer = typeof options.spacer == 'string' ? options.spacer : ' ';

            options.calculate = function (spec) {
                var type = equals(spec, 'si') ? ['k', 'B'] : ['K', 'iB'];
                var algorithm = equals(spec, 'si') ? 1e3 : 1024;
                var magnitude = Math.log(bytes) / Math.log(algorithm) | 0;
                var result = (bytes / Math.pow(algorithm, magnitude));
                var fixed = result.toFixed(options.fixed);
                var suffix;

                if (magnitude - 1 < 3 && !equals(spec, 'si') && equals(spec, 'jedec'))
                    type[1] = 'B';

                suffix = magnitude
                    ? (type[0] + 'MGTPEZY')[magnitude - 1] + type[1]
                    : ((fixed | 0) === 1 ? 'Byte' : 'Bytes');

                return {
                    suffix: suffix,
                    magnitude: magnitude,
                    result: result,
                    fixed: fixed,
                    bits: {result: result / 8, fixed: (result / 8).toFixed(options.fixed)}
                }
            };

            options.to = function (unit, spec) {
                var algorithm = equals(spec, 'si') ? 1e3 : 1024;
                var position = units.indexOf(typeof unit == 'string' ? unit[0].toUpperCase() : 'B');
                var result = bytes;

                if (position === -1 || position === 0) return result.toFixed(2);
                for (; position > 0; position--) result /= algorithm
                return result.toFixed(2)
            };

            options.human = function (spec) {
                var output = options.calculate(spec);
                return output.fixed + options.spacer + output.suffix
            };

            return options;
        }

        utilsProvider.addModule('getFileSize', getSize);
    }]);
angular.module('yes.utils').factory('interpreter', ["$stateParams", "oPath", "utils",
    function ($stateParams, oPath, utils) {

        var settings = utils.settings;

        var defaultListOperations = {
            'search': {
                'name': '查找'
            },
            'reset': {
                'name': '重置'
            },
            'add': {
                'name': '新建'
            },
            'del': {
                'name': '删除'
            }
        };

        var defaultFormOperations = {
            'save': {
                'name': '保存'
            },
            'reset': {
                'name': '重置'
            },
            'del': {
                'name': '删除'
            }
        };

        var array2Object = function (arr, key) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i].hasOwnProperty(key))
                    rv[arr[i][key]] = arr[i];
                else
                    rv[i] = arr[i];
            }
            return rv;
        };

        var getConfig = function (name, pageName) {
            try {
                return injector.get(name + ".config")[pageName];
            } catch (ex) {
                return null;
            }
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
                config.schema.properties = array2Object(properties, 'key');
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
            var __default = getConfig($stateParams.name, '_default') || {};
            __default = angular.extend({list: {}, form: {}}, __default);
            overrideDefault(__default.form, 'template', [utils.root, plugins.templates.detail].join('/'));
            overrideDefault(__default.list, 'template', [utils.root, plugins.templates.list].join('/'));
            overrideDefault(__default.list, 'pageSize', settings.pageSize['default']);
            return __default;
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

                //validateAuthority(config.form.operations);
                //validateAuthority(config.list.operations);

                config = explainList(config, scope);
                config.form = explainForm(config.form, scope);
                return config
            }
        };

    }]);
angular.module('yes.utils').config(['utilsProvider',
    function (utilsProvider) {
        var __menus = {};

        var settings = utilsProvider.settings;

        var findParents = function (self, node, menus) {

            if (angular.isUndefined(self))
                return [];

            self.parents = self.parents || [];

            var parent = menus.filter(function (m) {
                return m.uid == node.parent;
            });

            if (self.parents.length == 0)
                self.parents.push(self.label);
            if (parent.length) {
                self.parents.push(parent[0].name);
                findParents(self, parent[0], menus);
            }
        };

        var fixedUrl = function (m) {
            if (angular.isUndefined(m.url) || m.url == "#")
                m.url = "";

            if (m.url.indexOf('/') === 0 && angular.isDefined(settings.serverRoot))
                m.url = settings.serverRoot + m.url;
        };

        var groupMenus = function (menus) {
            angular.forEach(menus, function (m) {
                fixedUrl(m);

                if (angular.isString(m.uid) && m.parent && m.type && m.type.toLowerCase() == "menu") {
                    __menus[m.parent] = __menus[m.parent] || [];
                    __menus[m.parent].push(m);
                }
            });
        };

        var initMenus = function (parentId, menus) {
            groupMenus(menus);
            var result = menus.filter(
                function (m) {
                    m.subMenus = __menus[m.uid];
                    return m.parent == parentId;
                }
            );
            console.log(result);
            return result;
        };

        var menus = {
            initMenus: initMenus,
            buildMenuTree: function (menus) {
                var result = [];
                angular.forEach(menus, function (r) {
                    var m = {label: r.name, url: r.url, parent: r.parent, uid: r.uid};
                    findParents(m, m, menus);
                    m.name = m.parents.reverse().join(" > ");
                    result.push(m);
                });
                return result;
            }
        };

        utilsProvider.addModule('menus', menus);
    }]);
angular.module('yes.utils').config(['utilsProvider',
    function (utilsProvider) {
        var oPath;
        oPath = (function () {
            var toStr = Object.prototype.toString,
                _hasOwnProperty = Object.prototype.hasOwnProperty;

            function isEmpty(value) {
                if (!value) {
                    return true;
                }
                if (isArray(value) && value.length === 0) {
                    return true;
                } else if (!isString(value)) {
                    for (var i in value) {
                        if (_hasOwnProperty.call(value, i)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }

            function toString(type) {
                return toStr.call(type);
            }

            var isNumber = angular.isNumber;
            var isString = angular.isString;
            var isObject = angular.isObject;
            var isArray = angular.isArray;

            function isBoolean(obj) {
                return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
            }

            function getKey(key) {
                var intKey = parseInt(key);
                if (intKey.toString() === key) {
                    return intKey;
                }
                return key;
            }

            function set(obj, path, value, doNotReplace) {
                if (isNumber(path)) {
                    path = [path];
                }
                if (isEmpty(path)) {
                    return obj;
                }
                if (isString(path)) {
                    return set(obj, path.split('.').map(getKey), value, doNotReplace);
                }
                var currentPath = path[0];

                if (path.length === 1) {
                    var oldVal = obj[currentPath];
                    if (oldVal === void 0 || !doNotReplace) {
                        obj[currentPath] = value;
                    }
                    return oldVal;
                }

                if (obj[currentPath] === void 0) {
                    //check if we assume an array
                    if (isNumber(path[1])) {
                        obj[currentPath] = [];
                    } else {
                        obj[currentPath] = {};
                    }
                }

                return set(obj[currentPath], path.slice(1), value, doNotReplace);
            }

            function del(obj, path) {
                if (isNumber(path)) {
                    path = [path];
                }

                if (isEmpty(obj)) {
                    return void 0;
                }

                if (isEmpty(path)) {
                    return obj;
                }
                if (isString(path)) {
                    return del(obj, path.split('.'));
                }

                var currentPath = getKey(path[0]);
                var oldVal = obj[currentPath];

                if (path.length === 1) {
                    if (oldVal !== void 0) {
                        if (isArray(obj)) {
                            obj.splice(currentPath, 1);
                        } else {
                            delete obj[currentPath];
                        }
                    }
                } else {
                    if (obj[currentPath] !== void 0) {
                        return del(obj[currentPath], path.slice(1));
                    }
                }

                return obj;
            }

            var objectPath = function (obj) {
                return Object.keys(objectPath).reduce(function (proxy, prop) {
                    /*istanbul ignore else*/
                    if (typeof objectPath[prop] === 'function') {
                        proxy[prop] = objectPath[prop].bind(objectPath, obj);
                    }

                    return proxy;
                }, {});
            };

            objectPath.has = function (obj, path) {
                if (isEmpty(obj)) {
                    return false;
                }

                if (isNumber(path)) {
                    path = [path];
                } else if (isString(path)) {
                    path = path.split('.');
                }

                if (isEmpty(path) || path.length === 0) {
                    return false;
                }

                for (var i = 0; i < path.length; i++) {
                    var j = path[i];
                    if ((isObject(obj) || isArray(obj)) && _hasOwnProperty.call(obj, j)) {
                        obj = obj[j];
                    } else {
                        return false;
                    }
                }

                return true;
            };

            objectPath.ensureExists = function (obj, path, value) {
                return set(obj, path, value, true);
            };

            objectPath.set = function (obj, path, value, doNotReplace) {
                return set(obj, path, value, doNotReplace);
            };

            objectPath.insert = function (obj, path, value, at) {
                var arr = objectPath.get(obj, path);
                at = ~~at;
                if (!isArray(arr)) {
                    arr = [];
                    objectPath.set(obj, path, arr);
                }
                arr.splice(at, 0, value);
            };

            objectPath.empty = function (obj, path) {
                if (isEmpty(path)) {
                    return obj;
                }
                if (isEmpty(obj)) {
                    return void 0;
                }

                var value, i;
                if (!(value = objectPath.get(obj, path))) {
                    return obj;
                }

                if (isString(value)) {
                    return objectPath.set(obj, path, '');
                } else if (isBoolean(value)) {
                    return objectPath.set(obj, path, false);
                } else if (isNumber(value)) {
                    return objectPath.set(obj, path, 0);
                } else if (isArray(value)) {
                    value.length = 0;
                } else if (isObject(value)) {
                    for (i in value) {
                        if (_hasOwnProperty.call(value, i)) {
                            delete value[i];
                        }
                    }
                } else {
                    return objectPath.set(obj, path, null);
                }
            };

            objectPath.push = function (obj, path /*, values */) {
                var arr = objectPath.get(obj, path);
                if (!isArray(arr)) {
                    arr = [];
                    objectPath.set(obj, path, arr);
                }

                arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
            };

            objectPath.coalesce = function (obj, paths, defaultValue) {
                var value;

                for (var i = 0, len = paths.length; i < len; i++) {
                    if ((value = objectPath.get(obj, paths[i])) !== void 0) {
                        return value;
                    }
                }

                return defaultValue;
            };

            objectPath.find = function (obj, path, defaultValue) {

                if (isNumber(path)) {
                    path = [path];
                }
                if (isEmpty(path)) {
                    return obj;
                }
                if (isEmpty(obj)) {
                    return defaultValue;
                }
                if (isString(path)) {

                    objectPath.find(obj, path.split('.'), defaultValue);
                }

                var currentPath = getKey(path[0]);

                if (/\[(.*?)\]/g.test(currentPath) && isArray(obj)) {
                    var rv = /\[(.*?)\]/g.exec(currentPath)[1];
                    var arrRv = rv.split(':');
                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i].hasOwnProperty(arrRv[0]) && obj[i][arrRv[0]] == arrRv[1]) {
                            return objectPath.find(obj[i], path.slice(1), defaultValue);
                        }
                    }
                }

                if (path.length === 1) {
                    if (obj[currentPath] === void 0) {
                        return defaultValue;
                    }
                    return obj[currentPath];
                }

                return objectPath.find(obj[currentPath], path.slice(1), defaultValue);
            };

            objectPath.get = function (obj, path, defaultValue) {
                if (isNumber(path)) {
                    path = [path];
                }
                if (isEmpty(path)) {
                    return obj;
                }
                if (isEmpty(obj)) {
                    return defaultValue;
                }
                if (isString(path)) {
                    return objectPath.get(obj, path.split('.'), defaultValue);
                }

                var currentPath = getKey(path[0]);

                if (path.length === 1) {
                    if (obj[currentPath] === void 0) {
                        return defaultValue;
                    }
                    return obj[currentPath];
                }

                return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
            };

            objectPath.del = function (obj, path) {
                return del(obj, path);
            };

            return objectPath;

        })();
        utilsProvider.addModule('oPath', oPath);
    }]);
angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var serialize = function (data) {
            if (!angular.isObject(data)) {
                return ( ( data == null ) ? "" : data.toString() );
            }
            var buffer = [];
            for (var name in data) {
                if (!data.hasOwnProperty(name)) {
                    continue;
                }
                var value = data[name];

                if (angular.isDate(value) && moment) {
                    value = moment(value).format("YYYY-MM-DD HH:mm:ss");
                }

                buffer.push(
                    encodeURIComponent(name) + "=" + encodeURIComponent(( value == null ) ? "" : value)
                );
            }
            var source = buffer.join("&");
            return ( source );
        };

        utilsProvider.addModule("serialize", serialize);
    }]);