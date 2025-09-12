# TypeScript Migration Progress Tracker

## Overview
Migrating 570 JavaScript files to TypeScript across the Spinnaker Deck monorepo while maintaining backward compatibility.

## Migration Strategy
- **Backward Compatibility**: Maintain `allowJs: true` throughout migration
- **Phased Approach**: Migrate by package dependency order
- **Testing**: Full test suite after each phase
- **Git Strategy**: Separate PRs for each phase

## Phase 1: Infrastructure Setup ✅
- [x] Create migration tracking system
- [x] Document JavaScript files by package priority
- [x] Establish naming conventions (.js → .ts, .jsx → .tsx)

## Phase 2: Core Foundation Migration (Package: core) ✅
### Core Validation Module (~8 files)
- [x] packages/core/src/validation/validateUnique.directive.js → .ts
- [x] packages/core/src/validation/triggerValidation.directive.js → .ts
- [x] packages/core/src/validation/validationError.directive.js → .ts
- [ ] packages/core/src/validation/validateUnique.directive.spec.js
- [x] packages/core/src/validation/validation.module.js → .ts

### Core Task Module (~10 files)
- [x] packages/core/src/task/tasks.controller.js → .ts
- [x] packages/core/src/task/task.dataSource.js → .ts
- [ ] packages/core/src/task/task.read.service.spec.js
- [ ] packages/core/src/task/tasks.controller.spec.js
- [x] packages/core/src/task/task.module.js → .ts
- [x] packages/core/src/task/taskProgressBar.directive.js → .ts
- [ ] packages/core/src/task/modal/reason.directive.js
- [ ] packages/core/src/task/verification/userVerification.directive.spec.js
- [ ] packages/core/src/task/verification/userVerification.directive.js
- [ ] packages/core/src/task/monitor/taskMonitor.module.js

### Core Forms and Widgets (~25 files)
- [ ] packages/core/src/forms/autofocus/autofocus.directive.js
- [ ] packages/core/src/forms/validateOnSubmit/validateOnSubmit.directive.js
- [ ] packages/core/src/forms/forms.module.js
- [ ] packages/core/src/forms/checklist/checklist.directive.spec.js
- [ ] packages/core/src/forms/checklist/checklist.directive.js
- [ ] packages/core/src/forms/uiSelect.decorator.js
- [ ] packages/core/src/forms/ignoreEmptyDelete.directive.js
- [ ] packages/core/src/forms/checkmap/checkmap.directive.spec.js
- [ ] packages/core/src/forms/checkmap/checkmap.directive.js
- [ ] packages/core/src/forms/mapEditor/mapEditor.component.spec.js
- [ ] packages/core/src/forms/mapEditor/mapEditor.component.js
- [ ] packages/core/src/widgets/actionIcons/actionIcons.component.js
- [ ] packages/core/src/widgets/accountNamespaceClusterSelector.component.js
- [ ] packages/core/src/widgets/accountRegionClusterSelector.component.js
- [ ] packages/core/src/widgets/spelText/spelSelect.component.js
- [ ] packages/core/src/widgets/spelText/spelText.decorator.js
- [ ] packages/core/src/widgets/spelText/spelAutocomplete.service.js
- [ ] packages/core/src/widgets/scopeClusterSelector.directive.js

## Phase 3: Cloud Provider Package Migration ✅
### Oracle Package (~29 files) ✅
- [x] packages/oracle/src/serverGroup/configure/serverGroup.configure.module.js → .ts
- [x] packages/oracle/src/serverGroup/configure/serverGroupCommandBuilder.service.js → .ts
- [x] packages/oracle/src/serverGroup/configure/serverGroupConfiguration.service.js → .ts
- [x] packages/oracle/src/serverGroup/details/serverGroupDetails.controller.js → .ts
- [x] packages/oracle/src/serverGroup/details/rollback/rollbackServerGroup.controller.js → .ts
- [x] packages/oracle/src/pipeline/stages/bake/ociBakeStage.js → .ts
- [x] packages/oracle/src/securityGroup/configure/createSecurityGroup.controller.js → .ts
- [x] packages/oracle/src/pipeline/stages/bake/bakeExecutionDetails.controller.js → .ts
- [x] packages/oracle/src/pipeline/stages/findAmi/findAmiStage.js → .ts
- [x] packages/oracle/src/pipeline/stages/shrinkCluster/shrinkClusterStage.js → .ts
- [x] packages/oracle/src/pipeline/stages/scaleDownCluster/scaleDownClusterStage.js → .ts
- [x] packages/oracle/src/pipeline/stages/resizeAsg/resizeAsgStage.js → .ts
- [x] packages/oracle/src/pipeline/stages/disableAsg/disableAsgStage.js → .ts
- [x] packages/oracle/src/securityGroup/securityGroup.reader.js → .ts
- [x] packages/oracle/src/securityGroup/securityGroup.transformer.js → .ts
- [x] packages/oracle/src/common/footer.component.js → .ts
- [x] packages/oracle/src/serverGroup/serverGroup.transformer.js → .ts
- [x] packages/oracle/src/serverGroup/details/resize/resizeServerGroup.controller.js → .ts
- [x] packages/oracle/src/pipeline/stages/findImageFromTags/oracleFindImageFromTagsStage.js → .ts
- [x] packages/oracle/src/serverGroup/details/resize/resizeCapacity.component.js → .ts
- [x] packages/oracle/src/pipeline/disableAsg/disableAsgStage.js → .ts
- [x] packages/oracle/src/common/ocid/truncateOcid.filter.js → .ts
- [x] packages/oracle/src/pipeline/stages/destroyAsg/destroyAsgStage.js → .ts
- [x] packages/oracle/src/image/image.reader.js → .ts
- [x] packages/oracle/src/common/ocid/ocid.component.js → .ts
- [x] packages/oracle/src/instance/details/instance.details.controller.js → .ts
- [x] packages/oracle/src/serverGroup/configure/wizard/capacity/capacitySelector.component.js → .ts
- [x] packages/oracle/src/serverGroup/configure/wizard/basicSettings/basicSettings.controller.js → .ts
- [x] packages/oracle/src/serverGroup/configure/wizard/cloneServerGroup.controller.js → .ts


## Phase 4: Cloud Provider Package Migration ✅
### Amazon Package (~34 files) ✅
- [x] packages/amazon/src/securityGroup/securityGroup.transformer.js → .ts
- [x] packages/amazon/src/securityGroup/details/securityGroupDetail.controller.js → .ts
- [x] packages/amazon/src/securityGroup/configure/CreateSecurityGroupCtrl.js → .ts
- [x] packages/amazon/src/securityGroup/configure/configSecurityGroup.mixin.controller.js → .ts
- [x] packages/amazon/src/securityGroup/configure/EditSecurityGroupCtrl.js → .ts
- [x] packages/amazon/src/securityGroup/clone/cloneSecurityGroup.controller.js → .ts
- [x] packages/amazon/src/pipeline/stages/bake/awsBakeStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/bake/bakeExecutionDetails.controller.js → .ts
- [x] packages/amazon/src/serverGroup/details/rollback/rollbackServerGroup.controller.js → .ts
- [x] packages/amazon/src/serverGroup/details/advancedSettings/editAsgAdvancedSettings.modal.controller.js → .ts
- [x] packages/amazon/src/serverGroup/details/securityGroup/editSecurityGroups.modal.controller.js → .ts
- [x] packages/amazon/src/serverGroup/details/scheduledAction/editScheduledActions.modal.controller.js → .ts
- [x] packages/amazon/src/instance/details/instance.details.controller.js → .ts
- [x] packages/amazon/src/serverGroup/details/scalingProcesses/modifyScalingProcesses.controller.js → .ts
- [x] packages/amazon/src/pipeline/stages/scaleDownCluster/awsScaleDownClusterStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/shrinkCluster/awsShrinkClusterStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/findAmi/awsFindAmiStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/modifyScalingProcess/modifyScalingProcessStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/findImageFromTags/awsFindImageFromTagsStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/destroyAsg/awsDestroyAsgStage.js → .ts
- [x] packages/amazon/src/pipeline/stages/enableAsg/awsEnableAsgStage.js → .ts

### Azure Package (~5 files) ✅
- [x] packages/azure/src/securityGroup/securityGroup.transformer.js → .ts
- [x] packages/azure/src/pipeline/stages/bake/azureBakeStage.js → .ts
- [x] packages/azure/src/pipeline/stages/enableAsg/azureEnableAsgStage.js → .ts
- [x] packages/azure/src/pipeline/stages/disableAsg/azureDisableAsgStage.js → .ts
- [x] packages/azure/src/pipeline/stages/destroyAsg/azureDestroyAsgStage.js → .ts

### Other Cloud Provider Packages ✅
- [x] Google Package - Already fully converted to TypeScript (only webpack.config.js remains)
- [x] Titus Package - Already fully converted to TypeScript (only webpack.config.js remains)
- [x] Kubernetes Package - Already fully converted to TypeScript (only webpack.config.js remains)
- [x] Tencentcloud Package - Already fully converted to TypeScript (only webpack.config.js remains)
- [x] Other cloud provider packages - Already fully converted to TypeScript

## Phase 5: Plugin SDK and Configuration 📋
- [ ] packages/pluginsdk/scaffold/scaffold.prettierrc.js
- [ ] packages/pluginsdk/scaffold/rollup.config.js
- [ ] packages/pluginsdk/scaffold/.eslintrc.js
- [ ] packages/pluginsdk/pluginconfig/eslintrc.js
- [ ] packages/pluginsdk/pluginconfig/prettierrc.js
- [ ] packages/pluginsdk/pluginconfig/rollup.config.js
- [ ] packages/pluginsdk/pluginconfig/huskyrc.js
- [ ] packages/pluginsdk/rollup.config.js

## Phase 6: Import Path Cleanup and Strictness Graduation 📋
- [ ] Search for remaining .js import references
- [ ] Update import paths incrementally
- [ ] Enable strictNullChecks: true
- [ ] Enable noImplicitThis: true
- [ ] Enable strict: true

## Root Configuration Files 📋
- [ ] .eslintrc.js
- [ ] postcss.config.js

## Migration Patterns
### Angular Controllers
```typescript
// Before (JS)
module('module.name', []).controller('CtrlName', ['$scope', function($scope) { ... }]);

// After (TS)
import { module } from 'angular';
export const MODULE_NAME = 'module.name';
module(MODULE_NAME, []).controller('CtrlName', ['$scope', function($scope: any) { ... }]);
```

### Angular Directives
```typescript
// Maintain existing directive registration patterns
// Add TypeScript interfaces for directive scope and attributes
```

### Module Exports
```typescript
// Preserve existing export patterns for backward compatibility
export const MODULE_NAME = 'spinnaker.module.name';
export const name = MODULE_NAME; // for backwards compatibility
```

## Testing Strategy
After each phase:
1. `yarn test` - Run full test suite
2. `yarn lint` - Run lint checks
3. `yarn build` - Build verification
4. `yarn start` - Start dev server and verify UI
5. Test critical user flows

## Git Strategy
- Separate branches: `devin/{timestamp}-typescript-migration-phase-{N}`
- Individual PRs for each phase
- Wait for CI and approval before merging
