import { module } from 'angular';
import type { IScope } from 'angular';

import { get } from 'lodash';
import type { Application } from '@spinnaker/core';
import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

export const AMAZON_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER =
  'spinnaker.amazon.serverGroup.details.rollback.controller';
export const name = AMAZON_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER; // for backwards compatibility

interface IAWSRollbackServerGroupScope extends IScope {
  serverGroup: any;
  disabledServerGroups: any[];
  allServerGroups: any[];
  verification: any;
  command: any;
  taskMonitor: TaskMonitor;
  previousServerGroup?: any;
  minHealthy: (percent: number) => number;
}

module(AMAZON_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER, [SERVER_GROUP_WRITER]).controller(
  'awsRollbackServerGroupCtrl',
  [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriter',
    'application',
    'serverGroup',
    'previousServerGroup',
    'disabledServerGroups',
    'allServerGroups',
    function (
      $scope: IAWSRollbackServerGroupScope,
      $uibModalInstance: any,
      serverGroupWriter: any,
      application: Application,
      serverGroup: any,
      previousServerGroup: any,
      disabledServerGroups: any[],
      allServerGroups: any[],
    ) {
      $scope.serverGroup = serverGroup;
      $scope.disabledServerGroups = disabledServerGroups.sort((a, b) => b.name.localeCompare(a.name));
      $scope.allServerGroups = allServerGroups.sort((a, b) => b.name.localeCompare(a.name));
      $scope.verification = {};

      const desired = serverGroup.capacity.desired;

      let rollbackType = 'EXPLICIT';

      if (allServerGroups.length === 0 && serverGroup.entityTags) {
        const previousServerGroupData = get(serverGroup, 'entityTags.creationMetadata.value.previousServerGroup');
        if (previousServerGroupData) {
          rollbackType = 'PREVIOUS_IMAGE';
          $scope.previousServerGroup = {
            name: (previousServerGroupData as any).name,
            imageName: (previousServerGroupData as any).imageName,
          };

          if (
            (previousServerGroupData as any).imageId &&
            (previousServerGroupData as any).imageId !== (previousServerGroupData as any).imageName
          ) {
            $scope.previousServerGroup.imageId = (previousServerGroupData as any).imageId;
          }

          const buildNumber = get(previousServerGroupData, 'buildInfo.jenkins.number');
          if (buildNumber) {
            $scope.previousServerGroup.buildNumber = buildNumber;
          }
        }
      }

      let healthyPercent: number;
      if (desired < 10) {
        healthyPercent = 100;
      } else if (desired < 20) {
        healthyPercent = 90;
      } else {
        healthyPercent = 95;
      }

      $scope.command = {
        rollbackType: rollbackType,
        rollbackContext: {
          rollbackServerGroupName: serverGroup.name,
          restoreServerGroupName: previousServerGroup ? previousServerGroup.name : undefined,
          targetHealthyRollbackPercentage: healthyPercent,
          delayBeforeDisableSeconds: 0,
        },
      };

      $scope.minHealthy = function (percent: number) {
        return Math.ceil((desired * percent) / 100);
      };

      if (application && application.attributes) {
        if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
          $scope.command.interestingHealthProviderNames = ['Amazon'];
        }

        $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
      }

      this.isValid = function () {
        const command = $scope.command;
        if (!$scope.verification.verified) {
          return false;
        }

        if (rollbackType === 'PREVIOUS_IMAGE') {
          return true;
        }

        return command.rollbackContext.restoreServerGroupName !== undefined;
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Rollback ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.rollback = function () {
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

      this.label = function (serverGroup: any) {
        if (!serverGroup) {
          return '';
        }

        if (!serverGroup.buildInfo || !serverGroup.buildInfo.jenkins || !serverGroup.buildInfo.jenkins.number) {
          return serverGroup.name;
        }

        return serverGroup.name + ' (build #' + serverGroup.buildInfo.jenkins.number + ')';
      };

      this.group = function (serverGroup: any) {
        return serverGroup.isDisabled ? 'Disabled Server Groups' : 'Enabled Server Groups';
      };
    },
  ],
);
