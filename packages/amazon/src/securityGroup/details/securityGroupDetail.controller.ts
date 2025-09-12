import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import { module } from 'angular';
import type { IScope } from 'angular';
import { cloneDeep, groupBy, head, map } from 'lodash';

import type { Application, ISecurityGroup } from '@spinnaker/core';
import {
  AccountService,
  ConfirmationModalService,
  FirewallLabels,
  RecentHistoryService,
  SECURITY_GROUP_READER,
  SecurityGroupWriter,
} from '@spinnaker/core';

export const AMAZON_SECURITYGROUP_DETAILS_SECURITYGROUPDETAIL_CONTROLLER =
  'spinnaker.amazon.securityGroup.details.controller';
export const name = AMAZON_SECURITYGROUP_DETAILS_SECURITYGROUPDETAIL_CONTROLLER; // for backwards compatibility

interface IAWSSecurityGroupDetailScope extends IScope {
  application: Application;
  securityGroup: ISecurityGroup;
  state: any;
  firewallLabel: string;
  ipRules: any[];
  securityGroupRules: any[];
  allSecurityGroups: any[];
}

module(AMAZON_SECURITYGROUP_DETAILS_SECURITYGROUPDETAIL_CONTROLLER, [
  UIROUTER_ANGULARJS,
  SECURITY_GROUP_READER,
]).controller('awsSecurityGroupDetailsCtrl', [
  '$scope',
  '$state',
  'resolvedSecurityGroup',
  'app',
  'securityGroupReader',
  '$uibModal',
  function (
    $scope: IAWSSecurityGroupDetailScope,
    $state: any,
    resolvedSecurityGroup: ISecurityGroup,
    app: Application,
    securityGroupReader: any,
    $uibModal: any,
  ) {
    const application = app;
    const securityGroup = resolvedSecurityGroup;

    $scope.firewallLabel = FirewallLabels.get('Firewall');

    $scope.state = {
      loading: true,
      standalone: application.isStandalone,
    };

    function extractSecurityGroup() {
      return securityGroupReader
        .getSecurityGroupDetails(
          application,
          securityGroup.accountId,
          securityGroup.provider,
          securityGroup.region,
          securityGroup.vpcId,
          securityGroup.name,
        )
        .then(function (details: any) {
          $scope.state.loading = false;

          if (!details || details.length === 0) {
            fourOhFour();
          } else {
            $scope.securityGroup = details;

            if (securityGroup.accountId) {
              AccountService.getAccountDetails(securityGroup.accountId).then((accountDetails: any) => {
                ($scope.securityGroup as any).logsLink =
                  accountDetails.accountType === 'aws' && accountDetails.regions
                    ? accountDetails.regions.find((region: any) => region.name === securityGroup.region)?.logsLink
                    : null;
              });
            }

            RecentHistoryService.addExtraDataToLatest('securityGroups', {
              accountId: securityGroup.accountId,
              region: securityGroup.region,
              vpcId: securityGroup.vpcId,
            });

            $scope.ipRules = buildIpRulesModel($scope.securityGroup);
            $scope.securityGroupRules = buildSecurityGroupRulesModel($scope.securityGroup);
          }
        }, fourOhFour);
    }

    function buildIpRulesModel(details: any) {
      const groupedRangeRules = groupBy(details.ipRangeRules, 'range.ip');
      return map(groupedRangeRules, function (rangeRules: any, ip: string) {
        return {
          ip: ip,
          cidr: (head(rangeRules) as any).range.cidr,
          rules: buildRuleModel(rangeRules, 'range'),
        };
      });
    }

    function buildSecurityGroupRulesModel(details: any) {
      const groupedRangeRules = groupBy(details.securityGroupRules, function (rule: any) {
        return rule.securityGroup.groupId + ':' + rule.securityGroup.accountName;
      });
      return map(groupedRangeRules, function (securityGroupRules: any, _key: string) {
        const securityGroup = (head(securityGroupRules) as any).securityGroup;
        return {
          securityGroup: securityGroup,
          rules: buildRuleModel(securityGroupRules, 'securityGroup'),
        };
      });
    }

    function buildRuleModel(rules: any[], _source: string) {
      return map(groupBy(rules, 'protocol'), function (protocolRules: any, protocol: string) {
        const portRanges = map(protocolRules, function (rule: any) {
          return rule.portRanges ? rule.portRanges[0] : null;
        });
        return {
          protocol: protocol,
          portRanges: portRanges,
        };
      });
    }

    function fourOhFour() {
      if ($scope.$$destroyed) {
        return;
      }
      if (application.isStandalone) {
        $scope.group = securityGroup.name;
        $scope.state.notFound = true;
        $scope.state.loading = false;
        RecentHistoryService.removeLastItem('securityGroups');
      } else {
        $state.go('^', {}, { location: 'replace' });
      }
    }

    extractSecurityGroup().then(() => {
      if (!$scope.$$destroyed && !application.isStandalone) {
        application.securityGroups.onRefresh($scope, extractSecurityGroup);
      }
    });

    this.editSecurityGroup = function editSecurityGroup() {
      $uibModal.open({
        templateUrl: require('../configure/editSecurityGroup.html'),
        controller: 'awsEditSecurityGroupCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          securityGroup: function () {
            return cloneDeep($scope.securityGroup);
          },
          application: function () {
            return application;
          },
        },
      });
    };

    this.cloneSecurityGroup = function cloneSecurityGroup() {
      $uibModal.open({
        templateUrl: require('../clone/cloneSecurityGroup.html'),
        controller: 'awsCloneSecurityGroupController',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          securityGroup: function () {
            const securityGroup = cloneDeep($scope.securityGroup);
            if (securityGroup.region) {
              (securityGroup as any).regions = [securityGroup.region];
            }
            return securityGroup;
          },
          application: function () {
            return application;
          },
        },
      });
    };

    this.deleteSecurityGroup = function deleteSecurityGroup() {
      const taskMonitor = {
        application: application,
        title: 'Deleting ' + securityGroup.name,
      };

      const submitMethod = function () {
        (securityGroup as any).type = 'deleteSecurityGroup';
        (securityGroup as any).cloudProvider = securityGroup.provider;
        return SecurityGroupWriter.deleteSecurityGroup(securityGroup, application, {});
      };

      ConfirmationModalService.confirm({
        header: 'Really delete ' + securityGroup.name + '?',
        buttonText: 'Delete ' + securityGroup.name,
        account: securityGroup.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    if (application.isStandalone) {
      this.closeDetails = function () {
        $state.go('^.^.securityGroupDetails', { name: securityGroup.name });
      };
    } else {
      this.closeDetails = function () {
        $state.go('^');
      };
    }
  },
]);
