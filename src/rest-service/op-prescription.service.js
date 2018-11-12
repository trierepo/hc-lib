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
