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
                $state.go('opPatientSearch',{opId: $scope.op.id});
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
