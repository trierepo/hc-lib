angular.module("hcLib").directive("locationForm",function(){
	return{
		templateUrl:"src/location-form/location-form.tpl.html",
		controller:function($scope,locationService){
			$scope.saveMedicineLocation=function(location){
				locationService.save(location).then(function(res) {
					$scope.location = {};
					if($scope.locationForm) {
						$scope.locationForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({location: res});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		},
		scope:{
			options: "=",
			onCreate: "&",
			location:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});