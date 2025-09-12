import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import type { StateService } from '@uirouter/core';
import * as angular from 'angular';
import type { IScope } from 'angular';

import { IMAGE_READER } from '@spinnaker/core';

export const ORACLE_SERVERGROUP_CONFIGURE_WIZARD_BASICSETTINGS_BASICSETTINGS_CONTROLLER =
  'spinnaker.oracle.serverGroup.configure.wizard.basicSettings.controller';
export const name = ORACLE_SERVERGROUP_CONFIGURE_WIZARD_BASICSETTINGS_BASICSETTINGS_CONTROLLER; // for backwards compatibility

angular
  .module(ORACLE_SERVERGROUP_CONFIGURE_WIZARD_BASICSETTINGS_BASICSETTINGS_CONTROLLER, [
    UIROUTER_ANGULARJS,
    'ui.bootstrap',
    IMAGE_READER,
  ])
  .controller('oracleServerGroupBasicSettingsCtrl', [
    '$scope',
    '$state',
    '$uibModalStack',
    '$controller',
    'imageReader',
    function ($scope: IScope, $state: StateService, $uibModalStack: any, $controller: any, imageReader: any) {
      angular.extend(
        this,
        $controller('BasicSettingsMixin', {
          $scope: $scope,
          imageReader: imageReader,
          $uibModalStack: $uibModalStack,
          $state: $state,
        }),
      );
    },
  ]);
