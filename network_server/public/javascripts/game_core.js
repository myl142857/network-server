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
	$scope.decision_info = "";
	$scope.player_turn = false;
	$scope.player_decision = null;
	$scope.decision = false;
	$scope.selecting_cards = false;
	$scope.gaining_cards = false;
 
	socket.on('start_game', function (data) {
		console.log('Starting game!');
		socket.emit('game_talk',{ message: "Starting game!", name: "Server" });
	     $http.get('/get_cards').success(function(data) {
			 $scope.player_decision = new Player_Decision($('.decision_div'),$scope);
			 $scope.load_data(data);
		 });
    });
	
	socket.on('update', function (data) {
    	 $scope.load_data(data);
    });
	
    socket.on('message', function (data) {
    	console.log(data);
        if(data.message) {
        	$scope.messages.push(data);
            var html = '';
            for(var i=0; i<$scope.messages.length; i++) {
                html += '<b>' + ($scope.messages[i].username ? $scope.messages[i].username : 'Server') + ': </b>';
                html += $scope.messages[i].message + '<br />';
            }
            $('#content').html(html);
            $("#content").scrollTop($("#content")[0].scrollHeight);
            $("#field").val('');
        } else {
            console.log("There is a problem:", data);
        }
    });
    
    socket.on('end_game', function (data) {
    	console.log('The game has ended!');
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
			angular.forEach(values, function(value) {
				if(card[field] == value){
					result.push(card);
				}
			});
        });
        return result;
	}
	 $scope.use_card = function(card){
		 if($scope.selecting_cards){
			 console.log('Selecting card');
			 card['selected'] = !card['selected'];
		 }else{
			 //Unlike buys, we need to know the exact index of the card in the player's hand
			 console.log('Using card');
			 socket.emit('player_use', { name: $scope.username, card:card });
		 }
	 };

	 $scope.sort_cost = function(card) {
	    return "" + card['cost'] + card['name'];
	  }
	 
	 $scope.buy_card = function(buy_card){
		 if($scope.gaining_cards){
			 console.log('Gaining Card');
			 console.log($scope.player_decision.value);
			 console.log(buy_card);
			 if(buy_card['cost'] <= $scope.player_decision.value){
				 console.log('In loop');
				 for(var card in $scope.cards){
					 $scope.cards[card]['selected'] = false;
				 }
				 buy_card['selected'] = true;
				 console.log('Card Selected');
				 console.log(buy_card);
			 }
		 }else{
			 socket.emit('player_buy', { name: $scope.username, card:buy_card });
		 }
	 };
	 
	 $scope.end_turn = function(){
		socket.emit('increment_turn', { name: $scope.username });
	 };
	 
	 $scope.exit_game = function(){
		 socket.emit('exit_game',{ name:$scope.username });
		 window.location = "http://localhost:3000/";
	 }
	 
	 $scope.make_decision = function(){
		 console.log('Making decision');
		 if($scope.selecting_cards){
			 var selected_cards = [];
			 for(var card in $scope.hand){
				 if($scope.hand[card]['selected']){
					 selected_cards.push($scope.hand[card]);
				 }
			 }
			 if(selected_cards.length <= $scope.player_decision.value){
				 console.log('Sending decision');
				 console.log(selected_cards);
				 socket.emit('card_decision_made',{ name:$scope.username, cards:selected_cards , action: $scope.player_decision.action });
			 }else{
				 alert('You have selected too many cards!');
			 }
	 	}
		if($scope.gaining_cards){
			 var selected_cards = [];
			 for(var card in $scope.cards){
				 if($scope.cards[card]['selected']){
					 selected_cards.push($scope.cards[card]);
				 }
			 }
			 socket.emit('card_decision_made',{ name:$scope.username, cards:selected_cards , action: $scope.player_decision.action });
		 }
	 }
	 
	 $scope.loadData = function () {
		 console.log("Loading Page");
		 
		 $http.get('/enter_game').success(function(data) {
			 console.log(data);
	    	 $scope.username = data.name;
	    	 socket.emit('enter_game', { name: $scope.username });
	     });
	  };
	  
	$scope.load_data = function(data){
		 console.log(data);
		 $scope.player_decision.reset_scope();
   	 	 $scope.player_turn = data.turn;
	   	 $scope.cards = data.cards;
	   	 $scope.deck = data.deck;
		 $scope.discard = data.discard;
		 $scope.hand_index = data.hand;
		 $scope.hand = [];
		 angular.forEach(data.hand, function(card_index) {
			 $scope.hand.push(jQuery.extend(true, {}, $scope.cards[card_index]));
		 });
		 $scope.stats = data.stats;
		 $scope.player_decision.parse_decision(data.actions);
	};
	 
	$scope.loadData();
	
}