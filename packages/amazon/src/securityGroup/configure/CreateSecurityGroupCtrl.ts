import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import * as angular from 'angular';
import { module } from 'angular';
import type { IScope } from 'angular';

import type { Application } from '@spinnaker/core';
import { CACHE_INITIALIZER_SERVICE, FirewallLabels } from '@spinnaker/core';
import type { TaskMonitor } from '@spinnaker/core';

export const AMAZON_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL =
  'spinnaker.amazon.securityGroup.create.controller';
export const name = AMAZON_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL; // for backwards compatibility

interface IAWSCreateSecurityGroupScope extends IScope {
  self: any;
  pages: any;
  securityGroup: any;
  state: any;
  taskMonitor: TaskMonitor;
}

module(AMAZON_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL, [
  UIROUTER_ANGULARJS,
  CACHE_INITIALIZER_SERVICE,
]).controller('awsCreateSecurityGroupCtrl', [
  '$scope',
  '$uibModalInstance',
  '$state',
  '$controller',
  'cacheInitializer',
  'application',
  'securityGroup',
  function (
    $scope: IAWSCreateSecurityGroupScope,
    $uibModalInstance: any,
    $state: any,
    $controller: any,
    cacheInitializer: any,
    application: Application,
    securityGroup: any,
  ) {
    $scope.pages = {
      location: require('./createSecurityGroupProperties.html'),
      ingress: require('./createSecurityGroupIngress.html'),
    };

    const ctrl = this;

    ctrl.translate = (label: string) => FirewallLabels.get(label);

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

    ctrl.upsert = () => ctrl.mixinUpsert('Create');

    ctrl.initializeSecurityGroups().then(ctrl.initializeAccounts);
  },
]);
