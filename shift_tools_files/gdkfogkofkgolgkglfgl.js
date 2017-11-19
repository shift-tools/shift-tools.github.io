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
    $scope.accounts 			  = [];
    $scope.lastpayout 			  = 0;
    $scope.nextpayout 			  = 0;
    current_ticket_number_index   = 0;
    ticketRange                   = {};
    previous_ticket_number        = -1;
    if (window.location.search.substr(10) == '') {
        var user = 'shift_tools';
    }
    else {
        var user = window.location.search.substr(10);
    }


    // if route is delegates show
    if ((window.location.href.indexOf("/delegates") > -1) || (window.location.href.indexOf("/pool") > -1)) {

    	if (window.location.href.indexOf("/pool") > -1) {
	        $http.get('http://51.255.196.160:8000/data.json').then (function (res) {
	            $scope.participants = res.data;
        	});

			$scope.getPercentage = function(percentage) {
			   return percentage.toFixed(2);
			}

			$scope.getTicketsRange = function(percentage, index, last_voter_index) {
				if (index > current_ticket_number_index) {
					console.log(index);
					number_of_tickets  = (percentage/100)*10000;
					if (number_of_tickets >= 1) {
						first_ticket_index = previous_ticket_number + 1;
						last_ticket_index  = first_ticket_index + number_of_tickets - 1;
					}
					else {
						first_ticket_index = 0;
						last_ticket_index  = -1;
					}
				    previous_ticket_number = last_ticket_index;

				    if (index+1 == last_voter_index) {
				    	last_ticket_index = '9999';
				    }
				    ticketRange[index] = [parseInt(first_ticket_index), parseInt(last_ticket_index)]
				    current_ticket_number_index = current_ticket_number_index + 1;

				}

				return ('From ' + ticketRange[index][0] + ' to ' + ticketRange[index][1]);
			}
    	}

        $http.get ('https://wallet.shiftnrg.org/api/delegates/get?username=' + user).then (function (res) {
            $scope.delegate = res.data.delegate;

            $('#home-tab').trigger('click');


            $http.get('https://wallet.shiftnrg.org/api/accounts/delegates?address=' + res.data.delegate.address).then (function (res) {
                $scope.votes = res.data.delegates;
            });

            $http.get('https://wallet.shiftnrg.org/api/delegates/voters?publicKey=' + res.data.delegate.publicKey).then (function (res) {
               $scope.voters = res.data.accounts;

                parseTable(2, 'desc');
            });
        });
    }
    // if route is index
    $http.get('https://wallet.shiftnrg.org/api/delegates').then (function (res) {
        $scope.first_delegates = res.data.delegates;
        $scope.delegates = res.data.delegates;
        $scope.totalCount = res.data.totalCount;

        if ((window.location.href.split('/').pop() === "") || (window.location.href.split('/').pop() === "index.html") ) {
            setTimeout(function () {
                parseTable(6, 'asc');
            }, 4000);

            const loop = [...Array(8)].map((_, i) => {
              $http.get('https://wallet.shiftnrg.org/api/delegates?offset='+parseInt(i+1)+'01').then (function (res) {
                $scope.delegates = res.data.delegates.concat($scope.delegates);
              });
            });
        }
    });

});
if (location.protocol == 'http:')
{
 location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
