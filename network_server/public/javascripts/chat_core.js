function mainController($scope, $http, $compile, socket) {
	var quiz_name = "";
	
	//A holder for the post form data
	$scope.formData = {};
	$scope.messages = [];
	$scope.username = "";
 
    socket.on('message', function (data) {
    	console.log(data);
        if(data.message) {
        	$scope.messages.push(data);
            var html = '';
            for(var i=0; i<$scope.messages.length; i++) {
                html += '<b>' + ($scope.messages[i].username ? $scope.messages[i].username : 'Server') + ': </b>';
                html += $scope.messages[i].message + '<br />';
            }
            $('#content').html(html);
            $("#content").scrollTop($("#content")[0].scrollHeight);
            $("#field").val('');
        } else {
            console.log("There is a problem:", data);
        }
    });
	
	$scope.send = function(user){
		console.log(user.message);
		if($scope.username != ""){
			socket.emit('send', { message: user.message, username: $scope.username});
		}else{
			alert("Please login to the chat!");
		}
	};
	
	$scope.login = function(user){
		console.log(user.name);
		$scope.username = user.name;
		$("#username").val('');
	};
	
	
	 /*$scope.loadData = function () {
		 console.log("Loading Page");
	     $http.get('/all').success(function(data) {
	    	 //console.log("Load returned success!");
	    	 $scope.quizzes = data;
	    	 for(quiz in $scope.quizzes){
	    		 var this_quiz = $scope.quizzes[quiz];
	    		 //console.log("Comparing: " + $scope.quiz['name'] + ":" + this_quiz['name']);
	    		 if($scope.quiz['name'] == this_quiz['name']){
	    			 //console.log("Found Match!!!");
	    			 $scope.quiz = this_quiz;
	    		     $scope.nameClick($scope.quiz,false);
	    		 }
	    	 }
	     });
	  };
	
	$scope.loadData();*/
	
}