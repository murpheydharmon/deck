import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const AMAZON_PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE =
  'spinnaker.amazon.pipeline.stage.aws.destroyAsgStage';
export const name = AMAZON_PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE; // for backwards compatibility

interface IAwsDestroyAsgScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
  regions: string[];
  targets: any[];
}

module(AMAZON_PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'destroyServerGroup',
      alias: 'destroyAsg',
      cloudProvider: 'aws',
      templateUrl: require('./destroyAsgStage.html'),
      executionStepLabelUrl: require('./destroyAsgStepLabel.html'),
      accountExtractor: (stage: any) => [stage.context.credentials],
      configAccountExtractor: (stage: any) => [stage.credentials],
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to destroy a server group without deploying a new version into the same cluster.',
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    } as any);
  })
  .controller('awsDestroyAsgStageCtrl', [
    '$scope',
    function ($scope: IAwsDestroyAsgScope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('aws').then(function (accounts: any[]) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'us-west-2'];

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'aws';

      if (!stage.credentials && $scope.application.defaultCredentials.aws) {
        stage.credentials = $scope.application.defaultCredentials.aws;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.aws) {
        stage.regions.push($scope.application.defaultRegions.aws);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
