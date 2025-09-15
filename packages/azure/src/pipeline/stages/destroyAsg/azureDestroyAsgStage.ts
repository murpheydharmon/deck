import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const AZURE_PIPELINE_STAGES_DESTROYASG_AZUREDESTROYASGSTAGE = 'spinnaker.azure.pipeline.stage.destroyAsgStage';
export const name = AZURE_PIPELINE_STAGES_DESTROYASG_AZUREDESTROYASGSTAGE; // for backwards compatibility

interface IAzureDestroyAsgScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
  targets: any[];
}

module(AZURE_PIPELINE_STAGES_DESTROYASG_AZUREDESTROYASGSTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'destroyServerGroup',
      cloudProvider: 'azure',
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
  .controller('azureDestroyAsgStageCtrl', [
    '$scope',
    function ($scope: IAzureDestroyAsgScope) {
      const ctrl = this;

      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('azure').then(function (accounts: any[]) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.accountUpdated = function () {
        AccountService.getAccountDetails(stage.credentials).then(function (details: any) {
          stage.regions = [details.org];
        });
      };

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'azure';

      stage.interestingHealthProviderNames = [];

      if (!stage.credentials && $scope.application.defaultCredentials.azure) {
        stage.credentials = $scope.application.defaultCredentials.azure;
      }

      if (stage.credentials) {
        ctrl.accountUpdated();
      }
      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
