import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_DISABLEASG_DISABLEASGSTAGE = 'spinnaker.oracle.pipeline.stage.disableAsg';
export const name = ORACLE_PIPELINE_DISABLEASG_DISABLEASGSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_DISABLEASG_DISABLEASGSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'disableServerGroup',
    cloudProvider: 'oracle',
    label: 'Disable Server Group',
    description: 'Disables a server group',
    templateUrl: require('./disableAsgStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'target' },
      { type: 'requiredField', fieldName: 'credentials' },
      { type: 'requiredField', fieldName: 'regions' },
    ],
  } as any);
});
