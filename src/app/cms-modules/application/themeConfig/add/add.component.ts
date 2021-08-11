import {
  CoreEnumService,
  EnumModel,
  ErrorExceptionResult,
  FormInfoModel,
  ApplicationThemeConfigModel,
  ApplicationThemeConfigService,
  CoreModuleModel,
  AccessModel,
  DataFieldInfoModel,
  CoreSiteCategoryModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { NodeInterface, TreeModel } from 'projects/ntk-cms-filemanager/src/public-api';
import { CmsFormsErrorStateMatcher } from 'src/app/core/pipe/cmsFormsErrorStateMatcher';
import { CmsStoreService } from 'src/app/core/reducers/cmsStore.service';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-core-sitecategorycmsmodule-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class ApplicationThemeConfigAddComponent implements OnInit {
  requestLinkSourceId = 0;
  requestLinkCmsSiteCategoryId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cmsStoreService: CmsStoreService,
    private dialogRef: MatDialogRef<ApplicationThemeConfigAddComponent>,
    public coreEnumService: CoreEnumService,
    public applicationThemeConfigService: ApplicationThemeConfigService,
    private cmsToastrService: CmsToastrService,
    private publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    if (data) {
      this.requestLinkSourceId = +data.LinkSourceId || 0;
    }

    if (this.requestLinkSourceId > 0) {
      this.dataModel.LinkSourceId = this.requestLinkSourceId;
    }
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.DataGetAccess();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  dataAccessModel: AccessModel;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();


  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<ApplicationThemeConfigModel> = new ErrorExceptionResult<ApplicationThemeConfigModel>();
  dataModel: ApplicationThemeConfigModel = new ApplicationThemeConfigModel();


  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumModel> = new ErrorExceptionResult<EnumModel>();

  fileManagerOpenForm = false;


  ngOnInit(): void {
    this.getEnumRecordStatus();
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }

  DataGetAccess(): void {
    this.applicationThemeConfigService
      .ServiceViewModel()
      .subscribe(
        async (next) => {
          if (next.IsSuccess) {
            this.dataAccessModel = next.Access;
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

  DataAddContent(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    this.loading.Start('main');
    this.cdr.detectChanges();
    this.applicationThemeConfigService.ServiceAdd(this.dataModel).subscribe(
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
        this.loading.Stop('main');
        this.cdr.detectChanges();
      },
      (error) => {
        this.formInfo.FormSubmitAllow = true;
        this.cmsToastrService.typeError(error);
        this.loading.Stop('main');
        this.cdr.detectChanges();
      }
    );
  }
  onActionFileSelected(model: NodeInterface): void {
    this.dataModel.LinkMainImageId = model.id;
    this.dataModel.LinkMainImageIdSrc = model.downloadLinksrc;

  }
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.FormSubmitAllow = false;
    this.DataAddContent();
  }
  onActionSelectSource(model: CoreSiteCategoryModel): void {
    this.dataModel.LinkSourceId = null;
    if (model && model.Id > 0) {
      this.dataModel.LinkSourceId = model.Id;
    }
  }

  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: false });
  }
}
