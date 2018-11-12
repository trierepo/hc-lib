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
