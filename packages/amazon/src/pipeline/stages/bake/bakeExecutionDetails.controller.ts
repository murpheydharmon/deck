import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import { module } from 'angular';
import type { IScope } from 'angular';
import { get } from 'lodash';

import { SETTINGS } from '@spinnaker/core';

export const AMAZON_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER =
  'spinnaker.amazon.pipeline.stage.bake.executionDetails.controller';
export const name = AMAZON_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER; // for backwards compatibility

interface IAWSBakeExecutionDetailsScope extends IScope {
  configSections: string[];
  detailsSection: string;
  provider: string;
  roscoMode: boolean;
  stage: any;
  bakeryDetailUrl: any;
  bakeFailedNoError: boolean;
}

module(AMAZON_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER, [UIROUTER_ANGULARJS]).controller(
  'awsBakeExecutionDetailsCtrl',
  [
    '$scope',
    '$stateParams',
    'executionDetailsSectionService',
    '$interpolate',
    function (
      $scope: IAWSBakeExecutionDetailsScope,
      $stateParams: any,
      executionDetailsSectionService: any,
      $interpolate: any,
    ) {
      $scope.configSections = ['bakeConfig', 'taskStatus'];

      const initialized = () => {
        $scope.detailsSection = $stateParams.details;
        $scope.provider = $scope.stage.context.cloudProviderType || 'aws';
        $scope.roscoMode =
          SETTINGS.feature.roscoMode ||
          (typeof SETTINGS.feature.roscoSelector === 'function' &&
            SETTINGS.feature.roscoSelector($scope.stage.context));
        $scope.bakeryDetailUrl = $interpolate(
          $scope.roscoMode && SETTINGS.roscoDetailUrl ? SETTINGS.roscoDetailUrl : SETTINGS.bakeryDetailUrl,
        );
        $scope.bakeFailedNoError =
          get($scope.stage, 'context.status.result') === 'FAILURE' && !$scope.stage.failureMessage;
      };

      const initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

      initialize();

      $scope.$on('$stateChangeSuccess', initialize);
    },
  ],
);
