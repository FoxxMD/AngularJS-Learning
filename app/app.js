/* App */

var topid;

var App = angular.module('docs', ['ngRoute'])
    .config(['$compileProvider', function ($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);
}]);

App.controller('DocsCtrl', function($scope, $http) {
  $scope.navitems = [];

  $scope.converter = new Showdown.converter();
  $scope.container = document.getElementById('markdown');

  $scope.convert = function() {
    var container = angular.element($scope.container), headings, heading;

    for (var i = 0; i <= 6; i++) {
      container.find('h' + i).addClass('heading');
    }

    var headings = $scope.container.getElementsByClassName('heading'), heading, link;

    for (var i = 0; i < headings.length; i++) {
      heading = headings.item(i);

      link = document.createElement('a');
      link.href = '#' + heading.id;

      if (i === 0) {
        topid = heading.id;
      }

      $scope.navitems[i] = {
        tag: heading.tagName.toLowerCase(),
        id: heading.id,
        text: heading.innerText || heading.textContent
      };

      link.innerHTML = heading.innerHTML;
      heading.innerHTML = '';
      heading.appendChild(link);
    }

    var pre = $scope.container.getElementsByTagName('pre');

    for (var i = 0; i < pre.length; i++) {
      var el = pre.item(i),
          child = el.getElementsByTagName('code'),
          classname = 'lang-' + child.item(0).className;

      el.className = classname + ' prettyprint linenums';
    }

    prettyPrint();
  };

  $http.get('README.md').success(function(data, status, headers, config) {
    $scope.container.innerHTML = $scope.converter.makeHtml(data);
    var hash = window.location.hash;
    if (hash !== "") {
      window.location.replace(('' + window.location).split('#')[0] + hash);
    }
    $scope.convert();

    document.getElementsByClassName('viewport')[0].style.opacity = '1';
  });

  $scope.search_submit = function() {
    var navitems = document.getElementsByClassName('navitem');
    if (navitems.length === 1) {
      window.location.hash = navitems[0].getAttribute('href');
    }
  };
});

window.onload = function() {
  var hash = window.location.hash;
  if ( hash === '#sidebar' || ('' + window.location).split('#').length === 2 && hash === '' ) {
    window.location.replace(('' + window.location).split('#')[0]);
  }
};

window.onhashchange = function() {
  var hash = window.location.hash;

  if ( hash === '#' + topid ) {
    window.location.replace(('' + window.location).split('#')[0] + '#');
  } else if ( hash === '#sidebar' ) {
    document.getElementById('search').focus();
  }

  if (hash !== '#sidebar') {
    document.getElementById('search').value = '';
  }
};
