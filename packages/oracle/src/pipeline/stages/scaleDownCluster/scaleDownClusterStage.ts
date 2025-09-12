import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_SCALEDOWNCLUSTER_SCALEDOWNCLUSTERSTAGE =
  'spinnaker.oracle.pipeline.stage.scaleDownClusterStage';
export const name = ORACLE_PIPELINE_STAGES_SCALEDOWNCLUSTER_SCALEDOWNCLUSTERSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_SCALEDOWNCLUSTER_SCALEDOWNCLUSTERSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'scaleDownCluster',
    cloudProvider: 'oracle',
    label: 'Scale Down Cluster',
    description: 'Scales down a cluster',
    templateUrl: require('./scaleDownClusterStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'remainingFullSizeServerGroups' },
      { type: 'requiredField', fieldName: 'allowScaleDownActive' },
      { type: 'requiredField', fieldName: 'preferLargerOverNewer' },
      { type: 'requiredField', fieldName: 'credentials' },
      { type: 'requiredField', fieldName: 'regions' },
    ],
  } as any);
});
