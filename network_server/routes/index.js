#!/usr/bin/env node

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
//var app = require('../app');
var game = require('../game');
var Room = require('../room');
//console.log(express());
//console.log(router);
//var server = app.get('server');
//var server = express['server'];

//console.log(express);
//console.log(server);

//var http = require('http');

var lobby = new Room("Lobby", "001", "admin");
var game_rooms = [];

/*var people = [];
var games = {};
var clients = [];*/

var card_meta = [ 
                  {name:"Province",deck:"dominion",quantity:8,picture:"",type:"victory",cost:8,attrs:{victory:"6"}},
                  {name:"Duchy",deck:"dominion",quantity:8,picture:"",type:"victory",cost:5,attrs:{victory:"3"}},
                  {name:"Estate",deck:"dominion",quantity:8,picture:"",type:"victory",cost:2,attrs:{victory:"1"}},
                  {name:"Province",deck:"dominion",quantity:8,picture:"",type:"victory",cost:8,attrs:{victory:"6"}},
                 {name:"Gold",deck:"dominion",quantity:20,picture:"",type:"coin",cost:6,attrs:{money:"3"}},
                 {name:"Silver",deck:"dominion",quantity:20,picture:"",type:"coin",cost:3,attrs:{money:"2"}},
                 {name:"Copper",deck:"dominion",quantity:20,picture:"",type:"coin",cost:0,attrs:{money:"1"}},
                 {name:"Curse",deck:"dominion",quantity:10,picture:"",type:"victory",cost:0,attrs:{victory:"-1"}},
                 
                 {name:"Cellar",deck:"dominion",quantity:10,picture:"",type:"action",cost:2,attrs:{action:"1",discard:"*",card:"discard"}},
                 {name:"Chapel",deck:"dominion",quantity:10,picture:"",type:"action",cost:2,attrs:{trash_other:"<=4"}},
                 {name:"Village",deck:"dominion",quantity:10,picture:"",type:"action",cost:3,attrs:{card:"1",action:"2"}},
                 {name:"Woodcutter",deck:"dominion",quantity:10,picture:"",type:"action",cost:3,attrs:{buy:"1",money:"2"}},
                 {name:"Workshop",deck:"dominion",quantity:10,picture:"",type:"action",cost:3,attrs:{gain_card:"<=4"}},
                 {name:"Council Room",deck:"dominion",quantity:10,picture:"",type:"action",cost:5,attrs:{card:"4",buy:"1",card_opponents:"1"}},
                 {name:"Festival",deck:"dominion",quantity:10,picture:"",type:"action",cost:5,attrs:{action:"1",buy:"1",money:"2"}},
                 {name:"Laboratory",deck:"dominion",quantity:10,picture:"",type:"action",cost:5,attrs:{card:"2",action:"1"}},
                 {name:"Market",deck:"dominion",quantity:10,picture:"",type:"action",cost:5,attrs:{card:"1",action:"1",money:"1",buy:"1"}},
                 {name:"Witch",deck:"dominion",quantity:10,picture:"",type:"action",cost:5,attrs:{card:"2",curse_opponents:"1"}},
                 ];

/*
Moat	Action – Reaction	$2	+2 Cards
When another player plays an Attack card, you may reveal this from your hand. If you do, you are unaffected by that Attack.
Chancellor	Action	$3	+$2
You may immediately put your deck into your discard pile.
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

Library	Action	$5	Draw until you have 7 cards in hand. You may set aside any Action cards drawn this way, as you draw them; discard the set aside cards after you finish drawing.
Mine	Action	$5	Trash a Treasure card from your hand. Gain a Treasure card costing up to $3 more; put it into your hand.
Each other player gains a Curse card.
Adventurer	Action	$6	Reveal cards from your deck until you reveal 2 Treasure cards. Put those Treasure cards in your hand and discard the other revealed cards. */

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

/*GET all meta*/
router.get('/all', function(req, res) {
    var db = req.db;
    var collection = db.get('card');
    collection.find({},{},function(e,docs){
        res.setHeader('Content-Type', 'application/json');
        res.send(docs);
    });
});

router.post('/add_quiz', function(req, res) {
    var db = req.db;

	console.log(req.param('test'));
	console.log(req.param('genre'));

    var test_name = req.param('test');
    var test_genre = req.param('genre');
    
    var collection = db.get('quiz');
    collection.insert({name:test_name,genre:test_genre,questions:[]},
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

router.post('/add_question', function(req, res) {
      var db = req.db;

	  console.log(req.param('test'));
	  console.log(req.param('question'));

      var test_name = req.param('test');
      var question_correct = req.param('correct');
      var question_name = req.param('question');
      var question_answers = req.param('answers');
      
      var question_object = {
		  question:question_name,
		  answers:question_answers,
		  correct:question_correct
      }
      
      console.log(question_object);

      // Set our collection
      var collection = db.get('quiz');
      
      collection.find({name:test_name},{},function(e,docs){
          	res.setHeader('Content-Type', 'application/json');
          	console.log(docs[0].questions);
          	docs[0].questions.push(question_object);
          	collection.update({name:test_name}, {'$set':{"questions" : docs[0].questions}},function (err, doc) {
                if (err) {
                    res.send("Error");
                }
                else {
                	res.send("Success");
                }
          	});
      });
});

router.post('/delete_question', function(req, res) {
      var db = req.db;

	  console.log(req.param('test'));
	  console.log(req.param('question'));

      var test_name = req.param('test');
      var question_name = req.param('question');

      // Set our collection
      var collection = db.get('quiz');
      
      collection.find({name:test_name},{},function(e,docs){
          	res.setHeader('Content-Type', 'application/json');
          	var new_questions = [];
          	console.log(docs[0]);
          	console.log(docs[0].questions);
          	for(var i = 0; i < docs[0].questions.length;i++){
          		console.log(docs[0].questions[i].question);
          		if(docs[0].questions[i].question != question_name){
          			new_questions.push(docs[0].questions[i]);
          		}
          	}
          	collection.update({name:test_name}, {'$set':{"questions" : new_questions}},function (err, doc) {
                if (err) {
                    res.send("Error");
                }
                else {
                	res.send("Success");
                }
          	});
      });
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

/*
 *  socket.room = name;
	socket.join(socket.room);
	people[socket.id].owns = id;
	people[socket.id].inroom = id;
	room.addPerson(socket.id);
	socket.emit("update", "Welcome to " + room.name + ".");
	socket.emit("sendRoomID", {id: id});
	chatHistory[socket.room] = [];
 */

//io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});

router.run_server = function(listener){
	var server = require('socket.io').listen(listener, function() {
	  debug('Express server listening on port ' + server.address().port);
	});

	//This will only work if we have a socket connected anyways
	
	console.log('Socket Set');
	
	server.sockets.on('connection', function (socket) {
	    socket.emit('message', { message: 'welcome to the chat' });
	    
	    router.check_username = function(username){
	    	if(username === "" || username === undefined){
				return false;
			}
	    	return true;
	    }
	    
		router.post('/login', function(req, res) {
			console.log(req.param('username'));
			req.session.username = req.param('username');
			//lobby.add_user(req.sessionID,req.session.username);
			lobby.add_user(socket.id,req.session.username);
			server.sockets.emit('user', { users: lobby.people });
			res.send(req.session.username);
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
					socket.room = req.param('roomname');
					socket.join(socket.room);
					
					//Add the room to the server. The name will refer to the socket later
					var new_room = new Room(req.param('roomname'), req.sessionID, req.session.username);
					new_room.add_user(socket.id,req.session.username);
					game_rooms.push(new_room);
					
					//Show the other users that the room has been created
					server.sockets.emit('room', { rooms: game_rooms });
					
					//Return the room name
					res.send(req.param('roomname'));
				}
			}
		});
		
		router.post('/join_room', function(req, res) {
			var room_name = req.param('roomname');
			//Check to make sure that the room exists
			if(!router.check_username(req.session.username)){
				res.send('username');
			}
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
					if(!joining_room.find_user(socket.id)){
						new_room.add_user(socket.id,req.session.username);
						//server.sockets.emit('user', { users: lobby.people });
						res.send('joined');
					}else{
						res.send('in_room');
					}
				}else{
					res.send('max_users');
				}
			}else{
				res.send('not_exists');
			}
		});
	    
	    socket.on('send', function (data) {
	        server.sockets.emit('message', data);
	    });
	    
	    socket.on('login', function (data) {
	    	console.log('Login');
	    	console.log(data);
	    	console.log(router);
	    	var session = require('../app').get('session');
	    	console.log(session);
	    	console.log(session['Cookie']);
	    	console.log(session['Store']);
	    	console.log(session['Session']);
	    	console.log(session['Cookie']());
	    	console.log(session['Store']());
	    	console.log(session['Session']());
	    	console.log('End Login');
	        //server.sockets.emit('message', data);
	    });
	});
};

/*server.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        server.sockets.emit('message', data);
    });
});*/

module.exports = router;

console.log('End of Index');