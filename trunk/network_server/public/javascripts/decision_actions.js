function Player_Decision(button_div,scope){
	this.button_div = button_div;
	this.scope = scope;
	this.action = "";
	this.value = 0;
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
	
	this.scope.decision_info = "";
	this.value = 0;
	this.action = "";
}
