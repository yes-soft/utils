angular.module('yes.utils').config(["utilsProvider",
    function (utilsProvider) {

        var settings = utilsProvider.getSettings();

        console.log(settings);

        var host = (settings.host !== "self") ? settings.host : (location.protocol + "//" + location.host);
        var root = host + location.pathname.substr(0, location.pathname.lastIndexOf("/"));

        var services = {
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
                console.log(options);
                //ngDialog.open({
                //    template: 'base/templates/dialog-container.html',
                //    controller: function ($scope) {
                //        $scope.options = options;
                //    }
                //});
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

