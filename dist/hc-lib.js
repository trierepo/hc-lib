angular.module('hcLib', ['camera', 'ngDialog', 'ui.bootstrap']);
angular.module("hcLib").directive("patientForm", function() {
	controller.$inject = ['$scope', 'patientService', '$stateParams', '$state', 'ngDialog'];
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
angular.module('tcLib').service('casesheet', ['httpService', function(httpService) {
    this.save = save;
    this.caseSheetList = caseSheetList;

    function save(casesheet) {
        return httpService.post('casesheet/saveorupdate', casesheet);
    }

    function caseSheetList(opPatientId) {
        return httpService.get('casesheet/search', {
            opPatientId: opPatientId // optional
        });
    }
}]);

angular.module('tcLib').service('commonService', ['httpService', function(httpService) {

    this.createDoctor = createDoctor;
    this.getDoctors = getDoctors;
    this.getDoctorByUserId = getDoctorByUserId;
    this.getOpTypes = getOpTypes;
    this.getOpSubTypes = getOpSubTypes;
    this.getLabData = getLabData;
    this.getLabReportData = getLabReportData;
    this.getLabTestNotes = getLabTestNotes;
    this.getRequisitionSlip = getRequisitionSlip;

    function createDoctor(casesheet) {
        return httpService.post('common/doctor/create', casesheet);
    }

    function getDoctors() {
        return httpService.get('common/doctor/list');
    }

    function getDoctorByUserId(userId) {
        return httpService.get('common/doctor/user/' + userId);
    }

    function getOpTypes() {
        return httpService.get('common/optype/list');
    }

    function getOpSubTypes() {
        return httpService.get('common/opsubtype/list');
    }

    function getLabData() {
        return httpService.get('common/lab/lab-data');
    }

    function getLabReportData() {
        return httpService.get('common/lab/lab-report-data');
    }

    function getLabTestNotes() {
        return httpService.get('common/lab/lab-test-notes');
    }

    function getRequisitionSlip() {
        return httpService.get('common/lab/requisition-slip');
    }
}]);

angular.module('tcLib').service('companyService', ['httpService', function(httpService) {
    this.save = save;
    this.companiesList = companiesList;

    function save(company) {
        return httpService.post('company/saveorupdate', company);
    }

    function companiesList() {
        return httpService.get('company/list');
    }
}]);

angular.module('tcLib').service('complaintService', ['httpService', function(httpService) {
    this.saveComplaint = saveComplaint;
    this.saveComplaintTransation = saveComplaintTransation;
    this.complaintMastersList = complaintMastersList;
    this.complaintTransactList = complaintTransactList;

    function saveComplaint(complaintMaster) {
        return httpService.post('complaint/save', complaintMaster);
    }

    function saveComplaintTransation(complaintTransact) {
        return httpService.post('complaint/transact/saveorupdate', complaintTransact);
    }

    function complaintMastersList(patientId) {
        return httpService.get('complaint/search', {
            patientId: patientId // optional
        });
    }

    function complaintTransactList(opPatientId) {
        return httpService.get('complaint/transact/search', {
            opPatientId: opPatientId // optional
        });
    }
}]);

angular.module('tcLib').service('drugFormulae', ['httpService', function(httpService) {
    this.save = save;
    this.drugFormulaeList = drugFormulaeList;

    function save(drugFormulae) {
        return httpService.post('drugFormulae/saveorupdate', drugFormulae);
    }

    function drugFormulaeList() {
        return httpService.get('drugFormulae/list');
    }
}]);

angular.module('tcLib').provider('httpService', function() {
	var basePath = '';
	try {
		basePath = location.href.split('/')[3];
	} catch(err) {
		basePath = '';
	}

	this.setBasePath = function(_basePath) {
		basePath = _basePath;
	};

	this.$get = ['$http', '$q', function httpService($http, $q) {
		return {
			get: reqWithoutPayload.bind(null, 'GET'),
			del: reqWithoutPayload.bind(null, 'DELETE'),
			put: reqWithPayload.bind(null, 'PUT'),
			post: reqWithPayload.bind(null, 'POST'),
			upload: upload.bind(null, 'POST'),
			getJSON: getJSON.bind(null, 'GET')
		};
	
		function reqWithoutPayload(reqType, url, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				method: reqType,
				url: url
			});
		}
	
		function reqWithPayload(reqType, url, payload, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				method: reqType,
				url: url,
				data: payload
			});
		}
		
		function upload(reqType, url, formData, urlParams, nullAllowed) {
			url = _appendUrlParams(url, urlParams, nullAllowed);
			return _sendRequest({
				url: url,
				method: reqType,
				data: formData,
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			});
		}
		
		function getJSON(reqType, url, cacheKey) {
			if (cacheKey && localStorage.getItem(cacheKey)) {
				return $q.when(null).then(function() {
					var cacheData = localStorage.getItem(cacheKey);
					return JSON.parse(cacheData);
				});
			} else {
				return reqWithoutPayload(reqType, url).then(function(res) {
					localStorage.setItem(cacheKey, res.json);
					return res;
				});
			}
		}
		
		function _appendUrlParams(url, urlParams, nullAllowed) {
			if (urlParams) {
				url += '?' + toURLParams(urlParams, nullAllowed);
			}
			return '/' + basePath + '/' + url;
		}
		
		function _sendRequest(req) {
			var defer = $q.defer();
			$http(req).success(function(res) {
				if (res.isSuccess) {
					defer.resolve(res.response);
				} else {
					defer.reject(res);
				}
			}).error(function(err) {
				defer.reject(err);
			});
			return defer.promise;
		}
	}];
});

angular.module('tcLib').service('labPatientService', ['httpService', function(httpService) {
    this.save = save;
    this.search = search;
    this.saveReport = saveReport;
    this.getReport = getReport;
    this.savePayment = savePayment;
    this.getPayments = getPayments;
    this.uploadReport = uploadReport;

    function save(payload) {
        return httpService.post('labpatient/save', payload);
    }

    function search(params) {
        return httpService.get('labpatient/get', params);
    }

    function saveReport(payload) {
        return httpService.post('labpatient/report/save', payload);
    }

    function getReport(labPatientId) {
        return httpService.get('labpatient/report/get/' + labPatientId);
    }

    function savePayment(payload) {
        return httpService.post('labpatient/payment/save', payload);
    }

    function getPayments(labReportId) {
        return httpService.get('labpatient/get/payments/' + labReportId);
    }

    function uploadReport(labPatientId, formData) {
        return httpService.upload('labpatient/uploadreport/' + labPatientId, formData);
    }
}]);

angular.module('tcLib').service('locationService', ['httpService', function(httpService) {
    this.save = save;
    this.locationsList = locationsList;

    function save(location) {
        return httpService.post('location/saveorupdate', location);
    }

    function locationsList() {
        return httpService.get('location/list');
    }
}]);

angular.module('tcLib').service('loginService', ['httpService', function(httpService) {
    this.login = login;
    this.sessionUser = sessionUser;

    function login(payload) {
        return httpService.post('auth/login', payload);
    }

    function sessionUser() {
        return httpService.get('auth/sessionuser');
    }
}]);

angular.module('tcLib').service('medicineCategoryService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryList = medicineCategoryList;

    function save(medicineCategory) {
        return httpService.post('medicinecategory/saveorupdate', medicineCategory);
    }

    function medicineCategoryList() {
        return httpService.get('medicinecategory/list');
    }
}]);

angular.module('tcLib').service('medicineCategoryByDoctorService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryByDoctorList = medicineCategoryByDoctorList;

    function save(medicineCategoryByDoctor) {
        return httpService.post('medicinecategorybydoctor/saveorupdate', medicineCategoryByDoctor);
    }

    function medicineCategoryByDoctorList() {
        return httpService.get('medicinecategorybydoctor/list');
    }
}]);

angular.module('tcLib').service('medicineService', ['httpService', function(httpService) {
    this.save = save;
    this.medicinesList = medicinesList;
    this.medicineViewList = medicineViewList;

    function save(medicine) {
        return httpService.post('medicine/saveorupdate', medicine);
    }

    function medicineViewList(payload) {
        return httpService.get('medicine/listbyoptions', payload);
    }

    function medicinesList(id) {
        return httpService.get('medicine/list', {
            id: id // optional
        });
    }

}]);

angular.module('tcLib').service('opPatientService', ['httpService', function(httpService) {
    this.save = save;
    this.getOpPatientsListByOptions = getOpPatientsListByOptions;
    this.getOpPatientByPatientId = getOpPatientByPatientId;
    this.getOpPatientCountWithStatusByOpId = getOpPatientCountWithStatusByOpId;
    this.getOrCreatePatientCard = getOrCreatePatientCard;
    this.createPatientCard = createPatientCard;

    function save(opPatient) {
        return httpService.post('oppatient/createorupdate', opPatient);
    }

    function getOpPatientsListByOptions(opPatient) {
        return httpService.post('oppatient/listbyoptions', opPatient);
    }

    function getOpPatientByPatientId(opPatientId) {
        return httpService.get('oppatient/getoppatientbyid/' + opPatientId);
    }

    function getOpPatientCountWithStatusByOpId(opId) {
        return httpService.get('oppatient/statuscount/'+opId);
    }

    function getOrCreatePatientCard(patientCardInfo) {
        return httpService.post('oppatient/patient-card', patientCardInfo);
    }

    function createPatientCard(patientCardInfo) {
        return httpService.post('oppatient/patient-card/new',patientCardInfo);
    }
}]);

angular.module('tcLib').service('opPrescriptionService', ['httpService', function(httpService) {
    this.save = save;
    this.searchPurchaseMedicines = searchPurchaseMedicines;
    this.opPrescriptionList = opPrescriptionList;

    function save(prescription) {
        return httpService.post('opprescription/saveorupdate', prescription);
    }

    function searchPurchaseMedicines(payload) {
        return httpService.get('opprescription/medicine-search', payload);
    }

    function opPrescriptionList(payload) {
        return httpService.get('opprescription/list', payload);
    }

}]);

angular.module('tcLib').service('opService', ['httpService', function(httpService) {
    this.create = create;
    this.search = search;
    this.get = get;
    this.statusList = statusList;
    this.configCreate = configCreate;
    this.configList = configList;

    function create(op) {
        return httpService.post('op/create', op);
    }

    function search(payload) {
        return httpService.post('op/op-list', payload);
    }

    function get(id) {
        return httpService.get('op/get/' + id);
    }

    function statusList(date) {
        return httpService.get('op/op-status-list', {
            date: date
        });
    }

    function configCreate(payload) {
        return httpService.post('op/config/create', payload);
    }

    function configList() {
        return httpService.get('op/config/list');
    }
}]);

angular.module('tcLib').service('patientService', ['httpService', function(httpService) {
    this.save = save;
    this.patientsListByOptions = patientsListByOptions;
    this.imageData = imageData;

    function save(patient) {
        return httpService.post('patient/saveorupdate', patient);
    }

    function patientsListByOptions(payload) {
        return httpService.get('patient/listbyoptions', payload);
    }

    function imageData(payload) {
        return httpService.get('patient/getphoto', payload);
    }

    
  
}]);

angular.module('tcLib').service('purchasebillMedicineService', ['httpService', function(httpService) {
    this.purchaseBillMedicines = purchaseBillMedicines;
    this.alertInfo = alertInfo;
    this.pendingBillMedicines  = pendingBillMedicines;

  
    function purchaseBillMedicines(payload) {
        return httpService.get('purchasebillmedicine/search', payload);
    }

    function alertInfo(payload) {
        return httpService.get('purchasebillmedicine/alertinfo', payload);
    }
    function pendingBillMedicines(billId) {
        return httpService.get('purchasebillmedicine/pendingbills', {
            billId: billId
        });
    }

}]);

angular.module('tcLib').service('purchasebillService', ['httpService', function(httpService) {
    this.createPurchaseBill = createPurchaseBill;
    this.purchaseBillById = purchaseBillById;
    this.purchaseBillsListByOptions = purchaseBillsListByOptions;
    this.purchaseTotal = purchaseTotal;
    this.createPurchaseBillPayment = createPurchaseBillPayment;
    this.purchaseBillPaymentList = purchaseBillPaymentList;
    this.createPurchaseBillReturn = createPurchaseBillReturn;
    this.purchaseReturns = purchaseReturns;
    this.purchaseReturnMedicines = purchaseReturnMedicines;
    this.uploadPurchaseBill = uploadPurchaseBill;

    function createPurchaseBill(purchaseBill) {
        return httpService.post('purchasebill/save', purchaseBill);
    }

    function purchaseBillById(id) {
        return httpService.get('purchasebill/get/' + id);
    }

    function purchaseBillsListByOptions(payload) {
        return httpService.get('purchasebill/search', payload);
    }

    function purchaseTotal(payload) {
        return httpService.get('purchasebill/total', payload);
    }

    function createPurchaseBillPayment(purchasePayment) {
        return httpService.post('purchasebill/payment/save', purchasePayment);
    }

    function purchaseBillPaymentList(payload) {
        return httpService.get('purchasebill/payment/search', payload);
    }

    function createPurchaseBillReturn(purchaseReturn) {
        return httpService.post('purchasebill/return/save', purchaseReturn);
    }    
    
    function purchaseReturns(payload) {
        return httpService.get('purchasebill/returns/get', payload);
    }

    function purchaseReturnMedicines(payload) {
        return httpService.get('purchasebill/return/medicines/get', payload);
    }
    
    function uploadPurchaseBill(payload,billId) {
        return httpService.post('purchasebill/upload/'+billId, payload);
    }

}]);



angular.module('tcLib').service('reportsService', ['httpService', function(httpService) {
    this.salesReports = salesReports;
    this.salesReturnReports = salesReturnReports;
    this.salesPaymentReports = salesPaymentReports;
    this.paymentReports = paymentReports;
    this.purchaseReports = purchaseReports;
    this.salesTransactions  = salesTransactions;
    this.purchaseTransactions = purchaseTransactions;
    this.paymentTransactionsByDateRange = paymentTransactionsByDateRange;
    this.adjustMrpByDateRange = adjustMrpByDateRange;
    this.adjustUnitsOrAvailability = adjustUnitsOrAvailability;

    function salesReports(payload) {
        return httpService.get('reports/sales/bills', payload);
    }

    function salesReturnReports(payload) {
        return httpService.get('reports/sales/returns', payload);
    }

    function salesPaymentReports(payload) {
        return httpService.get('reports/sales/payments', payload);
    }

    function paymentReports(payload){
        return httpService.post('reports/payments', payload);
    }


    function purchaseReports(payload) {
        return httpService.get('reports/purchase', payload);
    }

    
    function salesTransactions(payload) {
        return httpService.get('reports/salesTransactions', payload);
    }

    function purchaseTransactions(payload) {
        return httpService.get('reports/purchaseTransactions', payload);
    }

    function paymentTransactionsByDateRange(salesPayment) {
        return httpService.post('reports/create', salesPayment);
    }

    function adjustMrpByDateRange(taxAdjust) {
        return httpService.post('reports/adjustMrp', taxAdjust);
    }

    function adjustUnitsOrAvailability(salesBillMedicines) {
        return httpService.post('reports/adjustunitsoravailability', salesBillMedicines);
    }   

    function salesTransactions(payload) {
        return httpService.get('reports/salesPayments', payload);
    }

}]);

angular.module('tcLib').service('representativeService', ['httpService', function(httpService) {
    this.save = save;
    this.representativesList = representativesList;

    function save(representative) {
        return httpService.post('representative/saveorupdate', representative);
    }

   
    function representativesList() {
        return httpService.get('representative/list');
    }
}]);

angular.module('tcLib').service('salesbillService', ['httpService', function(httpService) {
    this.create = create;
    this.salesBillsListByOptions = salesBillsListByOptions;
    this.salesAmount = salesAmount;
    this.medicineSearch = medicineSearch;
    this.createSalesBillPayment = createSalesBillPayment;
    this.paymentsList = paymentsList;
    this.createSalesBillReturn  = createSalesBillReturn;
    this.returnsList = returnsList;
    this.prescriptionsList = prescriptionsList;
    this.savePrescriptionSale = savePrescriptionSale;
    this.createPrescriptionSale = createPrescriptionSale;
    this.salesReturnTotal = salesReturnTotal;
    this.generateInvoiceNum = generateInvoiceNum;

    function create(salesBill) {
        return httpService.post('salesbill/save', salesBill);
    }

    function salesBillsListByOptions(payload) {
        return httpService.get('salesbill/list', payload);
    }

    function salesAmount(payload) {
        return httpService.get('salesbill/total', payload);
    }

    function medicineSearch(payload) {
        return httpService.get('salesbill/medicines/search', payload);
    }

    function createSalesBillPayment(payment) {
        return httpService.post('salesbill/payment/save', payment);
    }

    function paymentsList(billId) {
        return httpService.get('salesbill/payment/search', {
            billId: billId //optional
        });
    }

    function createSalesBillReturn(salesReturns) {
        return httpService.post('salesbill/return/save', salesReturns);
    }

    function returnsList(payload) {
        return httpService.get('salesbill/return/search', payload);
    }


    function prescriptionsList(payload) {
        return httpService.get('salesbill/prescription/search', payload);
    }

    function savePrescriptionSale(payload,prescId,isResale) {
        return httpService.post('salesbill/prescription/save/'+prescId+'?isResale='+(isResale || false), payload);
    }

    function createPrescriptionSale(salesBill) {
        return httpService.post('salesbill/prescription/add', salesBill);
    }
    
    function salesReturnTotal(payload) {
        return httpService.get('salesbill/returns/total', payload);
    }

    function generateInvoiceNum() {
        return httpService.get('salesbill/generateinvoicenum');
    }
}]);

angular.module('tcLib').service('supplierService', ['httpService', function(httpService) {
    this.save = save;
    this.suppliersList = suppliersList;

    function save(supplier) {
        return httpService.post('supplier/saveorupdate', supplier);
    }

    function suppliersList() {
        return httpService.get('supplier/list');
    }
}]);

angular.module('hcLib').run(['$templateCache', function($templateCache) {
$templateCache.put('src/patient-form/patient-form.tpl.html',
    "<style>.borderd{\r" +
    "\n" +
    "       border-bottom: 1px solid gray;\r" +
    "\n" +
    "    }\r" +
    "\n" +
    "    .img-patient{\r" +
    "\n" +
    "        width : 200px;\r" +
    "\n" +
    "    }</style><h2 align=\"center\">Patient Form</h2><div class=\"row\"><div class=\"grid-md-8 card\"><div class=\"patientForm-headline borderd\"><h3>Add New Patient</h3><div class=\"pull-right mar-top-44px\"><tc-camera ng-model=\"patient.photoString\" confirm-text=\"Confirm\"></tc-camera></div></div><form name=\"form.patientForm\" class=\"patientForm margin-10\" novalidate><div class=\"row\"><div class=\"grid-md-1\"></div><div class=\"grid-md-9 no-padding\"><div class=\"row\"><label class=\"grid-md-4\" for=\"patientName\">Patient Name*</label><div class=\"grid-md-8 no-padding\"><input id=\"patientName\" class=\"form-field grid-md-12\" name=\"patientName\" placeholder=\"Patient Name\" ng-model=\"patient.name\" required> <span class=\"error-msg\" ng-messages=\"patientForm.patientName.$error\"><span ng-message=\"required\">*Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"aadhar\">Aadhar No*</label><div class=\"grid-md-8 no-padding\"><input id=\"aadhar\" class=\"form-field grid-md-12\" name=\"aadhar\" placeholder=\"Aadhar No\" ng-blur=\"isAdhaarExists(patient.adharNo)\" ng-model=\"patient.aadharNo\" ng-maxlength=\"12\" maxlength=\"12\" ng-disabled=\"isAdhaarDisabled\"> <span class=\"error-msg\">{{adhaarMsg}}</span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"mobileNo\">Mobile No*</label><div class=\"grid-md-8 no-padding\"><input id=\"mobileNo\" class=\"form-field grid-md-12\" name=\"mobileNo\" placeholder=\"Mobile No\" ng-model=\"patient.mobileNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\" required> <span class=\"error-msg\" ng-messages=\"patientForm.mobileNo.$error\"><span ng-message=\"required\">*Mobile No is Required.</span> <span ng-message=\"pattern\">*Enter 10digits Mobile Number.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"altMobileNo\">Alt No</label><div class=\"grid-md-8 no-padding\"><input id=\"altMobileNo\" class=\"form-field grid-md-12\" name=\"altMobileNo\" placeholder=\"Alt Mobile No\" ng-model=\"patient.alternateNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\"></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"altMobileNo\">Emergency No</label><div class=\"grid-md-8 no-padding\"><input id=\"emergencyNo\" class=\"form-field grid-md-12\" name=\"emergencyNo\" placeholder=\"Emergency No\" ng-model=\"patient.emergencyNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\"></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"village\">Village*</label><div class=\"grid-md-8 no-padding\"><input id=\"village\" class=\"form-field grid-md-12\" name=\"village\" placeholder=\"Village\" ng-model=\"patient.village\" required> <span class=\"error-msg\" ng-messages=\"patientForm.village.$error\"><span ng-message=\"required\">*Village is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"dob\">DOB -- Age*</label><div class=\"grid-md-8 no-padding\"><div class=\"row no-padding\"><div class=\"grid-md-6 no-padding relative\"><tc-date-picker placeholder=\"Choose a date\" ng-model=\"patient.dob\" ng-change=\"getAgeFromDob(patient.dob)\"></tc-date-picker></div><span class=\"grid-md-1 no-padding text-center\">--</span><div class=\"grid-md-5 no-padding\"><input class=\"grid-md-12 form-field\" name=\"age\" ng-change=\"getDateFromAge(patient.age)\" placeholder=\"Age\" ng-model=\"patient.age\"></div></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"gender-rltn\">Gender -- Relation</label><div class=\"grid-md-8 no-padding\"><div class=\"row no-padding\"><div class=\"grid-md-4 no-padding show-inline\"><select class=\"grid-md-12 form-field\" ng-model=\"patient.gender\" ng-options=\"genderType for genderType in genderTypes\"></select></div><label class=\"grid-md-1 text-center show-inline no-padding\" for=\"relationType\">--</label><div class=\"grid-md-3 no-padding show-inline\"><select class=\"grid-md-12 form-field\" ng-model=\"patient.relationType\" ng-options=\"relationType for relationType in relationTypes\"></select></div><div class=\"grid-md-4 no-padding pull-right\"><input id=\"relationName\" class=\"form-field grid-md-12\" name=\"age\" placeholder=\"Relation Name\" ng-model=\"patient.relationName\"></div></div></div></div><div class=\"row\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green\" name=\"patientFormBtn\" ng-disabled=\"form.patientForm.$invalid || adhaarMsg\" ng-click=\"addPatient();\">{{patient.id? 'Update': 'Save'}}</button></div></div><div class=\"grid-md-1\"></div></div></form></div><div class=\"grid-md-4\"><div ng-if=\"!patient.id\"><img class=\"grid-md-12\" ng-src=\"{{patient.photoString}}\" alt=\"Click capture to see preview\"></div><div ng-if=\"patient.id && !patient.photoString\"><img src=\"./patient/getphoto?patientId={{ patient.id }}\" class=\"img-patient\" style=\"border:2px solid gray\"></div><div ng-if=\"patient.id && patient.photoString\"><img ng-src=\"{{patient.photoString}}\" class=\"img-patient\" style=\"border:2px solid gray\"></div></div></div>"
  );
}]);
