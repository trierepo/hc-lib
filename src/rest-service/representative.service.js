angular.module('tcLib').service('representativeService', ['httpService', function(httpService) {
    this.save = save;
    this.representativesList = representativesList;

    function save(representative) {
        return httpService.post('representative/saveorupdate', representative);
    }

   
    function representativesList() {
        return httpService.get('representative/list');
    }
}]);
