var app = angular.module('delegateApp', []);

app.controller('indexCtrl', function($scope, $http) {
    $scope.accounts = [];
    $scope.lastpayout = 0;
    $scope.nextpayout = 0;

    if (window.location.search.substr(10) == '') {
        var user = 'enthusiast_developer';
    }
    else {
        var user = window.location.search.substr(10);
    }
    $http.get ('https://wallet.shiftnrg.org/api/delegates/get?username=' + user).then (function (res) {
        $scope.delegate = res.data.delegate;

        $http.get('https://wallet.shiftnrg.org/api/delegates/voters?publicKey=' + res.data.delegate.publicKey).then (function (res) {
            $scope.voters = res.data.accounts;
        });
    });

    $http.get('https://wallet.shiftnrg.org/api/delegates?limit=101').then (function (res) {
        $scope.delegates = res.data.delegates;
    });

});
