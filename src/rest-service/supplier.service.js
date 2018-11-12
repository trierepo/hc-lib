angular.module('tcLib').service('supplierService', ['httpService', function(httpService) {
    this.save = save;
    this.suppliersList = suppliersList;

    function save(supplier) {
        return httpService.post('supplier/saveorupdate', supplier);
    }

    function suppliersList() {
        return httpService.get('supplier/list');
    }
}]);
