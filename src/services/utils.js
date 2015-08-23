angular.module('yes.utils').factory('utils', ["$http", "$q", "$location", "$stateParams",
    function ($http, $q, $location, $stateParams) {

        var injector = angular.element(document.body).injector();

        var settings = {
            version: "0.0.0",
            templates: {
                'layout': 'base/templates/layout.html',
                'login': 'base/templates/login.html',
                'dashboard': 'base/templates/dashboard.html',
                'list': 'base/templates/list.uigrid.html',
                'detail': 'base/templates/detail.html',
                'searchCommon': 'base/templates/search-common.html'
            },
            gateway: {
                host: 'self'
            },
            runtime: {
                "mock": true,
                "menuRoot": null,
                "menuApi": 'base/menus',
                "language": navigator.language || navigator.userLanguage,
                "apiPath": "api",
                "serverRoot": 'src',
                "pluginFolder": 'plugins',
                "pageSize": {
                    "default": 20,
                    "more": 10
                },
                "debug": true
            }
        };
        if (injector.has('settings'))
            settings = injector.get('settings') || {};

        var headers = settings.headers;
        var gateway = settings.gateway;

        var cacheContainer = {};
        var __menus = {};
        var handles = {
            async: function (method, uri, entry, _headers) {
                var options = {
                    "method": method,
                    "url": uri,
                    "cache": false,
                    "headers": _headers || headers
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
            },
            serialize: function (data) {
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
            },
            createDoc: function (raw) {
                if (raw && raw.properties && angular.isArray(raw.properties)) {
                    angular.forEach(raw.properties, function (props) {
                        raw[props.name] = props.value.length == 1 ? props.value[0] : props.value;
                    });
                    delete raw.properties;
                }
                return raw;
            }
        };

        var extMap = {
            defaults: 'ico ico-file ico-file-1',
            xls: 'ico ico-file ico-file-2',
            xlsx: 'ico ico-file ico-file-2',
            doc: 'ico ico-file ico-file-3',
            docx: 'ico ico-file ico-file-3',
            ppt: 'ico ico-file ico-file-4',
            pptx: 'ico ico-file ico-file-4',
            rar: 'ico ico-file ico-file-6',
            zip: 'ico ico-file ico-file-7',
            html: 'ico ico-file ico-file-10',
            js: 'ico ico-file ico-file-11',
            xml: 'ico ico-file ico-file-12',
            css: 'ico ico-file ico-file-12',
            pdf: 'ico ico-file ico-file-17',
            txt: 'ico ico-file ico-file-22',
            jpg: 'ico ico-file ico-file-31',
            gif: 'ico ico-file ico-file-32',
            png: 'ico ico-file ico-file-33',
            bmp: 'ico ico-file ico-file-34'
        };

        var createEvents = function () {
            var events = {};
            return {
                on: function (names, handler) {
                    names.split(' ').forEach(function (name) {
                        if (!events[name]) {
                            events[name] = [];
                        }
                        events[name].push(handler);
                    });
                    return this;
                },
                once: function (names, handler) {
                    names.split(' ').forEach(function (name) {
                        events[name] = [];
                        events[name].push(handler);
                    });
                    return this;
                },
                trigger: function (name, args) {
                    angular.forEach(events[name], function (handler) {
                        handler.call(null, args);
                    });
                    return this;
                }
            };
        };

        var __events = new createEvents();

        var findInjectServices = function (name) {
            try {
                return angular.element(document.body).injector().get(name);
            } catch (ex) {
                return null;
            }
        };

        var host = (gateway.host !== "self") ? gateway.host : (location.protocol + "//" + location.host);
        var root = host + location.pathname.substr(0, location.pathname.lastIndexOf("/"));

        var getMockResourceUrl = function (uri) {

            var arr = uri.split('/');
            if (settings.runtime.mock && arr.length)
                return 'data/' + arr.slice(3).join('.') + ".json";

            return uri;
        };

        var getAbsUrl = function (path) {

            var uri = path;
            if (path.indexOf('http') == 0) {
                uri = path;
            } else {
                if (path.indexOf(settings.runtime.apiPath) !== 0) {
                    uri = [settings.runtime.apiPath, path].join('/').replace(/\/\//g, '/');
                }
                uri = [host, uri].join('/');
            }
            return uri;
        };

        return {
            settings: settings,
            alert: function (msg, btnText) {
                console.log(msg, btnText);
            },
            root: root,
            host: host,
            getAbsUrl: getAbsUrl,
            serialize: handles.serialize,
            format: function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (!format)
                    return "";
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                        ? args[number]
                        : match
                        ;
                });
            },
            capitalize: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },
            createEvents: function () {
                return new createEvents();
            },
            events: __events,
            changeTitle: function (title) {
                __events.trigger("changeTitle", title);
            },
            currentPage: function () {
                var p = $location.search()[p];
                return parseInt(p) || 1;
            },
            async: function (method, path, options) {
                var uri = getAbsUrl(path);
                uri = getMockResourceUrl(uri);
                return handles.async(method, uri, options);
            },
            findViewConfig: function (stateName, page) {
                return findInjectServices(stateName + ".config")[page];
            },
            disableScroll: function () {
                document.body.style.overflow = "hidden";
                angular.element(window).trigger('resize');
            },
            resetScroll: function () {
                document.body.style.overflow = null;
                angular.element(window).trigger('resize');
            },
            getFileExtCss: function (fileName) {
                var re = /(?:\.([^.]+))?$/;
                var ext = re.exec(fileName)[1];
                return extMap.hasOwnProperty(ext) ? extMap[ext] : extMap.defaults;
            },
            dialogUpload: function (options) {
                //ngDialog.open({
                //    template: 'base/templates/dialog-container.html',
                //    controller: function ($scope) {
                //        $scope.options = options;
                //    }
                //});
            }
        };
    }]);

