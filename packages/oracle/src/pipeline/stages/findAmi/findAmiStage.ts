import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_FINDAMI_FINDAMISTAGE = 'spinnaker.oracle.pipeline.stage.findAmiStage';
export const name = ORACLE_PIPELINE_STAGES_FINDAMI_FINDAMISTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_FINDAMI_FINDAMISTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'findImage',
    cloudProvider: 'oracle',
    label: 'Find Image',
    description: 'Finds an image to deploy',
    templateUrl: require('./findAmiStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'selectionStrategy', fieldLabel: 'Server Group Selection' },
      { type: 'requiredField', fieldName: 'credentials' },
    ],
  } as any);
});
