angular.module('hcLib').directive("casesheet",function(){
    return {
        templateUrl:'src/casesheet/casesheet.tpl.html',
        scope:{
            opPatientData:'@',
            currentCaseSheet:'&',
            onSave:'&',
        },
        controller:function($scope,$http,casesheet) {
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
        }
    };
});