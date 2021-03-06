import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUserGroupRouting } from './coreUserGroup.routing';
import { CoreUserGroupComponent } from './coreUserGroup.component';
import {
  CoreModuleService,
  CoreUserGroupService,
} from 'ntk-cms-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { CoreUserGroupTreeComponent } from './tree/tree.component';
import { CoreUserGroupSelectorComponent } from './selector/selector.component';
import { CoreUserGroupEditComponent } from './edit/edit.component';
import { CoreUserGroupAddComponent } from './add/add.component';
import { CoreUserGroupListComponent } from './list/list.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { CoreUserGroupSelectionlistComponent } from './selectionlist/selectionlist.component';


@NgModule({
  declarations: [
    CoreUserGroupComponent,
    CoreUserGroupListComponent,
    CoreUserGroupAddComponent,
    CoreUserGroupEditComponent,
    CoreUserGroupSelectorComponent,
    CoreUserGroupTreeComponent,
    CoreUserGroupSelectionlistComponent,
  ],
  exports: [
    CoreUserGroupComponent,
    CoreUserGroupListComponent,
    CoreUserGroupAddComponent,
    CoreUserGroupEditComponent,
    CoreUserGroupSelectorComponent,
    CoreUserGroupTreeComponent,
    CoreUserGroupSelectionlistComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreUserGroupRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    
    SharedModule.forRoot(),
    AngularEditorModule,
    
    // CmsFileManagerModule

  ],
  providers: [
    CoreUserGroupService,
    CoreModuleService,
  ]
})
export class CoreUserGroupCmsModule {
}
