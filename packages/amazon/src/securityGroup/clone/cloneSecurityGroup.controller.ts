import * as angular from 'angular';
import { module } from 'angular';
import type { IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { AccountService, FirewallLabels } from '@spinnaker/core';
import type { TaskMonitor } from '@spinnaker/core';
import { AMAZON_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER } from '../configure/configSecurityGroup.mixin.controller';

export const AMAZON_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER =
  'spinnaker.amazon.securityGroup.clone.controller';
export const name = AMAZON_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER; // for backwards compatibility

interface IAWSCloneSecurityGroupScope extends IScope {
  self: any;
  pages: any;
  securityGroup: any;
  state: any;
  taskMonitor: TaskMonitor;
}

module(AMAZON_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER, [
  AMAZON_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER,
]).controller('awsCloneSecurityGroupController', [
  '$scope',
  '$uibModalInstance',
  '$controller',
  'securityGroup',
  'application',
  function (
    $scope: IAWSCloneSecurityGroupScope,
    $uibModalInstance: any,
    $controller: any,
    securityGroup: any,
    application: Application,
  ) {
    const vm = this;

    vm.firewallLabel = FirewallLabels.get('Firewall');

    $scope.pages = {
      location: require('../configure/createSecurityGroupProperties.html'),
      ingress: require('../configure/createSecurityGroupIngress.html'),
    };

    securityGroup.credentials = securityGroup.accountName;
    $scope.namePreview = securityGroup.name;

    angular.extend(
      this,
      $controller('awsConfigSecurityGroupMixin', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        application: application,
        securityGroup: securityGroup,
      }),
    );
    $scope.state.isNew = true;
    $scope.allowDuplicateNames = true;
    $scope.state.isClone = true;
    $scope.state.originRegion = securityGroup.regions && securityGroup.regions[0];

    AccountService.listAccounts('aws').then(function (accounts: any) {
      $scope.accounts = accounts;
      vm.accountUpdated();
    });

    securityGroup.securityGroupIngress = _.chain(securityGroup.inboundRules)
      .filter(function (rule: any) {
        return rule.securityGroup;
      })
      .map(function (rule: any) {
        return rule.portRanges.map(function (portRange: any) {
          return {
            name: rule.securityGroup.name,
            type: rule.protocol,
            startPort: portRange.startPort,
            endPort: portRange.endPort,
          };
        });
      })
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

    vm.upsert = function () {
      const { credentials } = $scope.securityGroup;
      Object.assign($scope.securityGroup, {
        account: credentials,
        accountName: credentials,
        accountId: credentials,
      });

      vm.mixinUpsert('Clone');
    };

    vm.initializeSecurityGroups().then(vm.initializeAccounts);
  },
]);
