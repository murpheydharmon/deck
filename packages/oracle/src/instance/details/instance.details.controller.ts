import { module } from 'angular';
import type { IScope } from 'angular';
import * as angular from 'angular';

import { ConfirmationModalService, InstanceReader, RecentHistoryService, SETTINGS } from '@spinnaker/core';

export const ORACLE_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER = 'spinnaker.oracle.instance.details.controller';
export const name = ORACLE_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER; // for backwards compatibility

interface IOracleInstanceDetailsScope extends IScope {
  state: any;
  instance: any;
}

module(ORACLE_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER, []).controller('oracleInstanceDetailsCtrl', [
  '$scope',
  '$state',
  'instanceWriter',
  'instance',
  'app',
  function ($scope: IOracleInstanceDetailsScope, $state: any, instanceWriter: any, instance: any, app: any) {
    $scope.state = {
      loading: true,
      standalone: app.isStandalone,
    };

    $scope.instance = instance;

    this.uiLink = function uiLink() {
      return SETTINGS.gateUrl + '/applications/' + instance.application + '/instances/' + instance.instanceId;
    };

    this.terminateInstance = function terminateInstance() {
      const taskMonitor = {
        application: app,
        title: 'Terminating ' + instance.instanceId,
        onTaskComplete: function () {
          if ($state.includes('**.instanceDetails', { instanceId: instance.instanceId })) {
            $state.go('^');
          }
        },
      };

      const submitMethod = function () {
        return instanceWriter.terminateInstance(instance, app);
      };

      ConfirmationModalService.confirm({
        header: 'Really terminate ' + instance.instanceId + '?',
        buttonText: 'Terminate ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.rebootInstance = function rebootInstance() {
      const taskMonitor = {
        application: app,
        title: 'Rebooting ' + instance.instanceId,
      };

      const submitMethod = function () {
        return instanceWriter.rebootInstance(instance, app);
      };

      ConfirmationModalService.confirm({
        header: 'Really reboot ' + instance.instanceId + '?',
        buttonText: 'Reboot ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    const retrieveInstance = () => {
      const extraData: any = {};
      let instanceSummary: any, account: any, region: any;
      if (!app.serverGroups) {
        instanceSummary = {};
        account = instance.account;
        region = instance.region;
      } else {
        app.serverGroups.data.some((serverGroup: any) => {
          return serverGroup.instances.some((possibleInstance: any) => {
            if (possibleInstance.id === instance.instanceId) {
              instanceSummary = possibleInstance;
              account = serverGroup.account;
              region = serverGroup.region;
              extraData.serverGroup = serverGroup.name;
              return true;
            }
            return false;
          });
        });
        if (!instanceSummary) {
          instanceSummary = {};
          account = instance.account;
          region = instance.region;
        }
      }

      if (instanceSummary.health) {
        instanceSummary.health = instanceSummary.health.filter((health: any) => health.state !== 'Unknown');
      }

      angular.extend(instance, instanceSummary, extraData);

      InstanceReader.getInstanceDetails(account, region, instance.instanceId).then((details: any) => {
        angular.extend(instance, details);
        $scope.state.loading = false;
      });
    };

    retrieveInstance();

    app.registerAutoRefreshHandler(retrieveInstance, $scope);

    RecentHistoryService.addExtraDataToLatest('instances', {
      instanceId: instance.instanceId,
      account: instance.account,
      region: instance.region,
    });
  },
]);
