import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { TaskMonitor } from '@spinnaker/core';

export const ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CLONESERVERGROUP_CONTROLLER =
  'spinnaker.oracle.serverGroup.configure.wizard.cloneServerGroup.controller';
export const name = ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CLONESERVERGROUP_CONTROLLER; // for backwards compatibility

interface IOracleCloneServerGroupScope extends IScope {
  command: any;
  taskMonitor: TaskMonitor;
}

module(ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CLONESERVERGROUP_CONTROLLER, []).controller('oracleCloneServerGroupCtrl', [
  '$scope',
  '$uibModalInstance',
  'serverGroupWriter',
  'application',
  'serverGroup',
  'mode',
  function (
    $scope: IOracleCloneServerGroupScope,
    $uibModalInstance: any,
    serverGroupWriter: any,
    application: Application,
    serverGroup: any,
    mode: string,
  ) {
    $scope.command = serverGroup;

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: (mode === 'clone' ? 'Cloning ' : 'Creating ') + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.submit = function () {
      const submitMethod = function () {
        return serverGroupWriter.cloneServerGroup(serverGroup, application);
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
