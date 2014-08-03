function Player_Decision(button_div,scope){
	this.button_div = button_div;
	this.scope = scope;
	this.action = "";
	this.value = 0;
	this.pick_exact = false;
}

//This feeds the actions to the rest of the functions before they are seen by the user
Player_Decision.prototype.parse_decision = function(actions){
	for(var action in actions){
		if(actions[action]['action'] == 'trash_under'){
			this.trash_under(actions[action]['value']);
		}
		if(actions[action]['action'] == 'gain_card'){
			this.gain_card(actions[action]['value']);
		}
		if(actions[action]['action'] == 'discard_draw'){
			this.discard_draw(actions[action]['value']);
		}
		if(actions[action]['action'] == 'discard_down_to'){
			this.discard_down_to(actions[action]['value']);
		}
		if(actions[action]['action'] == 'wait_others'){
			this.wait_others();
		}
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

Player_Decision.prototype.gain_card = function(value){
	console.log('Preparing gain_card selection');
	this.scope.decision_info = 'Select a card under $' + value;
	this.scope.decision = true;
	this.scope.gaining_cards = true;
	this.action = "gain_card";
	this.value = parseInt(value,10);
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
	this.scope.decision = false;
	this.scope.selecting_cards = false;
	this.scope.gaining_cards = false;
	this.scope.waiting = false;
	
	this.pick_exact = false;
	this.scope.decision_info = "";
	this.value = 0;
	this.action = "";
}
