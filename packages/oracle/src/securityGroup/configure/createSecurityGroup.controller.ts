import { module } from 'angular';
import type { IScope } from 'angular';

import { FirewallLabels } from '@spinnaker/core';

export const ORACLE_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUP_CONTROLLER =
  'spinnaker.oracle.securityGroup.create.controller';
export const name = ORACLE_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUP_CONTROLLER; // for backwards compatibility

interface IOracleCreateSecurityGroupScope extends IScope {
  firewallLabel: string;
}

module(ORACLE_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUP_CONTROLLER, []).controller('oracleCreateSecurityGroupCtrl', [
  '$scope',
  '$uibModalInstance',
  function ($scope: IOracleCreateSecurityGroupScope, $uibModalInstance: any) {
    this.cancel = () => {
      $uibModalInstance.dismiss();
    };
    $scope.firewallLabel = FirewallLabels.get('Firewall');
  },
]);
