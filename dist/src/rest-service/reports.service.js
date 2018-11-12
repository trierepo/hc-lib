angular.module('tcLib').service('reportsService', ['httpService', function(httpService) {
    this.salesReports = salesReports;
    this.salesReturnReports = salesReturnReports;
    this.salesPaymentReports = salesPaymentReports;
    this.paymentReports = paymentReports;
    this.purchaseReports = purchaseReports;
    this.salesTransactions  = salesTransactions;
    this.purchaseTransactions = purchaseTransactions;
    this.paymentTransactionsByDateRange = paymentTransactionsByDateRange;
    this.adjustMrpByDateRange = adjustMrpByDateRange;
    this.adjustUnitsOrAvailability = adjustUnitsOrAvailability;

    function salesReports(payload) {
        return httpService.get('reports/sales/bills', payload);
    }

    function salesReturnReports(payload) {
        return httpService.get('reports/sales/returns', payload);
    }

    function salesPaymentReports(payload) {
        return httpService.get('reports/sales/payments', payload);
    }

    function paymentReports(payload){
        return httpService.post('reports/payments', payload);
    }


    function purchaseReports(payload) {
        return httpService.get('reports/purchase', payload);
    }

    
    function salesTransactions(payload) {
        return httpService.get('reports/salesTransactions', payload);
    }

    function purchaseTransactions(payload) {
        return httpService.get('reports/purchaseTransactions', payload);
    }

    function paymentTransactionsByDateRange(salesPayment) {
        return httpService.post('reports/create', salesPayment);
    }

    function adjustMrpByDateRange(taxAdjust) {
        return httpService.post('reports/adjustMrp', taxAdjust);
    }

    function adjustUnitsOrAvailability(salesBillMedicines) {
        return httpService.post('reports/adjustunitsoravailability', salesBillMedicines);
    }   

    function salesTransactions(payload) {
        return httpService.get('reports/salesPayments', payload);
    }

}]);
