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
