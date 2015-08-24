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