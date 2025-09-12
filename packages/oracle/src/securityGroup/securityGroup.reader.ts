import { module } from 'angular';

export const ORACLE_SECURITYGROUP_SECURITYGROUP_READER = 'spinnaker.oracle.securityGroup.reader';
export const name = ORACLE_SECURITYGROUP_SECURITYGROUP_READER; // for backwards compatibility

module(ORACLE_SECURITYGROUP_SECURITYGROUP_READER, []).factory('oracleSecurityGroupReader', function () {
  function resolveIndexedSecurityGroup(indexedSecurityGroups: any, container: any, securityGroupId: string) {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }

  return {
    resolveIndexedSecurityGroup: resolveIndexedSecurityGroup,
  };
});
