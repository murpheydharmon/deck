import * as angular from 'angular';
import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry } from '@spinnaker/core';

export const AMAZON_PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE = 'spinnaker.amazon.pipeline.stage.findAmiStage';
export const name = AMAZON_PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE; // for backwards compatibility

interface IAwsFindAmiScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
  selectionStrategies: Array<{
    label: string;
    val: string;
    description: string;
  }>;
  accountUpdated: () => void;
}

module(AMAZON_PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'findImage',
      alias: 'findAmi',
      cloudProvider: 'aws',
      templateUrl: require('./findAmiStage.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'selectionStrategy', fieldLabel: 'Server Group Selection' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials' },
      ],
    } as any);
  })
  .controller('awsFindAmiStageCtrl', [
    '$scope',
    function ($scope: IAwsFindAmiScope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('aws').then(function (accounts: any[]) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.selectionStrategies = [
        {
          label: 'Largest',
          val: 'LARGEST',
          description: 'When multiple server groups exist, prefer the server group with the most instances',
        },
        {
          label: 'Newest',
          val: 'NEWEST',
          description: 'When multiple server groups exist, prefer the newest',
        },
        {
          label: 'Oldest',
          val: 'OLDEST',
          description: 'When multiple server groups exist, prefer the oldest',
        },
        {
          label: 'Fail',
          val: 'FAIL',
          description: 'When multiple server groups exist, fail',
        },
      ];

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'aws';
      stage.selectionStrategy = stage.selectionStrategy || $scope.selectionStrategies[0].val;

      if (angular.isUndefined(stage.onlyEnabled)) {
        stage.onlyEnabled = true;
      }
      if (!stage.credentials && $scope.application.defaultCredentials.aws) {
        stage.credentials = $scope.application.defaultCredentials.aws;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.aws) {
        stage.regions.push($scope.application.defaultRegions.aws);
      }

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
