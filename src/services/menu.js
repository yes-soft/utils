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
            var __pairs = {};
            angular.forEach(menus, function (m) {
                __pairs[m.uid] = m;
                fixedUrl(m);
                if (angular.isString(m.uid) && m.parent && m.type && m.type.toLowerCase() == "menu") {
                    __menus[m.parent] = __menus[m.parent] || [];
                    __menus[m.parent].push(m);
                }
            });
            angular.forEach(menus, function (m) {
                m.parentNode = __pairs[m.parent];
            });
        };

        var initMenus = function (parentId, menus) {
            groupMenus(menus);
            return menus.filter(
                function (m) {
                    m.subMenus = __menus[m.uid];
                    return m.parent == parentId;
                }
            );
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