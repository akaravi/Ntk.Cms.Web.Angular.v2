import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  EstatePropertyModel,
  EstatePropertyService,
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  EstatePropertyTypeLanduseModel,
  DataFieldInfoModel,
  EstateAccountUserModel,
  CoreUserModel,
  CoreLocationModel,
  EstateContractTypeModel,
  EstateContractModel,
  EstateContractTypeService,
  EnumInputDataType,
  EstatePropertyDetailValueModel,
  EstatePropertyTypeUsageModel,
  FilterModel,
  FilterDataModel,
  EstatePropertyDetailGroupService,
  TokenInfoModel,
  EnumManageUserAccessUserTypes,
} from 'ntk-cms-api';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { CmsFormsErrorStateMatcher } from 'src/app/core/pipe/cmsFormsErrorStateMatcher';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import * as Leaflet from 'leaflet';
import { Map as leafletMap } from 'leaflet';
import { PoinModel } from 'src/app/core/models/pointModel';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { CmsMapComponent } from 'src/app/shared/cms-map/cms-map.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-estate-property-edit',
  templateUrl: './edit.component.html',
})
export class EstatePropertyEditComponent implements OnInit,OnDestroy {
  requestId = '';
  constructor(
    private activatedRoute: ActivatedRoute,
    public coreEnumService: CoreEnumService,
    public estateContractTypeService: EstateContractTypeService,
    public estatePropertyService: EstatePropertyService,
    public estatePropertyDetailGroupService: EstatePropertyDetailGroupService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private tokenHelper: TokenHelper,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      if (this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.AdminCpSite
        || this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.AdminMainCms
        || this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.AdminResellerCms
        || this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.SupportCpSite
        || this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.SupportMainCms
        || this.tokenInfo.UserAccessUserType === EnumManageUserAccessUserTypes.SupportResellerCms) {
        this.IsAdminSite = true;
      }
      else {
        this.IsAdminSite = false;
      }
    });
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  @ViewChild(CmsMapComponent) childMap: CmsMapComponent;

  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  enumInputDataType = EnumInputDataType;
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerTree: TreeModel;
  appLanguage = 'fa';
  IsAdminSite = false;
  tokenInfo = new TokenInfoModel();
  formMatcher = new CmsFormsErrorStateMatcher();
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<EstatePropertyModel> = new ErrorExceptionResult<EstatePropertyModel>();
  dataModelEstateContractTypeResult: ErrorExceptionResult<EstateContractTypeModel> = new ErrorExceptionResult<EstateContractTypeModel>();
  dataModel: EstatePropertyModel = new EstatePropertyModel();

  dataFileModelImgaes = new Map<number, string>();
  dataFileModelFiles = new Map<number, string>();
  formInfo: FormInfoModel = new FormInfoModel();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  fileManagerOpenForm = false;

  contractTypeSelected: EstateContractTypeModel;
  PropertyTypeSelected = new EstatePropertyTypeLanduseModel();
  contractDataModel = new EstateContractModel();
  optionActionTitle =this.translate.instant('ACTION.Add_To_List');
  loadingOption = new ProgressSpinnerModel();
  optionTabledataSource = new MatTableDataSource<EstateContractModel>();
  optionTabledisplayedColumns = ['LinkEstateContractTypeId', 'SalePrice', 'RentPrice', 'DepositPrice', 'Action'];

  propertyDetails: Map<string, string> = new Map<string, string>();
  /** map */
  viewMap = false;
  private mapModel: leafletMap;
  mapMarker: any;
  private mapMarkerPoints: Array<PoinModel> = [];
  mapOptonCenter = new PoinModel();
  // ** Accardon */
  step = 0;
  hidden = true;
  cmsApiStoreSubscribe: Subscription;

  ngOnInit(): void {
    if (this.requestId.length <= 0) {
      this.cmsToastrService.typeErrorComponentAction();
      // this.dialogRef.close({ dialogChangedDate: false });
      this.router.navigate(['/estate/property']);
      return;
    }
    this.formInfo.FormTitle =this.translate.instant('TITLE.Edit');
    this.DataGetOne();
    this.getEnumRecordStatus();
    this.getEstateContractType();

   
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataGetOne();
      this.getEnumRecordStatus();
      this.getEstateContractType();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  getEstateContractType(): void {
    const pName = this.constructor.name + 'getEstateContractType';
    this.loading.Start(pName, 'دریافت انواع معامله');
    this.estateContractTypeService.ServiceGetAll(null).subscribe((next) => {
      this.dataModelEstateContractTypeResult = next;
      this.loading.Stop(pName);
    }, () => {
      this.loading.Stop(pName);
    });

  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }

  DataGetOne(): void {
    this.formInfo.FormAlert = 'در دریافت ارسال اطلاعات از سرور';
    this.formInfo.FormError = '';


    const pName = this.constructor.name + 'ServiceGetOneById';
    this.loading.Start(pName, 'دریافت اطلاعات ملک');
    this.estatePropertyService.setAccessLoad();
    this.estatePropertyService.ServiceGetOneById(this.requestId).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

        this.dataModel = next.Item;
        if (next.IsSuccess) {
          this.optionTabledataSource.data = this.dataModel.Contracts;
          this.DataGetPropertyDetailGroup(this.dataModel.LinkPropertyTypeLanduseId);


          const lat = this.dataModel.Geolocationlatitude;
          const lon = this.dataModel.Geolocationlongitude;
          if (lat > 0 && lon > 0) {
            this.mapMarkerPoints = [];
            this.mapMarkerPoints.push({ lat, lon });
            this.receiveMap();
          }
          this.formInfo.FormTitle =next.Item.Title;
          this.formInfo.FormAlert = '';
          /*
          * check file attach list
          */
          if (this.dataModel.LinkFileIds && this.dataModel.LinkFileIds.length > 0) {
            this.dataModel.LinkFileIds.split(',').forEach((element, index) => {
              let link = '';
              if (this.dataModel.LinkFileIdsSrc.length >= this.dataModel.LinkFileIdsSrc.length) {
                link = this.dataModel.LinkFileIdsSrc[index];
              }
              this.dataFileModelFiles.set(+element, link);
            });
          }
          if (this.dataModel.LinkExtraImageIdsSrc && this.dataModel.LinkExtraImageIdsSrc.length > 0) {
            this.dataModel.LinkExtraImageIds.split(',').forEach((element, index) => {
              let link = '';
              if (this.dataModel.LinkExtraImageIdsSrc.length >= this.dataModel.LinkExtraImageIdsSrc.length) {
                link = this.dataModel.LinkExtraImageIdsSrc[index];
              }
              this.dataFileModelImgaes.set(+element, link);
            });
          }
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

  DataGetPropertyDetailGroup(id: string): void {
    const filteModelProperty = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkPropertyTypeLanduseId';
    filter.Value = id;
    filteModelProperty.Filters.push(filter);
    this.dataModel.PropertyDetailGroups = [];
    const pName = this.constructor.name + 'DataGetPropertyDetailGroup';
    this.loading.Start(pName, 'دریافت اطلاعات جزئیات');
    this.estatePropertyDetailGroupService.ServiceGetAll(filteModelProperty)
      .subscribe(
        async (next) => {
          if (next.IsSuccess) {
            this.dataModel.PropertyDetailGroups = next.ListItems;
            /** load Value */
            this.dataModel.PropertyDetailGroups.forEach(itemGroup => {
              itemGroup.PropertyDetails.forEach(element => {
                this.propertyDetails[element.Id] = 0;

                if (this.dataModel.PropertyDetailValues) {
                  const value = this.dataModel.PropertyDetailValues.find(x => x.LinkPropertyDetailId === element.Id);
                  if (value) {
                    this.propertyDetails[element.Id] = value.Value;
                  }
                }
              });
            });
            /** load Value */
          } else {
            this.cmsToastrService.typeErrorGetAccess(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.cmsToastrService.typeErrorGetAccess(error);
          this.loading.Stop(pName);
        }
      );
  }
  DataEdit(): void {
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';

    if (this.dataFileModelFiles) {
      const keys = Array.from(this.dataFileModelFiles.keys());
      if (keys && keys.length > 0) {
        this.dataModel.LinkFileIds = keys.join(',');
      }
    }
    if (this.dataFileModelImgaes) {
      const keys = Array.from(this.dataFileModelImgaes.keys());
      if (keys && keys.length > 0) {
        this.dataModel.LinkExtraImageIds = keys.join(',');
      }
    }
    const pName = this.constructor.name + 'ServiceEdit';
    this.loading.Start(pName, 'ثبت تغیرات اطلاعات ملک');

    this.estatePropertyService.ServiceEdit(this.dataModel).subscribe(
      (next) => {
        this.formInfo.FormSubmitAllow = true;
        this.dataModelResult = next;
        if (next.IsSuccess) {
          this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
          this.cmsToastrService.typeSuccessEdit();
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
  receiveMap(model: leafletMap = this.mapModel): void {
    if (!model) {
      return;
    }
    this.mapModel = model;

    if (this.mapMarkerPoints && this.mapMarkerPoints.length > 0) {
      this.mapMarkerPoints.forEach(item => {
        this.mapMarker = Leaflet.marker([item.lat, item.lon]).addTo(this.mapModel);
      });
      this.mapOptonCenter = this.mapMarkerPoints[0];
      this.mapMarkerPoints = [];
    }

    this.mapModel.on('click', (e) => {
      // @ts-ignore
      const lat = e.latlng.lat;
      // @ts-ignore
      const lon = e.latlng.lng;
      if (this.mapMarker !== undefined) {
        this.mapModel.removeLayer(this.mapMarker);
      }
      if (lat === this.dataModel.Geolocationlatitude && lon === this.dataModel.Geolocationlongitude) {
        this.dataModel.Geolocationlatitude = null;
        this.dataModel.Geolocationlongitude = null;
        return;
      }
      this.mapMarker = Leaflet.marker([lat, lon]).addTo(this.mapModel);
      this.dataModel.Geolocationlatitude = lat;
      this.dataModel.Geolocationlongitude = lon;
    });

  }

  receiveZoom(zoom: number): void {
  }
  onActionCopied(): void {
    this.cmsToastrService.typeSuccessCopedToClipboard();
  }
  onActionSelectorSelectUsage(model: EstatePropertyTypeUsageModel | null): void {
    if (!model || !model.Id || model.Id.length <= 0) {
      const message = 'دسته بندی اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.LinkPropertyTypeUsageId = model.Id;
  }
  onActionSelectorSelectLanduse(model: EstatePropertyTypeLanduseModel | null): void {
    if (!model || !model.Id || model.Id.length <= 0) {
      const message = 'دسته بندی اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.PropertyTypeSelected = model;
    this.dataModel.LinkPropertyTypeLanduseId = model.Id;
    this.DataGetPropertyDetailGroup(model.Id);
  }
  onActionSelectorCmsUser(model: CoreUserModel | null): void {
    if (!model || !model.Id || model.Id <= 0) {
      const message = 'کاربر اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.LinkCmsUserId = model.Id;
  }
  onActionSelectorLocation(model: CoreLocationModel | null): void {
    if (!model || !model.Id || model.Id <= 0) {
      const message = 'منطقه اطلاعات مشخص نیست';
      this.cmsToastrService.typeWarningSelected(message);
      this.dataModel.LinkLocationId = null;
      return;
    }
    this.dataModel.LinkLocationId = model.Id;
  }
  onActionSelectorEstateUser(model: EstateAccountUserModel | null): void {
    this.dataModel.LinkEstateUserId = null;
    if (!model || !model.Id || model.Id.length <= 0) {
      return;
    }
    this.dataModel.LinkEstateUserId = model.Id;
  }


  onActionSelectorContractType(model: EstateContractTypeModel | null): void {
    this.contractTypeSelected = null;
    if (!model || !model.Id || model.Id.length <= 0) {
      const message = 'نوع معامله ملک مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.contractTypeSelected = model;
    this.contractDataModel = new EstateContractModel();
    this.contractDataModel.ContractType = this.contractTypeSelected;
    this.contractDataModel.LinkEstateContractTypeId = this.contractTypeSelected.Id;
  }
  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      return;
    }
    this.formInfo.FormSubmitAllow = false;
    /** Save Value */
    this.dataModel.PropertyDetailValues = [];
    this.dataModel.PropertyDetailGroups.forEach(itemGroup => {
      itemGroup.PropertyDetails.forEach(element => {
        const value = new EstatePropertyDetailValueModel();
        value.LinkPropertyDetailId = element.Id;
        value.Value = this.propertyDetails[element.Id];

        this.dataModel.PropertyDetailValues.push(value);
      });
    });
    /** Save Value */
    if (!this.dataModel.Contracts || this.dataModel.Contracts.length === 0) {
      this.onActionOptionAddToList();
    }
    if (!this.dataModel.Contracts || this.dataModel.Contracts.length === 0) {
      const message = 'نوع معامله ملک مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      this.formInfo.FormSubmitAllow = true;
      return;
    }
    this.DataEdit();

  }
  onFormCancel(): void {
    // this.dialogRef.close({ dialogChangedDate: false });
    this.router.navigate(['/estate/property']);
  }

  onActionOptionAddToList(viewAlert: boolean = true): void {
    if (!this.contractTypeSelected || this.contractTypeSelected.Id.length === 0) {
      const message = 'نوع معامله ملک مشخص نیست';
      if (viewAlert) {
        this.cmsToastrService.typeErrorSelected(message);
      }
      return;
    }
    if (!this.dataModel.Contracts) {
      this.dataModel.Contracts = [];
    }
    this.dataModel.Contracts.push(this.contractDataModel);
    this.contractDataModel = new EstateContractModel();
    this.optionTabledataSource.data = this.dataModel.Contracts;
  }
  onActionOptionRemoveFromList(index: number): void {
    if (index < 0) {
      return;
    }
    if (!this.dataModel.Contracts || this.dataModel.Contracts.length === 0) {
      return;
    }
    this.contractDataModel = this.dataModel.Contracts[index];
    this.dataModel.Contracts.splice(index, 1);
    this.optionTabledataSource.data = this.dataModel.Contracts;
  }


  onActionFileSelectedLinkMainImageId(model: NodeInterface): void {
    this.dataModel.LinkMainImageId = model.id;
    this.dataModel.LinkMainImageIdSrc = model.downloadLinksrc;
  }
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      if (!this.dataModel.LinkPropertyTypeUsageId || this.dataModel.LinkPropertyTypeUsageId.length === 0) {
        this.cmsToastrService.typeErrorFormInvalid('نوع کاربری ملک انتخاب شود');
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
      if (!this.dataModel.LinkPropertyTypeLanduseId || this.dataModel.LinkPropertyTypeLanduseId.length === 0) {
        this.cmsToastrService.typeErrorFormInvalid('نوع کاربری زمین انتخاب شود');
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
      if (!this.formGroup.valid) {
        this.cmsToastrService.typeErrorFormInvalid();
        setTimeout(() => {
          stepper.selectedIndex = event.previouslySelectedIndex;
          // stepper.previous();
        }, 10);
      }
    }
  }
  onActionBackToParent(): void {
    this.router.navigate(['/estate/property/']);
  }
  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }
  // ** Accardon */
  onActionClickSalePriceAllowAgreement(): void {
    if (this.contractDataModel.SalePriceByAgreement) {
      this.contractDataModel.SalePrice = 0;
    }
  }
  onActionClickRentPriceAllowAgreement(): void {
    if (this.contractDataModel.RentPriceByAgreement) {
      this.contractDataModel.RentPrice = 0;
    }
  }
  onActionClickDepositPriceByAgreement(): void {
    if (this.contractDataModel.DepositPriceByAgreement) {
      this.contractDataModel.DepositPrice = 0;
    }
  }
  ActionCurrentPoint(): void {
    this.childMap.getPosition().then(pos => {
      const lat = pos.lat;
      const lon = pos.lon;
      if (lat > 0 && lon > 0) {

        if (this.mapMarker !== undefined) {
          this.mapModel.removeLayer(this.mapMarker);
        }
        this.mapMarkerPoints = [];
        this.mapMarkerPoints.push({ lat, lon });
        this.dataModel.Geolocationlatitude = lat;
        this.dataModel.Geolocationlongitude = lon;
        this.receiveMap();
      }
    });
  }
}

