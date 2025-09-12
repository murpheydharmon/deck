import { module } from 'angular';

export const ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_CAPACITYSELECTOR_COMPONENT =
  'spinnaker.oracle.serverGroup.configure.wizard.capacity.selector';
export const name = ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_CAPACITYSELECTOR_COMPONENT; // for backwards compatibility

module(ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_CAPACITYSELECTOR_COMPONENT, []).component(
  'oracleServerGroupCapacitySelector',
  {
    bindings: {
      command: '=',
    },
    templateUrl: require('./capacitySelector.component.html'),
    controller: [
      function () {
        this.setSimpleCapacity = (simpleCapacity: boolean) => {
          this.command.viewState.useSimpleCapacity = simpleCapacity;
          this.command.useSourceCapacity = false;
          if (simpleCapacity) {
            this.command.capacity = { min: 1, max: 1, desired: 1 };
          }
        };

        this.setMinMax = (capacity: any) => {
          if (capacity.min > capacity.max) {
            capacity.max = capacity.min;
          }
          if (capacity.desired < capacity.min) {
            capacity.desired = capacity.min;
          }
          if (capacity.desired > capacity.max) {
            capacity.desired = capacity.max;
          }
        };
      },
    ],
  },
);
