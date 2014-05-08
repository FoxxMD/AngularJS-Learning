/* App */

var topid;

var App = angular.module('docs', ['ui.router', 'ui.bootstrap', 'duScroll'])
    .config(['$compileProvider', '$stateProvider', '$urlRouterProvider', function ($compileProvider, $stateProvider, $urlRouterProvider) {
       $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);

        $stateProvider.state('home', {
            templateUrl: '/app/templates/home.html',
            url: '/',
            mPath:'README'
        })
            .state('marked-down', {
                template: '<div id="markdownArea" flourish></div>',
                url: '/resources/{path:.*}'
            })
            .state('404', {
                templateUrl: 'app/templates/404.html',
                url: '/404'
            });
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('404');
    }]);

App.controller('cnc', ['$scope', '$state', '$rootScope', function ($scope, $state, $rootScope) {
    $rootScope.navitems = [];

    $scope.search_submit = function () {
        var navitems = document.getElementsByClassName('navitem');
        if (navitems.length === 1) {
            window.location.hash = navitems[0].getAttribute('href');
        }
    };

}]);

App.directive('flourish', ['$rootScope', '$stateParams', '$state', '$http', function ($rootScope, $stateParams, $state, $http) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var markDOM = angular.element(element[0]),
                markdownUrl = ($state.current.mPath || $stateParams.path) + '.md';

            scope.convert = function () {
                $rootScope.navitems = [];
                for (var u = 0; u <= 6; u++) {
                    markDOM.find('h' + u).addClass('heading');
                }

                var headings = markDOM[0].getElementsByClassName('heading'),
                    heading,
                    link;

                for (var i = 0; i < headings.length; i++) {
                    heading = headings.item(i);

                    link = document.createElement('a');
                    link.href = '#' + heading.id;

                    if (i === 0) {
                        topid = heading.id;
                    }

                    $rootScope.navitems[i] = {
                        tag: heading.tagName.toLowerCase(),
                        id: heading.id,
                        text: heading.innerText || heading.textContent
                    };

                    link.innerHTML = heading.innerHTML;
                    heading.innerHTML = '';
                    heading.appendChild(link);

                    var pre = markDOM[0].getElementsByTagName('pre');

                    for (var p = 0; p < pre.length; p++) {
                        var el = pre.item(p),
                            child = el.getElementsByTagName('code'),
                            classname = 'lang-' + child.item(0).className;

                        el.className = classname + ' prettyprint linenums';
                    }

                    prettyPrint();
                }
            };

            scope.converter = new Showdown.converter();

            $http.get(markdownUrl).success(function (data, status, headers, config) {
                markDOM[0].innerHTML = scope.converter.makeHtml(data);
                var hash = window.location.hash;
                if (hash !== "") {
                    window.location.replace(('' + window.location).split('#')[0] + hash);
                }

                scope.convert();

                document.getElementsByClassName('viewport')[0].style.opacity = '1';
            });
        }
    };
}]);

window.onload = function () {
    var hash = window.location.hash;
    if (hash === '#sidebar' || ('' + window.location).split('#').length === 2 && hash === '') {
        window.location.replace(('' + window.location).split('#')[0]);
    }
};

window.onhashchange = function () {
    var hash = window.location.hash;

    if (hash === '#' + topid) {
        window.location.replace(('' + window.location).split('#')[0] + '#');
    } else if (hash === '#sidebar') {
        document.getElementById('search').focus();
    }

    if (hash !== '#sidebar') {
        document.getElementById('search').value = '';
    }
};
