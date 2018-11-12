angular.module('tcLib').service('purchasebillMedicineService', ['httpService', function(httpService) {
    this.purchaseBillMedicines = purchaseBillMedicines;
    this.alertInfo = alertInfo;
    this.pendingBillMedicines  = pendingBillMedicines;

  
    function purchaseBillMedicines(payload) {
        return httpService.get('purchasebillmedicine/search', payload);
    }

    function alertInfo(payload) {
        return httpService.get('purchasebillmedicine/alertinfo', payload);
    }
    function pendingBillMedicines(billId) {
        return httpService.get('purchasebillmedicine/pendingbills', {
            billId: billId
        });
    }

}]);
