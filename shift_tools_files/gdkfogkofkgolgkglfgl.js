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
    $scope.transaction_list       = {};
    $scope.last_transaction_timestamp = 0;

    pools = null;
    if (window.location.search.substr(10) == '') {
        var user = 'shift_tools';
    }
    else {
        if (window.location.href.indexOf("/checkpools") > -1) {
            var user = 'shift_tools';
        }        
        else {
            var user = window.location.search.substr(10);
        }
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
    if ((window.location.href.indexOf("/delegates") > -1) || (window.location.href.indexOf("/lottery") > -1) || (window.location.href.indexOf("/pools") > -1) || (window.location.href.indexOf("/checkpools") > -1)) {
        if (window.location.href.indexOf("/pools") > -1 || (window.location.href.indexOf("/checkpools") > -1)) {
            checkAddress = window.location.search.substr(14);

            var do_http_calls = function(pool) {
                $http.get ('https://wallet.shiftnrg.org/api/delegates/get?username=' + pool.delegate).then (function (res) {

                    $http.get('https://wallet.shiftnrg.org/api/delegates/voters?publicKey=' + res.data.delegate.publicKey).then (function (res) {
                        for (var i = 0; i < res.data.accounts.length; i++){
                            var account = res.data.accounts[i];
                            if (checkAddress == account.address) {
                                $scope.pools_data.push(pool.delegate);
                            }
                        }
                    });
                });
            }

            $http.get('https://raw.githubusercontent.com/vekexasia/dpos-tools-data/master/shift.yml').then (function (res) {

                $scope.pools = YAML.parse(res.data).pools;
                $scope.countPools = YAML.parse(res.data).pools.length;

                if(window.location.href.indexOf("/checkpools") > -1) {
                    for (var i = 0; i < $scope.pools.length; i++){
                        var pool          = $scope.pools[i];

                        $scope.pools_data = [];

                        do_http_calls(pool);

                    }
                

                    $http.get('https://wallet.shiftnrg.org/api/transactions?limit=200&recipientId='+checkAddress).then (function (res) {
                        window.eed = res;
                        for (var i = 0; i < res.data.transactions.length; i++) {
                            transaction = res.data.transactions[i];

                            if(!($scope.transaction_list[transaction.senderId])) {
                                $scope.transaction_list[transaction.senderId] = [transaction.id, transaction.timestamp, transaction.amount];
                            }
                        };
                    });
            
                };
            });

            $http.get('https://wallet.shiftnrg.org/api/transactions?limit=1&orderBy=timestamp:desc').then (function (res) {
                $scope.last_transaction_timestamp=res.data.transactions[0].timestamp;
            });
            
            $scope.is_shift_tools = function(pool_name) {
                if(pool_name == 'shift_tools') {
                    return true;
                }
            }

            $scope.is_vekexasia = function(pool_name) {
                if(pool_name == 'vekexasia') {
                    return true;
                }
            }

            $scope.is_recent_transaction = function(timestamp, amount) {
                console.log(timestamp + '-' + $scope.last_transaction_timestamp);
                if(amount===undefined){
                    return 'Never !';
                }
                if(timestamp>parseInt($scope.last_transaction_timestamp-1203305)) {
                    return 'Recently';
                }
                else {
                    return 'More than 10 days ago !'
                }

            }

            $scope.partOfPool = function(pools_data, pool_name) {
                for (var i = 0; i < pools_data.length; i++) {
                    if (pools_data[i] == pool_name) {
                       return 'yes';
                    }
                    else {
                    }
                }
            }
            $scope.explorer_link = function(pool_address) {
                if ($scope.transaction_list[pool_address]) {
                    return 'https://explorer.shiftnrg.org/tx/' + $scope.transaction_list[pool_address][0];                    
                }
            }
            $scope.transaction_timestamp = function(pool_address) {
                if ($scope.transaction_list[pool_address]) {
                    return ($scope.transaction_list[pool_address][1]);
                }
            }
            $scope.transaction_amount = function(pool_address) {
                if ($scope.transaction_list[pool_address]) {
                    return $scope.transaction_list[pool_address][2];
                }
            }

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
            $scope.getAddress = function(delegate_name) {
                for (var i = 0; i < first_delegates.length; i++){
                    var delegate = first_delegates[i];
                    if (delegate.username == delegate_name) {
                        return delegate.address;
                    }

                }
               return false;
            }
            $scope.getSharingPercentage = function(percentage) {
               return percentage;
            }
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

                if (!(window.location.href.indexOf("/pools") > -1) && !(window.location.href.indexOf("/checkpools") > -1)) {
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
