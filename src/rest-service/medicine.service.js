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
