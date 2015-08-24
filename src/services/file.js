angular.module('yes.utils').config(['utilsProvider',
    function (utilsProvider) {

        var units = 'BKMGTPEZY'.split('');

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

        function getFileExtCss(fileName) {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(fileName)[1];
            return extMap.hasOwnProperty(ext) ? extMap[ext] : extMap.defaults;
        }

        utilsProvider.addModule('getFileSize', getSize);
        utilsProvider.addModule('getFileExtCss', getFileExtCss);

    }]);