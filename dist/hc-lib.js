angular.module('hcLib', ['camera', 'ngDialog', 'ui.bootstrap']);
angular.module("hcLib").directive("autoSuggest", function() {
	return {
		restrict : 'E',
		template : "<div class='auto-suggest-container'>"
				+ "<input ng-attr-type='{{options.fieldType}}' placeholder='{{options.placeHolder}}' autocomplete='off' name='{{options.fieldName}}' id='{{options.fieldID}}' ng-required='{{options.isRequired}}' class='form-field' ng-class='options.inputClass' ng-model='suggestModel' ng-keydown='inputKeyDown($event)' ng-blur='closeList()' ng-change='changeSuggestInput(suggestModel)'>"
				// + "<span class='error-msg ng-active' ng-show='!suggestModel'><span>{{options.placeHolder}} is Required</span></span>"
				+ "<button ng-if='clearable' class='auto-suggest-clear' ng-click='clearInput(true)'><i class='fa fa-times'></i></button>"
				+ "<ul class='auto-suggest-list' ng-show='suggestList.length'>"
				+ "<li tabindex='-1' ng-repeat='suggestion in suggestList track by $index' bind-html-compile='suggestionTemplate' ng-click='selectItem(suggestion)'></li>"
				+ "</ul>" + "</div>",
		scope : {
			options			: "=",
			template		: "=",
			resultAs		: "=",
			clearable		: "=",
			outputModel		: "=",
			suggestions		: "=",
			
			searchKey 		: "@",
			displayKey		: "@",
			
			onSelect		: "&",
		},
		controller : ['$scope', '$filter', '$timeout', function($scope, $filter, $timeout) {

			$scope.clearable = ($scope.clearable !== undefined) ? $scope.clearable : true;
			//Assigning Functionalities
			$scope.init = init;
			$scope.changeSuggestInput = changeSuggestInput;
			$scope.closeList = closeList;
			$scope.selectItem = selectItem;
			$scope.inputFocusLost = inputFocusLost;
			$scope.inputKeyDown = keyboardHandler;
			$scope.clearInput = clearInput;
			
			$scope.$watch("suggestions", function(newVals, oldVals) {
				if(newVals && newVals.length) {
					if(!$scope.initialized) {
						init();
					}
				}
			});
			
			function clearInput(focusable) {
				$scope.suggestModel = "";
				$scope.outputModel = undefined;
				if(focusable) {
					$($scope.ele).find('input.form-field').focus();
				}
			}
			
			$scope.$watch("outputModel", function(newVal, oldVal) {
				if(newVal) {
					setSuggestInput(newVal);
				} else {
					clearInput();
				}
			});

			function init(suggestions) {
				$scope.initialized = true;
				
				if ($scope.template) {
					$scope.suggestionTemplate = $scope.template;
				} else if (typeof $scope.suggestions[0] === 'object') {
					if ($scope.displayKey) {
						$scope.suggestionTemplate = "<span>{{suggestion." + $scope.displayKey + "}}</span>";
					} else {
						$scope.suggestionTemplate = "<span>{{suggestion.name}}</span>";
					}
				} else {
					$scope.suggestionTemplate = "<span>{{suggestion}}</span>";
				}
			}
			
			function changeSuggestInput(suggestModel) {
				if (suggestModel) {
					var filter = suggestModel;
					if($scope.searchKey) {
						if($scope.searchKey.indexOf(".") === -1) {
							filter = JSON.parse("{\"" + $scope.searchKey + "\":\"" + suggestModel + "\"}");
						} else {
							searchKey = getObjectStringFromDottedKeyAndValue($scope.searchkey, suggestModel);
							filter = JSON.parse(searchKey);
						}
					}
					$scope.suggestList = $filter("filter")($scope.suggestions, filter).slice(0,50);
				}
			}

			function closeList(flag) {
				if (flag) {
					$scope.suggestList = [];
				} else {
					$timeout(function() {
						if (!$($scope.ele).find('input.form-field').is(":focus")) {
							$scope.suggestList = [];
						}
					}, 1000);
				}
			}

			function selectItem(item) {
				$scope.outputModel = item;
				$scope.closeList(true);
				setSuggestInput(item);
				if (typeof $scope.onSelect === 'function') {
					$scope.onSelect({selected:item});
				}
			}
			
			function setSuggestInput(item) {
				if ($scope.displayKey) {
					if($scope.displayKey.indexOf(".") === -1) {
						$scope.suggestModel = item[$scope.displayKey];
					} else {
						//$scope.suggestModel = item.medicine.medicineName; //Need to be reomved;
					}
				} else if ($scope.resultAs) {
					$scope.suggestModel = item[$scope.resultAs];
				} else {
					$scope.suggestModel = item;
				}
			}

			function inputFocusLost() {
				$scope.closeList();
			}

			function keyboardHandler(evt) {
				if (evt.keyCode === 40) {// KeyDown
					$scope.changeSuggestInput($scope.suggestModel);
					if ($($scope.ele).find(".auto-suggest-list li").hasClass('focused')) {
						$($scope.ele).find(".auto-suggest-list li.focused").removeClass('focused').next().addClass('focused').focus();
					} else {
						$($scope.ele).find(".auto-suggest-list li:first-child").addClass('focused').focus();
					}
					$(evt.currentTarget).focus();
					evt.preventDefault();
				} else if (evt.keyCode == 38) {// Key Up
					$scope.changeSuggestInput($scope.suggestModel);
					if ($($scope.ele).find(".auto-suggest-list li").hasClass('focused')) {
						$($scope.ele).find(".auto-suggest-list li.focused").removeClass('focused').prev().addClass('focused').focus();
					} else {
						$($scope.ele).find(".auto-suggest-list li:last-child").addClass('focused').focus();
					}
					$(evt.currentTarget).focus();
					evt.preventDefault();
				} else if (evt.keyCode === 27) {
					$scope.closeList();
				} else if (evt.keyCode === 13) {
					$scope.outputModel = undefined;
					var selectedIndex = ($($scope.ele).find(".auto-suggest-list li").index($($scope.ele).find(".auto-suggest-list li.focused")));
					if (selectedIndex !== -1) {
						$scope.selectItem($scope.suggestList[selectedIndex]);
					}
					evt.preventDefault();
				}
			}

			function getObjectStringFromDottedKeyAndValue(key, value) {
				var objectString ="";
				var closeBrackets = "";
				var keys = $scope.searchKey.split(".");
				for(var i=0; i<keys.length; i++) {
					objectString += "{\""+ keys[i] + "\":";
					closeBrackets += "}";
				}
				return objectString + "\"" + value + "\"" + closeBrackets;
			}
		}],
		link : function(scope, ele, attr) {
			scope.ele = $(ele);
		}
	};
});
angular.module('hcLib').directive("casesheet",function(){
    return {
        templateUrl:'src/casesheet/casesheet.tpl.html',
        scope:{
            opPatientData:'@',
            currentCaseSheet:'&',
            onSave:'&',
        },
        controller:['$scope', '$http', 'casesheet', function($scope,$http,casesheet) {
            $scope.caseSheetEditable = false;
            $scope.caseSheet = {};
            $scope.opPatientObj = JSON.parse($scope.opPatientData);
            $scope.caseSheet.patientOpId={};
            
            $scope.getOpPatietOldCaseSheet=function(){
                casesheet.caseSheetList($scope.opPatientObj.id).then(function(res){
                    if(res.id) {
                        $scope.caseSheet = {};
                        $scope.caseSheetEditable = true;
                    } else {
                        $scope.caseSheet = res[0] || {};
                        $scope.currentCaseSheet({"patientCurrentCaseSheet":$scope.caseSheet});
    //								$scope.onSave();
                        $scope.caseSheetEditable = false;
                    }
                });
            };

            $scope.editCaseSheet = function(){
                $scope.caseSheetEditable = true;
            };

            $scope.saveCaseSheet=function() {
                $scope.caseSheet.patientOpId = $scope.opPatientObj;
                casesheet.save($scope.caseSheet).then(function(res){
                    if (res.id) {
                        if(typeof $scope.onSave === 'function') {
                            $scope.onSave();
                        }
                        $scope.caseSheet = res;
                        $scope.currentCaseSheet({"patientCurrentCaseSheet": $scope.caseSheet});
                        $scope.caseSheetEditable = false;
                    }
                });
            };

            $scope.updateCaseSheet=function(caseSheet){
                casesheet.save($scope.caseSheet).then(function(res){
                    if (res.id) {
                        $scope.caseSheet = res;
                        $scope.currentCaseSheet({"patientCurrentCaseSheet" : $scope.caseSheet});
                        $scope.caseSheetEditable = false;
                    }
                });
            };
            $scope.getOpPatietOldCaseSheet();
        }]
    };
});
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
angular.module('hcLib').directive("complaint",function(){
    return {
            templateUrl:'src/complaint/complaint.tpl.html',
            scope:{
                patientOpId:'=',
                onModify:'=',
                onSelect:'&',
                onCheck:'&',
            },
            controller:['$scope', '$http', 'complaintService', function($scope, $http, complaintService){
                $scope.form={};
                $scope.complaint={};
                $scope.patientComplaints = [];
                $scope.getComplaintsListByPatientId = function(patientId) {
                    complaintService.complaintMastersList(patientId).then(function(res) {
                        $scope.patientComplaints = res;
                    });
                };
                
                $scope.getComplaintsListByPatientId($scope.patientOpId);	
                
                $scope.setComplaint = function(com, type) {
                    com.patient={id:$scope.patientOpId};
                    if (type === 'new') {
                        complaintService.saveComplaint(com).then(function(res){
                            if(res){
                                $scope.patientComplaints.push(res);
                            }
                        });
                        $scope.complaint = {};
                        $scope.form.complaintForm.$setPristine();
                    }
                    if ($scope.showAddPopup) {
                        $scope.toggleAddPopup();
                    }
                };
                
                $scope.selectComplaint = function(complaintSelected){
                    $scope.onSelect({selectedComplaint : complaintSelected});
                    $scope.onCheck({state:true});
                };
                
                
                $scope.toggleAddPopup = function() {
                    $scope.showAddPopup = !$scope.showAddPopup;
                };
                
            }]
        };
});
angular.module("hcLib").directive("drugFormulaForm",function(){
	return{
		templateUrl:"src/drug-formula-form/drug-formula-form.tpl.html",
		controller:['$scope', 'drugFormulae', function($scope,drugFormulae){
			$scope.saveDrugFormulae=function(drugFormulae){
				drugFormulae.save(drugFormulae).then(function(res) {
					$scope.drugFormulae = {};
					if($scope.drugFormulaForm) {
						$scope.drugFormulaForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({drugFormulae: res.response});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		}],
		scope:{
			options: "=",
			onCreate: "&",
			drugFormulae:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});
angular.module("hcLib").directive("locationForm",function(){
	return{
		templateUrl:"src/location-form/location-form.tpl.html",
		controller:['$scope', 'locationService', function($scope,locationService){
			$scope.saveMedicineLocation=function(location){
				locationService.save(location).then(function(res) {
					$scope.location = {};
					if($scope.locationForm) {
						$scope.locationForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({location: res.response});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		}],
		scope:{
			options: "=",
			onCreate: "&",
			location:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});
angular.module("hcLib").directive("medicineCategoryForm",function(){
	return{
		templateUrl:"src/medicine-category-form/medicine-category-form.tpl.html",
		controller:['$scope', 'medicineCategoryService', function($scope,medicineCategoryService){
			$scope.saveMedicineCategory=function(medicineCategory){
				medicineCategoryService.save(medicineCategory).then(function(res) {
					$scope.medicineCategory = {};
					if($scope.medicineCategoryForm) {
						$scope.medicineCategoryForm.$setPristine();
					}
					
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({medicineCategory: res.response});
					}
					if(typeof $scope.onSubmitCloseForm=='function'){
						$scope.onSubmitCloseForm();
					}
				});
			};
		}],
		scope:{
			options: "=",
			onCreate: "&",
			medicineCategory:"=?",
			onSubmitCloseForm:"&"
		}
	};
	
});
angular.module("hcLib").directive("medicineDoctorCategoryForm", function() {
	return {
		templateUrl : "src/medicine-doctor-category-form/medicine-doctor-category-form.tpl.html",
		controller : ['$scope', 'medicineCategoryByDoctorService', function($scope,medicineCategoryByDoctorService) {
			$scope.saveMedicineCategoryByDoctor = function(medicineCategoryByDoctor) {
				medicineCategoryByDoctorService.save(medicineCategoryByDoctor).then(function(res) {
					$scope.medicineCategoryByDoctor = {};
					if($scope.medicineCategoryDoctorForm) {
						$scope.medicineCategoryDoctorForm.$setPristine();
					}
					if (typeof $scope.onCreate === 'function') {
						$scope.onCreate({categoryByDoctor: res.response});
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
			medicineCategoryByDoctor:"=?",
			onSubmitCloseForm:"&"
		}
	};
});
angular.module("hcLib").directive("medicineForm",function(){
	return{
		templateUrl:"src/medicine-form/medicine-form.tpl.html",
		controller:['$scope', 'medicineService', 'companyService', 'drugFormulae', 'medicineCategoryService', 'medicineCategoryByDoctorService', 'locationService', '$timeout', '$log', function($scope,medicineService,companyService,drugFormulae,medicineCategoryService,medicineCategoryByDoctorService,locationService,$timeout,$log){
			$scope.init=function(){
				$scope.getCompaniesList();
				$scope.getDrugFormulaList();
				$scope.getMedicineCategoryList();
				$scope.getMedicineCategoryByDoctorList();
				$scope.getMedicineLocationList();
			};
			$scope.getCompaniesList=function(){
				companyService.companiesList().then(function(res){
					if(res.isSuccess) {
						$scope.companies=res.response;
					}
				});
			};
			$scope.getDrugFormulaList=function(){
				drugFormulae.drugFormulaeList().then(function(res){
					if(res.isSuccess) {
						$scope.drugFormulae=res.response;
					}
				});
			};
			$scope.getMedicineCategoryList=function(){
				medicineCategoryService.medicineCategoryList().then(function(res){
					if(res.isSuccess) {
						$scope.medicineCategories=res.response;
					}
				});
			};
			$scope.getMedicineCategoryByDoctorList=function(){
				medicineCategoryByDoctorService.medicineCategoryByDoctorList().then(function(res){
					if(res.isSuccess) {
						$scope.medicineCategoryByDoctor=res.response;
					}
				});
			};
			$scope.getMedicineLocationList=function(){
				locationService.locationsList().then(function(res){
					if(res.isSuccess) {
						$scope.medicineLocations=res.response;
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
						$scope.onCreate({medicine: res.response});
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
		}],
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
angular.module("hcLib").directive("opPatientForm", function() {
	
    controller.$inject = ['$scope','$timeout','opPatientService', 'opService', '$state','$parse', 'commonService'];
    function controller($scope,$timeout,opPatientService, opService, $state,$parse, commonService){
	
        $scope.onSelectPatient = onSelectPatient;
        $scope.onPatientAdd = onPatientAdd;
        $scope.addOpPatient = addOpPatient;
        $scope.getOpType = getOpType;
        $scope.functionToEnableButton = functionToEnableButton;
        $scope.opTypes = [];
        $scope.opConfig = {};

        function init(){
            opService.get($scope.opId).then(function(op) {
                $scope.op = op;
                $scope.defOpPatient = {patient:{}, op: {id: op.id}};
                getOpType();
                getOpSubTypeList();
            });
            $scope.opConfig = angular.copy(OP_COST_CONFIG);
        }
        init();
        
        function getOpType(){
            commonService.getOpTypes().then(function(res){
                $scope.opTypes = res;
                $scope.defOpPatient.opType = $scope.opTypes[0];
                $scope.opPatient = angular.copy($scope.defOpPatient);
                $scope.setOPCost();
            });
        }

        function getOpSubTypeList(){
            commonService.getOpSubTypes().then(function(res){
                $scope.opSubTypes = res;
                $scope.defOpPatient.opSubType = $scope.opSubTypes[0];
                $scope.opPatient = angular.copy($scope.defOpPatient);
                $scope.setOPCost();
            });
        }
        
        
        function addOpPatient(opPatient){
            if ($scope.opPatient.cardNo === 'New Card') {
                var opType = $parse('opPatient.opType.id')($scope);
                var opSubType = $parse('opPatient.opSubType.id')($scope);
                var config = $parse('opConfig.costs[' + opType + '][' + opSubType + ']')($scope);
                if (config) {
                    var patientId = $parse('opPatient.patient.id')($scope);
                    if (patientId && !$scope.opConfig.free.includes(opSubType)) {
                        var req = {
                            patient: {id: patientId},
                            opTypeId: opType,
                            opSubTypeId: opSubType,
                            validity: config.validity
                        };
                        opPatientService.createPatientCard(req).then(function(res) {
                            $scope.opPatient.cardNo = res.id;
                            saveOrUpdateOPPatient();
                        });
                    } else {
                        saveOrUpdateOPPatient();
                    }
                } else {
                    saveOrUpdateOPPatient();
                }
            } else {
                saveOrUpdateOPPatient();
            }
            //TO SAVE OP-SUB-TYPE
            var req = {
                    patient: {id: opPatient.patient.id},
                    opTypeId: opPatient.opType.id,
                    opSubTypeId: opPatient.opSubType.id,
                };
                opPatientService.createPatientCard(req).then(function(res) {
    //				$scope.opPatient.cardNo = res.id;
                    saveOrUpdateOPPatient();
                });
        }
        
        function saveOrUpdateOPPatient() {
            opPatientService.save($scope.opPatient).then(function(response){
                $state.go('opPatientList',{opId: $scope.op.id});
            });		
        }
        function onSelectPatient(patient){
            document.querySelector("[ng-model = 'suggestModel']").value = patient.name;
            if($scope.opPatient) {
                $scope.opPatient.patient = angular.copy(patient);
            }
            $scope.checkPatientStatus(patient);
        }
        function onPatientAdd(patient){
            document.querySelector("[ng-model = 'suggestModel']").value = patient.name;
            if($scope.opPatient) {
                $scope.opPatient.patient = angular.copy(patient);
            }
            $scope.checkPatientStatus(patient);
        }
        $scope.checkPatientStatus=function(selectedPatient){
            var patientRes = undefined;
            $scope.opPatientIsExist='';
            if($scope.opPatient.patient) {
                $scope.opPatient.patient.patientName="";
            }
            opPatientService.getOpPatientsListByOptions({op:{id:$scope.opId}}).then(function(res) {
                $scope.opPatientList = res;
                for(var i=0;i<res.length;i++) {
                    if($scope.opPatientList[i].patient.id == selectedPatient.id){
                        patientRes = $scope.opPatientList[i];
                        $scope.opPatientIsExist = $scope.opPatientList[i].patient.name + ' Already added to OP.';
                        break;
                    }
                }
                
                if (!$scope.opPatientIsExist) {
                    $scope.setOPCost();
                }
            });
            if(patientRes==undefined){
                $scope.opPatientIsExist='';
                $scope.patient = selectedPatient;
                $scope.opPatient.patient = $scope.patient;
            }
        };
        
        $scope.setOPCost = function() {
            var opType = $parse('opPatient.opType.id')($scope);
            var opSubType = $parse('opPatient.opSubType.id')($scope);
            var config = $parse('opConfig.costs[' + opType + '][' + opSubType + ']')($scope);
            if (config) {
                $scope.opPatient.consultFee = config.cost;
                var patientId = $parse('opPatient.patient.id')($scope);
                if (patientId && !$scope.opConfig.free.includes(opSubType)) {
                    var req = {
                        patient: {id: patientId},
                        opTypeId: opType,
                        opSubTypeId: opSubType,
                        validity: config.validity
                    };
                    opPatientService.getOrCreatePatientCard(req).then(function(res) {
                        if (res) {
                            $scope.opPatient.cardNo = res.id;
                            var cardOPCost = $parse('opConfig.costs[' + res.opTypeId + '][' + res.opSubTypeId + '].cost')($scope);
                            $scope.opPatient.consultFee = config.cost - cardOPCost > 0? config.cost - cardOPCost: 0;
                        } else {
                            $scope.opPatient.cardNo = "New Card";
                        }
                    });
                }
            }
        };
        function functionToEnableButton() {
            return $timeout(angular.noop, 5000);
        };
    }
    return {
		restrict : 'E',
		scope : {
            op: '=',
            opId: '='
		},
		controller : controller,
		templateUrl : "src/op-patient-form/op-patient-form.tpl.html"
    };
});

angular.module("hcLib").directive("patientForm", function() {
	
	controller.$inject = ['$scope', 'patientService', 'ngDialog'];
	function controller($scope, patientService,  ngDialog) {
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
		}

		function addPatient() {
			patientService.save($scope.patient).then(function(res) {
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
	return {
		restrict : 'E',
		scope : {
			patient: '=?',
			onSubmit : '&'
		},
		controller : controller,
		templateUrl : "src/patient-form/patient-form.tpl.html"
	};
});
angular.module("hcLib").directive('dosageInput', function() {
	var dosageSelectionMap = {
		cap: [{key: '1', val: '1'}, {key: '2', val: '2'}],
		tabInj: [{key: '1', val: '1'}, {key: '1/2', val: '1/2'}, {key:'2', val: '2'}],
		drops: [{key: '1', val: '1'}, {key: '2', val: '2'}, {key: '3', val: '3'}, {key: '4', val: '4'}, {key: '5', val: '5'}],
		liquid: [{key: '0.5ml', val: '0.5ml'}, {key: '1.0ml', val: '1.0ml'},{key: '2.5ml', val: '2.5ml'}, {key: '5ml', val: '5ml'}, {key: '10ml', val: '10ml'},{key: '15ml', val: '15ml'}, {key: '20ml', val: '20ml'},{key: '30ml', val: '30ml'},{key: '40ml', val: '40ml'},{key: '50ml', val: '50ml'}],
		powder: [{key: '1pn', val: '1pinch'}, {key: '0.5pn', val: '0.5pinch'}, {key: '1.5pn', val: '1.5pinch'}, {key: '2pn', val: '2pinch'}, {key: '0.5 T-Sp', val: '0.5 TS'}, {key: '1 T-Sp', val: '1 TS'}, {key: '1.5 T-Sp', val: '1.5 TS'}, {key: '2 T-Sp', val: '2 TS'}]
	};

	return {
		restrict: 'E',
		scope: {
			dosageRemarks: '=',
			isDosageSelected: '=',
			dosage: '=',
			medicineCategory:'='
		},
		templateUrl : "src/prescription-generator/dosageInput.tpl.html",
		controller : ['$scope', '$window', function($scope, $window) {
			$scope.showSelection = {showList: false};
			$scope.dosageListByCategory = function (cat) {
				switch(cat) {
					case 'Cap.': return dosageSelectionMap.cap;
					case 'Tab.':
					case 'Inj.': return dosageSelectionMap.tabInj;
					case 'Drops.': return dosageSelectionMap.drops;
					case 'Syr.' : return dosageSelectionMap.liquid;
					case 'Lotion': return dosageSelectionMap.drops;
					case 'SOLUTION' : return dosageSelectionMap.liquid;
					case 'SUSPENSION': return dosageSelectionMap.liquid;
					case 'POWDER': return dosageSelectionMap.powder;
				}
			};
			
			$scope.$on('$windowClick', function() {
				$scope.showSelection = null; 
			});
			
			$scope.onSelect = function(selected) {
				$scope.dosage = selected;
				$scope.showSelection = null;
				$scope.isDosageSelected = true;
			};
			
			$scope.toggleSelection = function(e) {
				e.stopPropagation();
				$scope.isDosageSelected = !$scope.isDosageSelected;
				$scope.dosageRemarks=document.getElementById('initDosageRemarks').innerHTML;
				if(!$scope.isDosageSelected) {
					$scope.dosage = null;
					$scope.dosageRemarks=null;
					$scope.showSelection = null;
				} else {
					$scope.dosage = $scope.dosageListByCategory($scope.medicineCategory)[0].val;
					$scope.showSelection = null;
				}
			};
			
			$scope.toggleSelectionDisplay = function (e) {
				e.stopPropagation();
				if($scope.showSelection == null) {
					$scope.showSelection = {showList: true};
				} else {
					$scope.showSelection = null;
				}
			};
		}]
	};
});
angular.module("hcLib").directive('prescriptionGenerator', ['$rootScope', function($rootScope) {
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
		controller: ['$scope', '$http', '$rootScope', 'opPrescriptionService', 'medicineCategoryService', 'medicineCategoryByDoctorService', function($scope, $http, $rootScope,opPrescriptionService,medicineCategoryService,medicineCategoryByDoctorService) {
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
					$scope.purchaseMedicineSearchResults = $scope.purchaseMedicineSearchResults.concat(res.response);
				});
			};
			$scope.getAvailableQuantity = function(product) {
				return ( (product.medicineQuantity*1 + product.medicineFreeUnits*1) * (product.medicineNoOfUnits*1) ) - (product.medicineSold*1) + (product.medicineReturned*1) - (product.purchaseBillPurchaseReturned*1);
			};
			$scope.getRecentPrescriptionsByComplaint = function(){
				opPrescriptionService.opPrescriptionList({compliant:$scope.prescription.complaint}).then(function(res){
					for(var i=0;i<res.length;i++){
						if($scope.getAvailableQuantity(res.response[i])!=0){
							$scope.prescription.prescriptionMedicines.push(res.response[i]);
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
		}]
	};
}]);
angular.module('hcLib').service('casesheet', ['httpService', function(httpService) {
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

angular.module('hcLib').service('commonService', ['httpService', function(httpService) {

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

angular.module('hcLib').service('companyService', ['httpService', function(httpService) {
    this.save = save;
    this.companiesList = companiesList;

    function save(company) {
        return httpService.post('company/saveorupdate', company);
    }

    function companiesList() {
        return httpService.get('company/list');
    }
}]);

angular.module('hcLib').service('complaintService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('drugFormulae', ['httpService', function(httpService) {
    this.save = save;
    this.drugFormulaeList = drugFormulaeList;

    function save(drugFormulae) {
        return httpService.post('drugFormulae/saveorupdate', drugFormulae);
    }

    function drugFormulaeList() {
        return httpService.get('drugFormulae/list');
    }
}]);

angular.module('hcLib').provider('httpService', function() {
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

angular.module('hcLib').service('labPatientService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('locationService', ['httpService', function(httpService) {
    this.save = save;
    this.locationsList = locationsList;

    function save(location) {
        return httpService.post('location/saveorupdate', location);
    }

    function locationsList() {
        return httpService.get('location/list');
    }
}]);

angular.module('hcLib').service('loginService', ['httpService', function(httpService) {
    this.login = login;
    this.sessionUser = sessionUser;

    function login(payload) {
        return httpService.post('auth/login', payload);
    }

    function sessionUser() {
        return httpService.get('auth/sessionuser');
    }
}]);

angular.module('hcLib').service('medicineCategoryService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryList = medicineCategoryList;

    function save(medicineCategory) {
        return httpService.post('medicinecategory/saveorupdate', medicineCategory);
    }

    function medicineCategoryList() {
        return httpService.get('medicinecategory/list');
    }
}]);

angular.module('hcLib').service('medicineCategoryByDoctorService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryByDoctorList = medicineCategoryByDoctorList;

    function save(medicineCategoryByDoctor) {
        return httpService.post('medicinecategorybydoctor/saveorupdate', medicineCategoryByDoctor);
    }

    function medicineCategoryByDoctorList() {
        return httpService.get('medicinecategorybydoctor/list');
    }
}]);

angular.module('hcLib').service('medicineService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('opPatientService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('opPrescriptionService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('opService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('patientService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('purchasebillMedicineService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('purchasebillService', ['httpService', function(httpService) {
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



angular.module('hcLib').service('reportsService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('representativeService', ['httpService', function(httpService) {
    this.save = save;
    this.representativesList = representativesList;

    function save(representative) {
        return httpService.post('representative/saveorupdate', representative);
    }

   
    function representativesList() {
        return httpService.get('representative/list');
    }
}]);

angular.module('hcLib').service('salesbillService', ['httpService', function(httpService) {
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

angular.module('hcLib').service('supplierService', ['httpService', function(httpService) {
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
$templateCache.put('src/casesheet/casesheet.tpl.html',
    "<style>.margin-bottom{\r" +
    "\n" +
    "		margin-bottom:0px !important;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.casesheet-min-height{\r" +
    "\n" +
    "		    min-height: 86.5vh;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.bordered-bottom{\r" +
    "\n" +
    "		border-bottom:2px solid lightgrey;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.grade-linear{\r" +
    "\n" +
    "	    background-image: repeating-linear-gradient(-45deg, transparent, transparent 1px, #ddd 4px);\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.wrap-word{ \r" +
    "\n" +
    "	 word-wrap: break-word;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	\r" +
    "\n" +
    "	.color-bg-fields{\r" +
    "\n" +
    "		 background-color: rgba(172, 219, 241, 0.19);\r" +
    "\n" +
    "	}</style><div><div class=\"row no-padding card card-full-height-84 vertical-scroll\" ng-if=\"!caseSheetEditable\"><div class=\"row bordered-bottom\"><div class=\"grid-md-8 font-18\"><strong>CaseSheet</strong></div><div class=\"grid-md-4\"><button type=\"button\" class=\"btn btn-md btn-normal btn-info pull-right\" ng-click=\"editCaseSheet()\">Edit</button></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>Chief Complaint:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.chiefComplaint}}</div></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>Present Illness:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.presentIllNess}}</div></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>Past Illness:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.pastIllNess}}</div></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>Family History:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.familyHistory}}</div></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>General Examination:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.genExamination}}</div></div></div><div class=\"row\"><div class=\"row\"><div class=\"grid-md-12 font-14\"><strong>Pro Diagnosis:</strong></div><div class=\"grid-md-1\"></div><div class=\"grid-md-10 wrap-word color-bg-fields\">{{caseSheet.proDiagnosis}}</div></div></div></div><div class=\"row card no-padding card-full-height-86 vertical-scroll\" ng-if=\"caseSheetEditable\"><div class=\"grid-md-2\"></div><div class=\"grid-md-8\"><div class=\"font-18 bordered-bottom mar-bottom-2\"><strong>CaseSheet</strong></div><form name=\"caseSheetForm\"><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>Chief Complaint:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.chiefComplaint\"></textarea></div></div><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>Present Illness:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.presentIllNess\"></textarea></div></div><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>Past Illness:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.pastIllNess\"></textarea></div></div><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>Family History:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.familyHistory\"></textarea></div></div><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>General Examination:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.genExamination\"></textarea></div></div><div class=\"row no-padding\"><label class=\"grid-md-12 font-14\"><strong>Pro Diagnosis:</strong></label><div class=\"grid-md-12\"><textarea rows=\"4\" cols=\"200\" class=\"form-field grid-md-12 no-padding margin-bottom font-15\" ng-model=\"caseSheet.proDiagnosis\"></textarea></div></div></form><div class=\"row no-padding\"><div class=\"grid-md-12\"><button type=\"submit\" ng-if=\"caseSheet.id\" class=\"btn btn-green bnt-md pull-right margin-bottom\" ng-click=\"updateCaseSheet(caseSheet)\">Update</button> <button type=\"submit\" ng-if=\"!caseSheet.id\" class=\"btn btn-purple bnt-lg pull-right margin-bottom\" ng-click=\"saveCaseSheet(caseSheet)\">Add Case Sheet</button></div></div></div></div></div>"
  );


  $templateCache.put('src/company-form/company-form.tpl.html',
    "<form name=\"companyForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"companyCode\">Company Code</label><div class=\"grid-md-8 no-padding\"><input id=\"companyCode\" class=\"form-field grid-md-12\" name=\"companyCode\" placeholder=\"Company Code\" ng-model=\"company.code\" required> <span class=\"error-msg\" ng-messages=\"companyForm.companyCode.$error\"><span ng-message=\"required\">Code is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"companyName\">Company Name</label><div class=\"grid-md-8 no-padding\"><input id=\"companyName\" class=\"form-field grid-md-12\" name=\"companyName\" placeholder=\"Company Name\" ng-model=\"company.name\" required> <span class=\"error-msg\" ng-messages=\"companyForm.companyName.$error\"><span ng-message=\"required\">Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"companyShortName\">Company Short Name</label><div class=\"grid-md-8 no-padding\"><input id=\"companyShortName\" class=\"form-field grid-md-12\" name=\"companyShortName\" placeholder=\"Company Short Name\" ng-model=\"company.shortName\" required> <span class=\"error-msg\" ng-messages=\"companyForm.companyShortName.$error\"><span ng-message=\"required\">Short Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"companyCity\">Company City</label><div class=\"grid-md-8 no-padding\"><input id=\"companyCity\" class=\"form-field grid-md-12\" name=\"companyCity\" placeholder=\"Company City\" ng-model=\"company.city\" required> <span class=\"error-msg\" ng-messages=\"companyForm.companyCity.$error\"><span ng-message=\"required\">City is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"companyPhoneNo\">Company Phone No</label><div class=\"grid-md-8 no-padding\"><input id=\"companyPhoneNo\" class=\"form-field grid-md-12\" name=\"companyPhoneno\" placeholder=\"Company Phone No\" ng-model=\"company.phoneNo\" ng-pattern=\"/^[0-9]{10,10}$/\" ng-maxlength=\"10\" maxlength=\"10\" required> <span class=\"error-msg\" ng-messages=\"companyForm.companyPhoneno.$error\"><span ng-message=\"required\">Phoneno is Required.</span> <span ng-message=\"pattern\">Phoneno is Number.</span></span></div></div><div class=\"row\" ng-if=\"!company.id\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" ng-disabled=\"companyForm.$invalid\" name=\"companyFormBtn\" ng-click=\"saveCompany(company)\">Submit</button></div></form>"
  );


  $templateCache.put('src/complaint/complaint.tpl.html',
    "<style>.not-found-alert{\r" +
    "\n" +
    "	    padding-left: 10px !important;\r" +
    "\n" +
    "	    padding-top: 5px !important;\r" +
    "\n" +
    "	    color: red;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.text-bold{\r" +
    "\n" +
    "		font-weight:bold;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.overlay-height{\r" +
    "\n" +
    "		height:820px;\r" +
    "\n" +
    "	}\r" +
    "\n" +
    "	.text-left{\r" +
    "\n" +
    "		text-align:cetner;\r" +
    "\n" +
    "	}</style><div class=\"row card card-full-height-86\"><div class=\"grid-md-12 pull-right\"><div class=\"tc-panel grid-md-12 no-padding relative\"><div class=\"tc-panel-heading\">Complaint <button class=\"btn btn-sm btn-sky-blue pull-right\" ng-click=\"toggleAddPopup()\">Add Complaint</button></div><div class=\"overlay card-full-height-86 absolute\" ng-class=\"{'show':showAddPopup}\" ng-click=\"toggleAddPopup()\"></div><div class=\"popup absolute grid-md-11 no-min-height padding-15\" ng-class=\"{'show':showAddPopup}\"><form name=\"form.complaintForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"shortName\">Short Name</label><div class=\"grid-md-8 no-padding\"><input id=\"shortName\" class=\"form-field grid-md-12\" name=\"shortName\" placeholder=\"Short Name\" ng-model=\"complaint.comShortName\" required> <span class=\"error-msg\" ng-messages=\"complaintForm.shortName.$error\"><span ng-message=\"required\" class=\"ng-scope\">Short Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"description\">Description</label><div class=\"grid-md-8 no-padding\"><input id=\"description\" class=\"form-field grid-md-12\" name=\"description\" placeholder=\"Description\" ng-model=\"complaint.comDesc\" required> <span class=\"error-msg\" ng-messages=\"complaintForm.description.$error\"><span ng-message=\"required\" class=\"ng-scope\">Description is Required.</span></span></div></div></form><div class=\"row\"><label class=\"grid-md-4\"></label><button class=\"btn btn-sm btn-light-green\" name=\"complaintFormBtn\" ng-disabled=\"form.complaintForm.$invalid\" ng-click=\"setComplaint(complaint,'new')\">Submit</button></div></div></div><table class=\"table\"><tr><th>S.No</th><th>Complaint</th><th>Description</th><th>Date</th><th>Actions</th></tr><tr ng-repeat=\"complaint in patientComplaints\" ng-if=\"patientComplaints.length\"><td>{{$index+1}}</td><td>{{complaint.comShortName}}</td><td>{{complaint.comDesc}}</td><td>{{complaint.createdOn |date:'dd-MM-yyyy'}}</td><td><button class=\"btn btn-sm btn-rounded btn-light-green font-11\" title=\"Select Complaint\" ng-click=\"selectComplaint(complaint)\"><i class=\"fa fa-check\"></i></button></td></tr><tr ng-if=\"!patientComplaints.length\"><td colspan=\"5\" class=\"not-found-alert text-bold\">No Complaints Found.</td></tr></table></div></div>"
  );


  $templateCache.put('src/drug-formula-form/drug-formula-form.tpl.html',
    "<form name=\"drugFormulaForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"drugCode\">Drug Code</label><div class=\"grid-md-8 no-padding\"><input id=\"drugCode\" class=\"form-field grid-md-12\" name=\"drugCode\" placeholder=\"Drug Code\" ng-model=\"drugFormulae.code\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.drugCode.$error\"><span ng-message=\"required\">Code is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"hsnCode\">HSN Code</label><div class=\"grid-md-8 no-padding\"><input id=\"hsnCode\" class=\"form-field grid-md-12\" name=\"hsnCode\" placeholder=\"HSN Code\" ng-model=\"drugFormulae.hsnCode\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.hsnCode.$error\"><span ng-message=\"required\">HSN Code is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"drugName\">Drug Name</label><div class=\"grid-md-8 no-padding\"><input id=\"drugName\" class=\"form-field grid-md-12\" name=\"drugName\" placeholder=\"Drug Name\" ng-model=\"drugFormulae.name\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.drugName.$error\"><span ng-message=\"required\">Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"drugContent\">Drug Content</label><div class=\"grid-md-8 no-padding\"><input id=\"drugContent\" class=\"form-field grid-md-12\" name=\"drugContent\" placeholder=\"Drug Content\" ng-model=\"drugFormulae.drugContent\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.drugContent.$error\"><span ng-message=\"required\">Content is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineAlertCount\">Medicine Min Count</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineAlertCount\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9]*$/\" name=\"medicineMinCount\" placeholder=\"Medicine Min Count\" ng-model=\"drugFormulae.minCount\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.medicineMinCount.$error\"><span ng-message=\"required\">Min Count is Required.</span> <span ng-message=\"pattern\">Min Count is Number.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineAlertCount\">Medicine Max Count</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineAlertCount\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9]*$/\" name=\"medicineMaxCount\" placeholder=\"Medicine Max Count\" ng-model=\"drugFormulae.maxCount\" required> <span class=\"error-msg\" ng-messages=\"drugFormulaForm.medicineMaxCount.$error\"><span ng-message=\"required\">Max Count is Required.</span> <span ng-message=\"pattern\">Max Count is Number.</span></span></div></div><div class=\"row\" ng-if=\"!drugFormulae.id\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" ng-disabled=\"drugFormulaForm.$invalid\" name=\"drugFormulaFormBtn\" ng-click=\"saveDrugFormulae(drugFormulae)\">Submit</button></div></form>"
  );


  $templateCache.put('src/location-form/location-form.tpl.html',
    "<form name=\"locationForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineLocationName\">Medicine Location Name</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineLocationName\" class=\"form-field grid-md-12\" name=\"locationName\" placeholder=\"Medicine Location Name\" ng-model=\"location.location\" required> <span class=\"error-msg\" ng-messages=\"locationForm.locationName.$error\"><span ng-message=\"required\">Location is Required.</span></span></div></div><div class=\"row\" ng-if=\"!location.id\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" ng-disabled=\"locationForm.$invalid\" ng-click=\"saveMedicineLocation(location)\">Submit</button></div></form>"
  );


  $templateCache.put('src/medicine-category-form/medicine-category-form.tpl.html',
    "<form name=\"medicineCategoryForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineCategoryName\">Medicine Category Name</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineCategoryName\" class=\"form-field grid-md-12\" name=\"medicineCategoryName\" placeholder=\"Medicine CategoryName\" ng-model=\"medicineCategory.category\" required> <span class=\"error-msg\" ng-messages=\"medicineCategoryForm.medicineCategoryName.$error\"><span ng-message=\"required\">Category is Required.</span></span></div></div><div class=\"row\" ng-if=\"!medicineCategory.id\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" ng-disabled=\"medicineCategoryForm.$invalid\" name=\"medicineCategoryFormBtn\" ng-click=\"saveMedicineCategory(medicineCategory)\">Submit</button></div></form>"
  );


  $templateCache.put('src/medicine-doctor-category-form/medicine-doctor-category-form.tpl.html',
    "<form name=\"medicineCategoryDoctorForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineDoctorName\">Medicine Doctor Category</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineDoctorName\" class=\"form-field grid-md-12\" placeholder=\"Medicine Doctor Category Name\" name=\"medicineDoctorName\" ng-model=\"medicineCategoryByDoctor.categoryName\" required> <span class=\"error-msg\" ng-messages=\"medicineCategoryDoctorForm.medicineDoctorName.$error\"><span ng-message=\"required\">Medicine Doctor Category is Required.</span></span></div></div><div class=\"row\" ng-if=\"!medicineCategoryByDoctor.id\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" ng-disabled=\"medicineCategoryDoctorForm.$invalid\" name=\"medicineCategoryDoctorFormBtn\" ng-click=\"saveMedicineCategoryByDoctor(medicineCategoryByDoctor)\">Submit</button></div></form>"
  );


  $templateCache.put('src/medicine-form/medicine-form.tpl.html',
    "<form name=\"medicineForm\" novalidate><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineCode\">Medicine Code</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineCode\" class=\"form-field grid-md-12\" name=\"medicineCode\" placeholder=\"Medicine Code\" ng-model=\"medicine.code\" required> <span class=\"error-msg\" ng-messages=\"medicineForm.medicineCode.$error\"><span ng-message=\"required\">Code is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineName\">Medicine Name</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineName\" class=\"form-field grid-md-12\" name=\"medicineName\" placeholder=\"Medicine Name\" ng-model=\"medicine.name\" required> <span class=\"error-msg\" ng-messages=\"medicineForm.medicineName.$error\"><span ng-message=\"required\">Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineNoOfUnits\">No Of Units</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineNoOfUnits\" class=\"form-field grid-md-12\" name=\"medicineNoOfUnits\" placeholder=\"No Of Units\" ng-model=\"medicine.noOfUnits\" ng-pattern=\"/^[0-9]*$/\" required> <span class=\"error-msg\" ng-messages=\"medicineForm.medicineNoOfUnits.$error\"><span ng-message=\"required\">No Of Units is Required.</span> <span ng-message=\"pattern\">No Of Units is Number.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicinePurchasePacking\">Purchase Packing</label><div class=\"grid-md-8 no-padding\"><input id=\"medicinePurchasePacking\" class=\"form-field grid-md-12\" name=\"medicinePurchasePacking\" placeholder=\"Purchase Packing\" ng-model=\"medicine.purchasePacking\" required> <span class=\"error-msg\" ng-messages=\"medicineForm.medicinePurchasePacking.$error\"><span ng-message=\"required\">Purchase Packing is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineSchedule\">Medicine Schedule</label><div class=\"grid-md-8 no-padding\"><input id=\"medicineSchedule\" class=\"form-field grid-md-12\" name=\"medicineSchedule\" placeholder=\"Medicine Schedule\" ng-model=\"medicine.schedule\" required> <span class=\"error-msg\" ng-messages=\"medicineForm.medicineSchedule.$error\"><span ng-message=\"required\">Schedule is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"company\">Company</label><div class=\"grid-md-8 no-padding\"><div class=\"grid-md-11 pull-left\"><auto-suggest suggestions=\"companies\" class=\"grid-md-12\" clearable=\"false\" search-key=\"name\" output-model=\"medicine.company\" display-key=\"name\" options=\"{'inputClass':'grid-md-12','placeHolder':'Company','fieldName':'companyName','isRequired':'true'}\"></auto-suggest><span class=\"error-msg\" ng-messages=\"medicineForm.companyName.$error\"><span ng-message=\"required\">Company is Required.</span></span></div><div class=\"grid-md-1 pull-right text-right\"><button class=\"btn btn-sky-blue btn-circle master-add-icons\" ng-click=\"openCompanyForm()\"><i class=\"fa fa-plus\"></i></button></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"drugFormulae\">Drug Formula</label><div class=\"grid-md-8 no-padding\"><div class=\"grid-md-11 pull-left\"><auto-suggest suggestions=\"drugFormulae\" class=\"grid-md-12\" clearable=\"false\" search-key=\"name\" output-model=\"medicine.drugFormulae\" display-key=\"name\" options=\"{'inputClass':'grid-md-12','placeHolder':'Drug Formula','fieldName':'drugName','isRequired':'true'}\"></auto-suggest><span class=\"error-msg\" ng-messages=\"medicineForm.drugName.$error\"><span ng-message=\"required\">Drug Formula is Required.</span></span></div><div class=\"grid-md-1 pull-right text-right\"><button class=\"btn btn-sky-blue btn-circle master-add-icons\" ng-click=\"openDrugFormulaForm()\"><i class=\"fa fa-plus\"></i></button></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineCategory\">Medicine Category</label><div class=\"grid-md-8 no-padding\"><div class=\"grid-md-11 pull-left\"><auto-suggest suggestions=\"medicineCategories\" class=\"grid-md-12\" clearable=\"false\" search-key=\"category\" output-model=\"medicine.category\" display-key=\"category\" options=\"{'inputClass':'grid-md-12','placeHolder':'Medicine Category','fieldName':'categoryName','isRequired':'true'}\"></auto-suggest><span class=\"error-msg\" ng-messages=\"medicineForm.categoryName.$error\"><span ng-message=\"required\">Category is Required.</span></span></div><div class=\"grid-md-1 pull-right text-right\"><button class=\"btn btn-sky-blue btn-circle master-add-icons\" ng-click=\"openCategoryForm()\"><i class=\"fa fa-plus\"></i></button></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineCategoryByDoctor\">MedicineCategory Doctor</label><div class=\"grid-md-8 no-padding\"><div class=\"grid-md-11 pull-left\"><auto-suggest suggestions=\"medicineCategoryByDoctor\" class=\"grid-md-12\" clearable=\"false\" search-key=\"categoryName\" output-model=\"medicine.categoryByDoctor\" display-key=\"categoryName\" options=\"{'inputClass':'grid-md-12','placeHolder':'Medicine Category By Doctor','fieldName':'doctorCategoryName','isRequired':'true'}\"></auto-suggest><span class=\"error-msg\" ng-messages=\"medicineForm.doctorCategoryName.$error\"><span ng-message=\"required\">Category By Doctor is Required.</span></span></div><div class=\"grid-md-1 pull-right text-right\"><button class=\"btn btn-sky-blue btn-circle master-add-icons\" ng-click=\"openDoctorCategoryForm()\"><i class=\"fa fa-plus\"></i></button></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"medicineLocationList\">Medicine Location</label><div class=\"grid-md-8 no-padding\"><div class=\"grid-md-11 pull-left\"><auto-suggest suggestions=\" medicineLocations\" class=\"grid-md-12\" clearable=\"false\" search-key=\"location\" output-model=\"medicine.location\" display-key=\"location\" options=\"{'inputClass':'grid-md-12','placeHolder':'Medicine Location','fieldName':'location','isRequired':'true'}\"></auto-suggest><span class=\"error-msg\" ng-messages=\"medicineForm.location.$error\"><span ng-message=\"required\">Location is Required.</span></span></div><div class=\"grid-md-1 pull-right text-right\"><button class=\"btn btn-sky-blue btn-circle master-add-icons\" ng-click=\"openLocationForm()\"><i class=\"fa fa-plus\"></i></button></div></div></div><div class=\"row\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green btn-normal\" name=\"medicineFormBtn\" click-and-disable=\"functionToEnableButton()\" ng-disabled=\"medicineForm.$invalid||!medicine.company ||!medicine.drugFormulae||!medicine.category||!medicine.categoryByDoctor|| !medicine.location.id\" ng-click=\"saveMedicine(medicine)\">Submit</button></div></form>"
  );


  $templateCache.put('src/op-patient-form/op-patient-form.tpl.html',
    "<div class=\"card grade-linear\"><div class=\"row\"><div class=\"grid-md-4\"><div class=\"row\"><div class=\"grid-md-12\"><div class=\"grade-linear\"><form name=\"opPatientForm\" class=\"grid-md-12 card relative\" novalidate><div class=\"row no-padding op-patient-form-heading\"><b>OP Patient Form</b></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"patientName\">Patient Name*</label><div class=\"grid-md-8 no-padding\"><patient-auto-suggest options=\"{placeHolder:'Patient Name'}\" output-model=\"patient\" on-select=\"checkPatientStatus(selected)\"></patient-auto-suggest></div><div ng-if=\"opPatientIsExist\" class=\"color-red\">{{opPatientIsExist}}</div></div><div ng-if=\"!opPatientIsExist\"><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"opType\">OP Type*</label><div class=\"grid-md-8 no-padding\"><select ng-model=\"opPatient.opType\" name=\"opType\" class=\"form-field grid-md-12\" required ng-change=\"setOPCost()\" ng-options=\"optype as optype.opType for optype in opTypes track by optype.id\"></select></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"opType\">OP Sub Type*</label><div class=\"grid-md-8 no-padding\"><select ng-model=\"opPatient.opSubType\" name=\"opSubType\" class=\"form-field grid-md-12\" required ng-change=\"setOPCost()\" ng-options=\"opSubType as opSubType.opSubType for opSubType in opSubTypes track by opSubType.id\"></select></div></div><div class=\"row padding-2px\" ng-if=\"opPatient.opType.id==1 || opPatient.opType.id==2\"><label class=\"grid-md-4\" for=\"cardNo\">Card No</label><div class=\"grid-md-8 relative no-padding\"><input ng-model=\"opPatient.cardNo\" disabled class=\"form-field grid-md-12\" name=\"cardNo\" placeholder=\"Enter Card No\" required> <span class=\"alert-msg\" ng-if=\"opPatientForm.cardNo.$dirty && opPatientForm.cardNo.$error.required\">*Enter CardNo</span></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"consultFee\">Conslt. Fee:*</label><div class=\"grid-md-8 relative no-padding\"><input ng-model=\"opPatient.consultFee\" class=\"form-field grid-md-12\" name=\"consultFee\" ng-pattern=\"/^[0-9]*$/\" placeholder=\"Consultation Fee\" required> <span class=\"alert-msg\" ng-if=\"opPatientForm.consultFee.$dirty && opPatientForm.consultFee.$error.required\">*Enter consultFee</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.consultFee.$dirty && opPatientForm.consultFee.$error.pattern\">*Enter Number only</span></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"height\">Ht &nbsp; -- &nbsp; Wt</label><div class=\"grid-md-8 no-padding\"><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.height\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9]*$/\" name=\"height\" placeholder=\"Ht\"> <span class=\"form-field-suffix\">cm</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.height.$dirty && opPatientForm.height.$error.pattern\">*Enter Number only</span></div><div class=\"grid-md-2 no-padding text-center pull-left\">--</div><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.weight\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9]*$/\" name=\"weight\" placeholder=\"Wt\"> <span class=\"form-field-suffix\">Kg</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.weight.$dirty && opPatientForm.weight.$error.pattern\">*Enter Number only</span></div></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"temp\">Temp. -- Pulse</label><div class=\"grid-md-8 no-padding\"><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.temperature\" class=\"form-field grid-md-12\" name=\"temp\" ng-pattern=\"/^[0-9]+\\.?[0-9]*$/\" placeholder=\"Temp\"> <span class=\"form-field-suffix\"><sup>o</sup>F</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.temp.$dirty && opPatientForm.temp.$error.pattern\">*Enter Number only</span></div><div class=\"grid-md-2 no-padding text-center pull-left\">--</div><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.pulse\" class=\"form-field grid-md-12\" name=\"pulse\" ng-pattern=\"/^[0-9]*$/\" placeholder=\"Pulse\"> <span class=\"form-field-suffix\">BPM</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.pulse.$dirty && opPatientForm.pulse.$error.pattern\">*Enter Number only</span></div><div class=\"grid-md-3\"></div></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"bp\">B.P. &nbsp; --&nbsp; Sugar</label><div class=\"grid-md-8 no-padding\"><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.bp\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9\\/]+$/\" name=\"bp\" placeholder=\"B.P\"> <span class=\"alert-msg\" ng-if=\"opPatientForm.bp.$dirty && opPatientForm.bp.$error.pattern\">*Enter Number only</span></div><div class=\"grid-md-2 no-padding text-center pull-left\">--</div><div class=\"relative grid-md-5 no-padding pull-left\"><input ng-model=\"opPatient.sugar\" class=\"form-field grid-md-12\" ng-pattern=\"/^[0-9]*$/\" name=\"sugar\" placeholder=\"Sugar\"> <span class=\"alert-msg\" ng-if=\"opPatientForm.sugar.$dirty && opPatientForm.sugar.$error.pattern\">*Enter Number only</span></div></div></div><div class=\"row padding-2px\"><label class=\"grid-md-4\" for=\"complaint\">Complaint*</label><div class=\"grid-md-8 relative no-padding\"><input name=\"complaint\" ng-pattern=\"/^[\\w -,]*$/\" ng-model=\"opPatient.complaint\" class=\"form-field grid-md-12\" placeholder=\"Complaint\" required> <span class=\"alert-msg\" ng-if=\"opPatientForm.complaint.$dirty && opPatientForm.complaint.$error.required\">*Enter Complaint</span> <span class=\"alert-msg\" ng-if=\"opPatientForm.complaint.$dirty && opPatientForm.complaint.$error.pattern\">*Enter characters only</span></div></div><div class=\"row no-padding\"><div class=\"grid-md-4\"></div><div class=\"grid-md-8 no-padding\"><button class=\"btn btn-md btn-sky-blue grid-md-12\" click-and-disable=\"functionToEnableButton()\" ng-disabled=\"opPatientForm.$invalid || opPatientIsExist\" ng-click=\"addOpPatient(opPatient)\">SAVE</button></div></div><div class=\"overlay absolute\" ng-class=\"{'show':formLoader}\"></div><div class=\"form-loader\" ng-class=\"{'show':formLoader}\"><i class=\"fa fa-refresh fa-spin\"></i></div></div></form></div></div></div></div><div class=\"grid-md-8 card padding-5\"><div class=\"row no-padding op-patient-form-heading\">Existing Patient Search</div><div><patient-search on-select=\"onSelectPatient($patient)\" on-save=\"onPatientAdd($patient)\" select=\"select\"></patient-search></div></div></div></div>"
  );


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
    "    }</style><h2 align=\"center\">Patient Form</h2><div class=\"row\"><div class=\"grid-md-8 card\"><div class=\"patientForm-headline borderd\"><h3>Add New Patient</h3><div class=\"pull-right mar-top-44px\"><button tc-camera class=\"btn btn-sky-blue\" ng-model=\"patient.photoString\" confirm-text=\"Confirm\">Photo</button></div></div><form name=\"form.patientForm\" class=\"patientForm margin-10\" novalidate><div class=\"row\"><div class=\"grid-md-1\"></div><div class=\"grid-md-9 no-padding\"><div class=\"row\"><label class=\"grid-md-4\" for=\"patientName\">Patient Name*</label><div class=\"grid-md-8 no-padding\"><input id=\"patientName\" class=\"form-field grid-md-12\" name=\"patientName\" placeholder=\"Patient Name\" ng-model=\"patient.name\" required> <span class=\"error-msg\" ng-messages=\"patientForm.patientName.$error\"><span ng-message=\"required\">*Name is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"aadhar\">Aadhar No*</label><div class=\"grid-md-8 no-padding\"><input id=\"aadhar\" class=\"form-field grid-md-12\" name=\"aadhar\" placeholder=\"Aadhar No\" ng-blur=\"isAdhaarExists(patient.adharNo)\" ng-model=\"patient.aadharNo\" ng-maxlength=\"12\" maxlength=\"12\" ng-disabled=\"isAdhaarDisabled\"> <span class=\"error-msg\">{{adhaarMsg}}</span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"mobileNo\">Mobile No*</label><div class=\"grid-md-8 no-padding\"><input id=\"mobileNo\" class=\"form-field grid-md-12\" name=\"mobileNo\" placeholder=\"Mobile No\" ng-model=\"patient.mobileNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\" required> <span class=\"error-msg\" ng-messages=\"patientForm.mobileNo.$error\"><span ng-message=\"required\">*Mobile No is Required.</span> <span ng-message=\"pattern\">*Enter 10digits Mobile Number.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"altMobileNo\">Alt No</label><div class=\"grid-md-8 no-padding\"><input id=\"altMobileNo\" class=\"form-field grid-md-12\" name=\"altMobileNo\" placeholder=\"Alt Mobile No\" ng-model=\"patient.alternateNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\"></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"altMobileNo\">Emergency No</label><div class=\"grid-md-8 no-padding\"><input id=\"emergencyNo\" class=\"form-field grid-md-12\" name=\"emergencyNo\" placeholder=\"Emergency No\" ng-model=\"patient.emergencyNo\" ng-pattern=\"/^[0-9]*$/\" ng-maxlength=\"10\" maxlength=\"10\"></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"village\">Village*</label><div class=\"grid-md-8 no-padding\"><input id=\"village\" class=\"form-field grid-md-12\" name=\"village\" placeholder=\"Village\" ng-model=\"patient.village\" required> <span class=\"error-msg\" ng-messages=\"patientForm.village.$error\"><span ng-message=\"required\">*Village is Required.</span></span></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"dob\">DOB -- Age*</label><div class=\"grid-md-8 no-padding\"><div class=\"row no-padding\"><div class=\"grid-md-6 no-padding relative\"><tc-date-picker placeholder=\"Choose a date\" ng-model=\"patient.dob\" ng-change=\"getAgeFromDob(patient.dob)\"></tc-date-picker></div><span class=\"grid-md-1 no-padding text-center\">--</span><div class=\"grid-md-5 no-padding\"><input class=\"grid-md-12 form-field\" name=\"age\" ng-change=\"getDateFromAge(patient.age)\" placeholder=\"Age\" ng-model=\"patient.age\"></div></div></div></div><div class=\"row\"><label class=\"grid-md-4\" for=\"gender-rltn\">Gender -- Relation</label><div class=\"grid-md-8 no-padding\"><div class=\"row no-padding\"><div class=\"grid-md-4 no-padding show-inline\"><select class=\"grid-md-12 form-field\" ng-model=\"patient.gender\" ng-options=\"genderType for genderType in genderTypes\"></select></div><label class=\"grid-md-1 text-center show-inline no-padding\" for=\"relationType\">--</label><div class=\"grid-md-3 no-padding show-inline\"><select class=\"grid-md-12 form-field\" ng-model=\"patient.relationType\" ng-options=\"relationType for relationType in relationTypes\"></select></div><div class=\"grid-md-4 no-padding pull-right\"><input id=\"relationName\" class=\"form-field grid-md-12\" name=\"age\" placeholder=\"Relation Name\" ng-model=\"patient.relationName\"></div></div></div></div><div class=\"row\"><label class=\"grid-md-4\"></label><button class=\"btn btn-light-green\" name=\"patientFormBtn\" ng-disabled=\"form.patientForm.$invalid || adhaarMsg\" ng-click=\"addPatient();\">{{patient.id? 'Update': 'Save'}}</button></div></div><div class=\"grid-md-1\"></div></div></form></div><div class=\"grid-md-4\"><div ng-if=\"!patient.id\"><img class=\"grid-md-12\" ng-src=\"{{patient.photoString}}\" alt=\"Click capture to see preview\"></div><div ng-if=\"patient.id && !patient.photoString\"><img ng-src=\"./patient/getphoto?patientId={{ patient.id }}\" class=\"img-patient\" style=\"border:2px solid gray\"></div><div ng-if=\"patient.id && patient.photoString\"><img ng-src=\"{{patient.photoString}}\" class=\"img-patient\" style=\"border:2px solid gray\"></div></div></div>"
  );


  $templateCache.put('src/prescription-generator/dosageInput.tpl.html',
    "<div><div class=\"selection\"><i class=\"fa seletion-trigger pointer-cursor\" ng-class=\"{'fa-check': isDosageSelected, 'fa-times': !isDosageSelected}\" ng-click=\"toggleSelection($event)\"></i><div class=\"selected-dosage pointer-cursor\" ng-click=\"toggleSelectionDisplay($event)\">{{dosage}}</div></div><select class=\"tiny form-field\" ng-model=\"dosageRemarks\" ng-show=\"isDosageSelected\"><option value=\"à°¤.\" id=\"initDosageRemarks\">à°¤.</option><option value=\"à°®à±�.\">à°®à±�.</option></select></div><div class=\"selection-container\" ng-show=\"showSelection.showList\"><ul><li class=\"pointer-cursor\" ng-repeat=\"dos in dosageListByCategory(medicineCategory)\" ng-click=\"onSelect(dos.val)\">{{dos.key}}</li></ul></div>"
  );


  $templateCache.put('src/prescription-generator/prescription-generator.tpl.html',
    "<head><style>.medicine-list-header{\r" +
    "\n" +
    "        padding: 10px;\r" +
    "\n" +
    "        box-shadow: 0px 2px 4px 0px #ddd;\r" +
    "\n" +
    "        border: 1px solid #ddd;\r" +
    "\n" +
    "    }\r" +
    "\n" +
    "    .med-loc-hover{\r" +
    "\n" +
    "        background-color: dodgerblue;\r" +
    "\n" +
    "        padding: 6px;\r" +
    "\n" +
    "        left: 115px;\r" +
    "\n" +
    "        color: #fff;\r" +
    "\n" +
    "        top: 5px;\r" +
    "\n" +
    "        z-index:10;\r" +
    "\n" +
    "        position: absolute;\r" +
    "\n" +
    "        display: none;\r" +
    "\n" +
    "    }\r" +
    "\n" +
    "    .med-loc{\r" +
    "\n" +
    "        color:dodgerblue;\r" +
    "\n" +
    "        cursor: pointer;\r" +
    "\n" +
    "    }\r" +
    "\n" +
    "    .med-loc:hover .med-loc-hover{\r" +
    "\n" +
    "        display: block !important;\r" +
    "\n" +
    "    }</style></head><div class=\"row no-padding\"><div class=\"card min-height relative\"><div class=\"grid-md-8\"><div class=\"no-padding row\"><div class=\"grid-md-4\"><label for=\"customerName\"><b>Doctor Medicine Category</b></label><select id=\"customerName\" class=\"form-field grid-md-12\" ng-change=\"searchPurchaseBillMedicines()\" ng-model=\"medicineSearch.doctorCategory\" ng-options=\"option.id as option.categoryName for option in doctorMedicineCategoryList track by option.id\"></select></div><div class=\"grid-md-2\"><label for=\"category\"><b>Category</b></label><select id=\"category\" class=\"form-field grid-md-12\" ng-change=\"searchPurchaseBillMedicines()\" ng-model=\"medicineSearch.category\" ng-options=\"option.id as option.category for option in medicineCategoryList track by option.id\"></select></div><div class=\"grid-md-3\"><label for=\"medicineName\"><b>Medicine Name</b></label><input id=\"medicineName\" placeholder=\"Medicine Name\" ng-change=\"searchPurchaseBillMedicines()\" class=\"form-field grid-md-12\" ng-model=\"medicineSearch.medicineName\"></div><div class=\"grid-md-3\"><label for=\"medicineFormula\"><b>Medicine Formula</b></label><input id=\"medicineFormula\" placeholder=\"Medicine Formula\" ng-change=\"searchPurchaseBillMedicines()\" class=\"form-field grid-md-12\" ng-model=\"medicineSearch.drugContent\"></div></div><div class=\"grid-md-12 vertical-scroll card-full-height-75\" scroller-api=\"scollerApi\" when-scrolled=\"fetchMoreMedicineProduct()\"><div ng-repeat=\"pmsr in purchaseMedicineSearchResults\" class=\"medicine-card\"><div class=\"row no-padding med-loc\"><div class=\"med-loc-hover\"><span class=\"grid-md-12\">Location Name:{{pmsr.location}}</span></div><div class=\"grid-md-12 pointer-cursor\" ng-dblclick=\"selectPurchaseMedicineProduct(pmsr)\"><strong class=\"row no-padding\"><span class=\"grid-md-4\">{{pmsr.name | uppercase}} </span><span class=\"grid-md-1 padding-5 color-brick\">{{pmsr.expiryMonth}}/{{pmsr.expiryYear}}</span> <span class=\"grid-md-3 padding-5 color-sky-blue\">{{pmsr.batch}}</span> <span class=\"grid-md-1 padding-5 color-green\">{{pmsr.available}}</span> <span class=\"grid-md-3 text-center padding-5 bg-color-violet\"><i class=\"fa fa-inr\"></i> {{pmsr.mrp/pmsr.noOfUnits | number:2}}/-</span></strong><div class=\"row no-padding\"><div class=\"color-grey font-10\">{{pmsr.drugName |tcCamelCase}}</div></div></div></div></div></div></div><form class=\"grid-md-4 prescription-card card\" ng-class=\"{'expanded': expanded.prescription}\" ng-if=\"prescription.prescriptionMedicines.length\" name=\"productsForm\"><i class=\"fa pull-right pointer-cursor\" ng-class=\"{true: 'fa-compress', false: 'fa-expand'}[expanded.prescription]\" ng-click=\"toggleSelectedList()\"></i><table class=\"table\"><tr><th>S.No</th><th>Medicine</th><th ng-show=\"expanded.prescription\">Batch</th><th ng-show=\"expanded.prescription\">Avl <span class=\"grid-md-5 pull-right\">Qty</span></th><th>Unit Cost</th><th ng-show=\"expanded.prescription\">à°‰</th><th ng-show=\"expanded.prescription\">à°®</th><th ng-show=\"expanded.prescription\">à°¸à°¾</th><th ng-show=\"expanded.prescription\">à°°à°¾</th><th>Actions</th></tr><tr ng-repeat-start=\"sm in prescription.prescriptionMedicines track by $index\"><td>{{$index+1}}</td><td><div>{{sm.medicineName | uppercase}}</div><div class=\"color-grey font-10\">{{sm.drugContent |tcCamelCase}}</div></td><td ng-show=\"expanded.prescription\">{{sm.batch}}</td><td ng-show=\"expanded.prescription\" class=\"grid-md-2 line-height-30\">{{sm.available}} <input type=\"number\" class=\"form-field grid-md-5 pull-right\" min=\"1\" max=\"{{sm.available}}\" ng-change=\"getPrescriptionTotal()\" placeholder=\"Qty\" ng-model=\"sm.quantity\" required></td><td>{{(sm.mrp/sm.noOfUnits) | number: 2}}</td><td style=\"width: 70px\" ng-show=\"expanded.prescription\"><dosage-input medicine-category=\"sm.category\" dosage-remarks=\"sm.dosageMorningRemarks\" is-dosage-selected=\"sm.dosageMorning\" dosage=\"sm.dosageMorningDescription\"></dosage-input></td><td style=\"width: 70px\" ng-show=\"expanded.prescription\"><dosage-input medicine-category=\"sm.category\" dosage-remarks=\"sm.dosageAfterNoonRemarks\" is-dosage-selected=\"sm.dosageAfterNoon\" dosage=\"sm.dosageAfterNoonDescription\"></dosage-input></td><td style=\"width: 70px\" ng-show=\"expanded.prescription\"><dosage-input medicine-category=\"sm.category\" dosage-remarks=\"sm.dosageEveningRemarks\" is-dosage-selected=\"sm.dosageEvening\" dosage=\"sm.dosageEveningDescription\"></dosage-input></td><td style=\"width: 70px\" ng-show=\"expanded.prescription\"><dosage-input medicine-category=\"sm.category\" dosage-remarks=\"sm.dosageNightRemarks\" is-dosage-selected=\"sm.dosageNight\" dosage=\"sm.dosageNightDescription\"></dosage-input></td><td><button type=\"button\" class=\"btn btn-sm btn-red\" ng-click=\"unSelectPurchaseMedicineProduct($index)\"><i class=\"fa fa-trash\"></i></button> <button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"showRemarks=!showRemarks\" ng-show=\"expanded.prescription\"><i class=\"fa fa-comment\"></i></button></td></tr><tr><td ng-if=\"sm.category=='Inj.'\" class=\"color-red\" colspan=\"10\"><strong>Note:please Select the syrange</strong></td></tr><tr ng-show=\"showRemarks\" ng-repeat-end><td colspan=\"5\"></td><td colspan=\"4\"><input ng-show=\"expanded.prescription\" class=\"form-field grid-md-12\" ng-model=\"sm.remarks\" placeholder=\"Enter Dosage Descrption for {{sm.medicineName}}\"></td><td></td></tr><tr><td colspan=\"3\" ng-show=\"!expanded.prescription\"><strong>Prescription Amount : {{finalTotal| number:2}}</strong></td><td colspan=\"10\" ng-show=\"expanded.prescription\"><strong>Prescription Amount : {{finalTotal| number:2}}</strong></td><td><button class=\"btn btn-green btn-md pull-right\" ng-disabled=\"productsForm.$invalid\" ng-click=\"onSaveClick()\">{{saveBtnTxt}}</button></td></tr></table></form></div></div>"
  );
}]);
