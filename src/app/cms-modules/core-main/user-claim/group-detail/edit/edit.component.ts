import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreUserClaimGroupDetailService,
  CoreUserClaimGroupDetailModel,
  DataFieldInfoModel,
  CoreUserClaimTypeModel,
  CoreUserClaimGroupModel,
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
import { TreeModel } from 'src/filemanager-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-core-userclaimgroupdetail-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreUserClaimGroupDetailEditComponent implements OnInit {
  requestModel = new CoreUserClaimGroupDetailModel();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimGroupDetailEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimGroupDetailService: CoreUserClaimGroupDetailService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestModel = data.model;
    }

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreUserClaimGroupDetailModel> = new ErrorExceptionResult<CoreUserClaimGroupDetailModel>();
  dataModel: CoreUserClaimGroupDetailModel = new CoreUserClaimGroupDetailModel();

  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();

  fileManagerOpenForm = false;


  ngOnInit(): void {
    if (this.requestModel && this.requestModel.LinkUserClaimTypeId > 0) {
this.formInfo.FormTitle =this.translate.instant('TITLE.Edit');
      this.DataGetOneContent();
    } else {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }

    this.getEnumRecordStatus();
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  DataGetOneContent(): void {

    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    const filteModelContent = new FilterModel();
    let fastfilter = new FilterDataModel();
    fastfilter.PropertyName = 'LinkUserClaimGroupId';
    fastfilter.Value = this.requestModel.LinkUserClaimGroupId;
    filteModelContent.Filters.push(fastfilter);
    /** */
    fastfilter = new FilterDataModel();
    fastfilter.PropertyName = 'LinkUserClaimTypeId';
    fastfilter.Value = this.requestModel.LinkUserClaimTypeId;
    filteModelContent.Filters.push(fastfilter);

    this.coreUserClaimGroupDetailService.setAccessLoad();
    this.coreUserClaimGroupDetailService.ServiceGetAll(filteModelContent).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        if (next.IsSuccess && next.ListItems.length > 0) {
          this.dataModel = next.ListItems[0];
          this.formInfo.FormTitle = this.formInfo.FormTitle + ' ' +
            this.dataModel.LinkUserClaimGroupId + '<-->' + this.dataModel.LinkUserClaimTypeId;
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

    this.coreUserClaimGroupDetailService.ServiceEdit(this.dataModel).subscribe(
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
  onActionSelectClaimGroup(model: CoreUserClaimGroupModel | null): void {
    if (!model || model.Id <= 0) {
      this.cmsToastrService.typeErrorMessage(
        'دسته را مشخص کنید',
        'گروه مدارک اطلاعات مشخص نیست'
      );
      return;
    }
    this.dataModel.LinkUserClaimGroupId = model.Id;
  }
  onActionSelectClaimType(model: CoreUserClaimTypeModel | null): void {
    if (!model || model.Id <= 0) {
      this.cmsToastrService.typeErrorMessage(
        'دسته را مشخص کنید',
        'نوع مدارک اطلاعات مشخص نیست'
      );
      return;
    }
    this.dataModel.LinkUserClaimTypeId = model.Id;
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
