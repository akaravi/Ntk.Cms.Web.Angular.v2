import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleRouting } from './article.routing';
import { ArticleComponent } from './article.component';

import {
  CoreEnumService,
  CoreModuleTagService,
  ArticleCategoryService,
  ArticleCommentService,
  ArticleConfigurationService,
  ArticleContentAndParameterValueService,
  ArticleContentOtherInfoService,
  ArticleContentParameterService,
  ArticleContentParameterTypeService,
  ArticleContentService,
  ArticleContentSimilarService,
  ArticleContentTagService,
  ArticleShareMainAdminSettingService,
  ArticleShareReceiverCategoryService,
  ArticleShareServerCategoryService,
  ArticleContentCategoryService,
  CoreModuleService
} from 'ntk-cms-api';
import { ArticleCategoryEditComponent } from './category/edit/edit.component';
import { ArticleCategoryDeleteComponent } from './category/delete/delete.component';
import { ArticleContentEditComponent } from './content/edit/edit.component';
import { ArticleContentAddComponent } from './content/add/add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { CmsFileManagerModule } from 'src/filemanager-api';
import { ArticleCategorySelectorComponent } from './category/selector/selector.component';
import { ArticleContentListComponent } from './content/list/list.component';
import { ArticleCategoryTreeComponent } from './category/tree/tree.component';
import { ArticleCommentListComponent } from './comment/list/list.component';
import { ArticleCommentEditComponent } from './comment/edit/edit.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ArticleContentSelectorComponent } from './content/selector/selector.component';
import { ArticleContentDeleteComponent } from './content/delete/delete.component';
import { ArticleCategoryAddComponent } from './category/add/add.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { ArticleCategoryTreeSelectorComponent } from './category/tree-selector/tree-selector.component';
import { ArticletHeaderComponent } from './content/header/header.component';
@NgModule({
  declarations: [
    ArticleComponent,
    ArticleContentAddComponent,
    ArticleContentEditComponent,
    ArticleContentDeleteComponent,
    ArticleContentListComponent,
    ArticleContentSelectorComponent,
    ArticleCategoryTreeComponent,
    ArticletHeaderComponent,
    ArticleCategorySelectorComponent,
    ArticleCategoryAddComponent,
    ArticleCategoryEditComponent,
    ArticleCategoryDeleteComponent,
    ArticleCommentListComponent,
    ArticleCommentEditComponent,
    ArticleCategoryTreeSelectorComponent,
  ],
  imports: [
    ArticleRouting,
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,
    
    CmsFileManagerModule
  ],
  providers: [
    CoreModuleService,
    CoreEnumService,
    /*Config*/
    ArticleConfigurationService,
    /*Config*/
    CoreModuleTagService,
    CmsConfirmationDialogService,
    ArticleCategoryService,
    ArticleCommentService,
    ArticleConfigurationService,
    ArticleContentService,
    ArticleContentCategoryService,
    ArticleContentAndParameterValueService,
    ArticleContentOtherInfoService,
    ArticleContentParameterService,
    ArticleContentParameterTypeService,
    ArticleContentSimilarService,
    ArticleContentTagService,
    ArticleShareMainAdminSettingService,
    ArticleShareReceiverCategoryService,
    ArticleShareServerCategoryService,
  ]
})
export class ArticleModule { }