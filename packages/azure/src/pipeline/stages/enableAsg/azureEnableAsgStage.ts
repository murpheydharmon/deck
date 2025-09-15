import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const AZURE_PIPELINE_STAGES_ENABLEASG_AZUREENABLEASGSTAGE = 'spinnaker.azure.pipeline.stage.enableAsgStage';
export const name = AZURE_PIPELINE_STAGES_ENABLEASG_AZUREENABLEASGSTAGE; // for backwards compatibility

interface IAzureEnableAsgScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
  targets: any[];
  accountUpdated: () => void;
}

module(AZURE_PIPELINE_STAGES_ENABLEASG_AZUREENABLEASGSTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'enableServerGroup',
      alias: 'enableAsg',
      cloudProvider: 'azure',
      templateUrl: require('./enableAsgStage.html'),
      executionStepLabelUrl: require('./enableAsgStepLabel.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    } as any);
  })
  .controller('azureEnableAsgStageCtrl', [
    '$scope',
    function ($scope: IAzureEnableAsgScope) {
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

      ctrl.reset = () => {
        ctrl.accountUpdated();
        ctrl.resetSelectedCluster();
      };

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'azure';

      if (stage.isNew) {
        stage.interestingHealthProviderNames = [];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.azure) {
        stage.credentials = $scope.application.defaultCredentials.azure;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.azure) {
        stage.regions.push($scope.application.defaultRegions.azure);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
