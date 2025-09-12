import { module } from 'angular';

export const ORACLE_COMMON_FOOTER_COMPONENT = 'spinnaker.oracle.footer.component';
export const name = ORACLE_COMMON_FOOTER_COMPONENT; // for backwards compatibility

module(ORACLE_COMMON_FOOTER_COMPONENT, []).component('oracleFooter', {
  templateUrl: require('./footer.component.html'),
  bindings: {
    action: '&',
    isValid: '&',
    cancel: '&',
    account: '<',
    verification: '<',
  },
});
