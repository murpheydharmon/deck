import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import type { StateService } from '@uirouter/core';
import { module } from 'angular';
import type { IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import {
  ConfirmationModalService,
  NetworkReader,
  SERVER_GROUP_WRITER,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SubnetReader,
} from '@spinnaker/core';

import { ORACLE_IMAGE_IMAGE_READER } from '../../image/image.reader';
import { ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER } from './resize/resizeServerGroup.controller';
import { ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER } from './rollback/rollbackServerGroup.controller';

export const ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER =
  'spinnaker.oracle.serverGroup.details.controller';
export const name = ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER; // for backwards compatibility

interface IOracleServerGroupDetailsScope extends IScope {
  $$destroyed: boolean;
}

module(ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER, [
  UIROUTER_ANGULARJS,
  SERVER_GROUP_WRITER,
  ORACLE_IMAGE_IMAGE_READER,
  ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER,
  ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER,
]).controller('oracleServerGroupDetailsCtrl', [
  '$scope',
  '$state',
  '$uibModal',
  'app',
  'serverGroup',
  'serverGroupWriter',
  'oracleImageReader',
  function (
    $scope: IOracleServerGroupDetailsScope,
    $state: StateService,
    $uibModal: any,
    app: Application,
    serverGroup: any,
    serverGroupWriter: any,
    oracleImageReader: any,
  ) {
    const provider = 'oracle';

    this.application = app;
    this.serverGroup = serverGroup;

    this.state = {
      loading: true,
    };

    const retrieveServerGroup = () => {
      return ServerGroupReader.getServerGroup(
        app.name,
        serverGroup.accountId,
        serverGroup.region,
        serverGroup.name,
      ).then((details: any) => {
        cancelLoader();
        details.account = serverGroup.accountId;
        this.serverGroup = details;
        retrieveNetwork();
        retrieveSubnet();
        retrieveImage();
      });
    };

    const retrieveNetwork = () => {
      NetworkReader.listNetworksByProvider(provider).then((networks: any[]) => {
        this.serverGroup.network = _.chain(networks)
          .filter({ account: this.serverGroup.account, id: this.serverGroup.launchConfig.vpcId })
          .head()
          .value() as any;
      });
    };

    const retrieveSubnet = () => {
      SubnetReader.getSubnetByIdAndProvider(this.serverGroup.launchConfig.subnetId, provider).then((subnet: any) => {
        this.serverGroup.subnet = subnet;
      });
    };

    const retrieveImage = () => {
      oracleImageReader
        .getImage(this.serverGroup.launchConfig.imageId, this.serverGroup.region, this.serverGroup.account)
        .then((image: any) => {
          if (!image) {
            image = { id: this.serverGroup.launchConfig.imageId, name: this.serverGroup.launchConfig.imageId };
          }
          this.serverGroup.image = image;
        });
    };

    this.destroyServerGroup = function destroyServerGroup() {
      const serverGroup = this.serverGroup;
      const taskMonitor = {
        application: app,
        title: 'Destroying ' + serverGroup.name,
        onTaskComplete: function () {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
      };

      const submitMethod = function () {
        return serverGroupWriter.destroyServerGroup(serverGroup, app);
      };

      const stateParams = {
        name: serverGroup.name,
        account: serverGroup.account,
        region: serverGroup.region,
      };

      ConfirmationModalService.confirm({
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.resizeServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./resize/resizeServerGroup.html'),
        controller: 'oracleResizeServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => {
            return this.serverGroup;
          },
          application: () => {
            return app;
          },
        },
      });
    };

    this.rollbackServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./rollback/rollbackServerGroup.html'),
        controller: 'oracleRollbackServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => this.serverGroup,
          disabledServerGroups: () => {
            const sgSummary = _.find(app.serverGroups.data, {
              name: this.serverGroup.name,
              account: this.serverGroup.account,
              region: this.serverGroup.region,
            });
            if (!sgSummary) return [];
            const cluster = _.find(app.clusters, {
              name: (sgSummary as any).cluster,
              account: this.serverGroup.account,
            });
            if (!cluster) return [];
            return _.filter(cluster.serverGroups, { isDisabled: true, region: this.serverGroup.region });
          },
          application: () => app,
        },
      });
    };

    this.disableServerGroup = () => {
      const serverGroup = this.serverGroup;

      const taskMonitor = {
        application: app,
        title: 'Disabling ' + serverGroup.name,
      };

      const submitMethod = (params: any) => serverGroupWriter.disableServerGroup(serverGroup, app, params);

      const confirmationModalParams: any = {
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Oracle',
        submitMethod: submitMethod,
        askForReason: true,
      };

      ServerGroupWarningMessageService.addDisableWarningMessage(app, serverGroup, confirmationModalParams);

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Oracle'];
      }

      ConfirmationModalService.confirm(confirmationModalParams);
    };

    this.enableServerGroup = () => {
      const serverGroup = this.serverGroup;

      const taskMonitor = {
        application: app,
        title: 'Enabling ' + serverGroup.name,
      };

      const submitMethod = (params: any) => serverGroupWriter.enableServerGroup(serverGroup, app, params);

      const confirmationModalParams: any = {
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Oracle',
        submitMethod: submitMethod,
        askForReason: true,
      };

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Oracle'];
      }

      ConfirmationModalService.confirm(confirmationModalParams);
    };

    const cancelLoader = () => {
      this.state.loading = false;
    };

    retrieveServerGroup().then(() => {
      if (!$scope.$$destroyed) {
        app.serverGroups.onRefresh($scope, retrieveServerGroup);
      }
    });
  },
]);
