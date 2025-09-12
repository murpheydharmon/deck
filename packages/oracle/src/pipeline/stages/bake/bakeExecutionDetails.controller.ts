import { module } from 'angular';
import type { IScope } from 'angular';

export const ORACLE_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER =
  'spinnaker.oracle.pipeline.stage.bake.executionDetails.controller';
export const name = ORACLE_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER; // for backwards compatibility

interface IOracleBakeExecutionDetailsScope extends IScope {
  configSections: string[];
  detailsSection: string;
  provider: string;
  roscoMode: boolean;
  stage: any;
}

module(ORACLE_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER, []).controller('oracleBakeExecutionDetailsCtrl', [
  '$scope',
  function ($scope: IOracleBakeExecutionDetailsScope) {
    $scope.configSections = ['bakeConfig', 'taskStatus'];
    $scope.detailsSection = $scope.configSections[0];
    $scope.provider = 'oracle';
    $scope.roscoMode = true;

    // ExecutionDetailsTasks.updateScope($scope as any);
  },
]);
