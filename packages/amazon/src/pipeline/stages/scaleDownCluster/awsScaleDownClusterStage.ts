import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry } from '@spinnaker/core';

export const AMAZON_PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE =
  'spinnaker.amazon.pipeline.stage.scaleDownClusterStage';
export const name = AMAZON_PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE; // for backwards compatibility

interface IAwsScaleDownClusterScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
}

module(AMAZON_PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'scaleDownCluster',
      cloudProvider: 'aws',
      templateUrl: require('./scaleDownClusterStage.html'),
      accountExtractor: (stage: any) => [stage.context.credentials],
      configAccountExtractor: (stage: any) => [stage.credentials],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        {
          type: 'requiredField',
          fieldName: 'remainingFullSizeServerGroups',
          fieldLabel: 'Keep [X] full size Server Groups',
        },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
      strategy: true,
    } as any);
  })
  .controller('awsScaleDownClusterStageCtrl', [
    '$scope',
    function ($scope: IAwsScaleDownClusterScope) {
      const ctrl = this;

      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('aws').then(function (accounts: any[]) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'aws';

      if (!stage.credentials && $scope.application.defaultCredentials.aws) {
        stage.credentials = $scope.application.defaultCredentials.aws;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.aws) {
        stage.regions.push($scope.application.defaultRegions.aws);
      }

      if (stage.remainingFullSizeServerGroups === undefined) {
        stage.remainingFullSizeServerGroups = 1;
      }

      if (stage.allowScaleDownActive === undefined) {
        stage.allowScaleDownActive = false;
      }

      ctrl.pluralize = function (str: string, val: number) {
        if (val === 1) {
          return str;
        }
        return str + 's';
      };

      if (stage.preferLargerOverNewer === undefined) {
        stage.preferLargerOverNewer = 'false';
      }
      stage.preferLargerOverNewer = stage.preferLargerOverNewer.toString();
    },
  ]);
