import { module } from 'angular';

export const ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZECAPACITY_COMPONENT =
  'spinnaker.oracle.serverGroup.details.resize.capacity';
export const name = ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZECAPACITY_COMPONENT; // for backwards compatibility

module(ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZECAPACITY_COMPONENT, []).component('oracleResizeCapacity', {
  bindings: {
    command: '=',
    currentSize: '=',
  },
  templateUrl: require('./resizeCapacity.component.html'),
  controller: [
    function () {
      this.isValid = () => {
        return this.command && this.command.capacity && this.command.capacity.desired !== null;
      };
    },
  ],
});
