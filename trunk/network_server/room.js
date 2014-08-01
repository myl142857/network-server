function Room(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.max_users = 2;
  this.cards = [];
  this.current_turn = -1;
  this.game_started = false;
  
  this.game = null;
  console.log('Room created!!!');
};

Room.prototype.create_game = function(cards){
	
	console.log(this);
	//console.log("Creating Game!!!");
	if(!this.game_started){
		console.log("Game Not Started!!!");
		var Game = require('./game');
		this.game = new Game(this.people,cards,Math.floor((Math.random() * this.max_users)));
		this.game_started = true;
	}
	
	/*this.pick_first();
	for(var card in cards) {
		cards[card]['current_quantity'] = cards[card]['quantity'];
  	}
	this.cards = cards;
  	for(var person in this.people){
		this.people[person]['deck']=this.shuffle(this.get_starting_deck(this.cards));
		this.people[person]['stats'] = {turn:0,action:0,buy:0,money:0};
		this.people[person]['hand'] = this.draw_hand(this.people[person]);
		this.people[person]['discard'] = [];
	}*/
	
}

//All the game functions for the room. Need to be separated out later
/*Room.prototype.game_over = function(){
	//var card_index = this.find_card('Province',this.cards);
	if (1 > this.cards[this.find_card('Province',this.cards)]['current_quantity']){
		return true;
	}
	return false;
}

Room.prototype.return_points = function(card){
	for(var action in this.cards[card]['attrs']){
		if(action === 'victory'){
			console.log('Found victory card!');
			console.log(this.cards[card]);
			return parseInt(this.cards[card]['attrs']['victory'],10);
		}
	}
	return 0;
}

Room.prototype.return_winner = function(){
	//var card_index = this.find_card('Province',this.cards);
	for(var person in this.people){
		while(this.people[person]['hand'].length > 0){
			this.people[person]['deck'].push(this.people[person]['hand'].pop());
		}
		while(this.people[person]['discard'].length > 0){
			this.people[person]['deck'].push(this.people[person]['discard'].pop());
		}
		console.log('Parsing cards');
		this.people[person]['points'] = 0;
		for(var card in this.people[person]['deck']){
			this.people[person]['points'] += this.return_points(this.people[person]['deck'][card]);
		}
	}
	console.log(this.people);
	var winner = this.people[0];
	console.log('Winner');
	console.log(winner);
	var user_meta = [{name:winner['name'],points:winner['points']}];
	for(var i = 1; i < this.max_users; i++){
		user_meta.push({name:this.people[i]['name'],points:this.people[i]['points']});
		if(this.people[i]['points'] > winner['points']){
			winner = this.people[i];
		}else if(this.people[i]['points'] == winner['points']){
			if(this.people[i]['deck'].length > winner[deck].length){
				winner = this.people[i];
			}
		}
	}
	console.log(winner);
	return {winner:winner['name'],user_meta:this.format_meta(user_meta)};
}

Room.prototype.format_meta = function(meta){
	var stringy = "<br>";
	
	for(var user in meta){
		stringy += "<p>";
		for(var data in meta[user]){
			stringy += " " + data + ": " + meta[user][data];
		}
		stringy += "</p>";
	}
	
	return stringy;
}


Room.prototype.use_card = function(user,card){
	var person = this.get_user(user);
	
	var card_index = this.find_card(card['name'],this.cards);
	var hand_index = -1;
	for(var position in person['hand']){
		if(person['hand'][position] == card_index){
			hand_index = position;
		}
	}
	console.log('Hand Index');
	console.log(hand_index);
	console.log('Deck Index');
	console.log(card_index);
	console.log('Raw Card');
	console.log(card);
	
	
	for(var action in card['attrs']){
		console.log(action);
		if(action === 'money'){
			person['stats']['money'] += parseInt(card['attrs']['money'],10);
		}
	}
	
	person['discard'].push(person['hand'][hand_index]);
	person['hand'].splice(hand_index, 1);
}

Room.prototype.buy_card = function(user,raw_card){
	console.log("Buying...");
	console.log(raw_card);
	var person = this.get_user(user);
	var card_index = this.find_card(raw_card['name'],this.cards);
	var card = this.cards[card_index];
	
	if(card['cost'] <= person['stats']['money'] && card['current_quantity'] > 0 && person['stats']['buy'] > 0){
		person['stats']['money'] -= card['cost'];
		person['discard'].push(card_index);
		person['stats']['buy']--;
		this.cards[card_index]['current_quantity']--;
	}
}

Room.prototype.find_card = function(search_card, card_array){
	for(var card in card_array){
		if(card_array[card]['name'] == search_card){
			return card;
		}
	}
	return -1;
}

Room.prototype.game_package = function(user){
	var player = this.get_user(user);
	return {
    	turn:this.is_first(user),
    	cards:this.cards,
    	deck:player['deck'],
    	hand:player['hand'],
    	discard:player['discard'],
    	stats:player['stats']
    };
}

Room.prototype.next_turn = function(user){
	//If the player just had a turn, draw them a new hand
	var user_index = this.get_user_index(user);
	if(user_index == this.current_turn){
		while(this.people[user_index]['hand'].length > 0){
			this.people[user_index]['discard'].push(this.people[user_index]['hand'].pop());
		}
		this.people[user_index]['hand'] = this.draw_hand(this.people[user_index]);
	}
	
	//Increment turn to the next player
	this.increment_turn();
}

Room.prototype.increment_turn = function(){
	this.current_turn++;
	if(this.current_turn == this.max_users){
		this.current_turn = 0;
	}
}

Room.prototype.pick_first = function(){
	if(this.current_turn == -1){
		this.current_turn = Math.floor((Math.random() * this.max_users));
	}
}

Room.prototype.draw_hand = function(person){
	//this.people[person]
	 var new_hand = [];
	 for(var i = 0; i < 5; i++){
		 if(person['deck'].length<1){
			 person['deck'] = person['discard'];
			 this.shuffle(person['deck']);
		 }
		 new_hand.push(person['deck'].pop());
	 }
	 person['stats']['turn']++;
	 person['stats']['action'] = 1;
	 person['stats']['buy'] = 1;
	 person['stats']['money'] = 8;
	 return new_hand;
};

Room.prototype.get_starting_deck = function(cards){
	var deck = [];
	for(var card in cards) {
		 if(cards[card]['name'] == "Estate"){
			 for(var i = 0; i < 3; i++){
				 deck.push(card);
			 }
		 }
		 if(cards[card]['name'] == "Copper"){
			 for(var i = 0; i < 7; i++){
				 deck.push(card);
			 }
		 }
	};
	return deck;
};

Room.prototype.is_first = function(user_name){
	for(var person in this.people){
		if(user_name == this.people[person]['name']){
			console.log("First: " + this.current_turn);
			console.log("User: " + person);
			return person == this.current_turn;
		}
	}
	return false;
}

Room.prototype.shuffle = function(array){
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
}*/


//Here are all the social/deep functions for the room
Room.prototype.get_user = function(user_name){
	for(var person in this.people){
		if(this.people[person]['name'] == user_name){
			return this.people[person];
		}
	}
	return null;
}

Room.prototype.get_user_index = function(user_name){
	for(var person in this.people){
		if(this.people[person]['name'] == user_name){
			return person;
		}
	}
	return null;
}

Room.prototype.add_user = function(user_name, socket_id){
	//$scope.stats = {turn:0,action:0,buy:0,money:0};
	//console.log('Adding User');
	//console.log(user_id + ' : ' + user_name);
	
	for(var user in this.people){
		//This needs to check for the socket instead once it gets pushed to production
		if(this.people[user]['socket'] == socket_id){
			this.people[user]['name'] = user_name;
			return null;
		}
	}
	var object = {name:user_name, socket:socket_id};
	console.log('Created New User!');
	console.log(object);
	this.people.push({name:user_name, socket:socket_id});
	//console.log(this.people);
	return null;
}

Room.prototype.print_all_people = function(){
	console.log('Room ' + this.name + ' people start');
	for(var person in this.people){
		console.log(this.people[person]);
	}
	console.log('Room ' + this.name + ' people end');
}

Room.prototype.update_socket = function(user_name, socket_id){
	console.log('Looking for...');
	console.log(user_name);
	for(var user in this.people){
		console.log(this.people[user]);
		//console.log(this.people[user]['socket']);
		if(this.people[user]['name'] == user_name){
			this.people[user]['socket'] = socket_id;
		}
	}
}

Room.prototype.find_socket = function(user_name){
	console.log('Looking for...');
	console.log(user_name);
	for(var user in this.people){
		console.log(this.people[user]);
		//console.log(this.people[user]['socket']);
		if(this.people[user]['name'] == user_name){
			return this.people[user]['socket'];
		}
	}
	return "";
}

Room.prototype.find_user = function(user_name){
	console.log('Looking for...');
	console.log(user_name);
	for(var user in this.people){
		console.log(this.people[user]);
		//console.log(this.people[user]['socket']);
		if(this.people[user]['name'] == user_name){
			return true;
		}
	}
	return false;
}

module.exports = Room;