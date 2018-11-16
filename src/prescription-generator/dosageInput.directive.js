angular.module("hcLib").directive('dosageInput', function() {
	var dosageSelectionMap = {
		cap: [{key: '1', val: '1'}, {key: '2', val: '2'}],
		tabInj: [{key: '1', val: '1'}, {key: '1/2', val: '1/2'}, {key:'2', val: '2'}],
		drops: [{key: '1', val: '1'}, {key: '2', val: '2'}, {key: '3', val: '3'}, {key: '4', val: '4'}, {key: '5', val: '5'}],
		liquid: [{key: '0.5ml', val: '0.5ml'}, {key: '1.0ml', val: '1.0ml'},{key: '2.5ml', val: '2.5ml'}, {key: '5ml', val: '5ml'}, {key: '10ml', val: '10ml'},{key: '15ml', val: '15ml'}, {key: '20ml', val: '20ml'},{key: '30ml', val: '30ml'},{key: '40ml', val: '40ml'},{key: '50ml', val: '50ml'}],
		powder: [{key: '1pn', val: '1pinch'}, {key: '0.5pn', val: '0.5pinch'}, {key: '1.5pn', val: '1.5pinch'}, {key: '2pn', val: '2pinch'}, {key: '0.5 T-Sp', val: '0.5 TS'}, {key: '1 T-Sp', val: '1 TS'}, {key: '1.5 T-Sp', val: '1.5 TS'}, {key: '2 T-Sp', val: '2 TS'}]
	};

	return {
		restrict: 'E',
		scope: {
			dosageRemarks: '=',
			isDosageSelected: '=',
			dosage: '=',
			medicineCategory:'='
		},
		templateUrl : "src/prescription-generator/dosageInput.tpl.html",
		controller : function($scope, $window) {
			$scope.showSelection = {showList: false};
			$scope.dosageListByCategory = function (cat) {
				switch(cat) {
					case 'Cap.': return dosageSelectionMap.cap;
					case 'Tab.':
					case 'Inj.': return dosageSelectionMap.tabInj;
					case 'Drops.': return dosageSelectionMap.drops;
					case 'Syr.' : return dosageSelectionMap.liquid;
					case 'Lotion': return dosageSelectionMap.drops;
					case 'SOLUTION' : return dosageSelectionMap.liquid;
					case 'SUSPENSION': return dosageSelectionMap.liquid;
					case 'POWDER': return dosageSelectionMap.powder;
				}
			};
			
			$scope.$on('$windowClick', function() {
				$scope.showSelection = null; 
			});
			
			$scope.onSelect = function(selected) {
				$scope.dosage = selected;
				$scope.showSelection = null;
				$scope.isDosageSelected = true;
			};
			
			$scope.toggleSelection = function(e) {
				e.stopPropagation();
				$scope.isDosageSelected = !$scope.isDosageSelected;
				$scope.dosageRemarks=document.getElementById('initDosageRemarks').innerHTML;
				if(!$scope.isDosageSelected) {
					$scope.dosage = null;
					$scope.dosageRemarks=null;
					$scope.showSelection = null;
				} else {
					$scope.dosage = $scope.dosageListByCategory($scope.medicineCategory)[0].val;
					$scope.showSelection = null;
				}
			};
			
			$scope.toggleSelectionDisplay = function (e) {
				e.stopPropagation();
				if($scope.showSelection == null) {
					$scope.showSelection = {showList: true};
				} else {
					$scope.showSelection = null;
				}
			};
		}
	};
});