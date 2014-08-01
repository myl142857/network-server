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
		   	 $scope.player_turn = data.turn;
		   	 $scope.cards = data.cards;
		   	 $scope.deck = data.deck;
			 $scope.discard = data.discard;
			 $scope.hand_index = data.hand;
			 $scope.hand = [];
			 angular.forEach(data.hand, function(card_index) {
				 $scope.hand.push($scope.cards[card_index]);
			 });
			 $scope.stats = data.stats;
			 if($scope.player_turn){
				 socket.emit('game_talk', { message: "I'm starting this game!", name: $scope.username }); 
			 }
		 });
    });
	
	socket.on('update', function (data) {
    	console.log(data);
    	$scope.player_turn = data.turn;
	   	 $scope.cards = data.cards;
	   	 $scope.deck = data.deck;
		 $scope.discard = data.discard;
		 $scope.hand_index = data.hand;
		 $scope.hand = [];
		 angular.forEach(data.hand, function(card_index) {
			 $scope.hand.push($scope.cards[card_index]);
		 });
		 $scope.stats = data.stats;
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
			//console.log(card);
			angular.forEach(values, function(value) {
				if(card[field] == value){
					result.push(card);
				}
			});
        });
        return result;
	}
	 $scope.use_card = function(card){
		 //Unlike buys, we need to know the exact index of the card in the player's hand
		 console.log('Using card');
		 socket.emit('player_use', { name: $scope.username, card:card });
	 };

	 $scope.buy_card = function(card){
		 socket.emit('player_buy', { name: $scope.username, card:card });
	 };
	 
	 $scope.end_turn = function(){
		//console.log("Turn Ended!"); 
		//increment_turn
		socket.emit('increment_turn', { name: $scope.username });
		//socket.emit('send', { message: 'ends turn', username: $scope.username, action:'end_turn'});
		//while($scope.hand.length > 0){
		//	 $scope.discard.push($scope.hand.pop());
		// }
	 };
	 
	 $scope.exit_game = function(){
		 socket.emit('exit_game',{ name:$scope.username });
		 window.location = "http://localhost:3000/";
	 }
	 
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
	  
	  /*$('.popover').on({
		    mousemove: function(e) {
		        $(this).next('img').css({
		            top: e.pageY - 260,
		            left: e.pageX + 10
		        });
		    },
		    mouseenter: function() {
		        var big = $('<img />', {'class': 'big_img', src: this.src});
		        $(this).after(big);
		    },
		    mouseleave: function() {
		        $('.big_img').remove();
		    }
		});*/
	 
	$scope.loadData();
	
}