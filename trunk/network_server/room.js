function Room(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.max_users = 2;
};

Room.prototype.add_user = function(user_id,user_name){
	//$scope.stats = {turn:0,action:0,buy:0,money:0};
	//console.log('Adding User');
	//console.log(user_id + ' : ' + user_name);
	
	for(var user in this.people){
		if(this.people[user]['id'] == user_id){
			this.people[user]['name'] = user_name;
			return null;
		}
	}
	this.people.push({id:user_id,name:user_name});
	//console.log(this.people);
	return null;
}

Room.prototype.find_user = function(user_id){
	for(var user in this.people){
		if(this.people[user]['id'] == user_id){
			return true;
		}
	}
	return false;
}

module.exports = Room;