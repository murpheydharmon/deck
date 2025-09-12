import { module } from 'angular';

import { Registry } from '@spinnaker/core';

export const ORACLE_PIPELINE_STAGES_FINDIMAGEFROMTAGS_ORACLEFINDIMAGEFROMTAGSSTAGE =
  'spinnaker.oracle.pipeline.stage.findImageFromTagsStage';
export const name = ORACLE_PIPELINE_STAGES_FINDIMAGEFROMTAGS_ORACLEFINDIMAGEFROMTAGSSTAGE; // for backwards compatibility

module(ORACLE_PIPELINE_STAGES_FINDIMAGEFROMTAGS_ORACLEFINDIMAGEFROMTAGSSTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    provides: 'findImageFromTags',
    cloudProvider: 'oracle',
    label: 'Find Image from Tags',
    description: 'Finds an image from tags',
    templateUrl: require('./findImageFromTagsStage.html'),
    validators: [
      { type: 'requiredField', fieldName: 'packageName' },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'tags' },
    ],
  } as any);
});
