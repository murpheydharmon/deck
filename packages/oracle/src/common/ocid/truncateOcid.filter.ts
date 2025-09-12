import { module } from 'angular';

export const ORACLE_COMMON_OCID_TRUNCATEOCID_FILTER = 'spinnaker.oracle.ocid.filter';
export const name = ORACLE_COMMON_OCID_TRUNCATEOCID_FILTER; // for backwards compatibility

module(ORACLE_COMMON_OCID_TRUNCATEOCID_FILTER, []).filter('truncateOcid', function () {
  return function (input: string) {
    if (!input) {
      return input;
    }
    const parts = input.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
    return input;
  };
});
