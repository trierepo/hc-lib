angular.module("hcLib").directive('prescriptionGenerator', function($rootScope) {
	return {
		restrict: 'E',
		scope : {
			options	: "=",
			onSave	: "&",
			prescription: '=',
			onToggleSelectedList: '&' 
		},
		templateUrl: 'src/prescription-generator/prescription-generator.tpl.html',
		link: function(scope, ele, attr) {} ,
		controller: function($scope, $http, $rootScope,opPrescriptionService,medicineCategoryService,medicineCategoryByDoctorService) {
			$scope.init = function() {
				$scope.saveBtnTxt = $scope.options.saveBtnTxt || 'Save';
				$scope.medicineSearch = {};
				$scope.expanded = { prescription: false };
				$scope.medicineCategoryList = [];
				$scope.doctorMedicineCategories = [];
				$scope.getRecentPrescriptionsByComplaint();
				$scope.getMedicineCategories();
				$scope.getDoctorMedicineCategories();
				$scope.scollerApi = {};
				$scope.finalTotal = 0;
			};
			$scope.getMedicineCategories = function() {
				medicineCategoryService.medicineCategoryList().then(function(res) {
					res.splice(0, 0, {category: "All"});
					$scope.medicineCategoryList = res;
				});
			};
			
			$scope.getDoctorMedicineCategories = function() {
				medicineCategoryByDoctorService.medicineCategoryByDoctorList().then(function(res) {
						res.splice(0, 0, {categoryName: "All"}); 
						$scope.doctorMedicineCategoryList = res;
				});
			};
			
			$scope.searchPurchaseBillMedicines = function() {
				$scope.medicineSearch.startIndex = 0;
				opPrescriptionService.searchPurchaseMedicines($scope.medicineSearch).then(function(res) {
					$scope.scollerApi.resetScroll();
					$scope.purchaseMedicineSearchResults = res;
					//console.log($scope.purchaseMedicineSearchResults);
				});
			};

			$scope.fetchMoreMedicineProduct = function () {
				$scope.medicineSearch.startIndex = $scope.purchaseMedicineSearchResults.length;
				opPrescriptionService.searchPurchaseMedicines($scope.medicineSearch).then(function(res) {
					$scope.purchaseMedicineSearchResults = $scope.purchaseMedicineSearchResults.concat(res);
				});
			};
			$scope.getAvailableQuantity = function(product) {
				return ( (product.medicineQuantity*1 + product.medicineFreeUnits*1) * (product.medicineNoOfUnits*1) ) - (product.medicineSold*1) + (product.medicineReturned*1) - (product.purchaseBillPurchaseReturned*1);
			};
			$scope.getRecentPrescriptionsByComplaint = function(){
				opPrescriptionService.opPrescriptionList({compliant:$scope.prescription.complaint}).then(function(res){
					for(var i=0;i<res.length;i++){
						if($scope.getAvailableQuantity(res[i])!=0){
							$scope.prescription.prescriptionMedicines.push(res[i]);
						}
					}
					$scope.getPrescriptionTotal();
				});
			};
			
			$scope.selectPurchaseMedicineProduct = function(purchaseMedicineProduct) {
				console.log("Purchase medicine",purchaseMedicineProduct);
				var prescriptionMedicine = {
						purchasedMedicineId : purchaseMedicineProduct.id,
						medicineName : purchaseMedicineProduct.name,
						batch : purchaseMedicineProduct.batch,
						expiryMonth : purchaseMedicineProduct.expiryMonth,
						expiryYear : purchaseMedicineProduct.expiryYear,
						mrp : purchaseMedicineProduct.mrp,
						noOfUnits : purchaseMedicineProduct.noOfUnits,
						packing : purchaseMedicineProduct.packing,
						medicineId : purchaseMedicineProduct.medicineId,
						category : purchaseMedicineProduct.category,
						subCategory : purchaseMedicineProduct.categoryByDoctor,
						location : purchaseMedicineProduct.location,
						drugContent : purchaseMedicineProduct.drugContent,
						hsnCode : purchaseMedicineProduct.hsnCode,
						taxPercent : purchaseMedicineProduct.taxPercent,
						taxAmount : purchaseMedicineProduct.taxAmount,
						purchaseQuantity : purchaseMedicineProduct.quantity,
						available : purchaseMedicineProduct.available
				};
				if($scope.prescription.prescriptionMedicines<1){
					$scope.prescription.prescriptionMedicines.push(prescriptionMedicine);
				}else {
					$scope.isExist = false;
					for(var i=0;i<$scope.prescription.prescriptionMedicines.length;i++){
						if($scope.prescription.prescriptionMedicines[i].purchasedMedicineId==purchaseMedicineProduct.id){
							$scope.infoMsg = "Already Exist.";
							$scope.isExist = true;
							$rootScope.$broadcast("$medicineExist",{isMedicineExist:$scope.isExist});
						}
					}
					if($scope.isExist==false){
						$scope.prescription.prescriptionMedicines.push(prescriptionMedicine);
					}
				}
			};
			
			$scope.unSelectPurchaseMedicineProduct = function(index) {
				$scope.prescription.prescriptionMedicines.splice(index, 1);
				$scope.getPrescriptionTotal();
				if($scope.expanded.prescription && !$scope.prescription.prescriptionMedicines.length) {
					$scope.toggleSelectedList(); // making exapended prescription false
				}
			};
			
			$scope.toggleSelectedList = function() {
				$scope.expanded.prescription = !$scope.expanded.prescription;
				if(typeof $scope.onToggleSelectedList === 'function') {
					$scope.onToggleSelectedList({$expanded: $scope.expanded.prescription});
				}
			};  
			$scope.getPrescriptionTotal=function() {
				$scope.finalTotal = 0;
				for(var i=0; i < $scope.prescription.prescriptionMedicines.length; i++) {
					var prescriptionTotal = 0;
					var medQty = 0;
					if($scope.prescription.prescriptionMedicines[i].quantity) {
						medQty = $scope.prescription.prescriptionMedicines[i].quantity;
					}
					$scope.finalTotal += medQty * ($scope.prescription.prescriptionMedicines[i].mrp / $scope.prescription.prescriptionMedicines[i].noOfUnits);
				}
			};
			$scope.onSaveClick = function() {
				if(typeof $scope.onSave === 'function') {
					$scope.onSave({$prescriptionMedicines: $scope.prescription.prescriptionMedicines});
				}
			};
			
			$scope.$on('$setPrescriptions', function(prescriptionMedicines) {
				$scope.prescription = {prescriptionMedicines: prescriptionMedicines};
			});
			$scope.$on('$setPrescriptionTotal', function() {
				$scope.getPrescriptionTotal();
			});

			$scope.init();
		}
	};
});