#!/usr/bin/env node

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
//var app = require('../app');
//var game = require('../game');
var Room = require('../room');
//console.log(express());
//console.log(router);
//var server = app.get('server');
//var server = express['server'];

//console.log(express);
//console.log(server);

//var http = require('http');

var lobby = new Room("Lobby", "001", "admin");
var clients = {};
var game_rooms = [];

/*var people = [];
var games = {};
var clients = [];*/

var card_meta = [ 
                  {name:"Province",deck:"dominion",quantity:8,picture:"",type:["victory"],cost:8,attrs:{victory:"6"}},
                  {name:"Duchy",deck:"dominion",quantity:8,picture:"",type:["victory"],cost:5,attrs:{victory:"3"}},
                  {name:"Estate",deck:"dominion",quantity:8,picture:"",type:["victory"],cost:2,attrs:{victory:"1"}},
                 {name:"Gold",deck:"dominion",quantity:20,picture:"",type:["coin"],cost:6,attrs:{money:"3"}},
                 {name:"Silver",deck:"dominion",quantity:20,picture:"",type:["coin"],cost:3,attrs:{money:"2"}},
                 {name:"Copper",deck:"dominion",quantity:20,picture:"",type:["coin"],cost:0,attrs:{money:"1"}},
                 {name:"Curse",deck:"dominion",quantity:10,picture:"",type:["victory"],cost:0,attrs:{victory:"-1"}},
                 
                 {name:"Cellar",deck:"dominion",quantity:10,picture:"",type:["action"],cost:2,attrs:{action:"1",discard:"*",variable_card:"discard"}},
                 {name:"Chapel",deck:"dominion",quantity:10,picture:"",type:["action"],cost:2,attrs:{trash_card_number_under:"5"}},
                 {name:"Village",deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{card:"1",action:"2"}},
                 {name:"Woodcutter",deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{buy:"1",money:"2"}},
                 {name:"Workshop",deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{gain_card_under:"5"}},
                 {name:"Council Room",deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"4",buy:"1",card_opponents:"1"}},
                 {name:"Festival",deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{action:"1",buy:"1",money:"2"}},
                 {name:"Laboratory",deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"2",action:"1"}},
                 {name:"Market",deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"1",action:"1",money:"1",buy:"1"}},
                 {name:"Witch",deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"2",curse_opponents:"1"}},
                 ];

/*
Cellar	Action	$2	+1 Action
Discard any number of cards.
+1 Card per card discarded.
Chapel	Action	$2	Trash up to 4 cards from your hand.
Moat	Action – Reaction	$2	+2 Cards
When another player plays an Attack card, you may reveal this from your hand. If you do, you are unaffected by that Attack.
Chancellor	Action	$3	+$2
You may immediately put your deck into your discard pile.
Village	Action	$3	+1 Card; +2 Actions.
Woodcutter	Action	$3	+1 Buy; +$2.
Workshop	Action	$3	Gain a card costing up to $4.
Bureaucrat	Action – Attack	$4	Gain a silver card; put it on top of your deck. Each other player reveals a Victory card from his hand and puts it on his deck (or reveals a hand with no Victory cards).
Feast	Action	$4	Trash this card. Gain a card costing up to $5.
Gardens	Victory	$4	Worth 1 Victory for every 10 cards in your deck (rounded down).
Militia	Action – Attack	$4	+$2
Each other player discards down to 3 cards in his hand.
Moneylender	Action	$4	Trash a Copper from your hand. If you do, +$3.
Remodel	Action	$4	Trash a card from your hand. Gain a card costing up to $2 more than the trashed card.
Smithy	Action	$4	+3 Cards.
Spy	Action – Attack	$4	+1 Card; +1 Action
Each player (including you) reveals the top card of his deck and either discards it or puts it back, your choice.
Thief	Action – Attack	$4	Each other player reveals the top 2 cards of his deck. If they revealed any Treasure cards, they trash one of them that you choose. You may gain any or all of these trashed cards. They discard the other revealed cards.
Throne Room	Action	$4	Choose an Action card in your hand. Play it twice.
Council Room	Action	$5	+4 Cards; +1 Buy
Each other player draws a card.
Festival	Action	$5	+2 Actions, +1 Buy; +$2.
Laboratory	Action	$5	+2 Cards; +1 Action.
Library	Action	$5	Draw until you have 7 cards in hand. You may set aside any Action cards drawn this way, as you draw them; discard the set aside cards after you finish drawing.
Market	Action	$5	+1 Card; +1 Action; +1 Buy; +$1.
Mine	Action	$5	Trash a Treasure card from your hand. Gain a Treasure card costing up to $3 more; put it into your hand.
Witch	Action – Attack	$5	+2 Cards
Each other player gains a Curse card.
Adventurer	Action	$6	Reveal cards from your deck until you reveal 2 Treasure cards. Put those Treasure cards in your hand and discard the other revealed cards.
*/

console.log("index.js loaded!");

/* GET home page. */
router.get('/', function(req, res) {
  //res.render('index', { title: 'Express' });
  res.sendfile(req.abs_path + '/views/lobby.html');
});

router.get('/chat', function(req, res) {
    res.sendfile(req.abs_path + '/views/chat_index.html');
});

router.get('/game', function(req, res) {
    res.sendfile(req.abs_path + '/views/game_index.html');
});

router.get('/load', function(req, res) {
    var db = req.db;
    var collection = db.get('card');
    collection.remove({}, function(err) { 
    	  console.log('collection removed');
    });
    collection.insert(card_meta,
    	function (err, doc) {
	        if (err) {
	            res.send("Error");
	        }
	        else {
	            res.send("Success");
	        }
    	}
    );
});

router.get('/users', function(req, res) {
	console.log(lobby);
	res.send({users:lobby.people,rooms:game_rooms});
});

router.run_server = function(listener){
	var server = require('socket.io').listen(listener, function() {
	  debug('Express server listening on port ' + server.address().port);
	});

	//This will only work if we have a socket connected anyways
	
	console.log('Socket Set');
	
	server.sockets.on('connection', function (socket) {
		
		//var socket_id = socket.id;
		
		clients[socket.id] = socket;
		
	    //socket.emit('message', { message: 'welcome to the chat' });
	    
	    router.check_username = function(username){
	    	if(username === "" || username === undefined){
				return false;
			}
	    	return true;
	    }
		
	    /*GET all meta*/
	    router.get('/get_cards', function(req, res) {
	        var db = req.db;
	        var collection = db.get('card');
	        var room = find_room(req.session.username);
	        //var player = room.get_user(req.session.username);

	        //This call needs to hook to the database. The rest of the calls can just use the stored data
	        collection.find({},{},function(e,docs){
	            res.setHeader('Content-Type', 'application/json');
		        room.create_game(docs);
		        //console.log(room);
	            res.send(room.game.game_package(req.session.username));
	        });
	    });
	    
	    socket.on('increment_turn', function (data) {
	    	var user = data.name;
	    	var room = find_room(user);
	    	var result_message = user + " ends turn";
	    	
	    	room.game.next_turn(user);
	    	
	    	for(var person in room.game.people){
    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
    		}
	    	server.sockets.in(room['name']).emit('message',{ message:result_message });
	    });
	    
	    socket.on('player_buy', function (data) {
	    	var user = data.name;
	    	var card = data.card;
	    	var room = find_room(user);
	    	var result_message = data.name + " buys " + data.card['name'];
	    	
	    	if(room.game.get_user_index(user) == room.game.current_turn && room.game.can_buy_card(user,card)){
		    	room.game.buy_card(user,card);
		    	for(var person in room.game.people){
	    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
	    		}
		    	server.sockets.in(room['name']).emit('message',{ message:result_message });
		    	if(room.game.game_over()){
		    		console.log('Game Over');
	    			var data = room.game.return_winner();
	    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
		    		server.sockets.in(room['name']).emit('message',{ message:message_string});
		    		server.sockets.in(room['name']).emit('end_game', {});
		    	}else{
		    		console.log('Game Not Over');
		    	}
	    	}
	    });
	    
	    socket.on('player_use', function (data) {
	    	var user = data.name;
	    	var room = find_room(user);
	    	var card = data.card;
	    	var result_message = data.name + " plays " + card['name'];
	    	
	    	if(room.game.get_user_index(user) == room.game.current_turn && room.game.card_action_check(user,card)){
	    		room.game.use_card(user,card);
	    		for(var person in room.game.people){
	    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
	    		}
	    		server.sockets.in(room['name']).emit('message',{ message:result_message });
	    		if(room.game.game_over()){
	    			console.log('Game Over');
	    			var data = room.game.return_winner();
	    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
		    		server.sockets.in(room['name']).emit('message',{ message:message_string});
		    		server.sockets.in(room['name']).emit('end_game', {});
		    	}
	    	}
	    });
	    
		router.post('/create_room', function(req, res) {
			console.log(req.param('roomname'));
			//Check to make sure that the user has a username....
			console.log(req.session.username);
			if(!router.check_username(req.session.username)){
				res.send('username');
			}else{
				var found_room = false;
				//first we need to check to make sure that the user isn't already using a room...
				for(var room in game_rooms){
					if(game_rooms[room]['id'] == req.sessionID){
						res.send('duplicate');
						found_room = true;
					}
					if(game_rooms[room]['name'] == req.param('roomname')){
						res.send('room_name');
						found_room = true;
					}
				}
				if(!found_room){
					//Add the room to the socket...
					//socket.room = req.param('roomname');
					//socket.join(socket.room);
					
					//Add the room to the server. The name will refer to the socket later
					var new_room = new Room(req.param('roomname'), req.sessionID, req.session.username);
					
					//req.sessionID
					//new_room.add_user(req.session.username,lobby.find_socket(req.session.username));
					game_rooms.push(new_room);
					
					//Show the other users that the room has been created
					server.sockets.emit('room', { rooms: game_rooms });
					
					//Return the room name
					res.send({name: req.param('roomname')});
				}
			}
		});
		
		router.post('/join_room', function(req, res) {
			var room_name = req.param('roomname');
			//Check to make sure that the room exists
			if(!router.check_username(req.session.username)){
				res.send('username');
			}else{
				//Find the room that exists by the given name
				var joining_room = "";
				var found_room = false;
				
				for(var room in game_rooms){
					if(game_rooms[room]['name'] == req.param('roomname')){
						res.send('room_name');
						joining_room = game_rooms[room];
						found_room = true;
					}
				}
				if(found_room){
					if(joining_room.people.length < joining_room.max_users){
						//if(!joining_room.find_user(socket.id)){
							//socket.room = joining_room['name'];
							//socket.join(socket.room);
							
							joining_room.add_user(req.session.username,lobby.find_socket(req.session.username));
							
							//server.sockets.emit('user', { users: lobby.people });
							res.send('joined');
						//}else{
						//	res.send('in_room');
						//}
					}else{
						res.send('max_users');
					}
				}else{
					res.send('not_exists');
				}
			}
		});
		
		//game_talk
		socket.on('game_talk', function (data) {
	    	for(var room in game_rooms){
				if(game_rooms[room].find_user(data.name)){
					server.sockets.in(game_rooms[room]['name']).emit('message',{username:data.name,message : data.message});
				}else{
					console.log('User not here!');
				}
			}
	    });
		
		router.get('/enter_game', function(req, res) {
			res.send({name : req.session.username});
		});
		
		//socket.emit('exit_game',{ name:$scope.username });
		socket.on('exit_game', function (data) {
			var user_name = data.name;
			var room = find_room(user_name);
			var user_index = room.get_user_index(user_name);
			
			//Send message to players that current player has left
			server.sockets.in(room['name']).emit('message',{ message:user_name + ' has left the game!' });
			//Iterate the turn up one if it was the user's turn
			if(room.game.get_user_index(user_name) == room.game.current_turn){
				room.game.next_turn(user_name);
			}
			//Remove the player from the room
			//lobby.add_user(user_name,socket.id);
			room['people'].splice(user_index, 1);

			switch(room['people'].length){
				//If there are no more people in the room
				case 0:remove_room(room['id']);break;
				case 1:
					if(!room['game']['game_ended']){
						var data = room.game.return_winner();
		    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
			    		server.sockets.in(room['name']).emit('message',{ message:message_string});
			    		server.sockets.in(room['name']).emit('end_game', {});
					}
					break;
				default:break;
			}
			//end game
			//notify players that someone has left
			//splice leaving player from room
			//destroy room if nobody is left in it
			//add player to lobby
			
			//TODO: take player out of lobby when they join game
			//TODO: make sure that the player can't restart the game by refreshing browser
			//TODO: make sure that the player is redirected to the correct room if they try to join the lobby again after starting a game
	    });
		
		socket.on('enter_game', function (data) {
			console.log('Current Socket');
			console.log(socket.id);
	    	for(var room in game_rooms){
	    		console.log(game_rooms[room]);
				if(game_rooms[room].find_user(data.name)){
					game_rooms[room].update_socket(data.name,socket.id);
					socket.room = game_rooms[room]['name'];
					socket.join(socket.room);
					server.sockets.in(game_rooms[room]['name']).emit('message',{message : data.name + " joined room " + game_rooms[room]['name']});
					if(game_rooms[room]['people'].length == game_rooms[room]['max_users']){
						console.log('Starting game!');
						server.sockets.in(game_rooms[room]['name']).emit('start_game',{message : "Starting game!"});
					}else{
						var waiting = (game_rooms[room]['max_users'] - game_rooms[room]['people'].length);
						server.sockets.in(game_rooms[room]['name']).emit('message',{message : "Waiting for " + waiting + " more " + (waiting==1?"user":"users")});
					}
				}else{
					console.log('User not here!');
				}
			}
	    });
		
		//We have to attach the router to the client socket here
		router.post('/login', function(req, res) {
			console.log(req.param('username'));
			req.session.username = req.param('username');
			res.send({name: req.session.username});
		});
		
		//and here
	    socket.on('login', function (data) {
	    	lobby.add_user(data.name,socket.id);
	    	server.sockets.emit('user', { users: lobby.people });
	    	for(var person in lobby['people']){
				console.log(lobby['people'][person]['name']);
				clients[lobby['people'][person]['socket']].emit('message', {message : "Joined Room: " + lobby['name']});
			}
	    });
	    
	});
};

function find_room(user){
	for(var room in game_rooms){
		if(game_rooms[room].find_user(user)){
			return game_rooms[room];
		}
	}
	return null;
}

function remove_room(id){
	var room_index = -1;
	for(var room in game_rooms){
		if(game_rooms[room]['id'] == id){
			room_index = room;
		}
	}
	game_rooms.splice(room_index, 1);
}

module.exports = router;