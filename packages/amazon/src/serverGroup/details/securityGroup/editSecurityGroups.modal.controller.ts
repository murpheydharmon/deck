import { module } from 'angular';
import type { IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { FirewallLabels, SECURITY_GROUP_READER, SERVER_GROUP_WRITER } from '@spinnaker/core';
import { TaskMonitor } from '@spinnaker/core';

export const AMAZON_SERVERGROUP_DETAILS_SECURITYGROUP_EDITSECURITYGROUPS_MODAL_CONTROLLER =
  'spinnaker.amazon.serverGroup.details.securityGroup.editSecurityGroups.modal.controller';
export const name = AMAZON_SERVERGROUP_DETAILS_SECURITYGROUP_EDITSECURITYGROUPS_MODAL_CONTROLLER; // for backwards compatibility

interface IEditSecurityGroupsScope extends IScope {}

module(AMAZON_SERVERGROUP_DETAILS_SECURITYGROUP_EDITSECURITYGROUPS_MODAL_CONTROLLER, [
  SERVER_GROUP_WRITER,
  SECURITY_GROUP_READER,
]).controller('EditSecurityGroupsCtrl', [
  '$scope',
  '$uibModalInstance',
  'serverGroupWriter',
  'securityGroupReader',
  'application',
  'serverGroup',
  'securityGroups',
  function (
    $scope: IEditSecurityGroupsScope,
    $uibModalInstance: any,
    serverGroupWriter: any,
    securityGroupReader: any,
    application: Application,
    serverGroup: any,
    securityGroups: any,
  ) {
    this.command = {
      securityGroups: (securityGroups || []).slice(0).sort((a: any, b: any) => a.name.localeCompare(b.name)),
    };

    this.state = {
      securityGroupsLoaded: false,
      submitting: false,
      verification: {},
    };

    this.infiniteScroll = {
      currentItems: 20,
    };

    this.addMoreItems = () => (this.infiniteScroll.currentItems += 20);

    this.resetCurrentItems = () => (this.infiniteScroll.currentItems = 20);

    this.isValid = () => this.state.verification.verified;

    securityGroupReader.getAllSecurityGroups().then((allGroups: any) => {
      const account = serverGroup.account;
      const region = serverGroup.region;
      const vpcId = serverGroup.vpcId;
      this.availableSecurityGroups = _.get(allGroups, [account, 'aws', region].join('.'), [])
        .filter((group: any) => group.vpcId === vpcId)
        .sort((a: any, b: any) => {
          if (this.command.securityGroups.some((g: any) => g.id === a.id)) {
            return -1;
          }
          if (this.command.securityGroups.some((g: any) => g.id === b.id)) {
            return 1;
          }
          return a.name.localeCompare(b.name);
        });
      this.state.securityGroupsLoaded = true;
    });

    this.serverGroup = serverGroup;

    this.taskMonitor = new TaskMonitor({
      application: application,
      title: `Update ${FirewallLabels.get('Firewalls')} for ${serverGroup.name}`,
      modalInstance: $uibModalInstance,
      onTaskComplete: () => application.serverGroups.refresh(),
    });

    this.submit = () => {
      const submitMethod = () => {
        this.state.submitting = true;
        const hasLaunchTemplate = Boolean(serverGroup.launchTemplate);
        return serverGroupWriter.updateSecurityGroups(
          serverGroup,
          this.command.securityGroups,
          application,
          hasLaunchTemplate,
        );
      };

      this.taskMonitor.submit(submitMethod);
    };

    this.cancel = $uibModalInstance.dismiss;
  },
]);
