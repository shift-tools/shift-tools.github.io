var app = angular.module('delegateApp', []);

function parseTable(order, ascdesc, maxItem, countdown) {
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
    }, countdown);
}


function next_roll() {
    var currentTime = new Date()
    var month = currentTime.getMonth() + 2
    var year = currentTime.getFullYear()
    date = (1 + "/" + month + "/" + year)

    return date;
}

function show_table() {
    if (window.location.href.indexOf("/proofofhodl") > -1) {
        parseTable(7, 'desc', 101, 5000);
    }
    else if (((window.location.href.indexOf("/pools") > -1) || (window.location.href.indexOf("/checkpools") > -1))) {
        parseTable(0, 'asc', 101, 5000);
    }
    else {
        parseTable(2, 'desc', 10, 3000);
    }
}

app.controller('indexCtrl', function($scope, $http) {
    $scope.accounts 			  = [];
    $scope.lastpayout 			  = 0;
    $scope.nextpayout 			  = 0;
    current_ticket_number_index   = 0;
    ticketRange                   = {};
    previous_ticket_number        = -1;
    first_delegates               = [];
    pools_balance                 = [];
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

    function delegates_show() {
        $http.get('https://wallet.shiftnrg.org/api/delegates').then (function (res) {
            $scope.first_delegates = res.data.delegates;
            $scope.delegates = res.data.delegates;
            $scope.totalCount = res.data.totalCount;
            $scope.nextRoll = next_roll();
            $scope.minted_shift = function(blocks) {
                return parseInt(blocks*1.1);
            };

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

            // if route is proof of hodl
            
            if (window.location.href.indexOf("/proofofhodl") > -1) {
                show_table();

                $http.get('https://raw.githubusercontent.com/vekexasia/dpos-tools-data/master/shift.yml').then (function (res) {
                    $scope.pools = YAML.parse(res.data).pools;
                    $scope.countPools = YAML.parse(res.data).pools.length;

                    for (var i = 0; i < $scope.delegates.length; i++) {
                        address = $scope.delegates[i].address;
                        $http.get ('https://wallet.shiftnrg.org/api/accounts/getBalance?address=' + address).then (function (res) {
                            pools_balance.push([res.config.url.split('=')[1], res.data.balance]);

                            $scope.IsaPool = function(pools_data, pool_name) {
                                for (var i = 0; i < pools_data.length; i++) {
                                    if (pools_data[i].delegate == pool_name) {
                                       return 'yes';
                                    }
                                    else {
                                    }
                                }
                            }

                            $scope.poolPercentage = function(pools_data, pool_name) {
                                for (var i = 0; i < pools_data.length; i++) {
                                    if (pools_data[i].delegate == pool_name) {
                                       return pools_data[i].share + '%';
                                    }
                                }
                            }

                            $scope.currentBalance = function(pools_data, address, pool_name) {
                                for (var i = 0; i < pools_balance.length; i++) {
                                    if (pools_balance[i][0] == address) {
                                       return parseInt(pools_balance[i][1]*0.00000001);
                                    }
                                }
                            }

                            $scope.ishodling = function(pools_data, address, pool_name, minted_shifts) {

                                for (var i = 0; i < pools_balance.length; i++) {
                                    if (pools_balance[i][0] == address) {
                                       currentBalance = parseInt(pools_balance[i][1]*0.00000001);
                                    }
                                }

                                poolPercentage = 0;
                                for (var i = 0; i < pools_data.length; i++) {
                                    if (pools_data[i].delegate == pool_name) {
                                       poolPercentage = pools_data[i].share;
                                    }
                                    else {
                                        if (!(poolPercentage != 0)) {
                                          poolPercentage = 0;  
                                        }    
                                    }
                                }

                                return Math.round(parseFloat(((currentBalance*((poolPercentage/100)+1))/minted_shifts)*100) * 100) / 100 + '%';

                            }

                            $scope.ishodlingcolor = function(pools_data, address, pool_name, minted_shifts) {

                                for (var i = 0; i < pools_balance.length; i++) {
                                    if (pools_balance[i][0] == address) {
                                       currentBalance = parseInt(pools_balance[i][1]*0.00000001);
                                    }
                                }

                                poolPercentage = 0;
                                for (var i = 0; i < pools_data.length; i++) {
                                    if (pools_data[i].delegate == pool_name) {
                                       poolPercentage = pools_data[i].share;
                                    }
                                    else {
                                        if (!(poolPercentage != 0)) {
                                          poolPercentage = 0;  
                                        }    
                                    }
                                }

                                if ((Math.round(parseFloat(((currentBalance*((poolPercentage/100)+1))/minted_shifts)*100) * 100) / 100) > 70) {
                                    return 'chartreuse';
                                }
                                else {
                                    return 'rgb(239, 132, 132)';
                                }

                            }
                        });
                    }


                });
            }
        });
    }

    // if route is index
    delegates_show();


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

                if((window.location.href.indexOf("/checkpools") > -1) || (window.location.href.indexOf("/proofofhodl") > -1)) {
                    for (var i = 0; i < $scope.pools.length; i++){
                        var pool          = $scope.pools[i];

                        $scope.pools_data = [];

                        do_http_calls(pool);

                    }
                
                    if(window.location.href.indexOf("/checkpools") > -1) {
                        $http.get('https://wallet.shiftnrg.org/api/transactions?orderBy=timestamp:desc&limit=250&recipientId='+checkAddress).then (function (res) {
                            window.eed = res;
                            for (var i = 0; i < res.data.transactions.length; i++) {
                                transaction = res.data.transactions[i];

                                if(!($scope.transaction_list[transaction.senderId])) {
                                    $scope.transaction_list[transaction.senderId] = [transaction.id, transaction.timestamp, transaction.amount];
                                }
                            };
                        });
                    }
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
                else {
                    return '';
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
            $scope.isforgingdelegatecheck = function(delegate_name) {
                for (var i = 0; i < first_delegates.length; i++){
                    var delegate = first_delegates[i];
                    if ((delegate.username == delegate_name) && ((delegate.username != 'vekexasia'))) {
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

            $scope.pool_name_color = function(pools_data, pool_name) {
                if (pool_name == 'vekexasia'){
                    return 'yellow';
                }
                else if(pool_name == 'shift_tools') {
                    return 'yellow';
                }
                else if ($scope.partOfPool(pools_data, pool_name) == 'yes') {
                    if ($scope.is_recent_transaction($scope.transaction_timestamp($scope.getAddress(pool_name)), $scope.transaction_amount($scope.getAddress(pool_name))) == 'Recently') {
                        return 'chartreuse';
                    }
                    else if (pool_name == 'saluki'){
                        return 'yellow';
                    }
                    else if (pool_name == 'yondz'){
                        return 'yellow';
                    }
                    else {
                        return '#ef8484';
                    }
                }
                else {
                    if(pool_name == 'shift_tools') {
                        return 'yellow';
                    }
                    else {
                        return 'none';
                    }
                }
            }
            $scope.last_transaction_comment = function(pools_data, pool_name) {
                if($scope.partOfPool(pools_data, pool_name) == 'yes') {
                    if(pool_name == 'shift_tools') {
                        return 'The awesome creator of Shift_Tools, and of the Active Pool List. ';
                    }
                    else if (pool_name == 'saluki'){
                        return 'Saluki gives half of his earnings to the Shift Team !';
                    }
                    else if ((pool_name == 'yondz') && ($scope.explorer_link($scope.getAddress(pool_name)) == '')){
                        return 'Yondz organizes a lottery and gives some of his earnings to the team. Visit his website for more info.';
                    }
                    else {
                        return $scope.explorer_link($scope.getAddress(pool_name));
                    }
                }
                else {
                    if(pool_name == 'shift_tools') {
                        return "You haven't voted for me yet ! Help Shift Tools, vote Shift_Tools ^_^";
                    }
                }
            }
        }

        function pad(n) {
            var s = "000" + n;
            return s.substr(s.length-4);
        }

    	if (window.location.href.indexOf("/lottery") > -1) {

			$scope.getPercentage = function(percentage) {
			   return percentage.toFixed(2);
			}

			$scope.getTicketsRange = function(percentage, index, last_voter_index) {
                if( ticketRange[index] === undefined ) {
                    if (index > current_ticket_number_index) {
                        number_of_tickets  = parseInt((percentage/100)*10000);

                        if (number_of_tickets >= 1) {
                            first_ticket_index = parseInt(previous_ticket_number + 1);
                            last_ticket_index  = parseInt(first_ticket_index + number_of_tickets - 1);
                        }
                        else {
                            first_ticket_index = 0;
                            last_ticket_index  = -1;
                        }

                        if (index+1 == last_voter_index) {
                            last_ticket_index = '9999';
                        }

                        previous_ticket_number = last_ticket_index;

                        ticketRange[index] = [parseInt(first_ticket_index), parseInt(last_ticket_index)]
                        current_ticket_number_index = parseInt(current_ticket_number_index + 1);
                        return ('From ' + ticketRange[index][0] + ' to ' + ticketRange[index][1]);
                    }
                    
                }
                else {
                    return ('From ' + pad(ticketRange[index][0]) + ' to ' + pad(ticketRange[index][1]));                    
                }
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

               show_table();
            });
        });
    }


});
