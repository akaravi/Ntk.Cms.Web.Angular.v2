
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AccessModel,
  CoreSiteModel,
  CoreSiteService,
  CoreEnumService,
  DataFieldInfoModel,
  EnumInfoModel,
  ErrorExceptionResult,
  FormInfoModel,
  CoreSiteCategoryModel,
  TokenInfoModel,
  CoreUserModel,
} from 'ntk-cms-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { PoinModel } from 'src/app/core/models/pointModel';
import { Map as leafletMap } from 'leaflet';
import * as Leaflet from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-core-site-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class CoreSiteEditComponent implements OnInit , OnDestroy {
  requestId = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    public coreEnumService: CoreEnumService,
    private coreSiteService: CoreSiteService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private tokenHelper: TokenHelper
  ) {
    this.loading.cdr = this.cdr;
    this.requestId = + Number(this.activatedRoute.snapshot.paramMap.get('Id'));
    if (this.requestId === 0) {
      this.requestId = this.tokenInfo.SiteId;
    }
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      if (!this.requestId || this.requestId === 0) {
        this.DataGetOne(this.tokenInfo.SiteId);
      }
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      if ((!this.requestId || this.requestId === 0) && this.tokenInfo.SiteId !== this.dataModel.Id) {
        this.DataGetOne(this.tokenInfo.SiteId);
      }
    });
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  loading = new ProgressSpinnerModel();
  formInfo: FormInfoModel = new FormInfoModel();
  dataAccessModel: AccessModel;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  dataModel = new CoreSiteModel();
  dataModelResult: ErrorExceptionResult<CoreSiteModel> = new ErrorExceptionResult<CoreSiteModel>();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataModelEnumSiteStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataModelEnumLanguageResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  fileManagerOpenFormAboutUsLinkImageId = false;
  fileManagerOpenFormLinkFavIconId = false;
  fileManagerOpenFormPwaIconSize190x192Id = false;
  fileManagerOpenFormPwaIconSize512x512Id = false;
  fileManagerOpenFormLinkFileIdLogo = false;
  fileManagerOpenFormLinkImageLogoId = false;
  appLanguage = 'fa';
  tokenInfo = new TokenInfoModel();
  cmsApiStoreSubscribe: Subscription;
  fileManagerTree: TreeModel;
  mapMarker: any;
  private mapModel: leafletMap;
  private mapMarkerPoints: Array<PoinModel> = [];
  mapOptonCenter = new PoinModel();
  keywordDataModel = [];
  ngOnInit(): void {
    this.getEnumRecordStatus();
    this.getEnumSiteStatus();
    this.getEnumLanguage();
    if (this.requestId > 0) {
      this.DataGetOne(this.requestId);
    }
  }
  ngOnDestroy() {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  getEnumSiteStatus(): void {
    this.coreEnumService.ServiceEnumSiteStatus().subscribe((next) => {
      this.dataModelEnumSiteStatusResult = next;
    });
  }
  getEnumLanguage(): void {
    this.coreEnumService.ServiceEnumLanguage().subscribe((next) => {
      this.dataModelEnumLanguageResult = next;
    });
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }

  onFormSubmit(): void {
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }
    if (this.dataModel.linkCreatedBySiteId <= 0) {
      this.cmsToastrService.typeErrorEdit('سورس کد برنامه مشخص  کنید');

      return;
    }
    this.dataModel.SeoKeyword = '';
    if (this.keywordDataModel && this.keywordDataModel.length > 0) {
      const listKeyword = [];
      this.keywordDataModel.forEach(element => {
        if (element.display) {
          listKeyword.push(element.display);
        } else {
          listKeyword.push(element);
        }
      });
      if (listKeyword && listKeyword.length > 0) {
        this.dataModel.SeoKeyword = listKeyword.join(',');
      }
    }
    this.DataEditContent();
  }
  DataGetOne(id: number): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.get_information_from_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    /*َAccess Field*/
    this.coreSiteService.setAccessLoad();
    this.coreSiteService
      .ServiceGetOneById(id)
      .subscribe(
        async (next) => {
          /*َAccess Field*/
          this.dataAccessModel = next.Access;
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
          this.dataModelResult = next;
          this.formInfo.FormSubmitAllow = true;
          if (next.IsSuccess) {
            this.dataModel = next.Item;
            const lat = this.dataModel.AboutUsGeolocationlatitude;
            const lon = this.dataModel.AboutUsGeolocationlongitude;
            if (lat > 0 && lon > 0) {
              this.mapMarkerPoints = [];
              this.mapMarkerPoints.push({ lat, lon });
              this.receiveMap();
            }
            this.keywordDataModel = [];
            if (this.dataModel.SeoKeyword && this.dataModel.SeoKeyword.length > 0) {
              this.keywordDataModel = this.dataModel.SeoKeyword.split(',');
            }
          } else {
            this.cmsToastrService.typeErrorGetOne(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetOne(error);
          this.loading.Stop(pName);
        }
      );
  }
  DataEditContent(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.coreSiteService
      .ServiceEdit(this.dataModel)
      .subscribe(
        async (next) => {
          this.formInfo.FormSubmitAllow = !next.IsSuccess;
          this.dataModelResult = next;
          if (next.IsSuccess) {
            this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
            this.cmsToastrService.typeSuccessEdit();
            this.formInfo.FormSubmitAllow = true;
          } else {
            this.cmsToastrService.typeErrorEdit(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.loading.Stop(pName);

          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorEdit(error);
        }
      );
  }
  onStepClick(event: StepperSelectionEvent, stepper: MatStepper): void {
    if (event.previouslySelectedIndex < event.selectedIndex) {
      // if (!this.formGroup.valid) {
      //   this.cmsToastrService.typeErrorFormInvalid();
      //   setTimeout(() => {
      //     stepper.selectedIndex = event.previouslySelectedIndex;
      //     // stepper.previous();
      //   }, 10);
      // }
    }
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
      if (lat === this.dataModel.AboutUsGeolocationlatitude && lon === this.dataModel.AboutUsGeolocationlongitude) {
        this.dataModel.AboutUsGeolocationlatitude = null;
        this.dataModel.AboutUsGeolocationlongitude = null;
        return;
      }
      this.mapMarker = Leaflet.marker([lat, lon]).addTo(this.mapModel);
      this.dataModel.AboutUsGeolocationlatitude = lat;
      this.dataModel.AboutUsGeolocationlongitude = lon;
    });
  }
  onActionBackToParent(): void {
    this.router.navigate(['/core/site/']);
  }
  onActionFileSelectedAboutUsLinkImageId(model: NodeInterface): void {
    this.dataModel.AboutUsLinkImageId = model.id;
    this.dataModel.AboutUsLinkImageIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkFavIconId(model: NodeInterface): void {
    this.dataModel.LinkFavIconId = model.id;
    this.dataModel.LinkFavIconIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize190x192Id(model: NodeInterface): void {
    this.dataModel.PwaIconSize190x192Id = model.id;
    this.dataModel.PwaIconSize190x192IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedPwaIconSize512x512Id(model: NodeInterface): void {
    this.dataModel.LinkFavIconId = model.id;
    this.dataModel.PwaIconSize512x512IdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkImageLogoId(model: NodeInterface): void {
    this.dataModel.LinkImageLogoId = model.id;
    this.dataModel.LinkImageLogoIdSrc = model.downloadLinksrc;
  }
  onActionSelectCategory(model: CoreSiteCategoryModel | null): void {
    if (!model || model.Id <= 0) {
      const message = 'دسته بندی سایت مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.LinkSiteCategoryId = model.Id;
  }
  onActionSelectorLinkResellerSiteIdSelect(model: CoreSiteModel | null): void {
    this.dataModel.LinkResellerSiteId = null;
    if (!model || model.Id <= 0) {
      return;
    }
    this.dataModel.LinkResellerSiteId = model.Id;
  }
  onActionSelectorLinkResellerUserIdSelect(model: CoreUserModel | null): void {
    this.dataModel.LinkResellerUserId = null;
    if (!model || model.Id <= 0) {
      return;
    }
    this.dataModel.LinkResellerUserId = model.Id;
  }
}