var app = angular.module('delegateApp', []);

function parseTable(order, ascdesc, maxItem) {
    setTimeout(function () {
     $(".username").each(function(index, item) {
        value = $(item).text();
        item.innerHTML = "<a href='delegates.html?username=" + value +"'>"+ value +"</a>";
     });

    $('table#dataTables-example tr').filter(function (index) { 
        return $(this).children().length < 1; 
    }).remove();

    $('table#dataTables-example').dataTable(
            {
                aaSorting: [[order, ascdesc]],
                pageLength: maxItem,
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
    first_delegates               = [];
    if (window.location.search.substr(10) == '') {
        var user = 'shift_tools';
    }
    else {
        var user = window.location.search.substr(10);
    }

    // if route is index
    $http.get('https://wallet.shiftnrg.org/api/delegates').then (function (res) {
        $scope.first_delegates = res.data.delegates;
        $scope.delegates = res.data.delegates;
        $scope.totalCount = res.data.totalCount;
        first_delegates = $scope.first_delegates;
        if ((window.location.href.split('/').pop() === "") || (window.location.href.split('/').pop() === "index.html") ) {
            setTimeout(function () {
                parseTable(6, 'asc', 10);
            }, 4000);

            const loop = [...Array(8)].map((_, i) => {
              $http.get('https://wallet.shiftnrg.org/api/delegates?offset='+parseInt(i+1)+'01').then (function (res) {
                $scope.delegates = res.data.delegates.concat($scope.delegates);
              });
            });
        }
    });


    // if route is delegates show
    if ((window.location.href.indexOf("/delegates") > -1) || (window.location.href.indexOf("/lottery") > -1) || (window.location.href.indexOf("/pools") > -1)) {
        if (window.location.href.indexOf("/pools") > -1) {
            $scope.isnotvekexasia = function(delegate_name) {
               if (delegate_name != 'vekexasia') {
                   return true;
               }
               else {
                    return false;
               }
            }
            $scope.isforgingdelegate = function(delegate_name) {
                for (var i = 0; i < first_delegates.length; i++){
                    var delegate = first_delegates[i];
                    if (delegate.username == delegate_name) {
                        return true;
                    }

                }
               return false;
            }
            $scope.getRank = function(delegate_name) {
                for (var i = 0; i < first_delegates.length; i++){
                    var delegate = first_delegates[i];
                    if (delegate.username == delegate_name) {
                        return delegate.rank;
                    }

                }
               return false;
            }
            $scope.getSharingPercentage = function(percentage) {
               return percentage;
            }

            $http.get('https://raw.githubusercontent.com/vekexasia/dpos-tools-data/master/shift.yml').then (function (res) {
                window.hey = res;

                $scope.pools = YAML.parse(res.data).pools;
                $scope.countPools = YAML.parse(res.data).pools.length;
            });
        }

    	if (window.location.href.indexOf("/lottery") > -1) {
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

                if (!(window.location.href.indexOf("/pools") > -1)) {
                    parseTable(2, 'desc', 10);
                }
                else {
                    parseTable(0, 'asc', 101);
                }
            });
        });
    }


});
if (location.protocol == 'http:')
{
 location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
