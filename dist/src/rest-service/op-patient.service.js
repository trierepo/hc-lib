angular.module('tcLib').service('opPatientService', ['httpService', function(httpService) {
    this.save = save;
    this.getOpPatientsListByOptions = getOpPatientsListByOptions;
    this.getOpPatientByPatientId = getOpPatientByPatientId;
    this.getOpPatientCountWithStatusByOpId = getOpPatientCountWithStatusByOpId;
    this.getOrCreatePatientCard = getOrCreatePatientCard;
    this.createPatientCard = createPatientCard;

    function save(opPatient) {
        return httpService.post('oppatient/createorupdate', opPatient);
    }

    function getOpPatientsListByOptions(opPatient) {
        return httpService.post('oppatient/listbyoptions', opPatient);
    }

    function getOpPatientByPatientId(opPatientId) {
        return httpService.get('oppatient/getoppatientbyid/' + opPatientId);
    }

    function getOpPatientCountWithStatusByOpId(opId) {
        return httpService.get('oppatient/statuscount/'+opId);
    }

    function getOrCreatePatientCard(patientCardInfo) {
        return httpService.post('oppatient/patient-card', patientCardInfo);
    }

    function createPatientCard(patientCardInfo) {
        return httpService.post('oppatient/patient-card/new',patientCardInfo);
    }
}]);
