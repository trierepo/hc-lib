angular.module("hcLib").directive("autoSuggest", function() {
	return {
		restrict : 'E',
		template : "<div class='auto-suggest-container'>"
				+ "<input ng-attr-type='{{options.fieldType}}' placeholder='{{options.placeHolder}}' autocomplete='off' name='{{options.fieldName}}' id='{{options.fieldID}}' ng-required='{{options.isRequired}}' class='form-field' ng-class='options.inputClass' ng-model='suggestModel' ng-keydown='inputKeyDown($event)' ng-blur='closeList()' ng-change='changeSuggestInput(suggestModel)'>"
				// + "<span class='error-msg ng-active' ng-show='!suggestModel'><span>{{options.placeHolder}} is Required</span></span>"
				+ "<button ng-if='clearable' class='auto-suggest-clear' ng-click='clearInput(true)'><i class='fa fa-times'></i></button>"
				+ "<ul class='auto-suggest-list' ng-show='suggestList.length'>"
				+ "<li tabindex='-1' ng-repeat='suggestion in suggestList track by $index' bind-html-compile='suggestionTemplate' ng-click='selectItem(suggestion)'></li>"
				+ "</ul>" + "</div>",
		scope : {
			options			: "=",
			template		: "=",
			resultAs		: "=",
			clearable		: "=",
			outputModel		: "=",
			suggestions		: "=",
			
			searchKey 		: "@",
			displayKey		: "@",
			
			onSelect		: "&",
		},
		controller : function($scope, $filter, $timeout) {

			$scope.clearable = ($scope.clearable !== undefined) ? $scope.clearable : true;
			//Assigning Functionalities
			$scope.init = init;
			$scope.changeSuggestInput = changeSuggestInput;
			$scope.closeList = closeList;
			$scope.selectItem = selectItem;
			$scope.inputFocusLost = inputFocusLost;
			$scope.inputKeyDown = keyboardHandler;
			$scope.clearInput = clearInput;
			
			$scope.$watch("suggestions", function(newVals, oldVals) {
				if(newVals && newVals.length) {
					if(!$scope.initialized) {
						init();
					}
				}
			});
			
			function clearInput(focusable) {
				$scope.suggestModel = "";
				$scope.outputModel = undefined;
				if(focusable) {
					$($scope.ele).find('input.form-field').focus();
				}
			}
			
			$scope.$watch("outputModel", function(newVal, oldVal) {
				if(newVal) {
					setSuggestInput(newVal);
				} else {
					clearInput();
				}
			});

			function init(suggestions) {
				$scope.initialized = true;
				
				if ($scope.template) {
					$scope.suggestionTemplate = $scope.template;
				} else if (typeof $scope.suggestions[0] === 'object') {
					if ($scope.displayKey) {
						$scope.suggestionTemplate = "<span>{{suggestion." + $scope.displayKey + "}}</span>";
					} else {
						$scope.suggestionTemplate = "<span>{{suggestion.name}}</span>";
					}
				} else {
					$scope.suggestionTemplate = "<span>{{suggestion}}</span>";
				}
			}
			
			function changeSuggestInput(suggestModel) {
				if (suggestModel) {
					var filter = suggestModel;
					if($scope.searchKey) {
						if($scope.searchKey.indexOf(".") === -1) {
							filter = JSON.parse("{\"" + $scope.searchKey + "\":\"" + suggestModel + "\"}");
						} else {
							searchKey = getObjectStringFromDottedKeyAndValue($scope.searchkey, suggestModel);
							filter = JSON.parse(searchKey);
						}
					}
					$scope.suggestList = $filter("filter")($scope.suggestions, filter).slice(0,50);
				}
			}

			function closeList(flag) {
				if (flag) {
					$scope.suggestList = [];
				} else {
					$timeout(function() {
						if (!$($scope.ele).find('input.form-field').is(":focus")) {
							$scope.suggestList = [];
						}
					}, 1000);
				}
			}

			function selectItem(item) {
				$scope.outputModel = item;
				$scope.closeList(true);
				setSuggestInput(item);
				if (typeof $scope.onSelect === 'function') {
					$scope.onSelect({selected:item});
				}
			}
			
			function setSuggestInput(item) {
				if ($scope.displayKey) {
					if($scope.displayKey.indexOf(".") === -1) {
						$scope.suggestModel = item[$scope.displayKey];
					} else {
						//$scope.suggestModel = item.medicine.medicineName; //Need to be reomved;
					}
				} else if ($scope.resultAs) {
					$scope.suggestModel = item[$scope.resultAs];
				} else {
					$scope.suggestModel = item;
				}
			}

			function inputFocusLost() {
				$scope.closeList();
			}

			function keyboardHandler(evt) {
				if (evt.keyCode === 40) {// KeyDown
					$scope.changeSuggestInput($scope.suggestModel);
					if ($($scope.ele).find(".auto-suggest-list li").hasClass('focused')) {
						$($scope.ele).find(".auto-suggest-list li.focused").removeClass('focused').next().addClass('focused').focus();
					} else {
						$($scope.ele).find(".auto-suggest-list li:first-child").addClass('focused').focus();
					}
					$(evt.currentTarget).focus();
					evt.preventDefault();
				} else if (evt.keyCode == 38) {// Key Up
					$scope.changeSuggestInput($scope.suggestModel);
					if ($($scope.ele).find(".auto-suggest-list li").hasClass('focused')) {
						$($scope.ele).find(".auto-suggest-list li.focused").removeClass('focused').prev().addClass('focused').focus();
					} else {
						$($scope.ele).find(".auto-suggest-list li:last-child").addClass('focused').focus();
					}
					$(evt.currentTarget).focus();
					evt.preventDefault();
				} else if (evt.keyCode === 27) {
					$scope.closeList();
				} else if (evt.keyCode === 13) {
					$scope.outputModel = undefined;
					var selectedIndex = ($($scope.ele).find(".auto-suggest-list li").index($($scope.ele).find(".auto-suggest-list li.focused")));
					if (selectedIndex !== -1) {
						$scope.selectItem($scope.suggestList[selectedIndex]);
					}
					evt.preventDefault();
				}
			}

			function getObjectStringFromDottedKeyAndValue(key, value) {
				var objectString ="";
				var closeBrackets = "";
				var keys = $scope.searchKey.split(".");
				for(var i=0; i<keys.length; i++) {
					objectString += "{\""+ keys[i] + "\":";
					closeBrackets += "}";
				}
				return objectString + "\"" + value + "\"" + closeBrackets;
			}
		},
		link : function(scope, ele, attr) {
			scope.ele = $(ele);
		}
	};
});