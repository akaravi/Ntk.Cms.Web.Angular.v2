import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreUserClaimContentService,
  CoreUserClaimContentModel,
  DataFieldInfoModel,
  CoreUserClaimTypeModel,
  CoreUserModel,
  CoreSiteModel,
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
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';

@Component({
  selector: 'app-core-userclaimcontent-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class CoreUserClaimContentAddComponent implements OnInit, OnDestroy {
  requestLinkUserClaimTypeId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CoreUserClaimContentAddComponent>,
    public coreEnumService: CoreEnumService,
    public coreUserClaimContentService: CoreUserClaimContentService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private tokenHelper: TokenHelper,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestLinkUserClaimTypeId = +data.LinkUserClaimTypeId || 0;
    }
    if (this.requestLinkUserClaimTypeId > 0) {
      this.dataModel.LinkUserClaimTypeId = this.requestLinkUserClaimTypeId;
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

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreUserClaimContentModel> = new ErrorExceptionResult<CoreUserClaimContentModel>();
  dataModel: CoreUserClaimContentModel = new CoreUserClaimContentModel();
  tokenInfo = new TokenInfoModel();
  ProfessionalData = false;
  cmsApiStoreSubscribe: Subscription;
  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();

  fileManagerOpenForm = false;




  ngOnInit(): void {

    this.formInfo.FormTitle = 'اضافه کردن  ';
    this.getEnumRecordStatus();
    this.DataGetAccess();
  }
  ngOnDestroy() {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAccess(): void {
    this.coreUserClaimContentService
      .ServiceViewModel()
      .subscribe(
        async (next) => {
          if (next.IsSuccess) {
            // this.dataAccessModel = next.Access;
            this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
          } else {
            this.cmsToastrService.typeErrorGetAccess(next.ErrorMessage);
          }
        },
        (error) => {
          this.cmsToastrService.typeErrorGetAccess(error);
        }
      );
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }


  DataAddContent(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.coreUserClaimContentService.ServiceAdd(this.dataModel).subscribe(
      (next) => {
        this.formInfo.FormSubmitAllow = true;
        this.dataModelResult = next;
        if (next.IsSuccess) {
          this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessAdd();
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

    this.DataAddContent();
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
}
