var app = angular.module('delegateApp', []);

function parseTable(order, ascdesc) {
    setTimeout(function () {
     $(".username").each(function(index, item) {
        value = $(item).text();
        item.innerHTML = "<a href='delegates.html?username=" + value +"'>"+ value +"</a>";
     });

    $('table#dataTables-example').dataTable(
            {
                aaSorting: [[order, ascdesc]],
                "drawCallback": function( settings ) {
                    $('.VotesTable').show('slow');
                    $('#spinner').hide('slow')
                }
            }
        );    
    }, 3000);
}


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


    // if route is delegates show
    if ((window.location.href.indexOf("/delegates") > -1) || (window.location.href.indexOf("/pool") > -1)) {
        $http.get ('https://wallet.shiftnrg.org/api/delegates/get?username=' + user).then (function (res) {
            $scope.delegate = res.data.delegate;

            $('#home-tab').trigger('click');


            $http.get('https://wallet.shiftnrg.org/api/delegates?address=' + res.data.delegate.username).then (function (res) {
                $scope.votes = res.data.delegates;
            });

            $http.get('https://wallet.shiftnrg.org/api/delegates/voters?publicKey=' + res.data.delegate.publicKey).then (function (res) {
               $scope.voters = res.data.accounts;

                parseTable(2, 'desc');
            });
        });
    }
    // if route is index
    $http.get('https://wallet.shiftnrg.org/api/delegates?limit=101').then (function (res) {
        $scope.delegates = res.data.delegates;
        
        if ((window.location.href.split('/').pop() === "") || (window.location.href.split('/').pop() === "index.html") ) {
            parseTable(6, 'asc');
        }
    });

});
