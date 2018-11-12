angular.module('tcLib').service('purchasebillService', ['httpService', function(httpService) {
    this.createPurchaseBill = createPurchaseBill;
    this.purchaseBillById = purchaseBillById;
    this.purchaseBillsListByOptions = purchaseBillsListByOptions;
    this.purchaseTotal = purchaseTotal;
    this.createPurchaseBillPayment = createPurchaseBillPayment;
    this.purchaseBillPaymentList = purchaseBillPaymentList;
    this.createPurchaseBillReturn = createPurchaseBillReturn;
    this.purchaseReturns = purchaseReturns;
    this.purchaseReturnMedicines = purchaseReturnMedicines;
    this.uploadPurchaseBill = uploadPurchaseBill;

    function createPurchaseBill(purchaseBill) {
        return httpService.post('purchasebill/save', purchaseBill);
    }

    function purchaseBillById(id) {
        return httpService.get('purchasebill/get/' + id);
    }

    function purchaseBillsListByOptions(payload) {
        return httpService.get('purchasebill/search', payload);
    }

    function purchaseTotal(payload) {
        return httpService.get('purchasebill/total', payload);
    }

    function createPurchaseBillPayment(purchasePayment) {
        return httpService.post('purchasebill/payment/save', purchasePayment);
    }

    function purchaseBillPaymentList(payload) {
        return httpService.get('purchasebill/payment/search', payload);
    }

    function createPurchaseBillReturn(purchaseReturn) {
        return httpService.post('purchasebill/return/save', purchaseReturn);
    }    
    
    function purchaseReturns(payload) {
        return httpService.get('purchasebill/returns/get', payload);
    }

    function purchaseReturnMedicines(payload) {
        return httpService.get('purchasebill/return/medicines/get', payload);
    }
    
    function uploadPurchaseBill(payload,billId) {
        return httpService.post('purchasebill/upload/'+billId, payload);
    }

}]);


