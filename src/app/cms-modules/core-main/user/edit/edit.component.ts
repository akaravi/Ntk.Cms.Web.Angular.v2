import {
  CoreEnumService,
  EnumModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreUserService,
  CoreUserModel,
  AccessModel,
  DataFieldInfoModel,
  NtkCmsApiStoreService,
  TokenInfoModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import {
  TreeModel,
  NodeInterface,
} from 'src/app/modules/filemanager_api';
import { CmsFormsErrorStateMatcher } from 'src/app/core/pipe/cmsFormsErrorStateMatcher';
import { CmsStoreService } from 'src/app/core/reducers/cmsStore.service';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-core-user-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class CoreUserEditComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    public coreEnumService: CoreEnumService,
    public coreUserService: CoreUserService,
    private cmsToastrService: CmsToastrService,
    private publicHelper: PublicHelper,
    private tokenHelper: TokenHelper,
    private cmsApiStore: NtkCmsApiStoreService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.requestId = + Number(this.activatedRoute.snapshot.paramMap.get('Id'));
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.cmsApiStore.getState((state) => state.ntkCmsAPiState.tokenInfo).subscribe((value) => {
      this.tokenInfo = value;
      this.DataGetOneContent();
    });
  }
  tokenInfo: TokenInfoModel;
  cmsApiStoreSubscribe: Subscription;

  requestId = 0;
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreUserModel> = new ErrorExceptionResult<CoreUserModel>();
  dataModel: CoreUserModel = new CoreUserModel();
  @ViewChild('vform', { static: false }) formGroup: FormGroup;

  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumModel> = new ErrorExceptionResult<EnumModel>();
  dataAccessModel: AccessModel;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  fileManagerOpenForm = false;

  onActionFileSelected(model: NodeInterface): void {
    this.dataModel.LinkMainImageId = model.id;
    this.dataModel.LinkMainImageIdSrc = model.downloadLinksrc;
  }

  ngOnInit(): void {
    if (this.requestId === 0) {
      this.requestId = this.tokenInfo.UserId;
    }
    if (this.requestId === 0) {
      this.cmsToastrService.typeErrorAddRowParentIsNull();
      return;
    }

    this.formInfo.FormTitle = 'ویرایش  ';
    this.DataGetOneContent();
    this.getEnumRecordStatus();
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  DataGetOneContent(): void {

    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';
    this.loading.Start('main');
    this.cdr.detectChanges();
    /*َAccess Field*/
    this.coreUserService.setAccessLoad();


    this.coreUserService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        /*َAccess Field*/
        this.dataAccessModel = next.Access;
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

        this.dataModel = next.Item;
        if (next.IsSuccess) {
          this.formInfo.FormTitle = this.formInfo.FormTitle + ' ' + next.Item.Username;
          this.formInfo.FormAlert = '';
        } else {
          this.formInfo.FormAlert = 'برروز خطا';
          this.formInfo.FormError = next.ErrorMessage;
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop('main');
        this.cdr.detectChanges();

      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop('main');
        this.cdr.detectChanges();
      }
    );
  }

  DataEditContent(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    this.loading.Start('main');
    this.cdr.detectChanges();

    this.coreUserService.ServiceEdit(this.dataModel).subscribe(
      (next) => {
        this.formInfo.FormSubmitAllow = true;
        this.dataModelResult = next;
        if (next.IsSuccess) {
          this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessEdit();
          if (next.Item.Id === this.tokenInfo.UserId) {
            this.tokenHelper.getCurrentToken();
          }
          // setTimeout(() => this.router.navigate(['/core/user/']), 100);
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
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.FormSubmitAllow = false;
    this.DataEditContent();
  }
  onActionBackToParent(): void {
    this.router.navigate(['/core/user/']);
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

}
