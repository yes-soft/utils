angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var settings = utilsProvider.settings;

        var getMockResourceUrl = function (uri) {
            var arr = uri.split('/');
            if (settings.mock && arr.length)
                return 'data/' + arr.slice(3).join('.') + ".json";
            return uri;
        };

        var getAbsUrl = (function () {
            var a;
            return function (url) {

                if (url.indexOf('http') === 0)
                    return url;

                if (url.indexOf(settings.apiPath) !== 0) {
                    url = [settings.apiPath, url].join('/').replace(/\/\//g, '/');
                }

                var host = (settings.host !== "self") ? settings.host : (location.protocol + "//" + location.host);
                url = [host, url].join('/');

                return url;

                //if (!a) a = document.createElement('a');
                //a.href = url;
                //return a.href;
            }
        })();

        var async = function (method, path, entry, _headers) {

            var $http = utilsProvider.getService('$http');
            var $q = utilsProvider.getService('$q');

            var uri = getAbsUrl(path);
            uri = getMockResourceUrl(uri);

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
                && ((!angular.isString(options.headers)) || options.headers['Content-Type'].indexOf('json') > 0))
                options.data = entry;
            else if (entry)
                options.data = this.serialize(entry);

            var deferred = $q.defer();

            var getSeparator = function (url) {
                return url.indexOf('?') > -1 ? "&" : "?";
            };

            if (!uri)
                deferred.reject({"message": "Uri is empty!"});
            else {

                if (options.data && options.method.toLowerCase() == "get") {
                    options.url = options.url + getSeparator(options.url) + options.data + "&r_=" + Math.random() * 10000;
                } else if (options.method.toLowerCase() == "get") {
                    options.url += getSeparator(options.url) + "r_=" + Math.random() * 10000;
                }

                $http(options).success(function (res) {
                    if (res.error == 0 || res.error == 200 || res.error == 201 || !res.error) {
                        deferred.resolve(res);
                    } else if (res.message) {
                        deferred.reject(res);
                    } else {
                        deferred.reject({"message": "服务器异常"});
                    }
                }).error(function (error) {
                    var message = "服务器异常";
                    if (error)
                        message = error.message || message;
                    deferred.reject({"message": message});
                });
                return deferred.promise;
            }
        };

        utilsProvider.addModule("async", async);
    }]);