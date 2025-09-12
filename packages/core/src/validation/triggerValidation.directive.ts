import { module } from 'angular';
import type { IAttributes, INgModelController, IScope } from 'angular';

export const CORE_VALIDATION_TRIGGERVALIDATION_DIRECTIVE = 'spinnaker.core.validation.trigger.directive';
export const name = CORE_VALIDATION_TRIGGERVALIDATION_DIRECTIVE; // for backwards compatibility

module(CORE_VALIDATION_TRIGGERVALIDATION_DIRECTIVE, []).directive('triggerValidation', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope: IScope, _elem: JQuery, attr: IAttributes, ctrl: INgModelController) {
      const watches = attr.triggerValidation.split(',');
      watches.forEach(function (watchValue: string) {
        scope.$watch(watchValue, function () {
          if (ctrl.$viewValue) {
            ctrl.$validate();
          }
        });
      });
    },
  };
});
