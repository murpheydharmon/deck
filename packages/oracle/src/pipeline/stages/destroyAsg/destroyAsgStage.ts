import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_DESTROYASG_DESTROYASGSTAGE = 'spinnaker.oracle.pipeline.stage.destroyAsgStage';
export const name = ORACLE_PIPELINE_STAGES_DESTROYASG_DESTROYASGSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_DESTROYASG_DESTROYASGSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'destroyServerGroup',
    cloudProvider: 'oracle',
    label: 'Destroy Server Group',
    description: 'Destroys a server group',
    templateUrl: require('./destroyAsgStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'target' },
      { type: 'requiredField', fieldName: 'credentials' },
      { type: 'requiredField', fieldName: 'regions' },
    ],
  } as any);
});
