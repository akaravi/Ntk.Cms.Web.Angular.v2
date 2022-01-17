import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  WebDesignerMainPageTemplateService,
  WebDesignerMainPageTemplateModel,
  DataFieldInfoModel,
  CoreSiteCategoryModel,
  WebDesignerMainPageTemplateSiteCategoryModel,
  WebDesignerMainPageTemplateSiteCategoryService,
  FilterModel,
  FilterDataModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-webdesigner-pagetemplate-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class WebDesignerMainPageTemplateEditComponent implements OnInit {
  requestId = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<WebDesignerMainPageTemplateEditComponent>,
    public coreEnumService: CoreEnumService,
    public webDesignerMainPageTemplateService: WebDesignerMainPageTemplateService,
    public webDesignerMainPageTemplateSiteCategoryService: WebDesignerMainPageTemplateSiteCategoryService,
    private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestId = data.id + '';
    }
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerTree: TreeModel;
  appLanguage = 'fa';
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<WebDesignerMainPageTemplateModel> = new ErrorExceptionResult<WebDesignerMainPageTemplateModel>();
  dataModel: WebDesignerMainPageTemplateModel = new WebDesignerMainPageTemplateModel();
  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  fileManagerOpenForm = false;
  dataCoreSiteCategoryModel: CoreSiteCategoryModel[];
  dataCoreSiteCategoryIds: number[] = [];
  dataWebDesignerMainPageTemplateSiteCategoryModel: WebDesignerMainPageTemplateSiteCategoryModel[];
  ngOnInit(): void {
    if (this.requestId.length > 0) {
this.formInfo.FormTitle =this.translate.instant('TITLE.Edit');
      this.DataGetOneContent();
    } else {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }
    this.getEnumRecordStatus();
    this.DataGetAllSourceSiteCategory();
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  DataGetOneContent(): void {
    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.webDesignerMainPageTemplateService.setAccessLoad();
    this.webDesignerMainPageTemplateService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        this.dataModel = next.Item;
        if (next.IsSuccess) {
          this.formInfo.FormTitle = this.formInfo.FormTitle + ' ' + next.Item.Title;
          this.formInfo.FormAlert = '';
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(pName);

      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  DataEditContent(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.webDesignerMainPageTemplateService.ServiceEdit(this.dataModel).subscribe(
      (next) => {
        this.formInfo.FormSubmitAllow = true;
        this.dataModelResult = next;
        if (next.IsSuccess) {
          this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessEdit();
          this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  DataGetAllSourceSiteCategory(): void {
    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'webDesignerMainPageTemplateSiteCategoryService';
    this.loading.Start(pName);
    const filteModelContent = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkPageTemplateId';
    filter.Value = this.requestId;
    filteModelContent.Filters.push(filter);
    this.webDesignerMainPageTemplateSiteCategoryService.ServiceGetAll(filteModelContent).subscribe(
      (next) => {
        this.dataWebDesignerMainPageTemplateSiteCategoryModel = next.ListItems;
        const listG: number[] = [];
        this.dataWebDesignerMainPageTemplateSiteCategoryModel.forEach(element => {
          listG.push(element.LinkSiteCagegoryId);
        });
        this.dataCoreSiteCategoryIds = listG;
        if (next.IsSuccess) {
          this.formInfo.FormAlert = '';
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  onActionSelectorUserCategorySelect(model: CoreSiteCategoryModel[]): void {
    this.dataCoreSiteCategoryModel = model;
  }
  onActionSelectorUserCategorySelectAdded(model: CoreSiteCategoryModel): void {
    const entity = new WebDesignerMainPageTemplateSiteCategoryModel();
    entity.LinkSiteCagegoryId = model.Id;
    entity.LinkPageTemplateId = this.dataModel.Id;
    const pName = this.constructor.name + 'webDesignerMainPageTemplateSiteCategoryService.ServiceAdd';
    this.loading.Start(pName);
    this.webDesignerMainPageTemplateSiteCategoryService.ServiceAdd(entity).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.formInfo.FormAlert = 'ثبت در این گروه با موفقیت انجام شد';
          this.cmsToastrService.typeSuccessEdit();
          // this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  onActionSelectorUserCategorySelectRemoved(model: CoreSiteCategoryModel): void {
    const entity = new WebDesignerMainPageTemplateSiteCategoryModel();
    entity.LinkSiteCagegoryId = model.Id;
    entity.LinkPageTemplateId = this.dataModel.Id;
    const pName = this.constructor.name + 'webDesignerMainPageTemplateSiteCategoryService.ServiceDeleteEntity';
    this.loading.Start(pName);
    this.webDesignerMainPageTemplateSiteCategoryService.ServiceDeleteEntity(entity).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.formInfo.FormAlert = 'حذف از این گروه با موفقیت انجام شد';
          this.cmsToastrService.typeSuccessEdit();
          // this.dialogRef.close({ dialogChangedDate: true });
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(pName);
      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);
        this.loading.Stop(pName);
      }
    );
  }
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.FormSubmitAllow = false;
    this.DataEditContent();
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
}