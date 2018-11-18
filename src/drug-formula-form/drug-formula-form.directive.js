angular.module("hcLib").directive("drugFormulaForm",function(){
	return{
		templateUrl:"src/drug-formula-form/drug-formula-form.tpl.html",
		controller:function($scope,drugFormulaService){
			$scope.saveDrugFormulae=function(drugFormulae){
				drugFormulaService.save(drugFormulae).then(function(res) {
					$scope.drugFormulae = {};
					if($scope.drugFormulaForm) {
						$scope.drugFormulaForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({drugFormulae: res});
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
			drugFormulae:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});