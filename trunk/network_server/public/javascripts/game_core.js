function gameController($scope, $http, $compile, socket) {
	var quiz_name = "";
	
	//A holder for the post form data
	$scope.formData = {};
	$scope.cards = [];
	$scope.messages = [];
	$scope.username = "tester";
	$scope.deck = [];
	$scope.discard = [];
	$scope.hand = [];
	$scope.stats = {turn:0,action:0,buy:0,money:0};
	$scope.player_turn = true;
 
    socket.on('message', function (data) {
    	console.log(data);
        if(data.message) {
            if(data.action == 'use'){
            	data.message = 'uses ' + data.message;
            }
            if(data.action == 'buy'){
            	$scope.opponent_buy_card(data.message);
            	data.message = 'buys ' + data.message;
            }
        	$scope.messages.push(data);
            var html = '';
            for(var i=0; i<$scope.messages.length; i++) {
                html += '<b>' + ($scope.messages[i].username ? $scope.messages[i].username : 'Server') + ': </b>';
                html += $scope.messages[i].message + '<br />';
            }
            $('#content').html(html);
            $("#content").scrollTop($("#content")[0].scrollHeight);
            $("#field").val('');
            if(data.action === 'end_turn'){
	            $scope.player_turn = !$scope.player_turn;
	            if($scope.player_turn){
	            	$scope.draw();
	            }
            }
        } else {
            console.log("There is a problem:", data);
        }
    });
	
	$scope.send = function(user){
		console.log(user.message);
		if($scope.username != ""){
			socket.emit('send', { message: user.message, username: $scope.username, action:'talk'});
		}else{
			alert("Please login to the chat!");
		}
	};
	
	$scope.login = function(user){
		console.log(user.name);
		$scope.username = user.name;
		$("#username").val('');
	};
	
	$scope.filterCards = function(cards,field,values){
		var result = [];
		angular.forEach(cards, function(card) {
			//console.log(card);
			angular.forEach(values, function(value) {
				if(card[field] == value){
					result.push(card);
				}
			});
        });
        return result;
	}
	   
	 $scope.loadData = function () {
		 console.log("Loading Page");
	     $http.get('/all').success(function(data) {
	    	 console.log(data);
	    	 angular.forEach(data, function(card) {
	    		 card['current_quantity'] = card['quantity'];
	    	 });
	    	 $scope.cards = data;
	    	 $scope.createDeck();
	    	 $scope.deck = shuffle($scope.deck);
	    	 $scope.draw();
	     });
	  };
	
	  $scope.createDeck = function(){
		  angular.forEach($scope.cards, function(card) {
			 if(card['name'] == "Estate"){
				 for(var i = 0; i < 3; i++){
					 $scope.deck.push(card);
				 }
			 }
			 if(card['name'] == "Copper"){
				 for(var i = 0; i < 7; i++){
					 $scope.deck.push(card);
				 }
			 }
		  });
	 };
	
	 $scope.draw = function(){
		 for(var i = 0; i < 5; i++){
			 if($scope.deck.length<1){
				 $scope.deck = $scope.discard;
				 shuffle($scope.deck);
			 }
			 $scope.hand.push($scope.deck.pop());
		 }
		 $scope.stats['turn']++;
		 $scope.stats['action'] = 1;
		 $scope.stats['buy'] = 1;
	 };
	 
	 $scope.use_card = function(index){
		 console.log("Clicked On Card");
		 console.log($scope.hand[index]);
		 use($scope,$scope.hand[index]);
		 $scope.discard.push($scope.hand[index]);
		 socket.emit('send', { message: $scope.hand[index]['name'], username: $scope.username, action:'use'});
		 $scope.hand.splice(index, 1);
	 };
	 
	 $scope.opponent_buy_card = function(buy_card){
		console.log(buy_card);
		console.log('Searching');
		for(var card in $scope.cards){
			console.log($scope.cards[card]);
			if($scope.cards[card]['name'] == buy_card){
				buy_opponent($scope,$scope.cards[card]);
			}
	 	}
	 };
	 
	 $scope.buy_card = function(card){
		 console.log("Clicked On Card");
		 console.log(card);
		 if(buy($scope,card)){
			 socket.emit('send', { message: card['name'], username: $scope.username, action:'buy'});
		 }
	 };
	 
	 $scope.end_turn = function(){
		console.log("Turn Ended!"); 
		socket.emit('send', { message: 'ends turn', username: $scope.username, action:'end_turn'});
		while($scope.hand.length > 0){
			 $scope.discard.push($scope.hand.pop());
		 }
	 };
	 
	$scope.loadData();
	
}