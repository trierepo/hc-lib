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
