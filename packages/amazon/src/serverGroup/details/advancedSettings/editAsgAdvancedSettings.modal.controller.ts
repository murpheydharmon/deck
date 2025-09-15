import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { TaskExecutor, TaskMonitor } from '@spinnaker/core';
import { AMAZON_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE } from '../../configure/serverGroupCommandBuilder.service';

export const AMAZON_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER =
  'spinnaker.amazon.serverGroup.editAsgAdvancedSettings.modal.controller';
export const name = AMAZON_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER; // for backwards compatibility

interface IEditAsgAdvancedSettingsScope extends IScope {
  command: any;
  serverGroup: any;
  taskMonitor: TaskMonitor;
}

module(AMAZON_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER, [
  AMAZON_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE,
]).controller('EditAsgAdvancedSettingsCtrl', [
  '$scope',
  '$uibModalInstance',
  'application',
  'serverGroup',
  'awsServerGroupCommandBuilder',
  function (
    $scope: IEditAsgAdvancedSettingsScope,
    $uibModalInstance: any,
    application: Application,
    serverGroup: any,
    awsServerGroupCommandBuilder: any,
  ) {
    $scope.command = awsServerGroupCommandBuilder.buildUpdateServerGroupCommand(serverGroup);

    $scope.serverGroup = serverGroup;

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Update Advanced Settings for ' + serverGroup.name,
      modalInstance: $uibModalInstance,
      onTaskComplete: () => application.serverGroups.refresh(),
    });

    this.submit = () => {
      const job = [$scope.command];

      const submitMethod = function () {
        return TaskExecutor.executeTask({
          job: job,
          application: application,
          description: 'Update Advanced Settings for ' + serverGroup.name,
        });
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = $uibModalInstance.dismiss;
  },
]);
