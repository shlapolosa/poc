(function (app) {
    'use strict';

    app.factory('DemandService', function ($http) {

        return {
            addDemand: function (demand) {
                return $http.post('http://localhost:8089/api/demand', demand).
                    success(function (data, status, headers, config) {
                        return data;
                    }).
                    error(function (data, status, headers, config) {
                        return data;
                    });
            },
            getDemands: function () {
                return $http.get('http://localhost:8089/api/demand', {}).success(function (response) {
                        //console.log('service response');
                        //console.log(response);
                    return response.data;
                }).error(function (data, status, headers, config) {
                    return data;
                });
            }
        };
    });
})(angular.module('demand.add.service', []));
