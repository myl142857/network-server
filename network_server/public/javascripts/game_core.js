function gameController($scope, $http, $compile, socket) {
	var quiz_name = "";
	
	//var socket = io.connect("127.0.0.1:3000");
	
	//A holder for the post form data
	$scope.formData = {};
	$scope.messages = [];
	$scope.username = "";
	
	$scope.cards = [];
	$scope.deck = [];
	$scope.discard = [];
	$scope.hand = [];
	$scope.hand_index = [];
	$scope.stats = {turn:0,action:0,buy:0,money:0};
	$scope.player_turn = true;
 
	socket.on('start_game', function (data) {
		console.log('Starting game!');
		socket.emit('game_talk',{ message: "Starting game!", name: "Server" });
	     $http.get('/get_cards').success(function(data) {
		   	 console.log(data);
		   	 /*
		   	  * first:room.is_first(req.session.username),
	            	cards:room['cards'],
	            	deck:player['deck'],
	            	hand:player['hand'],
	            	discard:player['discard'],
	            	stats:player['stats']
		   	  */
		   	 $scope.player_turn = data.first;
		   	 $scope.cards = data.cards;
		   	 $scope.deck = data.deck;
			 $scope.discard = data.discard;
			 $scope.hand_index = data.hand;
			 $scope.hand = [];
			 angular.forEach(data.hand, function(card_index) {
				 $scope.hand.push($scope.cards[card_index]);
			 });
			 $scope.stats = data.stats;
		   	 
		   	 //angular.forEach(data.cards, function(card) {
		   	 //	 card['current_quantity'] = card['quantity'];
		   	 //});
		   	 //$scope.cards = data.cards;
		   	 //$scope.createDeck();
			 //$scope.deck = shuffle($scope.deck);
			 //$scope.draw();
		 });
    });
	
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
			socket.emit('game_talk', { message: user.message, name: $scope.username });
		}
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
	 
	 $scope.test = function(){
			console.log("Test"); 
	};
	 
	 $scope.loadData = function () {
		 console.log("Loading Page");
		 
		 $http.get('/enter_game').success(function(data) {
			 console.log(data);
	    	 $scope.username = data.name;
	    	 socket.emit('enter_game', { name: $scope.username });
	     });
	  };
	 
	$scope.loadData();
	
}