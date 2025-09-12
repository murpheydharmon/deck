import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';
import { ORACLE_COMMON_FOOTER_COMPONENT } from '../../../common/footer.component';

export const ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER =
  'spinnaker.oracle.serverGroup.details.rollback.controller';
export const name = ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER; // for backwards compatibility

interface IOracleRollbackScope extends IScope {
  serverGroup: any;
  disabledServerGroups: any[];
  verification: any;
  command: any;
  taskMonitor: TaskMonitor;
}

module(ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER, [
  SERVER_GROUP_WRITER,
  ORACLE_COMMON_FOOTER_COMPONENT,
]).controller('oracleRollbackServerGroupCtrl', [
  '$scope',
  '$uibModalInstance',
  'serverGroupWriter',
  'application',
  'serverGroup',
  'disabledServerGroups',
  function (
    $scope: IOracleRollbackScope,
    $uibModalInstance: any,
    serverGroupWriter: any,
    application: Application,
    serverGroup: any,
    disabledServerGroups: any[],
  ) {
    $scope.serverGroup = serverGroup;
    $scope.disabledServerGroups = disabledServerGroups.sort((a: any, b: any) => b.name.localeCompare(a.name));
    $scope.verification = {};

    $scope.command = {
      rollbackType: 'EXPLICIT',
      rollbackContext: {
        rollbackServerGroupName: serverGroup.name,
      },
    };

    if (application && application.attributes) {
      if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
        $scope.command.interestingHealthProviderNames = ['Oracle'];
      }

      $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
    }

    this.isValid = function () {
      const command = $scope.command;
      if (!$scope.verification.verified) {
        return false;
      }

      return command.rollbackContext.restoreServerGroupName !== undefined;
    };

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Rollback ' + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.rollback = function () {
      this.submitting = true;
      if (!this.isValid()) {
        return;
      }

      const submitMethod = function () {
        return serverGroupWriter.rollbackServerGroup(serverGroup, application, $scope.command);
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
