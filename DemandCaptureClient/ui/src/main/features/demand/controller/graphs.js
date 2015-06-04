(function (app) {
    'use strict';

    app.config(['$routeProvider', '$socketProvider', function ($routeProvider, $socketProvider) {
        $socketProvider.setUrl("http://localhost:3000");
        $routeProvider.when('/demand/graph', {
            templateUrl: 'features/demand/partials/graphs.html',
            controller: 'GraphController'
        });
    }]);

    app.controller('GraphController', function ($log, $scope, $socket, DemandService) {

        $scope.data = [];
        $scope.datapoints = [];

        function createGraphPoint(demand) {
            var date = new Date(demand.date);
            var v = demand.valueOrFailure;
            var t = demand.type;
            $scope.datapoints.push({
                "x": date, "top-1": Math.floor((Math.random() * 200) + 1)
                , "top-2": Math.floor((Math.random() * 100) + 1)
            });
        }

        DemandService.getDemands().then(function (response) {
            _.map(response.data, function (demand) {
                createGraphPoint(demand);
            });
        });

        $scope.datacolumns = [{"id": "top-1", "type": "line", "name": "Top one", "color": "black"},
            {"id": "top-2", "type": "spline", "name": "Top two"}];

        $scope.datax = {"id": "x"};


        $socket.on('demand', function (data) {

            if (!data.message) {
                createGraphPoint(data);
            } else {
                $scope.data.push(data.message);
            }
        });


        $scope.datacolumns = [{"id": "top-1", "type": "line", "name": "Top one", "color": "black"},
            {"id": "top-2", "type": "spline", "name": "Top two"}];
        $scope.datax = {"id": "x"};

    });
})(angular.module('demand.graph.controller', ['ngRoute', 'ngSocket', 'gridshore.c3js.chart', 'demand.add.service']));
