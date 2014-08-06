var lobbyProject = angular.module('lobbyProject', []);

//TODO: make sure that the user cannot reload the screen and log in as somebody else

lobbyProject.factory('socket', function ($rootScope) {
	  var socket = io.connect();
	  return {
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
	  };
	});

function lobbyController($scope, $http, $compile, socket) {
	//A holder for the post form data
	$scope.formData = {};
	$scope.messages = [];
	$scope.users = [];
	$scope.rooms = [];
 
	socket.on('user', function(data){
		console.log('Got user data back');
		console.log(data.users);
		$scope.users = data.users;
	});
	
	socket.on('room', function(data){
		console.log('Got room data back');
		console.log(data.rooms);
		$scope.rooms = data.rooms;
	});
	
    socket.on('message', function (data) {
    	console.log('Got message back');
    	console.log(data);
        if(data.message) {
           /* if(data.action == 'use'){
            	data.message = 'uses ' + data.message;
            }
            if(data.action == 'buy'){
            	$scope.opponent_buy_card(data.message);
            	data.message = 'buys ' + data.message;
            }
        	$scope.messages.push(data);
            var html = '';
            for(var i=0; i<$scope.messages.length; i++) {
                html += '<b>' + ($scope.messages[i].username ? $scope.messages[i].username : 'Server') + ': </b>';
                html += $scope.messages[i].message + '<br />';
            }
            $('#content').html(html);
            $("#content").scrollTop($("#content")[0].scrollHeight);
            $("#field").val('');
            if(data.action === 'end_turn'){
	            $scope.player_turn = !$scope.player_turn;
	            if($scope.player_turn){
	            	$scope.draw();
	            }
            }*/
        } else {
            console.log("There is a problem:", data);
        }
    });
	
	$scope.send = function(user){
		console.log(user.message);
		if($scope.username != ""){
			socket.emit('send', { message: user.message, username: $scope.username, action:'talk'});
		}else{
			alert("Please login to the chat!");
		}
	};
	
	$scope.login = function(user){
		
		//Need to create the user
		$http.post('/login', { username: user.name})
		.success(function(data) {
			//Then attach the user to the socket...
			socket.emit('login', { name: data.name });
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	};
	
	$scope.create_room = function(room){
		$http.post('/create_room', { roomname: room.name})
		.success(function(data) {
			if(data === 'username'){
				alert('You must log in to create a room!');
			}else if(data === 'duplicate'){
				alert('You can only create one room at a time!');
			}else if(data === 'room_name'){
				alert('A room by this name already exists!');
			}else{
				console.log('Room Created!');
				$http.post('/join_room', { roomname: room.name})
				.success(function(data) {
					if(data === 'username'){
						alert('You must log in to create a room!');
					}else if(data === 'in_room'){
						alert('You are already in this room!');
					}else if(data === 'max_users'){
						alert('This room has already reached it\'s max users!');
					}else if(data === 'not_exists'){
						alert('This room doesn\'t exist!');
					}else{
						//link to room
						console.log('Room Joined!');
						console.log(data);
						window.location = "/game";
					}
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
			}
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	};
	
	$scope.join_room = function(room){
		console.log('Attempting to join room');
		console.log("Room full");
		console.log(room);
		if(!room.full){
			$http.post('/join_room', { roomname: room.name })
			.success(function(data) {
				if(data === 'username'){
					alert('You must log in to create/join a room!');
				}else if(data === 'in_room'){
					alert('You are already in this room!');
				}else if(data === 'max_users'){
					alert('This room has already reached it\'s max users!');
				}else if(data === 'not_exists'){
					alert('This room doesn\'t exist!');
				}else{
					//link to room
					console.log('Room Joined!');
					console.log(data);
					window.location = "/game";
				}
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		}else{
			alert('This room is already full!');
		}
	};
	   
	 $scope.loadData = function () {
		 console.log("Loading Page");
	     $http.get('/users').success(function(data) {
	    	 console.log(data);
	    	 $scope.users = data.users;
	    	 $scope.rooms = data.rooms;
	    	 if(data.in_room){
	    	 	 window.location = "/game";
	    	 }
	     });
	  };
	  
	  $scope.test = function(){
			console.log("Test"); 
		 };
	 
	$scope.loadData();
	
}