import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import * as angular from 'angular';
import type { IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { FirewallLabels, SecurityGroupWriter, TaskMonitor } from '@spinnaker/core';

export const AMAZON_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL = 'spinnaker.amazon.securityGroup.edit.controller';
export const name = AMAZON_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL; // for backwards compatibility

interface IAWSEditSecurityGroupScope extends IScope {
  self: any;
  pages: any;
  securityGroup: any;
  state: any;
  taskMonitor: TaskMonitor;
}

angular
  .module(AMAZON_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL, [UIROUTER_ANGULARJS])
  .controller('awsEditSecurityGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    'application',
    'securityGroup',
    '$controller',
    function (
      $scope: IAWSEditSecurityGroupScope,
      $uibModalInstance: any,
      $state: any,
      application: Application,
      securityGroup: any,
      $controller: any,
    ) {
      $scope.self = $scope;
      $scope.pages = {
        ingress: require('./createSecurityGroupIngress.html'),
      };

      $scope.securityGroup = securityGroup;

      $scope.state = {
        refreshingSecurityGroups: false,
      };

      $scope.securityGroup.regions = [$scope.securityGroup.region];
      $scope.securityGroup.credentials = $scope.securityGroup.accountName;

      angular.extend(
        this,
        $controller('awsConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      $scope.state.isNew = false;

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: `Updating your ${FirewallLabels.get('firewall')}`,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.securityGroups.refresh(),
      });

      securityGroup.securityGroupIngress = _.chain(securityGroup.inboundRules)
        .filter((rule: any) => rule.securityGroup)
        .map((rule: any) =>
          rule.portRanges.map((portRange: any) => {
            const vpcId = rule.securityGroup.vpcId === securityGroup.vpcId ? null : rule.securityGroup.vpcId;
            return {
              accountName: rule.securityGroup.accountName || rule.securityGroup.accountId,
              accountId: rule.securityGroup.accountId,
              vpcId: vpcId,
              id: rule.securityGroup.id,
              name: rule.securityGroup.inferredName ? null : rule.securityGroup.name,
              type: rule.protocol,
              startPort: portRange.startPort,
              endPort: portRange.endPort,
              existing: true,
            };
          }),
        )
        .flatten()
        .value();

      securityGroup.ipIngress = _.chain(securityGroup.inboundRules)
        .filter(function (rule: any) {
          return rule.range;
        })
        .map(function (rule: any) {
          return rule.portRanges.map(function (portRange: any) {
            return {
              cidr: rule.range.ip + rule.range.cidr,
              type: rule.protocol,
              startPort: portRange.startPort,
              endPort: portRange.endPort,
            };
          });
        })
        .flatten()
        .value();

      this.upsert = function () {
        const group = $scope.securityGroup;
        const command = {
          credentials: group.accountName,
          name: group.name,
          description: group.description,
          vpcId: group.vpcId,
          region: group.region,
          securityGroupIngress: group.securityGroupIngress,
          ipIngress: group.ipIngress,
        };

        $scope.taskMonitor.submit(function () {
          return SecurityGroupWriter.upsertSecurityGroup(command, application, 'Update');
        });
      };

      this.cancel = function () {
        $uibModalInstance.dismiss();
      };

      this.initializeSecurityGroups().then(this.initializeAccounts);
    },
  ]);
