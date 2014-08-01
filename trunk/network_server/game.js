function Game(players,cards,first) {
  this.people = [];
  this.cards = [];
  this.max_users = 2;
  this.current_turn = first;
  this.game_started = null;
  for(var player in players){
	  this.people[player] = {name:players[player]['name'],game:new Player_Data()};
  }
  this.create_game(cards);
  this.game_ended = false;
};

function Player_Data(){
	this.deck = [];
	this.discard = [];
	this.used = [];
	this.hand = [];
	this.stats = {turn:0,action:0,buy:0,money:0};
}

Game.prototype.create_game = function(cards){
	//this.pick_first();
	for(var card in cards) {
		cards[card]['current_quantity'] = cards[card]['quantity'];
		//Now we have to create the descriptions for the cards
		var description = [];
		
		for(var action in cards[card]['attrs']){
			if(action === 'money'){
				description.push("+$" + cards[card]['attrs']['money'] + "");
			}
			if(action === 'action'){
				description.push("+" + cards[card]['attrs']['action'] + " Action");
			}
			if(action === 'buy'){
				description.push("+" + cards[card]['attrs']['buy'] + " Buy");
			}
			if(action === 'card'){
				description.push("+" + cards[card]['attrs']['card'] + " Card(s)");
			}
			if(action === 'victory'){
				//parseInt(card['attrs']['buy'],10)
				var victories = parseInt(cards[card]['attrs']['victory'],10);
				description.push((victories>0?"+":"") + victories + " Victory");
			}
			if(action === 'card_opponents'){
				description.push("+" + cards[card]['attrs']['card_opponents'] + " Card(s) Opponent(s)");
			}
			if(action === 'curse_opponents'){
				description.push("+" + cards[card]['attrs']['curse_opponents'] + " Curse(s) Opponent(s)");
			}
		}
		cards[card]['description'] = description;
  	}
	this.cards = cards;
  	for(var person in this.people){
		this.people[person]['game']['deck']=this.shuffle(this.get_starting_deck(this.cards));
		this.people[person]['game']['stats'] = {turn:0,action:0,buy:0,money:0};
		this.people[person]['game']['hand'] = this.draw_starting_hand(this.people[person]);
		this.people[person]['game']['discard'] = [];
		this.people[person]['game']['used'] = [];
	}
}

Game.prototype.game_over = function(){
	if (1 > this.cards[this.find_card('Province',this.cards)]['current_quantity'] || this.game_ended){
		return true;
	}
	return false;
}

Game.prototype.return_points = function(card){
	for(var action in this.cards[card]['attrs']){
		if(action === 'victory'){
			return parseInt(this.cards[card]['attrs']['victory'],10);
		}
	}
	return 0;
}

Game.prototype.return_winner = function(){
	//var card_index = this.find_card('Province',this.cards);
	for(var person in this.people){
		while(this.people[person]['game']['hand'].length > 0){
			this.people[person]['game']['deck'].push(this.people[person]['game']['hand'].pop());
		}
		while(this.people[person]['game']['discard'].length > 0){
			this.people[person]['game']['deck'].push(this.people[person]['game']['discard'].pop());
		}
		console.log('Parsing cards');
		this.people[person]['game']['points'] = 0;
		for(var card in this.people[person]['game']['deck']){
			this.people[person]['game']['points'] += this.return_points(this.people[person]['game']['deck'][card]);
		}
	}
	console.log(this.people);
	var winner = this.people[0];
	console.log('Winner');
	console.log(winner);
	var user_meta = [{name:winner['name'],points:winner['game']['points']}];
	for(var i = 1; i < this.people; i++){
		user_meta.push({name:this.people[i]['name'],points:this.people[i]['game']['points']});
		if(this.people[i]['game']['points'] > winner['game']['points']){
			winner = this.people[i];
		}else if(this.people[i]['game']['points'] == winner['game']['points']){
			if(this.people[i]['game']['deck'].length > winner['game'][deck].length){
				winner = this.people[i];
			}
		}
	}
	console.log(winner);
	return {winner:winner['name'],user_meta:this.format_meta(user_meta)};
}

Game.prototype.format_meta = function(meta){
	var stringy = "<br>";
	
	for(var user in meta){
		stringy += "<p>" + meta[user]['name'] + ": points=>" + meta[user]['points'];
	}
	
	return stringy;
}

Game.prototype.use_card = function(user,card){
	var person = this.get_user(user);
	
	var card_index = this.find_card(card['name'],this.cards);
	var hand_index = -1;
	for(var position in person['game']['hand']){
		if(person['game']['hand'][position] == card_index){
			hand_index = position;
		}
	}
	console.log('Hand Index');
	console.log(hand_index);
	console.log('Deck Index');
	console.log(card_index);
	console.log('Raw Card');
	console.log(card);
	
	//fruits.indexOf("Apple");
	
	if(this.check_actions(card)){
		person['game']['stats']['action']--;
	}
	
	person['game']['used'].push(person['game']['hand'][hand_index]);
	person['game']['hand'].splice(hand_index, 1);
	
	for(var action in card['attrs']){
		console.log(action);
		if(action === 'money'){
			person['game']['stats']['money'] += parseInt(card['attrs']['money'],10);
		}
		if(action === 'action'){
			person['game']['stats']['action'] += parseInt(card['attrs']['action'],10);
		}
		if(action === 'buy'){
			person['game']['stats']['buy'] += parseInt(card['attrs']['buy'],10);
		}
		if(action === 'card'){
			person['game']['hand'] = person['game']['hand'].concat(this.draw_hand(person,parseInt(card['attrs']['card'],10)));
		}
		if(action === 'card_opponents'){
			for(var person in this.people){
				if(this.people[person]['name'] != user){
					this.people[person]['game']['hand'] = this.people[person]['game']['hand'].concat(this.draw_hand(this.people[person],parseInt(card['attrs']['card_opponents'],10)));
				}
			}
		}
		if(action === 'curse_opponents'){
			var curse_index = this.find_card('Curse',this.cards);
			var curse_card = this.cards[curse_index];
			for(var person in this.people){
				if(this.people[person]['name'] != user && curse_card['current_quantity'] > 0){
					this.people[person]['game']['hand'].push(curse_index);
					curse_card['current_quantity']--;
				}
			}
		}
	}
}

Game.prototype.card_action_check = function(user_name,card){
	console.log(card);
	var person = this.get_user(user_name);
	if((person['game']['stats']['action']>0 && this.check_actions(this.cards[this.find_card(card['name'],this.cards)]) 
			|| !this.check_actions(this.cards[this.find_card(card['name'],this.cards)]))){
		return true;
	}
	return false;
}

Game.prototype.check_actions = function(card){
	console.log(card);
	if(card['type'].indexOf("action")!=-1 || card['type'].indexOf("reaction")!=-1 || card['type'].indexOf("attack")!=-1){
		return true;
	}
	return false;
}

Game.prototype.can_buy_card = function(user,raw_card){
	var person = this.get_user(user);
	var card_index = this.find_card(raw_card['name'],this.cards);
	var card = this.cards[card_index];
	if(card['cost'] <= person['game']['stats']['money'] && card['current_quantity'] > 0 && person['game']['stats']['buy'] > 0){
		return true;
	}
	return false;
}

Game.prototype.buy_card = function(user,raw_card){
	console.log("Buying...");
	console.log(raw_card);
	var person = this.get_user(user);
	var card_index = this.find_card(raw_card['name'],this.cards);
	var card = this.cards[card_index];
	
	//if(card['cost'] <= person['game']['stats']['money'] && card['current_quantity'] > 0 && person['game']['stats']['buy'] > 0){
	person['game']['stats']['money'] -= card['cost'];
	person['game']['discard'].push(card_index);
	person['game']['stats']['buy']--;
	this.cards[card_index]['current_quantity']--;
	//}
}

Game.prototype.find_card = function(search_card, card_array){
	for(var card in card_array){
		if(card_array[card]['name'] == search_card){
			return card;
		}
	}
	return -1;
}

Game.prototype.game_package = function(user){
	var player = this.get_user(user);
	return {
    	turn:this.is_first(user),
    	cards:this.cards,
    	deck:player['game']['deck'],
    	hand:player['game']['hand'],
    	discard:player['game']['discard'],
    	stats:player['game']['stats']
    };
}

Game.prototype.next_turn = function(user){
	//If the player just had a turn, draw them a new hand
	var user_index = this.get_user_index(user);
	if(user_index == this.current_turn){
		while(this.people[user_index]['game']['hand'].length > 0){
			this.people[user_index]['game']['discard'].push(this.people[user_index]['game']['hand'].pop());
		}
		while(this.people[user_index]['game']['used'].length > 0){
			this.people[user_index]['game']['discard'].push(this.people[user_index]['game']['used'].pop());
		}
		this.people[user_index]['game']['hand'] = this.draw_starting_hand(this.people[user_index]);
	}
	
	//Increment turn to the next player
	this.increment_turn();
}

Game.prototype.increment_turn = function(){
	this.current_turn++;
	if(this.current_turn == this.people.length){
		this.current_turn = 0;
	}
}

/*Game.prototype.pick_first = function(){
	if(this.current_turn == -1){
		console.log('Pick First');
		this.current_turn = Math.floor((Math.random() * this.max_users));
	}
}*/

Game.prototype.draw_hand = function(person,cards){
	//this.people[person]
	 var new_hand = [];
	 for(var i = 0; i < cards; i++){
		 if(person['game']['deck'].length<1){
			 if(person['game']['discard'].length>0){
				 person['game']['deck'] = person['game']['discard'];
				 person['game']['discard'] = [];
				 this.shuffle(person['game']['deck']);
			 }else{
				return new_hand; 
			 }
		 }
		 new_hand.push(person['game']['deck'].pop());
	 }
	 return new_hand;
};

Game.prototype.draw_starting_hand = function(person){
	var new_hand = [];
	new_hand = this.draw_hand(person,5);
	this.reset_stats(person);
	return new_hand;
}

Game.prototype.reset_stats = function(person){
	 person['game']['stats']['turn']++;
	 person['game']['stats']['action'] = 1;
	 person['game']['stats']['buy'] = 1;
	 person['game']['stats']['money'] = 0;
}

Game.prototype.get_starting_deck = function(cards){
	var deck = [];
	for(var card in cards) {
		 /*if(cards[card]['name'] == "Estate"){
			 for(var i = 0; i < 3; i++){
				 deck.push(card);
			 }
		 }*/
		 if(cards[card]['name'] == "Council Room"){
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

Game.prototype.is_first = function(user_name){
	for(var person in this.people){
		if(user_name == this.people[person]['name']){
			console.log("First: " + this.current_turn);
			console.log("User: " + person);
			return person == this.current_turn;
		}
	}
	return false;
}

Game.prototype.shuffle = function(array){
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
}

Game.prototype.get_user = function(user_name){
	for(var person in this.people){
		if(this.people[person]['name'] == user_name){
			return this.people[person];
		}
	}
	return null;
}

Game.prototype.get_user_index = function(user_name){
	for(var person in this.people){
		if(this.people[person]['name'] == user_name){
			return person;
		}
	}
	return null;
}

module.exports = Game;