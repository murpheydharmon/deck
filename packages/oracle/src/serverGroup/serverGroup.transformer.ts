import { module } from 'angular';
import type { IQService } from 'angular';
import _ from 'lodash';

export const ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER = 'spinnaker.oracle.serverGroup.transformer';
export const name = ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER; // for backwards compatibility

module(ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER, []).factory('oracleServerGroupTransformer', [
  '$q',
  function ($q: IQService) {
    const PROVIDER = 'oracle';

    function normalizeServerGroup(serverGroup: any): PromiseLike<any> {
      return $q.when(serverGroup);
    }

    function convertServerGroupCommandToDeployConfiguration(base: any): any {
      const command = _.defaults({ backingData: [], viewState: [] }, base);
      command.cloudProvider = PROVIDER;
      return command;
    }

    return {
      convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup,
    };
  },
]);
