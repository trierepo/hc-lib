angular.module('tcLib').service('medicineCategoryByDoctorService', ['httpService', function(httpService) {
    this.save = save;
    this.medicineCategoryByDoctorList = medicineCategoryByDoctorList;

    function save(medicineCategoryByDoctor) {
        return httpService.post('medicinecategorybydoctor/saveorupdate', medicineCategoryByDoctor);
    }

    function medicineCategoryByDoctorList() {
        return httpService.get('medicinecategorybydoctor/list');
    }
}]);
