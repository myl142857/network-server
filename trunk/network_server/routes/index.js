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
                 //These cards are always available
                  {name:"Province",avail:true,deck:"dominion",quantity:8,picture:"",type:["victory"],cost:8,attrs:{victory:"6"}},
                  {name:"Duchy",avail:true,deck:"dominion",quantity:8,picture:"",type:["victory"],cost:5,attrs:{victory:"3"}},
                  {name:"Estate",avail:true,deck:"dominion",quantity:8,picture:"",type:["victory"],cost:2,attrs:{victory:"1"}},
                 {name:"Gold",avail:true,deck:"dominion",quantity:20,picture:"",type:["coin"],cost:6,attrs:{money:"3"}},
                 {name:"Silver",avail:true,deck:"dominion",quantity:20,picture:"",type:["coin"],cost:3,attrs:{money:"2"}},
                 {name:"Copper",avail:true,deck:"dominion",quantity:20,picture:"",type:["coin"],cost:0,attrs:{money:"1"}},
                 {name:"Curse",avail:true,deck:"dominion",quantity:10,picture:"",type:["curse","victory"],cost:0,attrs:{victory:"-1"}},
                 
                 //These cards are picked from
                 {name:"Cellar",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:2,attrs:{action:"1",discard:"*",discard_actions:{cards:"discard"}}},
                 {name:"Chapel",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:2,attrs:{trash_under:"4"}},
                 {name:"Moat",avail:false,deck:"dominion",quantity:10,picture:"",type:["action","reaction"],cost:2,attrs:{card:"2",immune:"attack"}},
                 {name:"Village",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{card:"1",action:"2"}},
                 {name:"Woodcutter",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{buy:"1",money:"2"}},
                 {name:"Workshop",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:3,attrs:{gain_card:"4"}},
                 {name:"Feast",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:4,attrs:{trash_specific:"Feast",trash:"*",trash_actions:{gain_card:"5"}}},
                 {name:"Militia",avail:false,deck:"dominion",quantity:10,picture:"",type:["action","attack"],cost:4,attrs:{money:"2",discard:"*",discard_actions:{card_opponents_under:"3"}}},
                 {name:"Moneylender",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:4,attrs:{trash_specific:"Copper",trash:"*",trash_actions:{money:"3"}}},
                 {name:"Smithy",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:4,attrs:{card:"3"}},
                 {name:"Spy",avail:false,deck:"dominion",quantity:10,picture:"",type:["action","attack"],cost:4,attrs:{card:"1",action:"1",discard:"*",discard_actions:{peek_discard:"1"}}},
                 {name:"Council Room",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"4",buy:"1",card_opponents:"1"}},
                 {name:"Festival",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{action:"1",buy:"1",money:"2"}},
                 {name:"Laboratory",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"2",action:"1"}},
                 {name:"Market",avail:false,deck:"dominion",quantity:10,picture:"",type:["action"],cost:5,attrs:{card:"1",action:"1",money:"1",buy:"1"}},
                 {name:"Witch",avail:false,deck:"dominion",quantity:10,picture:"",type:["action","attack"],cost:5,attrs:{card:"2",curse_opponents:"1"}},
                 ];

/*
Chancellor	Action	$3	+$2
You may immediately put your deck into your discard pile.
Bureaucrat	Action – Attack	$4	Gain a silver card; put it on top of your deck. Each other player reveals a Victory card from his hand and puts it on his deck (or reveals a hand with no Victory cards).
Feast	Action	$4	Trash this card. Gain a card costing up to $5.
Gardens	Victory	$4	Worth 1 Victory for every 10 cards in your deck (rounded down).
Remodel	Action	$4	Trash a card from your hand. Gain a card costing up to $2 more than the trashed card.
Thief	Action – Attack	$4	Each other player reveals the top 2 cards of his deck. If they revealed any Treasure cards, they trash one of them that you choose. You may gain any or all of these trashed cards. They discard the other revealed cards.
Throne Room	Action	$4	Choose an Action card in your hand. Play it twice.
Library	Action	$5	Draw until you have 7 cards in hand. You may set aside any Action cards drawn this way, as you draw them; discard the set aside cards after you finish drawing.
Mine	Action	$5	Trash a Treasure card from your hand. Gain a Treasure card costing up to $3 more; put it into your hand.
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

router.run_server = function(listener){
	//var parseCookie = require('../node_modules/connect').utils;
	
	//var timeout = 1000;
	
	/*var t = io.connect("http://localhost/ping", {
	    'port': 7070,
	    'connect timeout': timeout,
	    'reconnect': true,
	    'reconnection delay': 2000,
	    'max reconnection attempts': 10000,
	    'force new connection':true
	});*/
	 
	
	var server = require('socket.io').listen(listener, function() {
	  debug('Express server listening on port ' + server.address().port);
	});
	
	//So I guess the serer checks to make sure the client is still there. Use this to test the disconnect
	//server.set('heartbeat timeout', 1000);
	//server.set('heartbeat interval', 1000);
	
	//console.log('server elements');
	//for(var element in server){
	//	console.log(element);
	//}

	//for(var element in server.set){
	//	console.log(element);
	//}
	
	//This will only work if we have a socket connected anyways
	
	server.set('authorization', function (data, accept) {
	    // check if there's a cookie header
	    if (data.headers.cookie) {
	    	//data.test = "Something is here!";
	        //data.sessionID = (data.headers.cookie.split('; ')[1]).replace("connect.sid=","");
	        //console.log('Authorization Finished');
	        //console.log(data.headers);
	        //console.log(data.res);
	        //for(var items in data){
	        //	console.log(items);
	        //}
	        //console.log(data.test);
	        //console.log(data.sessionID);
	    	data.headers.sessionID = (data.headers.cookie.split('; ')[1]);
	        //data.headers.sessionID = (data.headers.cookie.split('; ')[1]).replace("connect.sid=","");
	    } else {
	       // if there isn't, turn down the connection with a message
	       // and leave the function.
	       return accept('No cookie transmitted.', false);
	    }
	    // accept the incoming connection
	    accept(null, true);
	});
	
	console.log('Socket Set');
	
	server.sockets.on('connection', function (socket) {
		
		//var socket_id = socket.id;
		
		clients[socket.id] = socket;
		
		//The unique header for each user
		clients[socket.id]['session_id'] = socket.handshake.headers.sessionID;
		
		/*console.log(socket.handshake.headers.sessionID);
		console.log('-------------------------------------');
		console.log(socket.handshake.headers);
		console.log('-------------------------------------');
		console.log(socket.handshake);
		console.log('-------------------------------------');
		for(var element in socket){
			console.log(element);
		}
		
		console.log(socket.conn);
		console.log('-------------------------------------');
		console.log(socket.client);
		console.log('-------------------------------------');
		console.log(socket.handshake);
		console.log('-------------------------------------');*/
		
		socket.on('disconnect', function() {
			//so we have to comb through the clients and take out all the sockets belonging to this session
			console.log('socket expired!');
			console.log(socket.handshake.headers.sessionID);
			console.log('-------------------------------------');
			
			var user_name = "";
			var deletes = [];
			if(socket.handshake.headers.sessionID != undefined){
				for(var client in clients){
					console.log('Looking for: ' + socket.handshake.headers.sessionID);
					console.log('Found: ' + clients[client]['session_id']);
					if(clients[client]['session_id'] == socket.handshake.headers.sessionID){
						console.log('Found match!');
						user_name = lobby.search_by_socket(client);
						console.log(user_name);
						if(user_name!=null){
							console.log('User is logged in!');
							console.log('Name: ' + user_name.name);
							server.sockets.emit('exit_game', { name: user_name.name });
							var lobby_index = lobby.get_user_index(user_name.name);
							lobby['people'].splice(lobby_index, 1);
							console.log('Logged out of lobby');
							server.sockets.emit('user', { users: get_user_info() });
							server.sockets.emit('room', { rooms: get_room_info() });
						}
						deletes.push(client);
					}
				}
				for(var item in deletes){
					delete clients[item];
				}
			}
			/*console.log('Remaining Clients');
			for(var client in clients){
				console.log(client);
			}*/
			
			//socket.socket.reconnect();
			
			/*for(var client in clients){
				if(clients[client]['session_id'] == socket.handshake.headers.sessionID){
					//This socket belongs to the session
					
				}
			}*/
		 });
		
		//setTimeout(function() {
			
			/*
			//server.sockets.get('user_name', function (err, name) {
			console.log('User timeout!');
			//close the connection and log the user out after 10 min of inactivity
			console.log(lobby);
			var user_name = socket.username;
			console.log(user_name);
			console.log('Name: ' + user_name);
			//log out of game room
			server.sockets.emit('exit_game', { name: user_name });
			console.log('Logged out of game_room');
			
			//log out of lobby
			var lobby_index = lobby.get_user_index(user_name);
			lobby['people'].splice(lobby_index, 1);
			console.log('Logged out of lobby');
			
			server.sockets.emit('user', { users: get_user_info() });
			server.sockets.emit('room', { rooms: get_room_info() });
			console.log('Clients updated');
			//});
			*/
			//server.close();
		//}, 1 * 60 * 1000);
		
	    //socket.emit('message', { message: 'welcome to the chat' });
		
		router.get('/users', function(req, res) {	
			
			res.send({users:get_user_info(),rooms:get_room_info(),in_room:find_room(req.session.username)==null?false:true});
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
	    
	    //card_decision_made
	    socket.on('card_decision_made', function (data) {
	    	var user = data.name;
	    	var cards = data.cards;
	    	var room = find_room(user);
	    	var user_index = room.game.get_user_index(user);
	    	var result_message = "";
	    	
	    	console.log('Received decision');
	    	if(room.game.player_decision_check(user)){
	    		console.log('Decision valid');
	    		console.log(data.action);
	    		//There needs to be a decision check here
	    		
	    		var took_action = false;
	    		
	    		if(data.action == "trash"){
		    		result_message = room.game.trash_cards(user,cards,data.on_action,false);
	    		}
	    		if(data.action == "trash_self"){
		    		result_message = room.game.trash_cards(user,cards,data.on_action,true);
	    		}
	    		if(data.action == "gain_card"){
	    			result_message = room.game.gain_cards(user,cards);
	    		}
	    		if(data.action == "discard_draw"){
	    			result_message = room.game.discard_draw(user,cards);
	    		}
	    		if(data.action == "discard_down_to"){
	    			result_message = room.game.discard(user,cards);
	    		}
	    		if(data.action == "discard_deck"){
	    			result_message = room.game.discard_deck(user,cards);
	    		}
	    		if(data.action == "avoid"){
	    			result_message = [room.game.people[room.game.get_user_index(user)]['name'] + " shows reaction card and avoids attack!"];
	    		}
	    		room.game['people'][user_index]['game']['extra_actions'].splice(0,1);
	    		
	    		console.log('Actions in queue');
	    		console.log(room.game['people'][user_index]['game']['extra_actions']);
	    		
	    		var still_waiting = false;
	    		for(var person in room.game.people){
	    			if(person!=room.game.current_turn && room.game.people[person]['game']['extra_actions'].length>0){
	    				still_waiting = true;
	    			}
	    		}
	    		//If all the other players are done, removing the waiting action
	    		if(!still_waiting){
	    			//person['game']['extra_actions'].push({action:'wait_others',value:'*',general:'waiting'});
	    			for(var action in room.game['people'][room.game.current_turn]['game']['extra_actions']){
	    				if(room.game['people'][room.game.current_turn]['game']['extra_actions'][action]['general'] === 'waiting'){
	    					room.game['people'][room.game.current_turn]['game']['extra_actions'].splice(action, 1);
	    				}
	    			}
	    			//room.game['people'][room.game.current_turn]['game']['extra_actions'] = [];
	    		}
	    		//user_index == room.game.current_turn
	    		
	    		console.log('Extra actions');
	    		console.log(room.game['people'][user_index]['game']);
	    		
	    		for(var person in room.game.people){
	    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
	    		}
	    		for(var message in result_message){
		    		server.sockets.in(room['name']).emit('message',{ message: result_message[message] });
	    		}
		    	if(room.game.game_over()){
		    		console.log('Game Over');
		    		console.log(room.game.game_ended);
	    			var data = room.game.return_winner();
	    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
		    		server.sockets.in(room['name']).emit('message',{ message:message_string});
		    		for(var person in room.game.people){
		    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
		    		}
		    	}
		    }
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
		    		console.log(room.game.game_ended);
	    			var data = room.game.return_winner();
	    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
		    		server.sockets.in(room['name']).emit('message',{ message:message_string});
		    		for(var person in room.game.people){
		    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
		    		}
		    	}
	    	}
	    });
	    
	    socket.on('player_use', function (data) {
	    	var user = data.name;
	    	var room = find_room(user);
	    	var card = data.card;
	    	var result_message = data.name + " plays " + card['name'];
	    	var user_index = room.game.get_user_index(user);
	    	
	    	if(user_index == room.game.current_turn && room.game.card_action_check(user,card)){
	    		var extra_actions = room.game.use_card(user,card);
	    		for(var person in room.game.people){
	    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
	    		}
	    		server.sockets.in(room['name']).emit('message',{ message:result_message });
	    		if(room.game.game_over()){
	    			console.log('Game Over');
		    		console.log(room.game.game_ended);
	    			var data = room.game.return_winner();
	    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
		    		server.sockets.in(room['name']).emit('message',{ message:message_string});
		    		for(var person in room.game.people){
		    			clients[room['people'][person]['socket']].emit('update',room.game.game_package(room.game['people'][person]['name']));
		    		}
		    	}
	    	}
	    });
	    
		router.post('/create_room', function(req, res) {
			console.log('User');
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
					server.sockets.emit('user', { users: get_user_info() });
					server.sockets.emit('room', { rooms: get_room_info() });
					
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
							
							joining_room.add_user_socket(req.session.username,lobby.find_socket(req.session.username));
							
							server.sockets.emit('user', { users: get_user_info() });
							server.sockets.emit('room', { rooms: get_room_info() });
							
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
			
			if(room!=null){
				var user_index = room.get_user_index(user_name);
				var game_user_index = -1;
				if(room.game != null){
					game_user_index = room.game.get_user_index(user_name);
				}
				
				//Send message to players that current player has left
				server.sockets.in(room['name']).emit('message',{ message:user_name + ' has left the game!' });
				//Iterate the turn up one if it was the user's turn
				if(room.game_started && room.game.get_user_index(user_name) == room.game.current_turn){
					room.game.next_turn(user_name);
				}
				//Remove the player from the room
				//lobby.add_user(user_name,socket.id);
				
				//You can technically be a part of the room without being in the game
				room['people'].splice(user_index, 1);
				if(room.game != null){
					room.game['people'].splice(game_user_index, 1);
				}
				room.game_started = false;
				
				console.log('Ending room people');
				console.log(room['people']);
				
				switch(room['people'].length){
					//If there are no more people in the room
					case 0:remove_room(room['id']);break;
					case 1:
						if(!room['game']['game_ended']){
							var data = room.game.return_winner();
			    			var message_string = "<br>The Game is Over<br>Winner: " + data['winner'] + data['user_meta'];
				    		server.sockets.in(room['name']).emit('message',{ message:message_string});
				    		//server.sockets.in(room['name']).emit('end_game', {});
						}
						break;
					default:break;
				}
				
				server.sockets.emit('user', { users: get_user_info() });
				server.sockets.emit('room', { rooms: get_room_info() });
			}
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
			//console.log(req.param('username'));
			//console.log(req.session.username);
			//Things that can happen
			//The user logs in and isnt a duplicate
			//done: The user logs in and it is a duplicate
			//The user returns from a game and has an active session
			if(user_exists(req.param('username'))){
				res.send({action: 'send_data',name: "duplicate"});
			}else if((req.session.username != "" && req.session.username != undefined) || req.param('username') != ""){
				console.log('name: ' + req.param('username'));
				console.log('session: ' + req.session.username);
				if(req.param('username') != ""){
					req.session.username = req.param('username');
				}
				lobby.add_user_session(req.session.username,req.sessionID);
				res.send({action: 'update_list',name: req.session.username,in_room:find_room(req.session.username)==null?false:true});
			}else{
				res.send({action: 'send_data',name: ""});
			}	
		});
		
		//and here
	    socket.on('login', function (data) {
	    	//console.log(socket);
	    	lobby.add_user_socket(data.name,socket.id);
	    	server.sockets.emit('user', { users: get_user_info() });
			server.sockets.emit('room', { rooms: get_room_info() });
	    	for(var person in lobby['people']){
				console.log(lobby['people'][person]['name']);
				if(lobby['people'][person]['socket'] in clients){
					clients[lobby['people'][person]['socket']].emit('message', {message : "Joined Room: " + lobby['name']});
				}
			}
	    });
	    
	    socket.on('update',function (data){
	    	socket.emit('user', { users: get_user_info() });
			socket.emit('room', { rooms: get_room_info() });
	    });
	    
	    server.on('connect_timeout', function (obj) {
	    	console.log(obj);
	        console.log("connect_timeout");
	    });
	    
	});
};

function user_exists(user){
	if(lobby.find_user(user)){
		return true;
	}
	for(var room in game_rooms){
		if(game_rooms[room].find_user(user)){
			return true;
		}
	}
	return false;
}

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

function get_user_info(){
	lobby_people_info = [];
	for(var person in lobby.people){
		var person_in_room = false;
		for(var room in game_rooms){
			if(game_rooms[room].find_user(lobby.people[person].name)){
				person_in_room= true;
			}
		}
		console.log('Lobby person name: ' + lobby.people[person].name);
		if(lobby.people[person].name != "" && lobby.people[person].name != undefined){
			lobby_people_info.push({name:lobby.people[person].name,in_room:person_in_room});
		}
	}
	console.log('Start user info');
	console.log(lobby_people_info);
	console.log('End user info');
	return lobby_people_info;
}

function get_room_info(){
	game_room_info = [];
	for(var room in game_rooms){
		if(game_rooms[room]['people'].length == game_rooms[room]['max_users']){
			game_room_info.push({name:game_rooms[room]['name'],full:true});
		}else{
			game_room_info.push({name:game_rooms[room]['name'],full:false});
		}
	}
	return game_room_info;
}

module.exports = router;