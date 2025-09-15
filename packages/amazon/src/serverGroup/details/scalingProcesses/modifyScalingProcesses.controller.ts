import * as angular from 'angular';
import { module } from 'angular';
import type { IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { TaskExecutor, TaskMonitor } from '@spinnaker/core';

export const AMAZON_SERVERGROUP_DETAILS_SCALINGPROCESSES_MODIFYSCALINGPROCESSES_CONTROLLER =
  'spinnaker.amazon.serverGroup.details.autoscaling.process.controller';
export const name = AMAZON_SERVERGROUP_DETAILS_SCALINGPROCESSES_MODIFYSCALINGPROCESSES_CONTROLLER; // for backwards compatibility

interface IModifyScalingProcessesScope extends IScope {
  command: any;
  serverGroup: any;
  verification: any;
  taskMonitor: TaskMonitor;
}

module(AMAZON_SERVERGROUP_DETAILS_SCALINGPROCESSES_MODIFYSCALINGPROCESSES_CONTROLLER, []).controller(
  'ModifyScalingProcessesCtrl',
  [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    'processes',
    function (
      $scope: IModifyScalingProcessesScope,
      $uibModalInstance: any,
      application: Application,
      serverGroup: any,
      processes: any,
    ) {
      $scope.command = angular.copy(processes);
      $scope.serverGroup = serverGroup;
      $scope.verification = {};

      this.isValid = function () {
        if (!$scope.verification.verified) {
          return false;
        }
        return this.isDirty();
      };

      const currentlyEnabled = _.chain($scope.command).filter({ enabled: true }).map('name').value();
      const currentlySuspended = _.chain($scope.command).filter({ enabled: false }).map('name').value();

      this.isDirty = function () {
        const enabledSelections = _.chain($scope.command).filter({ enabled: true }).map('name').value();
        const suspendedSelections = _.chain($scope.command).filter({ enabled: false }).map('name').value();
        const toEnable = _.intersection(currentlySuspended, enabledSelections);
        const toSuspend = _.intersection(currentlyEnabled, suspendedSelections);

        return !!(toEnable.length || toSuspend.length);
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Auto Scaling Processes for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.submit = function () {
        const enabledSelections = _.chain($scope.command).filter({ enabled: true }).map('name').value();
        const suspendedSelections = _.chain($scope.command).filter({ enabled: false }).map('name').value();
        const toEnable = _.intersection(currentlySuspended, enabledSelections);
        const toSuspend = _.intersection(currentlyEnabled, suspendedSelections);

        const job: any[] = [];
        if (toEnable.length) {
          job.push({
            type: 'modifyScalingProcess',
            action: 'resume',
            processes: toEnable,
            asgName: serverGroup.name,
            regions: [serverGroup.region],
            credentials: serverGroup.account,
            cloudProvider: 'aws',
            reason: $scope.command.reason,
          });
        }
        if (toSuspend.length) {
          job.push({
            type: 'modifyScalingProcess',
            action: 'suspend',
            processes: toSuspend,
            asgName: serverGroup.name,
            regions: [serverGroup.region],
            credentials: serverGroup.account,
            cloudProvider: 'aws',
            reason: $scope.command.reason,
          });
        }

        const submitMethod = function () {
          return TaskExecutor.executeTask({
            job: job,
            application: application,
            description: 'Update Auto Scaling Processes for ' + serverGroup.name,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ],
);
