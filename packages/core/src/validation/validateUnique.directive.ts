import { module } from 'angular';
import type { IAttributes, INgModelController, IScope } from 'angular';

export const CORE_VALIDATION_VALIDATEUNIQUE_DIRECTIVE = 'spinnaker.core.validation.unique.directive';
export const name = CORE_VALIDATION_VALIDATEUNIQUE_DIRECTIVE; // for backwards compatibility

module(CORE_VALIDATION_VALIDATEUNIQUE_DIRECTIVE, []).directive('validateUnique', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope: IScope, _elem: JQuery, attr: IAttributes, ctrl: INgModelController) {
      scope.$watch(
        attr.validateUnique,
        function (newVal: any, oldVal: any) {
          if (newVal !== oldVal && (ctrl.$viewValue || ctrl.$dirty)) {
            ctrl.$validate();
          }
        },
        true,
      );
      const uniqueValidator = function (value: any) {
        let options = scope.$eval(attr.validateUnique) || [];
        let test = value;
        if (attr.validateIgnoreCase === 'true') {
          options = options.map(function (option: any) {
            return option ? option.toLowerCase() : null;
          });
          test = value ? value.toLowerCase() : value;
        }
        return !options.includes(test);
      };

      ctrl.$validators.validateUnique = uniqueValidator;
    },
  };
});
