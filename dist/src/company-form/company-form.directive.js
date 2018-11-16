angular.module("hcLib").directive("companyForm", function() {
	return {
		restrict: 'E',
		templateUrl : "src/company-form/company-form.tpl.html",
		controller : ['$scope', 'companyService', function($scope, companyService) {
			$scope.saveCompany = function(company) {
				companyService.saveCompany(company).then(function(res) {
					$scope.company = {};
					if($scope.companyForm) {
						$scope.companyForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({value: res.response});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		}], 
		scope : {
			options : "=",
			onCreate : "&",
			company :'=?',
			onSubmitCloseForm:"&"
		}
	};
});