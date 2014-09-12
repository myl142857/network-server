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
        	//The message code would go here if it mattered...
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
		console.log('User');
		console.log(user);
		//Need to create the user
		$http.post('/login', { username: user.name})
			.success(function(data) {
				$('#login_field').val('');
				
				console.log(data);
				
				if(data.action == 'update_list'){
					socket.emit('login', { name: data.name });
				}else if(data.action == 'send_data'){
					socket.emit('update', { });
					if(data.name == 'duplicate'){
						alert('This username already exists. Please choose another.');
					}
				}
				if(data.in_room){
		    	 	 window.location = "/game";
		    	 }
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
	
	$scope.create_room = function(room){
		$http.post('/create_room', { roomname: room.name})
		.success(function(data) {
			$('#room_field').val('');
			
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

	$scope.login({name:""});
	
}