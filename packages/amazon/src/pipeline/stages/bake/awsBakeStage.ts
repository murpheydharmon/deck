import { module } from 'angular';
import type { IQService, IScope } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { AuthenticationService } from '@spinnaker/core';
import { BakeExecutionLabel, BakeryReader, PipelineTemplates, Registry, SETTINGS } from '@spinnaker/core';
import { AWSProviderSettings } from '../../../aws.settings';

import { AMAZON_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER } from './bakeExecutionDetails.controller';

export const AMAZON_PIPELINE_STAGES_BAKE_AWSBAKESTAGE = 'spinnaker.amazon.pipeline.stage.bakeStage';
export const name = AMAZON_PIPELINE_STAGES_BAKE_AWSBAKESTAGE; // for backwards compatibility

interface IAWSBakeStageScope extends IScope {
  stage: any;
  application: Application;
  pipeline: any;
  regions: any[];
  storeTypes: any[];
  baseOsOptions: any;
  baseLabelOptions: any;
  vmTypes: any[];
  viewState: any;
  showAdvancedOptions: boolean;
}

module(AMAZON_PIPELINE_STAGES_BAKE_AWSBAKESTAGE, [AMAZON_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER])
  .config(function () {
    Registry.pipeline.registerStage({
      provides: 'bake',
      cloudProvider: 'aws',
      label: 'Bake',
      description: 'Bakes an image',
      templateUrl: require('./bakeStage.html'),
      executionDetailsUrl: require('./bakeExecutionDetails.html'),
      executionLabelComponent: BakeExecutionLabel,
      extraLabelLines: (stage: any) => {
        return stage.masterStage.context.allPreviouslyBaked || stage.masterStage.context.somePreviouslyBaked ? 1 : 0;
      },
      supportsCustomTimeout: true,
      validators: [
        { type: 'requiredField', fieldName: 'package' },
        { type: 'requiredField', fieldName: 'regions' },
        {
          type: 'upstreamVersionProvided',
          checkParentTriggers: true,
          message:
            'Bake stages should always have a stage or trigger preceding them that provides version information. Otherwise, Spinnaker will bake and deploy the most-recently built package.',
        } as any,
      ],
      restartable: true,
    });
  })
  .controller('awsBakeStageCtrl', [
    '$scope',
    '$q',
    '$uibModal',
    function ($scope: IAWSBakeStageScope, $q: IQService, $uibModal: any) {
      $scope.stage.extendedAttributes = $scope.stage.extendedAttributes || {};
      $scope.stage.regions = ($scope.stage.regions && $scope.stage.regions.sort()) || [];

      if (!$scope.stage.user) {
        $scope.stage.user = AuthenticationService.getAuthenticatedUser().name;
      }

      $scope.viewState = {
        loading: true,
        roscoMode:
          SETTINGS.feature.roscoMode ||
          (typeof SETTINGS.feature.roscoSelector === 'function' && SETTINGS.feature.roscoSelector($scope.stage)),
        minRootVolumeSize: AWSProviderSettings.minRootVolumeSize,
        showVmTypeSelector: true,
        bakeWarning: AWSProviderSettings.bakeWarning,
        dockerBakeWarning: AWSProviderSettings.dockerBakeWarning,
        showDockerPreview: AWSProviderSettings.dockerBakeryDeprecated && $scope.stage.storeType === 'docker',
        showMigrationFields: $scope.pipeline.migrationStatus !== 'Started',
        showStoreType: !AWSProviderSettings.dockerBakeryDeprecated,
      };

      function initialize() {
        $q.all([
          BakeryReader.getRegions('aws'),
          BakeryReader.getBaseOsOptions('aws'),
          BakeryReader.getBaseLabelOptions(),
          ['ebs', 'docker'],
        ]).then(function ([regions, baseOsOptions, baseLabelOptions, storeTypes]) {
          $scope.regions = [...regions].sort();
          $scope.storeTypes = storeTypes;
          if (!$scope.stage.storeType && $scope.storeTypes && $scope.storeTypes.length) {
            $scope.stage.storeType = $scope.storeTypes[0];
          }
          if ($scope.regions.length === 1) {
            $scope.stage.region = $scope.regions[0];
          } else if (!$scope.regions.includes($scope.stage.region)) {
            delete $scope.stage.region;
          }
          if (!$scope.stage.regions.length && $scope.application.defaultRegions.aws) {
            $scope.stage.regions.push(...Object.keys($scope.application.defaultRegions.aws).sort());
          }
          $scope.baseOsOptions = baseOsOptions.baseImages;
          $scope.baseLabelOptions = baseLabelOptions;

          if (!$scope.stage.baseOs && $scope.baseOsOptions && $scope.baseOsOptions.length) {
            $scope.stage.baseOs = $scope.baseOsOptions[0].id;
          } else if (
            $scope.stage.baseOs &&
            !($scope.baseOsOptions || []).find((baseOs: any) => baseOs.id === $scope.stage.baseOs)
          ) {
            $scope.baseOsOptions.push({
              id: $scope.stage.baseOs,
              detailedDescription: 'Custom',
              vmTypes: ['hvm', 'pv'],
            });
          }
          if (!$scope.stage.baseLabel && $scope.baseLabelOptions && $scope.baseLabelOptions.length) {
            $scope.stage.baseLabel = $scope.baseLabelOptions[0];
          }
          setVmTypes();
          if (!$scope.stage.vmType && $scope.vmTypes && $scope.vmTypes.length) {
            $scope.stage.vmType = $scope.vmTypes[0];
          }
          $scope.showAdvancedOptions = showAdvanced();
          $scope.viewState.loading = false;
        });
      }

      function stageUpdated() {
        deleteEmptyProperties();
        if ($scope.stage.storeType === 'ebs' && $scope.stage.cloudProviderType !== 'aws') {
          $scope.stage.cloudProviderType = 'aws';
        }
        if (typeof SETTINGS.feature.roscoSelector === 'function') {
          $scope.viewState.roscoMode = SETTINGS.feature.roscoSelector($scope.stage);
        }
      }

      function deleteEmptyProperties() {
        _.forOwn($scope.stage, function (val: any, key: string) {
          if (val === '') {
            delete $scope.stage[key];
          }
        });
      }

      function showAdvanced() {
        const stg = $scope.stage;
        return !!(
          stg.templateFileName ||
          (stg.extendedAttributes && _.size(stg.extendedAttributes) > 0) ||
          stg.varFileName ||
          stg.baseName ||
          stg.baseAmi ||
          stg.amiName ||
          stg.amiSuffix ||
          stg.rootVolumeSize
        );
      }

      function setVmTypes() {
        if ($scope.baseOsOptions.length && $scope.baseOsOptions.every(({ vmTypes }: any) => vmTypes)) {
          const allVmTypes =
            $scope.baseOsOptions.length &&
            new Set($scope.baseOsOptions.reduce((types: any[], { vmTypes }: any) => types.concat(vmTypes), []));
          const baseOs = $scope.baseOsOptions.find(({ id }: any) => id === $scope.stage.baseOs);

          $scope.viewState.showVmTypeSelector = allVmTypes.size > 1;
          $scope.vmTypes = baseOs.vmTypes;
        } else {
          $scope.viewState.showVmTypeSelector = true;
          $scope.vmTypes = ['hvm', 'pv'];
        }
      }

      this.addExtendedAttribute = function () {
        if (!$scope.stage.extendedAttributes) {
          $scope.stage.extendedAttributes = {};
        }
        $uibModal
          .open({
            templateUrl: PipelineTemplates.addExtendedAttributes,
            controller: 'bakeStageAddExtendedAttributeController',
            controllerAs: 'addExtendedAttribute',
            resolve: {
              extendedAttribute: function () {
                return {
                  key: '',
                  value: '',
                };
              },
            },
          })
          .result.then(function (extendedAttribute: any) {
            $scope.stage.extendedAttributes[extendedAttribute.key] = extendedAttribute.value;
          })
          .catch(() => {});
      };

      this.removeExtendedAttribute = function (key: string) {
        delete $scope.stage.extendedAttributes[key];
      };

      this.showTemplateFileName = function () {
        return $scope.viewState.roscoMode || $scope.stage.templateFileName;
      };

      this.showExtendedAttributes = function () {
        return (
          $scope.viewState.roscoMode || ($scope.stage.extendedAttributes && _.size($scope.stage.extendedAttributes) > 0)
        );
      };

      this.showVarFileName = function () {
        return $scope.viewState.roscoMode || $scope.stage.varFileName;
      };

      this.handleBaseOsChange = function () {
        setVmTypes();
        if ($scope.vmTypes && $scope.vmTypes.length && !$scope.vmTypes.includes($scope.stage.vmType)) {
          $scope.stage.vmType = $scope.vmTypes[0];
        }
      };

      $scope.$watch('stage', stageUpdated, true);

      initialize();
    },
  ]);
