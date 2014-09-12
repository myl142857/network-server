function Game(players,cards,first) {
  this.people = [];
  this.cards = [];
  this.max_users = 2;
  this.current_turn = this.starting_player = first;
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
	this.trash = [];
	this.extra_actions = [];
	this.stats = {turn:0,action:0,buy:0,money:0};
}

Game.prototype.return_gamedeck = function(cards){
	var end_cards = [];
	var buyables = [];
	console.log('Card list');
	console.log(cards);
	for(var card in cards){
		if(!cards[card]['avail']){
			if(buyables.length<10){
				buyables.push(cards[card]);
			}
		}else{
			end_cards.push(cards[card]);
		}
	}
	return end_cards.concat(buyables);
}

Game.prototype.create_game = function(cards){
	this.cards = this.return_gamedeck(this.shuffle(cards));
	console.log('Final card list');
	console.log(this.cards);
	
	var helper = require('./helper_description');
	this.cards = new helper(this.cards).cards;
	
  	for(var person in this.people){
		this.people[person]['game']['deck']=this.shuffle(this.get_starting_deck(this.cards));
		this.people[person]['game']['stats'] = {turn:0,action:0,buy:0,money:0};
		this.people[person]['game']['hand'] = this.draw_starting_hand(this.people[person]);
		this.people[person]['game']['discard'] = [];
		this.people[person]['game']['used'] = [];
		this.people[person]['game']['trash'] = [];
		this.people[person]['game']['extra_actions'] = [];
		console.log(this.people[person]['name']);
	}
}

Game.prototype.empty_piles = function(){
	var empty_piles = 0;
	for(var card in this.cards){
		if(this.cards[card]['current_quantity']<1){
			empty_piles++;
		}
	}
	return empty_piles;
}

Game.prototype.game_over = function(){
	//If there are 3 or more empty piles, no province cards, or a player ended the game prematurely
	if (2 < this.empty_piles() || 1 > this.cards[this.find_card('Province',this.cards)]['current_quantity'] || this.game_ended){
		console.log('Game ended');
		this.game_ended = true;
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

Game.prototype.discard = function(user,cards){
	var message = [];
	var person = this.get_user(user);
	var discarded = 0;
	for(var card in cards){
		var card_index = this.find_card(cards[card]['name'],this.cards);
		var hand_index = person['game']['hand'].indexOf(card_index);
		if(hand_index != -1){
			person['game']['used'].push(person['game']['hand'][hand_index]);
			person['game']['hand'].splice(hand_index, 1);
			discarded++;
		}
	}
	//person['game']['hand'] = person['game']['hand'].concat(this.draw_hand(person,parseInt(discarded,10)));
	message.push( person['name'] + " discards " + discarded + " card" + (discarded>1?"s":""));
	return message;
}

Game.prototype.discard_deck = function(user,cards){
	var message = [];
	var person = this.get_user(user);
	var discarded = 0;
	console.log('Discarding Cards');
	console.log(cards);
	for(var card in cards){
		console.log(cards[card]);
		var card_index = this.find_card(cards[card]['name'],this.cards);
		console.log(card_index);
		var deck_index = person['game']['deck'].indexOf(card_index);
		console.log(deck_index);
		if(deck_index != -1){
			person['game']['used'].push(person['game']['deck'][deck_index]);
			person['game']['deck'].splice(deck_index, 1);
			discarded++;
		}
	}
	//person['game']['hand'] = person['game']['hand'].concat(this.draw_hand(person,parseInt(discarded,10)));
	message.push( person['name'] + " discards " + discarded + " cards" );
	return message;
}

Game.prototype.discard_draw = function(user,cards){
	var message = [];
	var person = this.get_user(user);
	var discarded = 0;
	for(var card in cards){
		var card_index = this.find_card(cards[card]['name'],this.cards);
		var hand_index = person['game']['hand'].indexOf(card_index);
		if(hand_index != -1){
			person['game']['used'].push(person['game']['hand'][hand_index]);
			person['game']['hand'].splice(hand_index, 1);
			discarded++;
		}
	}
	person['game']['hand'] = person['game']['hand'].concat(this.draw_hand(person,parseInt(discarded,10)));
	message.push( person['name'] + " discards and draws " + discarded + " cards" );
	return message;
}

Game.prototype.trash_cards = function(user,cards,on_action,trash_used){
	var message = [];
	var person = this.get_user(user);
	var perform_on_action = false;
	
	console.log(cards);
	
	if(!trash_used){
		for(var card in cards){
			console.log('About to trash card index: ' + card);
			console.log(cards[card]);
			var card_index = this.find_card(cards[card]['name'],this.cards);
			console.log('About to trash card index: ' + card_index);
			var hand_index = person['game']['hand'].indexOf(card_index);
			console.log('About to trash hand index: ' + hand_index);
			if(hand_index != -1){
				person['game']['trash'].push(person['game']['hand'][hand_index]);
				person['game']['hand'].splice(hand_index, 1);
				message.push( person['name'] + " trashes " + this.cards[card_index]['name'] );
				perform_on_action = true;
			}
		}
	}else{
		for(var card in cards){
			console.log('About to trash card index: ' + card);
			console.log(cards[card]);
			var card_index = this.find_card(cards[card]['name'],this.cards);
			console.log('About to trash card index: ' + card_index);
			var hand_index = person['game']['used'].indexOf(card_index);
			console.log('About to trash hand index: ' + hand_index);
			if(hand_index != -1){
				person['game']['trash'].push(person['game']['used'][hand_index]);
				person['game']['used'].splice(hand_index, 1);
				message.push( person['name'] + " trashes " + this.cards[card_index]['name'] );
				perform_on_action = true;
			}
		}
	}
	if(perform_on_action){
		console.log('action_performed');
		console.log(on_action);
		for(var post_action in on_action){
			console.log(on_action[post_action]);
			if(on_action[post_action]['general'] === 'immediate'){
				if(on_action[post_action]['action'] === 'gain_money'){
					person['game']['stats']['money'] += parseInt(on_action[post_action]['value'],10);
				}
			}else{
				person['game']['extra_actions'].push(on_action[post_action]);
			}
		}
	}
	return message;
}

Game.prototype.gain_cards = function(user,cards){
	var message = [];
	var person = this.get_user(user);
	for(var card in cards){
		var card_index = this.find_card(cards[card]['name'],this.cards);
		//var hand_index = person['game']['hand'].indexOf(card_index);
		if(card_index != -1){
			person['game']['used'].push(card_index);
			this.cards[card_index]['current_quantity']--;

			message.push( person['name'] + " gains a " + this.cards[card_index]['name'] );
		}
	}
	return message;
}

Game.prototype.use_card = function(user,card,discard_card){
	
	//These are the things that a player can do after playing a card
	//Such as trashing other cards or making decisions
	extra_actions = [];
	var person = this.get_user(user);
	
	console.log("Using Card...");
	console.log(card);
	
	var card_index = this.find_card(card['name'],this.cards);
	var hand_index = -1;
	console.log("Starting function hand");
	console.log(person['game']['hand']);
	for(var position in person['game']['hand']){
		if(person['game']['hand'][position] == card_index){
			hand_index = position;
		}
	}

	//This section is only passed up when a card is multiplied. Subtract actions and discard card
	if(discard_card){
		
		if(this.check_actions(card)){
			person['game']['stats']['action']--;
		}
		
		person['game']['used'].push(person['game']['hand'][hand_index]);
		person['game']['hand'].splice(hand_index, 1);
	}
	
	//Make sure that the extra actions make sense when played twice in a row...
	//Every time there is an onaction call make sure that doubles append to the onaction
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
			var waiting_for_reaction = false;
			for(var player in this.people){
				if(this.people[player]['name'] != user && curse_card['current_quantity'] > 0){
					//Check if there is a reaction, then give the player a choice
					if(this.check_attack_reaction(this.people[player]['name'])){
						waiting_for_reaction = true;
						this.people[player]['game']['extra_actions'].push({action:'show_reaction',value:'0', general:'avoid',alt_action:
						{action:'gain_curse',value:'1',general:'gain'}});
					}else{
						this.people[player]['game']['used'].push(curse_index);
						curse_card['current_quantity']--;
					}
				}
			}
			if(waiting_for_reaction){
				//The attacking player has to wait until the other players show a reaction
				person['game']['extra_actions'].push({action:'wait_others',value:'*',general:'waiting'});
			}
		}
		if(action === 'trash_under'){
			person['game']['extra_actions'].push({action:'trash_under',value:'4',general:'trash'});
		}
		if(action === 'trash_specific'){
			if(card['attrs']['trash'] === '*'){
				var trash_action = "trash_specific";
				if(card['attrs']['trash_specific'] == card['name']){
					trash_action = "trash_self";
				}
				if('money' in card['attrs']['trash_actions']){
					var found_trash_action = false;
					for(var action in person['game']['extra_actions']){
						console.log(person['game']['extra_actions'][action]);
						if(person['game']['extra_actions'][action]['action'] === trash_action){
							person['game']['extra_actions'][action]['on_action'].push({action:'gain_money',value:card['attrs']['trash_actions']['money'],general:'immediate'});
							found_trash_action = true;
							console.log("Appending action");
							console.log(person['game']['extra_actions'][action]);
						}
					}
					if(!found_trash_action){
						person['game']['extra_actions'].push({action:trash_action,value:card['attrs']['trash_specific'],general:'trash',
							on_action:[{action:'gain_money',value:card['attrs']['trash_actions']['money'],general:'immediate'}]});
					}
				}
				if('gain_card' in card['attrs']['trash_actions']){
					var found_trash_action = false;
					for(var action in person['game']['extra_actions']){
						console.log(person['game']['extra_actions'][action]);
						if(person['game']['extra_actions'][action]['action'] === trash_action){
							person['game']['extra_actions'][action]['on_action'].push({action:'gain_card',value:card['attrs']['trash_actions']['gain_card'],general:'gain'});
							found_trash_action = true;
							console.log("Appending action");
							console.log(person['game']['extra_actions'][action]);
						}
					}
					if(!found_trash_action){
						person['game']['extra_actions'].push({action:trash_action,value:card['attrs']['trash_specific'],general:'trash',
							on_action:[{action:'gain_card',value:card['attrs']['trash_actions']['gain_card'],general:'gain'}]});
					}
				}
			}
		}
		if(action === 'gain_card'){
			person['game']['extra_actions'].push({action:'gain_card',value:'4',general:'gain'});
		}
		if(action == 'play_action'){
			person['game']['extra_actions'].push({action:'play_action',value:parseInt(card['attrs']['play_action'],10),general:'multiply'});
		}
		if(action === 'discard'){
			if(card['attrs']['discard'] == '*'){
				if(card['attrs']['discard_actions']['peek_discard'] != undefined){
					var need_to_wait = false;
					for(var player in this.people){
						if(this.people[player]['game']['deck'].length < 1 ){
							while(this.people[player]['game']['discard'].length > 0){
								this.people[player]['game']['deck'].push(this.people[person]['game']['discard'].pop());
							}
						}
						if(this.people[player]['game']['deck'].length > 0){
							need_to_wait = true;
							if(this.people[player] != person){
								//If there are no top cards, shuffle the discard pile into the deck
								if(this.check_attack_reaction(this.people[player]['name'])){
									console.log('found reaction');
									this.people[player]['game']['extra_actions'].push({action:'show_reaction',value:'0', general:'avoid', alt_action:
									{action:'peek_discard',value:card['attrs']['discard_actions']['peek_discard'],general:'discard'}});
								}else{
									console.log('didn\'t find reaction');
									this.people[player]['game']['extra_actions'].push({action:'peek_discard',value:card['attrs']['discard_actions']['peek_discard'],general:'discard'});
								}
							}else{
								this.people[player]['game']['extra_actions'].push({action:'peek_discard',value:card['attrs']['discard_actions']['peek_discard'],general:'discard'});
							}
						}
					}
					if(need_to_wait){
						person['game']['extra_actions'].push({action:'wait_others',value:'*',general:'waiting'});
					}
				}
				if(card['attrs']['discard_actions']['cards'] != undefined){
					if(card['attrs']['discard_actions']['cards'] === 'discard'){
						person['game']['extra_actions'].push({action:'discard_draw',value:'*',general:'discard'});
					}else{
						person['game']['extra_actions'].push({action:'discard_draw',value:card['attrs']['discard_actions']['cards'],general:'discard'});
					}
				}
				if(card['attrs']['discard_actions']['card_opponents_under'] != undefined){
					var people_need_to_discard = false;
					for(var player in this.people){
						if(this.people[player] != person){
							//All players have to discard down to value
							if(parseInt(card['attrs']['discard_actions']['card_opponents_under'],10) < this.people[player]['game']['hand'].length){
								people_need_to_discard = true;
								//Check if there is a reaction, then give the player a choice
								if(this.check_attack_reaction(this.people[player]['name'])){
									console.log('found reaction');
									this.people[player]['game']['extra_actions'].push({action:'show_reaction',value:'0', general:'avoid', alt_action:
									{action:'discard_down_to',value:card['attrs']['discard_actions']['card_opponents_under'],general:'discard'}});
								}else{
									console.log('didn\'t find reaction');
									this.people[player]['game']['extra_actions'].push({action:'discard_down_to',value:card['attrs']['discard_actions']['card_opponents_under'],general:'discard'});
								}
							}
						}
					}
					if(people_need_to_discard){
						//The attacking player has to wait until the other players discard
						person['game']['extra_actions'].push({action:'wait_others',value:'*',general:'waiting'});
					}
				}
			}
		}
	}
	console.log("Ending Player Hand");
	console.log(person['game']['hand']);
}

Game.prototype.check_attack_reaction = function(user_name){
	var person = this.get_user(user_name);
	console.log('Checking attack reaction');
	for(var card in person['game']['hand']){
		console.log(this.cards[person['game']['hand'][card]]);
		if('immune' in this.cards[person['game']['hand'][card]]['attrs'] && this.cards[person['game']['hand'][card]]['attrs']['immune'] === 'attack'){
			return true;
		}
	}
	return false;
}

Game.prototype.player_decision_check = function(user_name){
	var person = this.get_user(user_name);
	console.log(person['game']['extra_actions']);
	for(var actions in person['game']['extra_actions']){
		if(person['game']['extra_actions'][actions]['general'] == 'gain' || 
				('alt_action' in person['game']['extra_actions'][actions] && person['game']['extra_actions'][actions]['alt_action']['general'] === 'gain')){
			return true;
		}
		if(person['game']['extra_actions'][actions]['general'] == 'trash' || 
				('alt_action' in person['game']['extra_actions'][actions] && person['game']['extra_actions'][actions]['alt_action']['general'] === 'trash')){
			return true;
		}
		if(person['game']['extra_actions'][actions]['general'] == 'discard' || 
				('alt_action' in person['game']['extra_actions'][actions] && person['game']['extra_actions'][actions]['alt_action']['general'] === 'discard')){
			return true;
		}
		if(person['game']['extra_actions'][actions]['general'] === 'avoid' || 
				('alt_action' in person['game']['extra_actions'][actions] && person['game']['extra_actions'][actions]['alt_action']['general'] === 'avoid')){
			return true;
		}
		if(person['game']['extra_actions'][actions]['general'] === 'multiply' || 
				('alt_action' in person['game']['extra_actions'][actions] && person['game']['extra_actions'][actions]['alt_action']['general'] === 'multiply')){
			return true;
		}
	}
	return false;
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
	//Undefined card appeared here...
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
	
	person['game']['stats']['money'] -= card['cost'];
	person['game']['used'].push(card_index);
	person['game']['stats']['buy']--;
	this.cards[card_index]['current_quantity']--;
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
    	stats:player['game']['stats'],
    	actions:player['game']['extra_actions'],
    	game_over:this.game_ended
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
	
	for(var person in this.people){
		this.people[person]['game']['extra_actions'] = [];
	}
	//Increment turn to the next player
	this.increment_turn();
}

//This function figures out if the first player went before the second player
Game.prototype.was_before = function(player_1_position, player_2_position){
	console.log("Player1: " + player_1_position);
	console.log("Player2: " + player_2_position);
	var incrementor = this.starting_player;
	while(true){
		console.log("incrementor: " + incrementor);
		if(this.incrementor == this.people.length){
			this.incrementor = 0;
		}
		if(incrementor == player_1_position){
			return true;
		}
		if(incrementor == player_2_position){
			return false;
		}
		this.incrementor++;
	}
}

Game.prototype.increment_turn = function(){
	this.current_turn++;
	if(this.current_turn == this.people.length){
		this.current_turn = 0;
	}
}

Game.prototype.draw_hand = function(person,cards){
	 var new_hand = [];
	 for(var i = 0; i < cards; i++){
		 if(person['game']['deck'].length<1){
			 if(person['game']['discard'].length>0){
				 person['game']['deck'] = person['game']['discard'];
				 person['game']['discard'] = [];
				 this.shuffle(person['game']['deck']);
			 }else{
				 console.log('Returning Hand Early!');
				 console.log(new_hand);
				return new_hand; 
			 }
		 }
		 new_hand.push(person['game']['deck'].pop());
	 }
	 console.log('Drawing Cards...');
	 console.log(new_hand);
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
		 if(cards[card]['name'] == "Estate"){
			 for(var i = 0; i < 3; i++){
				 deck.push(card);
			 }
		 }
		 /*if(cards[card]['name'] == "Throne Room"){
			 for(var i = 0; i < 3; i++){
				 deck.push(card);
			 }
		 }*/
		 if(cards[card]['name'] == "Copper"){
			 for(var i = 0; i < 7; i++){
				 deck.push(card);
			 }
		 }
		 /*if(cards[card]['name'] == "Feast"){
			 for(var i = 0; i < 7; i++){
				 deck.push(card);
			 }
		 }*/
	};
	console.log('Starting deck');
	console.log(deck);
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

Game.prototype.return_winner = function(){
	//var card_index = this.find_card('Province',this.cards);
	for(var person in this.people){
		while(this.people[person]['game']['hand'].length > 0){
			this.people[person]['game']['deck'].push(this.people[person]['game']['hand'].pop());
		}
		while(this.people[person]['game']['discard'].length > 0){
			this.people[person]['game']['deck'].push(this.people[person]['game']['discard'].pop());
		}
		while(this.people[person]['game']['used'].length > 0){
			this.people[person]['game']['deck'].push(this.people[person]['game']['used'].pop());
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
	var user_meta = [{name:winner['name'],points:winner['game']['points'],cards:winner['game']['deck'].length}];
	for(var i = 1; i < this.people.length; i++){
		user_meta.push({name:this.people[i]['name'],points:this.people[i]['game']['points'],cards:this.people[i]['game']['deck'].length});
		if(this.people[i]['game']['points'] > winner['game']['points']){
			winner = this.people[i];
		}else if(this.people[i]['game']['points'] == winner['game']['points']){
			if(this.people[i]['game']['deck'].length > winner['game']['deck'].length){
				winner = this.people[i];
			}else if(this.people[i]['game']['deck'].length == winner['game']['deck'].length){
				//If the current winner went before the checked person
				console.log("Tie! Checking position...");
				if(this.was_before(this.get_user_index(winner['name']),i)){
					winner = this.people[i];
				}
			}
		}
	}
	console.log(winner);
	return {winner:winner['name'],user_meta:this.format_meta(user_meta)};
}

Game.prototype.format_meta = function(meta){
	var stringy = "<br>";
	
	console.log(meta);
	for(var user in meta){
		stringy += meta[user]['name'] + ": points=" + meta[user]['points'] + ": cards=" + meta[user]['cards'] + "<p>";
	}
	
	return stringy;
}

module.exports = Game;