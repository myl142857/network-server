function Player_Decision(button_div,scope){
	this.button_div = button_div;
	this.scope = scope;
	this.init();
}

Player_Decision.prototype.init = function(){
	this.immediate_action = false;
	this.pick_exact = false;
	this.value = 0;
	this.action = "";
	this.immediate_cards = [];
	this.actions = {};
	this.on_action = {};
	
	this.scope.decision = false;
	this.scope.choice = false;
	this.scope.selecting_cards = false;
	this.scope.gaining_cards = false;
	this.scope.waiting = false;
	this.scope.decision_info = "";
	
	this.scope.hand_view = this.scope.hand;
}


//This feeds the actions to the rest of the functions before they are seen by the user
Player_Decision.prototype.parse_decision = function(actions){
	this.reset_scope();
	if(actions.length>0){
		this.actions = actions[0];
		console.log('actions');
		console.log(this.actions);
		//for(var action in actions){
		if(this.actions['action'] == 'trash_under'){
			this.trash_under(this.actions['value']);
		}
		if(this.actions['action'] == 'trash_specific'){
			this.trash_specific(this.actions['value'], this.actions['on_action'], false);
		}
		if(this.actions['action'] == 'trash_self'){
			this.trash_specific(this.actions['value'], this.actions['on_action'], true);
		}
		if(this.actions['action'] == 'gain_card'){
			this.gain_card(this.actions['value']);
		}
		if(this.actions['action'] == 'gain_curse'){
			this.gain_curse(this.actions['value']);
		}
		if(this.actions['action'] == 'show_reaction'){
			this.show_reaction(this.actions['value']);
		}
		if(this.actions['action'] == 'discard_draw'){
			this.discard_draw(this.actions['value']);
		}
		if(this.actions['action'] == 'discard_down_to'){
			this.discard_down_to(this.actions['value']);
		}
		if(this.actions['action'] == 'peek_discard'){
			this.peek_discard(this.actions['value']);
		}
		if(this.actions['action'] == 'wait_others'){
			this.wait_others();
		}
		//}
	}
}

Player_Decision.prototype.wait_others = function(value){
	this.scope.waiting = true;
	this.scope.decision_info = 'Waiting for other players...';
	console.log('Waiting');
	console.log(this.scope.waiting);
}

Player_Decision.prototype.discard_down_to = function(value){
	//This is the amount of cards that need to be discarded down to
	console.log('Discard down to');
	this.value = parseInt(value,10);
	
	if(value != '*'){
		this.value = this.scope.hand.length - this.value;
		this.scope.decision_info = 'Select ' + this.value + ' card(s) to discard';
	}else{
		this.value = -1;
		this.scope.decision_info = 'Select card(s) to discard';
	}
	this.scope.decision = true;
	this.scope.selecting_cards = true;
	this.action = "discard_down_to";
	this.pick_exact = true;
}

Player_Decision.prototype.discard_draw = function(value){
	this.value = parseInt(value,10);
	if(value != '*'){
		this.scope.decision_info = 'Select ' + this.value + ' card(s) to discard';
	}else{
		this.value = -1;
		this.scope.decision_info = 'Select card(s) to discard';
	}
	this.scope.decision = true;
	this.scope.selecting_cards = true;
	this.action = "discard_draw";
}

Player_Decision.prototype.peek_discard = function(value){
	
	this.value = parseInt(value,10);
	//If there are more cards in the deck to view
	if(this.scope.deck.length >= this.value){
		this.value = parseInt(value,10);
		var new_hand = [];
		for(var i = 0; i < this.value; i++){
			new_hand.push(this.scope.cards[this.scope.deck[i]]);
		}
		
		this.scope.hand_view = new_hand;
	
		this.value = -1;
		this.scope.decision_info = 'Select card(s) to discard from deck';
		this.scope.decision = true;
		this.scope.selecting_cards = true;
		this.action = "discard_deck";
	}

}

Player_Decision.prototype.gain_card = function(value){
	console.log('Preparing gain_card selection');
	this.scope.decision_info = 'Select a card under $' + value;
	this.scope.decision = true;
	this.scope.gaining_cards = true;
	this.action = "gain_card";
	this.value = parseInt(value,10);
}

Player_Decision.prototype.show_reaction = function(value){
	console.log('Preparing show_reaction selection');
	this.scope.decision_info = 'Show reaction card?';
	this.scope.choice = true;
	this.action = "avoid";
	this.value = parseInt(value,10);
}

Player_Decision.prototype.gain_curse = function(value){
	console.log('Preparing to gain curse');
	this.action = "gain_card";
	this.value = parseInt(value,10);	
	this.immediate_action = true;
	this.immediate_cards = ['Curse'];
}

Player_Decision.prototype.trash_specific = function(value, on_action, trash_self){
	console.log('Preparing trashing selection');
	
	this.on_action = on_action; 
	var user_has_card = false;

	//Check to make sure that the user has the card in his/her hand
	if(!trash_self){
		for(var card in this.scope.hand){
			console.log(this.scope.hand[card]['name'] + ':' + value);
			if(this.scope.hand[card]['name'] == value){
				this.immediate_cards.push(this.scope.hand[card]);
				break;
			}
		}
	}else{
		for(var card in this.scope.cards){
			console.log(this.scope.cards[card]['name'] + ':' + value);
			if(this.scope.cards[card]['name'] == value){
				this.immediate_cards.push(this.scope.cards[card]);
				break;
			}
		}
	}
	
	console.log(value);
	console.log(this.immediate_cards);
	
	if(this.immediate_cards.length>0){
		this.scope.decision_info = 'Trash a ' + value + '?';
		this.scope.choice = true;
		if(trash_self){
			this.action = "trash_self";
		}else{
			this.action = "trash";
		}
	}else{
		this.immediate_action = true;
		this.immediate_cards = [];
		this.action = "skip";
	}
}

Player_Decision.prototype.trash_under = function(value){
	console.log('Preparing trashing selection');
	this.scope.decision_info = 'Trash under ' + value + ' cards';
	this.scope.decision = true;
	this.scope.selecting_cards = true;
	this.action = "trash";
	this.value = parseInt(value,10);
}

Player_Decision.prototype.reset_scope = function(){
	this.init();
}
