import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  ApiTelegramBotConfigService,
  ApiTelegramBotConfigModel,
  DataFieldInfoModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';
import { CmsViewComponent } from 'src/app/shared/cms-view/cms-view.component';

@Component({
  selector: 'app-core-module-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class ApiTelegramBotConfigEditComponent implements OnInit {
  requestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ApiTelegramBotConfigEditComponent>,
    public coreEnumService: CoreEnumService,
    public apiTelegramBotConfigService: ApiTelegramBotConfigService,
    private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    public dialog: MatDialog
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
  @Input()
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<ApiTelegramBotConfigModel> = new ErrorExceptionResult<ApiTelegramBotConfigModel>();
  dataModel: ApiTelegramBotConfigModel = new ApiTelegramBotConfigModel();

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
    this.apiTelegramBotConfigService.setAccessLoad();
    this.apiTelegramBotConfigService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        this.dataModel = next.Item;
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

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

    this.apiTelegramBotConfigService.ServiceEdit(this.dataModel).subscribe(
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
  onActionbuttonGetMeAsync(): void {
    const pName = this.constructor.name + 'ServiceGetMeAsync';

    this.apiTelegramBotConfigService.ServiceGetMeAsync(this.requestId).subscribe(
      (next) => {
        if (next.IsSuccess) {
          //open popup
          const dialogRef = this.dialog.open(CmsViewComponent, {
            // height: "90%",
            data: {
              optionItem: next.Item,
              // UrlViewContentQRCodeBase64: next.Item.UrlViewContentQRCodeBase64,
              /// UrlViewContent: next.Item.UrlViewContent,
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result && result.dialogChangedDate) {

            }
          });
          //open popup
        } else {
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
  onActionbuttonSetWebhookAsync(): void {
    const pName = this.constructor.name + 'ServiceSetWebhookAsync';

    this.apiTelegramBotConfigService.ServiceSetWebhookAsync(this.requestId).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.cmsToastrService.typeSuccessAdd();
        } else {
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
  onActionbuttonSetWebhookAsyncEmpty(): void {
    const pName = this.constructor.name + 'ServiceSetWebhookAsyncEmpty';

    this.apiTelegramBotConfigService.ServiceSetWebhookAsyncEmpty(this.requestId).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.cmsToastrService.typeSuccessAdd();
        } else {
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
