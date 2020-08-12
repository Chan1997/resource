/**
 * Created by Vikash Mehta on 28/1/16.
 */

App.directive('imgInput', ['$parse', function ($parse) {
    return {
        restrict: "AE",
        template: "<input type='file' class='btn btn-default' style='opacity: 0;position: absolute;top: 0;bottom: 0;left: 0;right: 0;'/>" +
        '<span>Browse or drag an Image</span>',
        replace: false,
        link: function (scope, element, attrs) {

            var modelGet = $parse(attrs.imgInput);
            var modelSet = modelGet.assign;
            var onChange = $parse(attrs.onChange);

            var updateModel = function () {
                scope.$apply(function () {
                    modelSet(scope, element[0].files[0]);
                    onChange(scope);
                });
            };

            element.bind('change', updateModel);
        }
    };
}]);


App.directive('whenScrolled', function () {
    return function (scope, elm, attr) {
        var funCheckBounds = function () {
            var dom = angular.element('#loadMoreAgt .tab-pane.active');
            if ($(dom).scrollTop() + $(dom).innerHeight() >= $(dom)[0].scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        };

        $(document).ready(function () {
            angular.element('#loadMoreAgt .tab-pane').on('scroll', funCheckBounds);
        });
    };
});

App.directive('createTmpItem', function () {
    return {
        restrict: "E",
        scope: {
            variables: '='
        },
        template: '<input  ng-model="$parent.variables" class="form-control"  ng-switch-when="Number" type="number"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Text" type="text"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Date" type="date"  style="display: none"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Dropdown" type="text"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Checklist" type="text"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Checkbox" type="checkbox" value="false"  style="; height:20px; display: none"  ng-true-value="true" ng-false-value="false"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Telephone" type="tel"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="Email" type="email"  style=""  placeholder="Value"/>' +
        '<input ng-model="$parent.variables" class="form-control"  ng-switch-when="URL" type="text"  style=""  placeholder="Value"/>',
        replace: false,
        link: function (scope, element, attrs, fn) {
        }
    };
});

App.directive('showTmpItem', function () {
    return {
        restrict: "E",
        scope: {
            variables: '='
        },
        template: '<span  ng-bind="$parent.variables" ng-switch-when="Number"></span>' +
        '<span ng-bind="$parent.variables" ng-switch-when="Text"></span>' +
            //'<span ng-bind="$parent.variables" ng-switch-when="Date"></span>'+
        '<span ng-bind="$parent.variables" ng-switch-when="Dropdown"></span>' +
        '<span ng-bind="$parent.variables" ng-switch-when="Checklist"></span>' +
            //'<span ng-bind="$parent.variables" ng-switch-when="Checkbox"></span>'+
        '<span ng-bind="$parent.variables" ng-switch-when="Telephone"></span>' +
        '<span ng-bind="$parent.variables" ng-switch-when="URL"></span>' +
        '<span ng-bind="$parent.variables" ng-switch-when="Email"></span>',
        replace: false,
        link: function (scope, element, attrs, fn) {
        }
    };
});

App.directive('showHelpBtn', function () {
    return {
        restrict: "E",
        scope: {
            variables: '='
        },
        template: '<span ng-switch-when="Dropdown" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#dropdown-help" data-toggle="modal">help_outline</span>' +
        '<span ng-switch-when="Checklist" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#checklist-help" data-toggle="modal">help_outline</span>' +
        '<span ng-switch-when="Date-Future" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#date-future-help" data-toggle="modal">help_outline</span>' +
        '<span ng-switch-when="Date-Past" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#date-past-help" data-toggle="modal">help_outline</span>' +
        '<span ng-switch-when="Datetime-Future" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#date-future-help" data-toggle="modal">help_outline</span>' +
        '<span ng-switch-when="Datetime-Past" class="material-icons ft-color-gray font-x-large vert-al-mid" data-target="#date-past-help" data-toggle="modal">help_outline</span>',
        replace: false,
        link: function (scope, element, attrs, fn) {
        }
    };
});

App.directive('templateItem', function () {
    return {
        restrict: "E",
        scope: {
            variables: '='
        },
        template: '<input  ng-model="$parent.variables.input" ng-change="$parent.variables.changeCustomValue($parent.variables.input, $parent.variables)" ng-model-options="{ debounce: 300 }" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Number" type="number" min="{{ $parent.variables.label == \'Item_Quantity\' && 0 }}" max="{{ $parent.variables.label == \'Item_Quantity\' && 99999 }}" placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input" ng-change="$parent.variables.changeCustomValue($parent.variables.input, $parent.variables)" ng-model-options="{ debounce: 300 }" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Text" type="text" maxlength="{{ $parent.variables.label == \'Account_Number\' && 15 }}"   placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input" class="form-control"  ng-switch-when="Image" type="text"   disabled/>' +
        '<input ng-model="$parent.variables.input" class="form-control"  ng-switch-when="Date" type="date"   />' +
        '<select ng-model="$parent.variables.data" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Dropdown" type="text"   placeholder="Select value" ng-change="$parent.variables.changeCustomDropdown($parent.variables)"><option value="">Select Value</option><option ng-repeat="val in $parent.variables.dropdown" value="{{val.value}}" >{{val.value}}</option></select>' +
        '<input ng-model="$parent.variables.input" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Checklist" type="text"   placeholder="Value" disabled/>' +
        '<input ng-model="$parent.variables.input" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Checkbox" type="checkbox"  style="height:20px" value="false"  ng-true-value="true" ng-false-value="false"/>' +
        '<input ng-model="$parent.variables.input" ng-switch-when="Telephone" type="tel" class="form-control div-display tmp-phone"  id="tmp-phone" placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="Email" type="email"   placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Date-Past" type="text" class="form-control div-display tmp-dtpast"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Date-Future" type="text" class="form-control div-display tmp-dtfut"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Date-Today" type="text" class="form-control div-display tmp-dttoday" placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Date-Time" type="text" class="form-control div-display tmp-datetime"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Datetime-Future" type="text" class="form-control div-display tmp-datetime-fut"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input"   ng-switch-when="Datetime-Past" type="text" class="form-control div-display tmp-datetime-past"  placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input" ng-required="$parent.variables.app_side != 2 && $parent.variables.required == 1" ng-disabled="$parent.variables.app_side == 0 && $parent.variables.required != 1" class="form-control"  ng-switch-when="URL" type="text"   placeholder="Value"/>' +
        '<input ng-model="$parent.variables.input" onKeyPress="return disableEnterKey(event)" type="text" googleplace="" ng-change="getLatlng()"',
        replace: false,
        link: function (scope, element, attrs, fn) {

            //scope.changeCustomDropdown=function(value){
            //    if(value.input){
            //        value.data= value.input;
            //        value.data_type = "Text",
            //        value.app_side = "0"
            //    }
            //}
        }
    };
});

App.directive('timePick', function () {
    return {
        restrict: "E",
        scope: {
            variables: '='
        },
        template: ''
    }
});




