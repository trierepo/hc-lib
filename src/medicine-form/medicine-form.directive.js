angular.module("hcLib").directive("medicineForm",function(){
	return{
		templateUrl:"src/medicine-form/medicine-form.tpl.html",
		controller:function($scope,medicineService,companyService,drugFormulaService,medicineCategoryService,medicineCategoryByDoctorService,locationService,$timeout,$log){
			$scope.init=function(){
				$scope.getCompaniesList();
				$scope.getDrugFormulaList();
				$scope.getMedicineCategoryList();
				$scope.getMedicineCategoryByDoctorList();
				$scope.getMedicineLocationList();
			};
			$scope.getCompaniesList=function(){
				companyService.companiesList().then(function(res){
					if(res) {
						$scope.companies=res;
					}
				});
			};
			$scope.getDrugFormulaList=function(){
				drugFormulaService.drugFormulaeList().then(function(res){
					if(res) {
						$scope.drugFormulae=res;
					}
				});
			};
			$scope.getMedicineCategoryList=function(){
				medicineCategoryService.medicineCategoryList().then(function(res){
					if(res) {
						$scope.medicineCategories=res;
					}
				});
			};
			$scope.getMedicineCategoryByDoctorList=function(){
				medicineCategoryByDoctorService.medicineCategoryByDoctorList().then(function(res){
					if(res) {
						$scope.medicineCategoryByDoctor=res;
					}
				});
			};
			$scope.getMedicineLocationList=function(){
				locationService.locationsList().then(function(res){
					if(res) {
						$scope.medicineLocations=res;
					}
				});
			};
			
			$scope.saveMedicine=function(medicine){
				medicineService.save(medicine).then(function(res) {
					$scope.medicine = {};
					if($scope.medicineForm) {
						$scope.medicineForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({medicine: res});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				},function(err){
					$log.error(err);
				});
			};
			/*On create for Master Forms*/
			$scope.$on('$companyCreate', function(event, company) {
				$scope.companies.push(company);
			});
			$scope.$on('$drugCreate', function(event, drugFormulae) {
				$scope.drugFormulae.push(drugFormulae);
			});
			$scope.$on('$medicineCategoryCreate', function(event, medicineCategory) {
				$scope.medicineCategories.push(medicineCategory);
			});
			$scope.$on('$medicineCategoryByDoctorCreate', function(event, medicineCategoryByDoctor) {
				$scope.medicineCategoryByDoctor.push(medicineCategoryByDoctor);
			});
			$scope.$on('$medicineLocationCreate', function(event, medicineLocation) {
				$scope.medicineLocations.push(medicineLocation);
			});
			/*Display Master Form*/
			$scope.openCompanyForm=function(){
				if(typeof $scope.onCompanyOpen=='function'){
					$scope.onCompanyOpen();
				}
			};
			$scope.openDrugFormulaForm=function(){
				if(typeof $scope.onDrugFormulaOpen=='function'){
					$scope.onDrugFormulaOpen();
				}
			};
			$scope.openCategoryForm=function(){
				if(typeof $scope.onCategoryOpen=='function'){
					$scope.onCategoryOpen();
				}
			};
			$scope.openDoctorCategoryForm=function(){
				if(typeof $scope.onDoctorCategoryOpen=='function'){
					$scope.onDoctorCategoryOpen();
				}
			};
			$scope.openLocationForm=function(){
				if(typeof $scope.onLocationOpen=='function'){
					$scope.onLocationOpen();
				}
			};
			$scope.functionToEnableButton = function() {
			    return $timeout(angular.noop, 5000);
			  };
			$scope.init();
		},
		scope:{
			options: "=",
			medicine: "=",
			onCreate: "&",
			onCompanyOpen:"&",
			onDrugFormulaOpen:"&",	
			onCategoryOpen:"&",
			onDoctorCategoryOpen:"&",
			onLocationOpen:"&",
			onSubmitCloseForm:"&"
		}
	};
	
});