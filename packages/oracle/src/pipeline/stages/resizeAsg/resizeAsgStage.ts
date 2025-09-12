import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_RESIZEASG_RESIZEASGSTAGE = 'spinnaker.oracle.pipeline.stage.resizeAsgStage';
export const name = ORACLE_PIPELINE_STAGES_RESIZEASG_RESIZEASGSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_RESIZEASG_RESIZEASGSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'resizeServerGroup',
    cloudProvider: 'oracle',
    label: 'Resize Server Group',
    description: 'Resizes a server group',
    templateUrl: require('./resizeAsgStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'target' },
      { type: 'requiredField', fieldName: 'action' },
      { type: 'requiredField', fieldName: 'credentials' },
      { type: 'requiredField', fieldName: 'regions' },
    ],
  } as any);
});
