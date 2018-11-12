angular.module('tcLib').service('medicineCategoryService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryList = medicineCategoryList;

    function save(medicineCategory) {
        return httpService.post('medicinecategory/saveorupdate', medicineCategory);
    }

    function medicineCategoryList() {
        return httpService.get('medicinecategory/list');
    }
}]);
