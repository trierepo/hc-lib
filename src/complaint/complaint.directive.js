angular.module('hcLib').directive("complaint",function(){
    return {
            templateUrl:'src/complaint/complaint.tpl.html',
            scope:{
                patientOpId:'=',
                onModify:'=',
                onSelect:'&',
                onCheck:'&',
            },
            controller:function($scope, $http, complaintService){
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
                
            }
        };
});