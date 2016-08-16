angular.module('starter.controllers', [])

.controller('PixLiveCtrl', function($scope, $ionicPopup, PxlRemoteController) {
	PxlRemoteController.synchronize(['release_test']).then(function(contexts) {
		console.log('Sync OK: ');
		console.log(contexts);
	}, function(reason) {
		$ionicPopup.alert({
	     title: 'PixLive Synchronization Error',
	     template: reason
	   });
	});
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
