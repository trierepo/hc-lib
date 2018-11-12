angular.module('tcLib').service('patientService', ['httpService', function(httpService) {
    this.save = save;
    this.patientsListByOptions = patientsListByOptions;
    this.imageData = imageData;

    function save(patient) {
        return httpService.post('patient/saveorupdate', patient);
    }

    function patientsListByOptions(payload) {
        return httpService.get('patient/listbyoptions', payload);
    }

    function imageData(payload) {
        return httpService.get('patient/getphoto', payload);
    }

    
  
}]);
