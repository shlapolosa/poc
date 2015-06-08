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
        $scope.datapoints1 = [];

        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        var value = 0;
        var failure = 0;

        function createGraphPoint(demand) {
            var date = new Date(demand.date);
            var v = (demand.demand) ? demand.demand.valueOrFailure : demand["VALUE/ FAILURE/ FAILURE US"];
            var t = demand.type;
            if(v == 'Value' || v == 'value'){
                value = value+1;
            }else{
                failure = failure+1;
            }
            $scope.datapoints.push({
                "x": date, "value": value
                , "failure": failure
            });


            $scope.enableZoom === "true";

            //$scope.datapoints1.push({
            //    "x": weekday[Math.floor((Math.random() * 6) + 1)], "value": value+=1
            //    , "failure": failure+=1
            //});
        }

        DemandService.getDemands().then(function (response) {
            _.map(response.data, function (demand) {
                createGraphPoint(demand);
            });
        });

        $scope.datacolumns = [{"id": "value", "type": "line", "name": "Value Demand", "color": "red"},
            {"id": "failure", "type": "spline", "name": "Failure Demand", "color": "blue"}];

        $scope.datax = {"id": "x"};


        $socket.on('demand', function (data) {

            if (!data.message) {
                createGraphPoint(data);
            } else {
                $scope.data.push(data.message);
            }
        });


        //$scope.datacolumns = [{"id": "top-1", "type": "line", "name": "Top one", "color": "black"},
        //    {"id": "top-2", "type": "spline", "name": "Top two"}];
        //$scope.datax = {"id": "x"};

    });
})(angular.module('demand.graph.controller', ['ngRoute', 'ngSocket', 'gridshore.c3js.chart', 'demand.add.service']));
