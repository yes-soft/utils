angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var settings = utilsProvider.settings;

        var host = (settings.host !== "self") ? settings.host : (location.protocol + "//" + location.host);
        var root = host + location.pathname.substr(0, location.pathname.lastIndexOf("/"));

        var injector = function () {
            return angular.element('body').injector();
        };

        var invoke = function (fn, context) {
            if (angular.isFunction(fn)) {
                injector().invoke(fn, context);
            } else if (angular.isArray(fn)) {
                angular.forEach(fn, function (f) {
                    invoke(f, context);
                });
            }
        };

        var services = {
            format: function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (!format)
                    return "";
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined' ? args[number] : match;
                });
            },
            capitalize: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },
            currentPage: function () {
                var p = $location.search()[p];
                return parseInt(p) || 1;
            },
            disableScroll: function () {
                document.body.style.overflow = "hidden";
                angular.element(window).trigger('resize');
            },
            resetScroll: function () {
                document.body.style.overflow = null;
                angular.element(window).trigger('resize');
            },
            dialogUpload: function (options) {
                if (injector().has('ngDialog')) {
                    injector().get('ngDialog').open({
                        template: settings.templates.dialog,
                        controller: function ($scope) {
                            $scope.options = options;
                        }
                    });
                } else {
                    console.log('ngDialog no found');
                }
            },
            array2Object: function (arr, key) {
                var rv = {};
                for (var i = 0; i < arr.length; ++i) {
                    if (arr[i].hasOwnProperty(key))
                        rv[arr[i][key]] = arr[i];
                    else
                        rv[i] = arr[i];
                }
                return rv;
            },
            invoke: invoke,
            getAbsUrl: function (path) {
                var uri = path;
                if (path.indexOf('http') == 0) {
                    uri = path;
                } else {
                    if (path.indexOf(settings.apiPath) !== 0) {
                        uri = [settings.apiPath, path].join('/').replace(/\/\//g, '/');
                    }
                    uri = [host, uri].join('/');
                }
                return uri;
            }
        };

        for (var key in services) {
            if (services.hasOwnProperty(key)) {
                utilsProvider.addModule(key, services[key]);
            }
        }

        utilsProvider.addModule('host', host);
        utilsProvider.addModule('root', root);
    }]);

