(function (app) {
    'use strict';

    app.config(['$routeProvider', '$socketProvider', function ($routeProvider, $socketProvider) {
        $socketProvider.setUrl("http://localhost:3000");
        $routeProvider.when('/demand/graph', {
            templateUrl: 'features/demand/partials/graphs.html',
            controller: 'GraphController'
        });
    }]);

    app.controller('GraphController', function ($log, $scope, $socket) {

        $scope.data = [];
        $scope.datapoints = [];


        var chart = c3.generate({
            bindto: '#chart',
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25]
                ]
            }
        });

        $socket.on('demand', function (data) {
            var event = data;
            $scope.data.push(event);
            var date = event.date;
            var v = event.demand.valueOrFailure;
            var t = event.demand.type;
            console.log({"x": date, "top-1": v, "top-2": t});
            $scope.datapoints.push({"x": event.date, "top-1": event.valueOrFailure, "top-2": event.type});
        });


        $scope.datacolumns = [{"id": "top-1", "type": "line", "name": "Top one", "color": "black"},
            {"id": "top-2", "type": "spline", "name": "Top two"}];
        $scope.datax = {"id": "x"};

        //var chart = c3.generate({
        //    bindto: '#chart',
        //    data: {
        //        columns: [
        //            ['value',20,20,20,20,20,20,20],
        //            ['failure', 25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25]
        //        ]
        //    }
        //});
    });
})(angular.module('demand.graph.controller', ['ngRoute', 'ngSocket']));
