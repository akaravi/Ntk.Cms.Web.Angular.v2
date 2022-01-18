import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreGuideRouting } from './coreGuide.routing';
import { CoreGuideComponent } from './coreGuide.component';
import {
  CoreModuleService,
  CoreGuideService,
} from 'ntk-cms-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreGuideTreeComponent } from './tree/tree.component';
import { CoreGuideSelectorComponent } from './selector/selector.component';
import { CoreGuideEditComponent } from './edit/edit.component';
import { CoreGuideAddComponent } from './add/add.component';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagInputModule } from 'ngx-chips';
import { CoreGuideListComponent } from './list/list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CoreInfoComponent } from '../site/info/core-info.component';
import { InlineSVGModule } from 'ng-inline-svg-2';


@NgModule({
  declarations: [
    CoreGuideComponent,
    CoreGuideListComponent,
    CoreGuideAddComponent,
    CoreGuideEditComponent,
    CoreGuideSelectorComponent,
    CoreGuideTreeComponent,
    CoreInfoComponent,
  ],
  exports: [
    CoreGuideComponent,
    CoreGuideListComponent,
    CoreGuideAddComponent,
    CoreGuideEditComponent,
    CoreGuideSelectorComponent,
    CoreGuideTreeComponent,
    CoreInfoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreGuideRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,
    TagInputModule,
    InlineSVGModule,

    // CmsFileManagerModule
    DragDropModule
  ],
  providers: [
    CoreGuideService,
    CoreModuleService,
  ]
})
export class CoreGuideCmsModule {
}
