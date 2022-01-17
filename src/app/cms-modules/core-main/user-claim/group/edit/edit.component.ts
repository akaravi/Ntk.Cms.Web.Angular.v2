import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreUserClaimGroupService,
  CoreUserClaimGroupModel,
  DataFieldInfoModel,
  CoreSiteCategoryModel,
  CoreModuleModel,
  ApplicationAppModel,
  CoreUserClaimTypeModel,
  CoreUserClaimGroupDetailService,
  CoreUserClaimGroupDetailModel,
  FilterModel,
  FilterDataModel,
  ApplicationSourceModel,
  CoreUserGroupModel,
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
import { TreeModel } from 'src/filemanager-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-core-userclaimgroup-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreUserClaimGroupEditComponent implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimGroupEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimGroupService: CoreUserClaimGroupService,
    public coreUserClaimGroupDetailService: CoreUserClaimGroupDetailService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestId = +data.id || 0;
    }

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreUserClaimGroupModel> = new ErrorExceptionResult<CoreUserClaimGroupModel>();
  dataModel: CoreUserClaimGroupModel = new CoreUserClaimGroupModel();

  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataModelEnumUserClaimGroupActionTypeResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();

  fileManagerOpenForm = false;
  dataCoreUserClaimTypeModels: CoreUserClaimTypeModel[];
  dataCoreClaimTypeIds: number[] = [];
  dataCoreUserClaimGroupDetailModels: CoreUserClaimGroupDetailModel[];


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
    this.getEnumUserClaimGroupActionType();
    this.DataGetAllCoreUserClaimType();

  }
  getEnumUserClaimGroupActionType(): void {
    this.coreEnumService.ServiceEnumUserClaimGroupActionType().subscribe((next) => {
      this.dataModelEnumUserClaimGroupActionTypeResult = next;
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
    const pName = this.constructor.name + 'DataGetOneContent';
    this.loading.Start(pName, 'دریافت دسته بندی مدارک');

    this.coreUserClaimGroupService.setAccessLoad();
    this.coreUserClaimGroupService.ServiceGetOneById(this.requestId).subscribe(
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
    this.loading.Start(pName, 'ثبت دسته بندی مدارک');
    this.coreUserClaimGroupService.ServiceEdit(this.dataModel).subscribe(
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
  onActionSelectApplication(model: ApplicationAppModel | null): void {
    if (!model || model.Id <= 0) {
      this.dataModel.LinkApplicationId = null;
      return;
    }
    this.dataModel.LinkApplicationId = model.Id;
  }
  onActionSelectApplicationSource(model: ApplicationSourceModel | null): void {
    if (!model || model.Id <= 0) {
      this.dataModel.LinkApplicationSourceId = null;
      return;
    }
    this.dataModel.LinkApplicationSourceId = model.Id;
  }
  onActionSelectUserGroup(model: CoreUserGroupModel | null): void {
    if (!model || model.Id <= 0) {
      this.dataModel.LinkUserGroupId = null;
      return;
    }
    this.dataModel.LinkUserGroupId = model.Id;
  }
  onActionSelectSiteCategory(model: CoreSiteCategoryModel | null): void {
    this.dataModel.LinkSiteCategoryId = null;
    if (!model || model.Id <= 0) {
      this.dataModel.LinkSiteCategoryId = null;
      return;
    }
    this.dataModel.LinkSiteCategoryId = model.Id;
  }
  onActionSelectModuleId(model: CoreModuleModel | null): void {
    this.dataModel.LinkModuleId = null;
    if (!model || model.Id <= 0) {
      return;
    }
    this.dataModel.LinkModuleId = model.Id;
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
  DataGetAllCoreUserClaimType(): void {

    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorEditRowIsNull();
      return;
    }

    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'DataGetAllCoreUserClaimType'
    this.loading.Start(pName, 'دریافت لیست مدارک');

    const filteModelContent = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkUserClaimGroupId';
    filter.Value = this.requestId;
    filteModelContent.Filters.push(filter);

    this.coreUserClaimGroupDetailService.ServiceGetAll(filteModelContent).subscribe(
      (next) => {
        this.dataCoreUserClaimGroupDetailModels = next.ListItems;
        const listG: number[] = [];
        this.dataCoreUserClaimGroupDetailModels.forEach(element => {
          listG.push(element.LinkUserClaimTypeId);
        });
        this.dataCoreClaimTypeIds = listG;
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
  onActionSelectorUserCategorySelect(model: CoreUserClaimTypeModel[]): void {
    this.dataCoreUserClaimTypeModels = model;
  }
  onActionSelectorUserCategorySelectAdded(model: CoreUserClaimTypeModel): void {
    const entity = new CoreUserClaimGroupDetailModel();
    entity.LinkUserClaimTypeId = model.Id;
    entity.LinkUserClaimGroupId = this.dataModel.Id;
    entity.IsRequired = true;

    this.coreUserClaimGroupDetailService.ServiceAdd(entity).subscribe(
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
  onActionSelectorUserCategorySelectRemoved(model: CoreUserClaimTypeModel): void {
    const entity = new CoreUserClaimGroupDetailModel();
    entity.LinkUserClaimTypeId = model.Id;
    entity.LinkUserClaimGroupId = this.dataModel.Id;

    this.coreUserClaimGroupDetailService.ServiceDeleteEntity(entity).subscribe(
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
}
