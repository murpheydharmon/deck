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

## Phase 3: Cloud Provider Package Migration
### Oracle Package (~32 files) 📋
- [ ] packages/oracle/src/serverGroup/configure/serverGroup.configure.module.js
- [ ] packages/oracle/src/serverGroup/configure/serverGroupCommandBuilder.service.js
- [ ] packages/oracle/src/serverGroup/configure/serverGroupConfiguration.service.js
- [ ] packages/oracle/src/serverGroup/details/serverGroupDetails.controller.js
- [ ] packages/oracle/src/serverGroup/details/rollback/rollbackServerGroup.controller.js
- [ ] packages/oracle/src/pipeline/stages/bake/ociBakeStage.js
- [ ] packages/oracle/src/securityGroup/configure/createSecurityGroup.controller.js
- [ ] packages/oracle/src/pipeline/stages/bake/bakeExecutionDetails.controller.js
- [ ] packages/oracle/src/pipeline/stages/findAmi/findAmiStage.js
- [ ] packages/oracle/src/pipeline/stages/shrinkCluster/shrinkClusterStage.js
- [ ] packages/oracle/src/pipeline/stages/scaleDownCluster/scaleDownClusterStage.js
- [ ] packages/oracle/src/serverGroup/configure/wizard/cloneServerGroup.controller.js
- [ ] packages/oracle/src/pipeline/stages/resizeAsg/resizeAsgStage.js
- [ ] packages/oracle/src/pipeline/stages/disableAsg/disableAsgStage.js
- [ ] packages/oracle/src/securityGroup/securityGroup.reader.js
- [ ] packages/oracle/src/securityGroup/securityGroup.transformer.js
- [ ] packages/oracle/src/common/footer.component.js
- [ ] packages/oracle/src/serverGroup/serverGroup.transformer.js
- [ ] packages/oracle/src/serverGroup/details/resize/resizeServerGroup.controller.js
- [ ] packages/oracle/src/pipeline/stages/findImageFromTags/oracleFindImageFromTagsStage.js
- [ ] packages/oracle/src/serverGroup/details/resize/resizeCapacity.component.js
- [ ] packages/oracle/src/pipeline/disableAsg/disableAsgStage.js
- [ ] packages/oracle/src/common/ocid/truncateOcid.filter.js
- [ ] packages/oracle/src/pipeline/stages/destroyAsg/destroyAsgStage.js
- [ ] packages/oracle/src/image/image.reader.js
- [ ] packages/oracle/src/common/ocid/ocid.component.js
- [ ] packages/oracle/src/instance/details/instance.details.controller.js
- [ ] packages/oracle/src/serverGroup/configure/wizard/capacity/capacitySelector.component.js
- [ ] packages/oracle/src/serverGroup/configure/wizard/basicSettings/basicSettings.controller.js

### Amazon Package (~15 files) 📋
- [ ] packages/amazon/src/securityGroup/securityGroup.transformer.js
- [ ] packages/amazon/src/securityGroup/details/securityGroupDetail.controller.js
- [ ] packages/amazon/src/securityGroup/configure/CreateSecurityGroupCtrl.js
- [ ] packages/amazon/src/securityGroup/configure/configSecurityGroup.mixin.controller.js
- [ ] packages/amazon/src/securityGroup/configure/EditSecurityGroupCtrl.js
- [ ] packages/amazon/src/securityGroup/configure/CreateSecurityGroup.controller.spec.js
- [ ] packages/amazon/src/securityGroup/clone/cloneSecurityGroup.controller.js

### Other Cloud Provider Packages 📋
- [ ] packages/tencentcloud/src/search/searchResultFormatter.js
- [ ] Additional files from Google, Azure, Kubernetes, etc. packages

## Phase 4: Plugin SDK and Configuration 📋
- [ ] packages/pluginsdk/scaffold/scaffold.prettierrc.js
- [ ] packages/pluginsdk/scaffold/rollup.config.js
- [ ] packages/pluginsdk/scaffold/.eslintrc.js
- [ ] packages/pluginsdk/pluginconfig/eslintrc.js
- [ ] packages/pluginsdk/pluginconfig/prettierrc.js
- [ ] packages/pluginsdk/pluginconfig/rollup.config.js
- [ ] packages/pluginsdk/pluginconfig/huskyrc.js
- [ ] packages/pluginsdk/rollup.config.js

## Phase 5: Import Path Cleanup and Strictness Graduation 📋
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
