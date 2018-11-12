angular.module('tcLib').service('salesbillService', ['httpService', function(httpService) {
    this.create = create;
    this.salesBillsListByOptions = salesBillsListByOptions;
    this.salesAmount = salesAmount;
    this.medicineSearch = medicineSearch;
    this.createSalesBillPayment = createSalesBillPayment;
    this.paymentsList = paymentsList;
    this.createSalesBillReturn  = createSalesBillReturn;
    this.returnsList = returnsList;
    this.prescriptionsList = prescriptionsList;
    this.savePrescriptionSale = savePrescriptionSale;
    this.createPrescriptionSale = createPrescriptionSale;
    this.salesReturnTotal = salesReturnTotal;
    this.generateInvoiceNum = generateInvoiceNum;

    function create(salesBill) {
        return httpService.post('salesbill/save', salesBill);
    }

    function salesBillsListByOptions(payload) {
        return httpService.get('salesbill/list', payload);
    }

    function salesAmount(payload) {
        return httpService.get('salesbill/total', payload);
    }

    function medicineSearch(payload) {
        return httpService.get('salesbill/medicines/search', payload);
    }

    function createSalesBillPayment(payment) {
        return httpService.post('salesbill/payment/save', payment);
    }

    function paymentsList(billId) {
        return httpService.get('salesbill/payment/search', {
            billId: billId //optional
        });
    }

    function createSalesBillReturn(salesReturns) {
        return httpService.post('salesbill/return/save', salesReturns);
    }

    function returnsList(payload) {
        return httpService.get('salesbill/return/search', payload);
    }


    function prescriptionsList(payload) {
        return httpService.get('salesbill/prescription/search', payload);
    }

    function savePrescriptionSale(payload,prescId,isResale) {
        return httpService.post('salesbill/prescription/save/'+prescId+'?isResale='+(isResale || false), payload);
    }

    function createPrescriptionSale(salesBill) {
        return httpService.post('salesbill/prescription/add', salesBill);
    }
    
    function salesReturnTotal(payload) {
        return httpService.get('salesbill/returns/total', payload);
    }

    function generateInvoiceNum() {
        return httpService.get('salesbill/generateinvoicenum');
    }
}]);
