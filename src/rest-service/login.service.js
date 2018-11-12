angular.module('tcLib').service('loginService', ['httpService', function(httpService) {
    this.login = login;
    this.sessionUser = sessionUser;

    function login(payload) {
        return httpService.post('auth/login', payload);
    }

    function sessionUser() {
        return httpService.get('auth/sessionuser');
    }
}]);
