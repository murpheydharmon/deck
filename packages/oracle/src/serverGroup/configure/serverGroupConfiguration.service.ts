import { module } from 'angular';
import type { IQService } from 'angular';
import _ from 'lodash';

import type { Application } from '@spinnaker/core';
import { AccountService, NetworkReader, SECURITY_GROUP_READER, SubnetReader } from '@spinnaker/core';
import { OracleProviderSettings } from '../../oracle.settings';

export const ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE =
  'spinnaker.oracle.serverGroup.configure.configuration.service';
export const name = ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE; // for backwards compatibility

module(ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE, [SECURITY_GROUP_READER]).factory(
  'oracleServerGroupConfigurationService',
  [
    '$q',
    'oracleImageReader',
    'securityGroupReader',
    function ($q: IQService, oracleImageReader: any, securityGroupReader: any) {
      const oracle = 'oracle';

      const getShapes = (image: any) => {
        if (!image || !image.compatibleShapes) {
          return [];
        }
        return image.compatibleShapes.map((shape: any) => {
          return { name: shape };
        });
      };

      const loadAndSelectRegions = (command: any, backingData: any) => {
        if (command.account) {
          const selectedAccountDetails = backingData.credentialsKeyedByAccount[command.account];
          if (!selectedAccountDetails) {
            return;
          }
          backingData.filtered.regions = _.map(selectedAccountDetails.regions, (region: any) => {
            return { name: region.name };
          });
          if (selectedAccountDetails) {
            command.region = selectedAccountDetails.region;
          }
        }
      };

      const loadAvailabilityDomains = (command: any) => {
        if (command.account && command.region) {
          AccountService.getAvailabilityZonesForAccountAndRegion(oracle, command.account, command.region).then(
            (availDoms: any) => {
              if (availDoms) {
                command.backingData.filtered.availabilityDomains = availDoms.map((av: any) => {
                  return { name: av };
                });
              } else {
                command.backingData.filtered.availabilityDomains = [];
                command.availabilityDomain = null;
              }
            },
          );
        }
      };

      const loadLoadBalancers = (command: any) => {
        if (command.account && command.region) {
          command.backingData.filtered.loadBalancers = command.backingData.loadBalancers.filter(function (lb: any) {
            return lb.region === command.region && lb.account === command.account;
          });
        }
      };

      function configureCommand(application: Application, command: any) {
        const defaults = command || {};
        const defaultCredentials =
          defaults.account || application.defaultCredentials.oracle || OracleProviderSettings.defaults.account;
        const defaultRegion =
          defaults.region || application.defaultRegions.oracle || OracleProviderSettings.defaults.region;

        return $q
          .all([
            AccountService.getCredentialsKeyedByAccount(oracle),
            NetworkReader.listNetworksByProvider(oracle),
            SubnetReader.listSubnetsByProvider(oracle),
            securityGroupReader.getAllSecurityGroups(),
            loadImages(),
            AccountService.getAvailabilityZonesForAccountAndRegion(oracle, defaultCredentials, defaultRegion),
          ])
          .then(function ([credentialsKeyedByAccount, networks, subnets, securityGroups, images, availDomains]) {
            const backingData: any = {
              credentialsKeyedByAccount,
              networks,
              subnets,
              securityGroups,
              images,
              availDomains,
            };

            backingData.accounts = _.keys(backingData.credentialsKeyedByAccount);
            backingData.filtered = {};
            loadAndSelectRegions(command, backingData);
            backingData.filtered.availabilityDomains = _.map(backingData.availDomains, function (zone: any) {
              return { name: zone };
            });

            backingData.filterSubnets = function () {
              if (command.vpcId && command.availabilityDomain) {
                return _.filter(backingData.subnets, (subnet: any) => {
                  return subnet.vcnId === command.vpcId && subnet.availabilityDomain === command.availabilityDomain;
                });
              }
              return backingData.subnets;
            };

            backingData.loadBalancers = application.loadBalancers.data;

            backingData.accountOnChange = function () {
              loadAndSelectRegions(command, command.backingData);
              loadAvailabilityDomains(command);
              loadLoadBalancers(command);
            };

            backingData.regionOnChange = function () {
              loadAvailabilityDomains(command);
              loadLoadBalancers(command);
            };

            backingData.availabilityDomainOnChange = function () {
              command.subnetId = null;
              backingData.seclists = null;
            };

            backingData.vpcOnChange = function () {
              command.subnetId = null;
              backingData.seclists = null;
            };

            backingData.subnetOnChange = function () {
              const subnet = _.find(backingData.subnets, { id: command.subnetId });
              const mySecGroups = backingData.securityGroups[command.account][oracle][command.region];
              const secLists: any[] = [];
              _.forEach((subnet as any).securityListIds, function (sid: any) {
                const sgRef = _.find(mySecGroups, { id: sid });
                securityGroupReader
                  .getSecurityGroupDetails(
                    command.application,
                    command.account,
                    oracle,
                    command.region,
                    command.vpcId,
                    (sgRef as any).name,
                  )
                  .then(function (sgd: any) {
                    secLists.push(sgd);
                    backingData.seclists = secLists;
                  });
              });
            };

            backingData.findBackendSetsByLoadBalancerId = (loadBalancerId: string) => {
              const lb = backingData.filtered.loadBalancers.find((lb: any) => lb.id === loadBalancerId);
              if (lb && lb.backendSets) {
                const bsetArray: any[] = [];
                Object.keys(lb.backendSets).reduce((arr: any[], bsetName: string) => {
                  const bset = lb.backendSets[bsetName];
                  bset['name'] = bsetName;
                  arr.push(bset);
                  return arr;
                }, bsetArray);
                return bsetArray;
              } else {
                return [];
              }
            };

            backingData.findLoadBalListenersByBackendSetName = (loadBalancerId: string, backendSetName: string) => {
              const lb = backingData.filtered.loadBalancers.find((lb: any) => lb.id === loadBalancerId);
              if (lb && lb.listeners) {
                return Object.keys(lb.listeners)
                  .filter((lisName: string) => lb.listeners[lisName].defaultBackendSetName === backendSetName)
                  .map((lisName: string) => lb.listeners[lisName]);
              } else {
                return [];
              }
            };

            backingData.loadBalancerOnChange = () => {
              if (command.loadBalancerId) {
                backingData.filtered.backendSets = backingData.findBackendSetsByLoadBalancerId(command.loadBalancerId);
              } else {
                command.backendSetName = undefined;
                backingData.backendSetOnChange();
                backingData.filtered.backendSets = [];
              }
            };

            backingData.backendSetOnChange = () => {
              backingData.filtered.listeners =
                command.loadBalancerId && command.backendSetName
                  ? backingData.findLoadBalListenersByBackendSetName(command.loadBalancerId, command.backendSetName)
                  : [];
            };

            backingData.filtered.images = backingData.images;
            const shapesMap: any = {};
            _.forEach(backingData.filtered.images, (image: any) => {
              shapesMap[image.id] = getShapes(image);
            });
            backingData.filtered.shapes = shapesMap;
            backingData.filtered.allShapes = _.uniqBy(_.flatten(_.values(shapesMap)), 'name');
            command.backingData = backingData;
            if (command.account) {
              loadLoadBalancers(command);
              backingData.loadBalancerOnChange();
              backingData.backendSetOnChange();
            }
          });
      }

      function loadImages() {
        return oracleImageReader.findImages({ provider: oracle });
      }

      return {
        configureCommand: configureCommand,
      };
    },
  ],
);
