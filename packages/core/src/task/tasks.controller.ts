import UIROUTER_ANGULARJS from '@uirouter/angularjs';
import type { StateParams, StateService } from '@uirouter/core';
import { module } from 'angular';
import type { IQService, IScope } from 'angular';
import _ from 'lodash';

import { ViewStateCache } from '../cache';
import { SETTINGS } from '../config/settings';
import { ConfirmationModalService } from '../confirmationModal';
import { DISPLAYABLE_TASKS_FILTER } from './displayableTasks.filter';
import { TaskWriter } from './task.write.service';
import { CORE_TASK_TASKPROGRESSBAR_DIRECTIVE } from './taskProgressBar.directive';

export const CORE_TASK_TASKS_CONTROLLER = 'spinnaker.core.task.controller';
export const name = CORE_TASK_TASKS_CONTROLLER; // for backwards compatibility

interface ITasksScope extends IScope {
  viewState: any;
  tasksUrl: string;
  filterCountOptions: number[];
  pagination: any;
}

module(CORE_TASK_TASKS_CONTROLLER, [
  UIROUTER_ANGULARJS,
  CORE_TASK_TASKPROGRESSBAR_DIRECTIVE,
  DISPLAYABLE_TASKS_FILTER,
]).controller('TasksCtrl', [
  '$scope',
  '_$state',
  '_$stateParams',
  '_$q',
  'app',
  function ($scope: ITasksScope, _$state: StateService, _$stateParams: StateParams, _$q: IQService, app: any) {
    if (app.notFound || app.hasError) {
      return;
    }

    const controller = this;

    function cacheViewState(state: any) {
      const cache = ViewStateCache.get(app.name) || ViewStateCache.createCache(app.name, { version: 1 });
      cache.put('tasks', state);
    }

    function cacheGlobalViewState(state: any) {
      const cache = ViewStateCache.get('tasks') || ViewStateCache.createCache('tasks', { version: 1 });
      cache.put('global', state);
    }

    function initializeViewState() {
      const appCache = ViewStateCache.get(app.name) || ViewStateCache.createCache(app.name, { version: 1 });
      const viewState = appCache.get('tasks') || {
        nameFilter: '',
        typeFilter: '',
      };

      const globalCache = ViewStateCache.get('tasks') || ViewStateCache.createCache('tasks', { version: 1 });
      const globalViewState = globalCache.get('global') || {
        itemsPerPage: 20,
      };
      (viewState as any).itemsPerPage = (globalViewState as any).itemsPerPage;

      $scope.viewState = viewState;
      $scope.tasksUrl = [SETTINGS.gateUrl, 'applications', app.name, 'tasks'].join('/');
      $scope.filterCountOptions = [10, 20, 30, 50, 100];
      $scope.pagination = {
        currentPage: 1,
        itemsPerPage: (viewState as any).itemsPerPage,
        maxSize: 12,
      };
    }

    const setTaskFilter = _.debounce(function () {
      if ($scope.viewState.nameFilter) {
        $scope.viewState.filteredTasks = $scope.viewState.sortedTasks.filter(function (task: any) {
          return task.name.toLowerCase().indexOf($scope.viewState.nameFilter.toLowerCase()) !== -1;
        });
      } else {
        $scope.viewState.filteredTasks = $scope.viewState.sortedTasks;
      }
      controller.resetPaginator();
    }, 300);

    controller.toggleDetails = function (index: number) {
      const newState = $scope.viewState.itemDetails[index];
      $scope.viewState.itemDetails = [];
      if (!newState) {
        $scope.viewState.itemDetails[index] = true;
      }
    };

    controller.isExpanded = function (index: number) {
      return $scope.viewState.itemDetails[index];
    };

    controller.sortTasksAndResetPaginator = function (sortBy: string) {
      controller.sortTasks(sortBy);
      controller.resetPaginator();
    };

    controller.sortTasks = function (sortBy: string) {
      $scope.viewState.sortBy = sortBy;
      let direction = $scope.viewState.sortDirection || 'desc';
      if (sortBy === 'startTime' || sortBy === 'endTime') {
        direction = 'desc';
      }
      $scope.viewState.sortDirection = direction;
      controller.sortedTasks = _.orderBy($scope.viewState.tasks, [sortBy], [direction]);
      $scope.viewState.sortedTasks = controller.sortedTasks;
      setTaskFilter();
      cacheViewState($scope.viewState);
    };

    controller.clearNameFilter = function () {
      $scope.viewState.nameFilter = '';
      setTaskFilter();
    };

    controller.nameFilterUpdated = function () {
      setTaskFilter();
      cacheViewState($scope.viewState);
    };

    controller.cancelTask = function (task: any) {
      const taskCopy = _.cloneDeep(task);
      taskCopy.job = [taskCopy.job[0]];
      taskCopy.job[0].type = 'cancelTask';
      delete taskCopy.job[0].name;

      const submitMethod = function () {
        return TaskWriter.postTaskCommand(taskCopy);
      };

      ConfirmationModalService.confirm({
        header: 'Really cancel ' + task.name + '?',
        buttonText: 'Cancel ' + task.name,
        body:
          '<p>This will attempt to cancel the task and stop all running jobs.</p><p>The task cannot be restarted.</p>',
        submitMethod: submitMethod,
      });
    };

    controller.resetPaginator = function () {
      $scope.pagination = {
        currentPage: 1,
        itemsPerPage: $scope.viewState.itemsPerPage,
        maxSize: 12,
      };
    };

    controller.resultPage = function () {
      const pagination = $scope.pagination;
      const allFiltered = $scope.viewState.filteredTasks;
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const end = pagination.currentPage * pagination.itemsPerPage;
      if (!allFiltered || !allFiltered.length) {
        return [];
      }
      if (allFiltered.length < pagination.itemsPerPage) {
        return allFiltered;
      }
      if (allFiltered.length < end) {
        return allFiltered.slice(start);
      }
      return allFiltered.slice(start, end);
    };

    controller.getFirstDeployServerGroupName = function (task: any) {
      if (task.execution && task.execution.stages) {
        const stage = task.execution.stages.find(function (test: any) {
          return test.type === 'deploy';
        });
        return stage ? stage.context['deploy.server.groups'] : null;
      }
      return null;
    };

    controller.getAccountId = function (task: any) {
      return task.ownerId;
    };

    controller.getRegion = function (task: any) {
      let regionVariable = null;
      if (task.variables) {
        regionVariable = task.variables.find(function (variable: any) {
          return variable.key === 'region';
        });
      }
      return regionVariable ? regionVariable.value : null;
    };

    controller.getProviderForServerGroupByTask = function (task: any) {
      const execution = findStageWithTaskInExecution(task);
      if (execution && execution.context && execution.context.cloudProvider) {
        return execution.context.cloudProvider;
      }
      return null;
    };

    function findStageWithTaskInExecution(task: any) {
      let stage = null;
      if (task.execution && task.execution.stages && task.execution.stages.length > 0) {
        stage = task.execution.stages.find(function (test: any) {
          return (
            test.tasks &&
            test.tasks.find(function (stageTask: any) {
              return stageTask.id === task.id;
            })
          );
        });
      }
      return stage;
    }

    function filterRunningTasks(tasks: any[]) {
      const running = tasks.filter(function (task: any) {
        return task.status === 'RUNNING';
      });
      return _.sortBy(running, 'startTime').reverse();
    }

    function filterNonRunningTasks(tasks: any[]) {
      const notRunning = tasks.filter(function (task: any) {
        return task.status !== 'RUNNING';
      });
      return _.sortBy(notRunning, taskStartTimeComparator).reverse();
    }

    function taskStartTimeComparator(task: any) {
      return task.startTime || task.buildTime;
    }

    this.application = app;

    app.tasks.activate();

    $scope.viewState = {
      loading: true,
      itemsPerPage: 20,
      nameFilter: '',
      typeFilter: '',
      sortBy: 'startTime',
      sortDirection: 'desc',
      itemDetails: {},
    };

    app.tasks.ready().then(() => {
      initializeViewState();
      $scope.viewState.loading = false;
      $scope.viewState.tasks = [].concat(app.tasks.data || []);
      filterRunningTasks($scope.viewState.tasks).concat(filterNonRunningTasks($scope.viewState.tasks));
      controller.sortTasks($scope.viewState.sortBy);
    });

    app.tasks.onRefresh($scope, () => {
      $scope.viewState.tasks = [].concat(app.tasks.data || []);
      filterRunningTasks($scope.viewState.tasks).concat(filterNonRunningTasks($scope.viewState.tasks));
      controller.sortTasks($scope.viewState.sortBy);
    });

    this.stateChanged = function () {
      cacheViewState($scope.viewState);
      cacheGlobalViewState({
        itemsPerPage: $scope.viewState.itemsPerPage,
      });
    };

    $scope.$watch('viewState.itemsPerPage', controller.resetPaginator);
  },
]);
