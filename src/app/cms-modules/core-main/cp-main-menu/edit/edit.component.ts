import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreCpMainMenuService,
  CoreCpMainMenuModel,
  AccessModel,
  DataFieldInfoModel,
  CoreModuleModel,
  CoreUserGroupModel,
  CoreCpMainMenuCmsUserGroupModel,
  CoreCpMainMenuCmsUserGroupService,
  FilterModel,
  FilterDataModel
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
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-core-user-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreCpMainMenuEditComponent implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreCpMainMenuEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreCpMainMenuService: CoreCpMainMenuService,
    public coreCpMainMenuCmsUserGroupService: CoreCpMainMenuCmsUserGroupService,
    private cmsToastrService: CmsToastrService,
    private publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestId = +data.id || 0;
    }

  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();


  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreCpMainMenuModel> = new ErrorExceptionResult<CoreCpMainMenuModel>();
  dataModel: CoreCpMainMenuModel = new CoreCpMainMenuModel();

  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataModelEnumMenuPlaceTypeResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataAccessModel: AccessModel;

  fileManagerOpenForm = false;

  dataCoreCpMainMenuModel: CoreUserGroupModel[];
  dataCoreCpMainMenuIds: number[] = [];
  dataCoreCpMainMenuCmsUserGroupModel: CoreCpMainMenuCmsUserGroupModel[];

  ngOnInit(): void {
    if (this.requestId > 0) {
this.formInfo.FormTitle =this.translate.instant('TITLE.Edit');
      this.DataGetOneContent();
    } else {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }

    this.getEnumRecordStatus();
    this.getEnumMenuPlaceType();
    // this.DataGetAllMenuCoreUserGroup();
  }
  getEnumMenuPlaceType(): void {
    this.coreEnumService.ServiceEnumMenuPlaceType().subscribe((next) => {
      this.dataModelEnumMenuPlaceTypeResult = next;
    });
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  DataGetOneContent(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    /*َAccess Field*/
    this.coreCpMainMenuService.setAccessLoad();
    this.coreCpMainMenuService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        /*َAccess Field*/
        this.dataAccessModel = next.Access;
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        this.dataModel = next.Item;
        if (next.IsSuccess) {
          this.DataGetAllMenuCoreUserGroup();
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
  DataGetAllMenuCoreUserGroup(): void {

    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.FormAlert = 'در دریافت دسته بندی دسترسی های از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    const filteModelContent = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'CmsCpMainMenu_Id';
    filter.Value = this.requestId;
    filteModelContent.Filters.push(filter);

    this.coreCpMainMenuCmsUserGroupService.ServiceGetAll(filteModelContent).subscribe(
      (next) => {
        this.dataCoreCpMainMenuCmsUserGroupModel = next.ListItems;
        const listG: number[] = [];
        this.dataCoreCpMainMenuCmsUserGroupModel.forEach(element => {
          listG.push(element.CmsUserGroup_Id);
        });
        this.dataCoreCpMainMenuIds = listG;
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

  DataEditContent(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreCpMainMenuService.ServiceEdit(this.dataModel).subscribe(
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
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      if (!this.formGroup.valid) {
        this.cmsToastrService.typeErrorFormInvalid();
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
    }
  }
  onActionSelectorModuleSelect(model: CoreModuleModel): void {
    this.dataModel.LinkModuleId = null;
    if (model && model.Id > 0) {
      this.dataModel.LinkModuleId = model.Id;
    }
  }
  onActionSelectorSelect(model: CoreCpMainMenuModel): void {
    this.dataModel.LinkParentId = null;
    if (model && model.Id > 0) {
      this.dataModel.LinkParentId = model.Id;
    }
  }
  onActionSelectorUserCategorySelect(model: CoreUserGroupModel[]): void {
    this.dataCoreCpMainMenuModel = model;
  }
  onActionSelectorUserCategorySelectAdded(model: CoreUserGroupModel): void {
    const entity = new CoreCpMainMenuCmsUserGroupModel();
    entity.CmsUserGroup_Id = model.Id;
    entity.CmsCpMainMenu_Id = this.dataModel.Id;

    this.coreCpMainMenuCmsUserGroupService.ServiceAdd(entity).subscribe(
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

      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);

      }
    );
  }
  onActionSelectorUserCategorySelectRemoved(model: CoreUserGroupModel): void {
    const entity = new CoreCpMainMenuCmsUserGroupModel();
    entity.CmsUserGroup_Id = model.Id;
    entity.CmsCpMainMenu_Id = this.dataModel.Id;

    this.coreCpMainMenuCmsUserGroupService.ServiceDeleteEntity(entity).subscribe(
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
      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);
      }
    );
  }
  onIconPickerSelect(model: any): void {
    this.dataModel.Icon = model;
  }

}
