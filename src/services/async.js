angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var getMockResourceUrl = function (uri) {
            var settings = utilsProvider.getSettings();
            var arr = uri.split('/');
            if (settings.mock && arr.length)
                return 'data/' + arr.slice(3).join('.') + ".json";
            return uri;
        };


        var getAbsUrl = (function () {
            var a;
            return function (url) {
                if (!a) a = document.createElement('a');
                a.href = url;
                return a.href;
            };
        })();


        var async = function (method, path, entry, _headers) {

            var $http = utilsProvider.getService('$http');
            var $q = utilsProvider.getService('$q');
            var settings = utilsProvider.getSettings();

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