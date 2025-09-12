import { module } from 'angular';

export const ORACLE_COMMON_OCID_OCID_COMPONENT = 'spinnaker.oracle.ocid.component';
export const name = ORACLE_COMMON_OCID_OCID_COMPONENT; // for backwards compatibility

module(ORACLE_COMMON_OCID_OCID_COMPONENT, []).component('ocid', {
  bindings: {
    ocid: '<',
  },
  template: '<span class="ocid" title="{{$ctrl.ocid}}">{{$ctrl.ocid | truncateOcid}}</span>',
});
