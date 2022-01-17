import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreUserClaimContentService,
  CoreUserClaimContentModel,
  DataFieldInfoModel,
  CoreUserClaimTypeModel,
  CoreSiteModel,
  CoreUserModel,
  TokenInfoModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-core-userclaim-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreUserClaimContentEditComponent implements OnInit ,OnDestroy {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimContentEditComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimContentService: CoreUserClaimContentService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private tokenHelper: TokenHelper,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestId = +data.id || 0;
    }

    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      if (!this.tokenInfo.UserAccessAdminAllowToProfessionalData && this.tokenInfo.UserAccessAdminAllowToAllData) {
        this.dataModel.LinkUserId = this.tokenInfo.UserId;
        this.dataModel.LinkSiteId = this.tokenInfo.SiteId;
        this.ProfessionalData = true;
      } else {
        this.ProfessionalData = false;
      }
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      if (!this.tokenInfo.UserAccessAdminAllowToProfessionalData && this.tokenInfo.UserAccessAdminAllowToAllData) {
        this.dataModel.LinkUserId = this.tokenInfo.UserId;
        this.dataModel.LinkSiteId = this.tokenInfo.SiteId;
        this.ProfessionalData = true;
      } else {
        this.ProfessionalData = false;
      }
    });
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  cmsApiStoreSubscribe: Subscription;
  tokenInfo = new TokenInfoModel();
  ProfessionalData=false;
  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreUserClaimContentModel> = new ErrorExceptionResult<CoreUserClaimContentModel>();
  dataModel: CoreUserClaimContentModel = new CoreUserClaimContentModel();

  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();

  fileManagerOpenForm = false;


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
  }
  ngOnDestroy() {
    this.cmsApiStoreSubscribe.unsubscribe();
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

    this.coreUserClaimContentService.setAccessLoad();
    this.coreUserClaimContentService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

        this.dataModel = next.Item;
        if (next.IsSuccess) {

          this.formInfo.FormTitle = this.formInfo.FormTitle + ' ' + next.Item.Id;
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

    this.coreUserClaimContentService.ServiceEdit(this.dataModel).subscribe(
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
  onActionFileSelected(model: NodeInterface): void {
    this.dataModel.LinkFileContentId = model.id;
    this.dataModel.LinkFileContentIdSrc = model.downloadLinksrc;
  }
  onActionSelectUser(model: CoreUserModel | null): void {
    if (!model || model.Id <= 0) {
      this.cmsToastrService.typeErrorMessage(
        'کاربر را مشخص کنید',
        'کاربر  اطلاعات مشخص نیست'
      );
      return;
    }
    this.dataModel.LinkUserId = model.Id;
  }
  onActionSelectSite(model: CoreSiteModel | null): void {
    if (!model || model.Id <= 0) {
      this.cmsToastrService.typeErrorMessage(
        'سایت را مشخص کنید',
        'سایت  اطلاعات مشخص نیست'
      );
      return;
    }
    this.dataModel.LinkSiteId = model.Id;
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
