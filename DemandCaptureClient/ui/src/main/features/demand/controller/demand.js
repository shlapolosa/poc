(function (app) {
    'use strict';

    app.config(['$routeProvider', '$socketProvider', function ($routeProvider) {
        $routeProvider.when('/demand/add', {
            templateUrl: 'features/demand/partials/addDemand.html',
            controller: 'DemandController'
        }).when('/demand/view', {
            templateUrl: 'features/demand/partials/viewDemands.html',
            controller: 'DemandController'
        });
    }]);

    app.controller('DemandController', function ($log, $scope, $socket, DemandService) {


        DemandService.getDemands().then(function (response) {
            $scope.demands = response.data;
        });

        $scope.getDemands = function () {
            DemandService.getDemands().then(function (response) {
                $scope.demands = response.data;
            });
        };

        $scope.submit = function (customer, demand) {
            var demandRequest = {customer: customer, demand: demand};
            DemandService.addDemand(demandRequest);
        };
    });
})(angular.module('demand.add.controller', ['ngRoute', 'ngSocket','demand.add.service']));
