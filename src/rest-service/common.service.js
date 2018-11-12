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
