angular.module("hcLib").directive("medicineDoctorCategoryForm", function() {
	return {
		templateUrl : "src/medicine-doctor-category-form/medicine-doctor-category-form.tpl.html",
		controller : function($scope,medicineCategoryByDoctorService) {
			$scope.saveMedicineCategoryByDoctor = function(medicineCategoryByDoctor) {
				medicineCategoryByDoctorService.save(medicineCategoryByDoctor).then(function(res) {
					$scope.medicineCategoryByDoctor = {};
					if($scope.medicineCategoryDoctorForm) {
						$scope.medicineCategoryDoctorForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({categoryByDoctor: res});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		},
		scope : {
			options : "=",
			onCreate : "&",
			medicineCategoryByDoctor:"=?",
			onSubmitCloseForm:"&"
		}
	};
});