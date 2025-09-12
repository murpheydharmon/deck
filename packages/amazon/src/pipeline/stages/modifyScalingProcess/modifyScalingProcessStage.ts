import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const AMAZON_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE =
  'spinnaker.amazon.pipeline.stage.modifyScalingProcessStage';
export const name = AMAZON_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE; // for backwards compatibility

interface IModifyScalingProcessScope extends IScope {
  stage: any;
  application: Application;
  accounts: any[];
  state: {
    accounts: boolean;
    regionsLoaded: boolean;
  };
  targets: any[];
  actions: Array<{
    label: string;
    val: string;
  }>;
  processes: string[];
  toggleProcess: (process: string) => void;
  accountUpdated: () => void;
}

module(AMAZON_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE, [])
  .config(function () {
    Registry.pipeline.registerStage({
      label: 'Modify Scaling Process',
      description: 'Suspend/Resume Scaling Processes',
      key: 'modifyAwsScalingProcess',
      alias: 'modifyScalingProcess',
      controller: 'ModifyScalingProcessStageCtrl',
      templateUrl: require('./modifyScalingProcessStage.html'),
      executionDetailsUrl: require('./modifyScalingProcessExecutionDetails.html'),
      executionConfigSections: ['modifyScalingProcessesConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'action' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'processes' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
      cloudProvider: 'aws',
      strategy: true,
    } as any);
  })
  .controller('ModifyScalingProcessStageCtrl', [
    '$scope',
    'stage',
    function ($scope: IModifyScalingProcessScope, stage: any) {
      $scope.stage = stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('aws').then(function (accounts: any[]) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.targets = StageConstants.TARGET_LIST;

      $scope.actions = [
        {
          label: 'Suspend',
          val: 'suspend',
        },
        {
          label: 'Resume',
          val: 'resume',
        },
      ];
      $scope.processes = [
        'Launch',
        'Terminate',
        'AddToLoadBalancer',
        'AlarmNotification',
        'AZRebalance',
        'HealthCheck',
        'ReplaceUnhealthy',
        'ScheduledActions',
      ];

      stage.processes = stage.processes || [];
      stage.regions = stage.regions || [];
      stage.action = stage.action || $scope.actions[0].val;
      stage.target = stage.target || $scope.targets[0].val;
      stage.cloudProvider = 'aws';

      if (!stage.credentials && $scope.application.defaultCredentials.aws) {
        stage.credentials = $scope.application.defaultCredentials.aws;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.aws) {
        stage.regions.push($scope.application.defaultRegions.aws);
      }

      $scope.toggleProcess = function (process: string) {
        if (!stage.processes) {
          stage.processes = [];
        }
        const idx = stage.processes.indexOf(process);
        if (idx > -1) {
          stage.processes.splice(idx, 1);
        } else {
          stage.processes.push(process);
        }
      };

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
