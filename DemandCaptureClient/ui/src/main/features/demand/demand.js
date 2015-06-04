angular.module('demand',
    [
        'ngRoute',
        'demand.add.controller',
        'demand.add.service',
        'demand.graph.controller'
    ]
).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/demand/add'});
    }]);
