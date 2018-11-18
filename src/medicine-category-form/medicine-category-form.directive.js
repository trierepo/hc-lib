angular.module("hcLib").directive("medicineCategoryForm",function(){
	return{
		templateUrl:"src/medicine-category-form/medicine-category-form.tpl.html",
		controller:function($scope,medicineCategoryService){
			$scope.saveMedicineCategory=function(medicineCategory){
				medicineCategoryService.save(medicineCategory).then(function(res) {
					$scope.medicineCategory = {};
					if($scope.medicineCategoryForm) {
						$scope.medicineCategoryForm.$setPristine();
					}
					
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({medicineCategory: res});
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
			medicineCategory:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});