import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';
import { ORACLE_COMMON_FOOTER_COMPONENT } from '../../../common/footer.component';
import { ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZECAPACITY_COMPONENT } from './resizeCapacity.component';

export const ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER =
  'spinnaker.oracle.serverGroup.details.resize.controller';
export const name = ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER; // for backwards compatibility

interface IOracleResizeScope extends IScope {
  command: any;
  currentSize: any;
  taskMonitor: TaskMonitor;
}

module(ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER, [
  SERVER_GROUP_WRITER,
  ORACLE_COMMON_FOOTER_COMPONENT,
  ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZECAPACITY_COMPONENT,
]).controller('oracleResizeServerGroupCtrl', [
  '$scope',
  '$uibModalInstance',
  'serverGroupWriter',
  'application',
  'serverGroup',
  function (
    $scope: IOracleResizeScope,
    $uibModalInstance: any,
    serverGroupWriter: any,
    application: Application,
    serverGroup: any,
  ) {
    $scope.currentSize = {
      min: serverGroup.capacity.min,
      max: serverGroup.capacity.max,
      desired: serverGroup.capacity.desired,
    };

    $scope.command = {
      capacity: {
        min: serverGroup.capacity.min,
        max: serverGroup.capacity.max,
        desired: serverGroup.capacity.desired,
      },
      serverGroupName: serverGroup.name,
      account: serverGroup.account,
      region: serverGroup.region,
      interestingHealthProviderNames: [],
    };

    if (application && application.attributes) {
      if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
        $scope.command.interestingHealthProviderNames = ['Oracle'];
      }
    }

    this.isValid = function () {
      const command = $scope.command;
      return command.capacity.desired !== null && command.capacity.desired >= 0;
    };

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Resizing ' + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.resize = function () {
      this.submitting = true;
      if (!this.isValid()) {
        return;
      }

      const submitMethod = function () {
        return serverGroupWriter.resizeServerGroup(serverGroup, application, $scope.command);
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
