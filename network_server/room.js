function Room(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.max_users = 2;
  this.cards = [];
  this.first = -1;
  this.game_started = null;
};

Room.prototype.pick_first = function(){
	if(this.first == -1){
		this.first = Math.floor((Math.random() * this.max_users));
	}
}

Room.prototype.create_game = function(cards){
	this.pick_first();
	for(var card in cards) {
		cards[card]['current_quantity'] = cards[card]['quantity'];
  	}
	this.cards = cards;
  	for(var person in this.people){
		this.people[person]['deck']=this.get_starting_deck(this.cards);
		this.people[person]['stats'] = {turn:0,action:0,buy:0,money:0};
		this.people[person]['hand'] = this.draw_hand(this.people[person]);
		this.people[person]['discard'] = [];
	}
}

Room.prototype.draw_hand = function(person){
	 var new_hand = [];
	 for(var i = 0; i < 5; i++){
		 if(person['deck'].length<1){
			 person['deck'] = person['discard'];
			 shuffle(person['deck']);
		 }
		 new_hand.push(person['deck'].pop());
	 }
	 person['stats']['turn']++;
	 person['stats']['action'] = 1;
	 person['stats']['buy'] = 1;
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
			console.log("First: " + this.first);
			console.log("User: " + person);
			return person == this.first;
		}
	}
	return false;
}

Room.prototype.get_user = function(user_name){
	for(var person in this.people){
		if(this.people[person]['name'] == user_name){
			return this.people[person];
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