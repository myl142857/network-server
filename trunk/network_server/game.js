function Game(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.peopleLimit = 2;
  this.status = "available";
  this.private = false;
  
  this.username = "";
  this.deck = [];
  this.discard = [];
  this.hand = [];
  this.stats = {turn:0,action:0,buy:0,money:0};
  this.player_turn = false;
  
};

Game.prototype.use = function(scope,card){
	//$scope.stats = {turn:0,action:0,buy:0,money:0};
	for(var action in card['attrs']){
		console.log(action);
		if(action === 'money'){
			scope.stats['money'] += parseInt(card['attrs']['money'],10);
		}
	}
}

Game.prototype.buy_opponent = function(scope,card){
	console.log('Removing...');
	console.log(card);
	card['current_quantity']--;
}

Game.prototype.buy = function(scope,card){
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

Game.prototype.addPerson = function(personID) {
  if (this.status === "available") {
    this.people.push(personID);
  }
};

Game.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i].id === person.id){
      personIndex = i;
      break;
    }
  }
  this.people.remove(personIndex);
};

Game.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};

Game.prototype.isAvailable = function() {
  if (this.available === "available") {
    return true;
  } else {
    return false;
  }
};

Game.prototype.isPrivate = function() {
  if (this.private) {
    return true;
  } else {
    return false;
  }
};

module.exports = Game;