angular.module('hcLib').service('locationService', ['httpService', function(httpService) {
    this.save = save;
    this.locationsList = locationsList;

    function save(location) {
        return httpService.post('location/saveorupdate', location);
    }

    function locationsList() {
        return httpService.get('location/list');
    }
}]);
