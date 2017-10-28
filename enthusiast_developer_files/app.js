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

           setTimeout(function () {
             $(".username").each(function(index, item) {
                value = $(item).text();
                item.innerHTML = "<a href='index.html?username=" + value +"'>"+ value +"</a>";
             });
            
            $('table#dataTables-example').dataTable(
                    {
                        aaSorting: [[3, 'desc']],
                        "drawCallback": function( settings ) {
                            $('#VotesTable').show('slow');
                            $('#spinner').hide('slow')
                        }
                    }
                );
                
            }, 3000);
        });
    });

    $http.get('https://wallet.shiftnrg.org/api/delegates?limit=101').then (function (res) {
        $scope.delegates = res.data.delegates;
    });

});
