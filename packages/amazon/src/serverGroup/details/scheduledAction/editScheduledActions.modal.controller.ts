import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { TaskExecutor, TaskMonitor } from '@spinnaker/core';

export const AMAZON_SERVERGROUP_DETAILS_SCHEDULEDACTION_EDITSCHEDULEDACTIONS_MODAL_CONTROLLER =
  'spinnaker.amazon.serverGroup.details.scheduledActions.editScheduledActions.modal.controller';
export const name = AMAZON_SERVERGROUP_DETAILS_SCHEDULEDACTION_EDITSCHEDULEDACTIONS_MODAL_CONTROLLER; // for backwards compatibility

interface IEditScheduledActionsScope extends IScope {
  command: any;
  serverGroup: any;
  taskMonitor: TaskMonitor;
}

module(AMAZON_SERVERGROUP_DETAILS_SCHEDULEDACTION_EDITSCHEDULEDACTIONS_MODAL_CONTROLLER, []).controller(
  'EditScheduledActionsCtrl',
  [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    function ($scope: IEditScheduledActionsScope, $uibModalInstance: any, application: Application, serverGroup: any) {
      $scope.command = {
        scheduledActions: serverGroup.scheduledActions.map((action: any) => {
          return {
            recurrence: action.recurrence,
            minSize: action.minSize,
            maxSize: action.maxSize,
            desiredCapacity: action.desiredCapacity,
          };
        }),
      };

      $scope.serverGroup = serverGroup;

      this.addScheduledAction = () => {
        $scope.command.scheduledActions.push({});
      };

      this.removeScheduledAction = (index: number) => {
        $scope.command.scheduledActions.splice(index, 1);
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Scheduled Actions for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.submit = () => {
        const job = [
          {
            type: 'upsertAsgScheduledActions',
            asgs: [{ asgName: serverGroup.name, region: serverGroup.region }],
            scheduledActions: $scope.command.scheduledActions,
            credentials: serverGroup.account,
          },
        ];

        const submitMethod = function () {
          return TaskExecutor.executeTask({
            job: job,
            application: application,
            description: 'Update Scheduled Actions for ' + serverGroup.name,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ],
);
