function use(scope,card){
	//$scope.stats = {turn:0,action:0,buy:0,money:0};
	for(var action in card['attrs']){
		console.log(action);
		if(action === 'money'){
			scope.stats['money'] += parseInt(card['attrs']['money'],10);
		}
	}
}

function buy_opponent(scope,card){
	console.log('Removing...');
	console.log(card);
	card['current_quantity']--;
}

function buy(scope,card){
	console.log("Buying...");
	console.log(card);
	if(card['cost'] <= scope.stats['money'] && card['current_quantity'] > 0 && scope.stats['buy'] > 0){
		scope.stats['money'] -= card['cost'];
		scope.discard.push(card);
		card['current_quantity']--;
		scope.stats['buy']--;
		return true;
	}
	return false;
}