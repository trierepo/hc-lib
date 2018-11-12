angular.module('tcLib').service('companyService', ['httpService', function(httpService) {
    this.save = save;
    this.companiesList = companiesList;

    function save(company) {
        return httpService.post('company/saveorupdate', company);
    }

    function companiesList() {
        return httpService.get('company/list');
    }
}]);
