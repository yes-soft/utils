angular.module('yes.utils').factory('menu', ["$http", "$q", "$location", "utils",
    function ($http, $q, $location, utils) {
        var __menus = {};

        var settings = utils.settings || {};

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
                if (m.hasOwnProperty('parent') && angular.isString(m.parent)) {
                    __menus[m.parent] = __menus[m.parent] || [];
                    m.subMenus = __menus[m.parent];
                }

                fixedUrl(m);

                if (m.parent == m.uid && m.type && m.type.toLowerCase() == "menu") {
                    __menus[m.parent].push(m);
                }

            });
        };

        var initMenus = function (parentId, menus) {
            groupMenus(menus);

            return menus.filter(
                function (m) {
                    return m.parent == parentId;
                }
            );
        };

        return {
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
    }]);