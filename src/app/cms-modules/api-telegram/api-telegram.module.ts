import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTelegramComponent } from './api-telegram.component';
import { ApiTelegramRoutes } from './api-telegram.routing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagInputModule } from 'ngx-chips';

import {
  CoreAuthService,
  CoreEnumService,
  ApplicationEnumService,
  CoreModuleTagService,
  CoreModuleService
} from 'ntk-cms-api';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';

import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { CmsFileManagerModule } from 'src/filemanager-api';

@NgModule({
  declarations: [
    ApiTelegramComponent,
  ],
  imports: [
    CommonModule,
    ApiTelegramRoutes,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),

    SharedModule.forRoot(),
    AngularEditorModule,
    TagInputModule,
    
    MatIconModule,
    MatFormFieldModule,
    MatStepperModule,
  ],
  providers: [
    CoreEnumService,
    CoreAuthService,
    CmsConfirmationDialogService,
    ApplicationEnumService,
    CoreModuleTagService,
    CoreModuleService,
  ]
})
export class ApiTelegramModule { }
