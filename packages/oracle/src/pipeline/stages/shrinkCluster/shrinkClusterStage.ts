import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_SHRINKCLUSTER_SHRINKCLUSTERSTAGE =
  'spinnaker.oracle.pipeline.stage.shrinkClusterStage';
export const name = ORACLE_PIPELINE_STAGES_SHRINKCLUSTER_SHRINKCLUSTERSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_SHRINKCLUSTER_SHRINKCLUSTERSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'shrinkCluster',
    cloudProvider: 'oracle',
    label: 'Shrink Cluster',
    description: 'Shrinks a cluster',
    templateUrl: require('./shrinkClusterStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'shrinkToSize' },
      { type: 'requiredField', fieldName: 'allowDeleteActive' },
      { type: 'requiredField', fieldName: 'retainLargerOverNewer' },
      { type: 'requiredField', fieldName: 'credentials' },
      { type: 'requiredField', fieldName: 'regions' },
    ],
  } as any);
});
