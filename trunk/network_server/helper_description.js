var Helper_Funcs;

function Helper_Funcs(cards) {
	  this.cards = add_descriptions(cards);
};

var action_function_descriptions = {
    "money":function(name, attr){return ["+$" + attr['money']]},
    "action":function(name, attr){return ["+" + attr['action'] + " Action"]},
    "buy":function(name, attr){return ["+" + attr['buy'] + " Buy"]},
    "card":function(name, attr){return ["+" + attr['card'] + " Card(s)"]},
    "victory":function(name, attr){return [(parseInt(attr['victory'],10)>0?"+":"") + parseInt(attr['victory'],10) + " Victory"]},
    "card_opponents":function(name, attr){return ["+" + attr['card_opponents'] + " Card(s) Opponent(s)"]},
    "curse_opponents":function(name, attr){return ["+" + attr['curse_opponents'] + " Curse(s) Opponent(s)"]},
    "trash_under":function(name, attr){return ["Trash up to " + attr['trash_under'] + " Card(s)"]},
    "trash_specific":function(name, attr){return trash_description(name, attr)},
    "gain_card":function(name, attr){return ["Gain card up to $" + attr['gain_card']]},
    "play_action":function(name, attr){return ["Choose an action card in your hand","Play action card " + parseInt(attr['play_action'],10) + " times"]},
    "immune":function(name, attr){return immune_description(attr)},
    "discard":function(name, attr){return discard_description(attr)},
}

var trash_description = function(name, attr){
	var details = [];
	if(attr['trash_specific'] === name){
		details.push("Trash this card");
	}else{
		details.push("Trash a " + attr['trash_specific']);
	}
	if(attr['trash'] === '*'){
		if('money' in attr['trash_actions']){
			details.push("Gain $" + attr['trash_actions']['money']);
		}
		if('gain_card' in attr['trash_actions']){
			details.push("Gain a card <= $" + attr['trash_actions']['gain_card']);
		}
	}
	return details;
}

var immune_description = function(attr){
	if(attr['immune'] === 'attack'){
		return ["Immune to attacks when shown"];
	}
}

var discard_description = function(attr){
	
	var details = [];
	if(attr['discard'] === '*'){
		if('peek_discard' in attr['discard_actions']){
			details.push("Players look at the top " + attr['discard_actions']['peek_discard'] + " card(s) of their deck");
			details.push("Discard the card or put it back");
		}
		if('cards' in attr['discard_actions']){
			if(attr['discard_actions']['cards'] === 'discard'){
				details.push("Discard any number of cards");
				details.push("+Cards equal to cards discarded");
			}
		}
		if('card_opponents_under' in attr['discard_actions']){
			details.push("Other players discard down to " + attr['discard_actions']['card_opponents_under'] + " cards");
		}
	}
	return details;
}

var add_descriptions = function(cards){
	for(var card in cards) {
		cards[card]['current_quantity'] = cards[card]['quantity'];
		cards[card]['selected'] = false;
		
		var description = [];
		for(var action in cards[card]['attrs']){
			if(action in action_function_descriptions){
				description.push.apply(description, action_function_descriptions[action](cards[card]['name'],cards[card]['attrs']));
			}
		}
		cards[card]['description'] = description;
  	}
	return cards;
}


module.exports = Helper_Funcs;