angular.module("hcLib").directive("patientForm", function() {
	return {
		restrict : 'E',
		scope : {
			patient: '=?',
			onSubmit : '&'
		},
		controller : controller,
		templateUrl : "src/patient-form/patient-form.tpl.html"
	};
	function controller($scope, patientService, $stateParams, $state, ngDialog) {
		$scope.addPatient = addPatient;
		$scope.getAgeFromDob = getAgeFromDob;
		$scope.getDateFromAge = getDateFromAge;
		$scope.init = init;

		function init() {
			$scope.form = {};
			$scope.genderTypes = GENDERS;
			$scope.relationTypes = RELATIONS;

			if ($scope.patient) {
				$scope.patient = $scope.patient || {};
			} else {
				$scope.gender = $scope.genderTypes[0];
				$scope.relationType = $scope.relationTypes[1];
			}
			$scope.opId = $stateParams.opId;
		}

		function addPatient() {
			patientService.addPatient($scope.patient).then(function(res) {
				$scope.onSubmit({
					$patient : res
				});
				ngDialog.close(ngDialog.latestID);
			});
		}
		$scope.getAgeFromDob = function(pdob) {
			$scope.patient.age = getAgeFromDob(pdob);
		};

		$scope.getDateFromAge = function(age) {
			$scope.patient.dob = getDateFromAge(age);
		};
		init();
	}
});