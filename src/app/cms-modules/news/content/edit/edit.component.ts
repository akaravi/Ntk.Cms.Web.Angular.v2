import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as Leaflet from 'leaflet';
import { FormGroup } from '@angular/forms';
import {
  CoreEnumService,
  EnumInfoModel,
  ErrorExceptionResult,
  FilterModel,
  FormInfoModel,
  NewsContentModel,
  NewsContentService,
  FilterDataModel,
  NewsCategoryModel,
  NewsContentTagService,
  NewsContentTagModel,
  NewsContentSimilarService,
  NewsContentOtherInfoService,
  NewsContentOtherInfoModel,
  NewsContentSimilarModel,
  AccessModel,
  DataFieldInfoModel,
  EnumClauseType,
  NewsContentCategoryModel,
  NewsContentCategoryService
} from 'ntk-cms-api';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { NodeInterface, TreeModel } from 'src/filemanager-api';
import { Map as leafletMap } from 'leaflet';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { PoinModel } from 'src/app/core/models/pointModel';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-news-content-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'
  ]
})
export class NewsContentEditComponent implements OnInit, AfterViewInit {
  requestId = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    public coreEnumService: CoreEnumService,
    public publicHelper: PublicHelper,
    private contentService: NewsContentService,
    private contentTagService: NewsContentTagService,
    private contentSimilarService: NewsContentSimilarService,
    private contentOtherInfoService: NewsContentOtherInfoService,
    private contentCategoryService: NewsContentCategoryService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loading.cdr = this.cdr;
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();
  }
  @ViewChild('vform', { static: false }) formGroup: FormGroup;
  dataModel = new NewsContentModel();
  dataModelResult: ErrorExceptionResult<NewsContentModel> = new ErrorExceptionResult<NewsContentModel>();
  dataContentTagModelResult: ErrorExceptionResult<NewsContentTagModel> = new ErrorExceptionResult<NewsContentTagModel>();
  dataContentSimilarModelResult: ErrorExceptionResult<NewsContentSimilarModel> = new ErrorExceptionResult<NewsContentSimilarModel>();
  dataContentOtherInfoModelResult: ErrorExceptionResult<NewsContentOtherInfoModel> = new ErrorExceptionResult<NewsContentOtherInfoModel>();
  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataContentCategoryModel: number[] = [];
  similarDataModel = new Array<NewsContentModel>();
  otherInfoDataModel = new Array<NewsContentOtherInfoModel>();
  contentSimilarSelected: NewsContentModel = new NewsContentModel();
  contentOtherInfoSelected: NewsContentOtherInfoModel = new NewsContentOtherInfoModel();
  otherInfoTabledisplayedColumns = ['Id', 'Title', 'TypeId', 'Action'];
  similarTabledisplayedColumns = ['LinkMainImageIdSrc', 'Id', 'RecordStatus', 'Title', 'Action'];
  similarTabledataSource = new MatTableDataSource<NewsContentModel>();
  otherInfoTabledataSource = new MatTableDataSource<NewsContentOtherInfoModel>();
  dataAccessModel: AccessModel;
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  loading = new ProgressSpinnerModel();
  selectFileTypeMainImage = ['jpg', 'jpeg', 'png'];
  selectFileTypePodcast = ['mp3'];
  selectFileTypeMovie = ['mp4', 'webm'];
  formInfo: FormInfoModel = new FormInfoModel();
  fileManagerOpenForm = false;
  fileManagerOpenFormPodcast = false;
  fileManagerOpenFormMovie = false;
  fileManagerTree: TreeModel;
  keywordDataModel = [];
  tagIdsData: number[];
  appLanguage = 'fa';
  viewMap = false;
  mapMarker: any;
  private mapModel: leafletMap;
  private mapMarkerPoints: Array<PoinModel> = [];
  mapOptonCenter = new PoinModel();
  ngOnInit(): void {
    this.requestId = + Number(this.activatedRoute.snapshot.paramMap.get('Id'));
    if (this.requestId === 0) {
      this.cmsToastrService.typeErrorAddRowParentIsNull();
      return;
    }
    this.DataGetOne();
    this.DataCategoryGetAll();
    this.getEnumRecordStatus();
  }
  ngAfterViewInit(): void {
  }
  onActionFileSelectedLinkMainImageId(model: NodeInterface): void {
    this.dataModel.LinkMainImageId = model.id;
    this.dataModel.LinkMainImageIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkFilePodcastId(model: NodeInterface): void {
    this.dataModel.LinkFilePodcastId = model.id;
    this.dataModel.LinkFilePodcastIdSrc = model.downloadLinksrc;
  }
  onActionFileSelectedLinkFileMovieId(model: NodeInterface): void {
    this.dataModel.LinkFileMovieId = model.id;
    this.dataModel.LinkFileMovieIdSrc = model.downloadLinksrc;
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  onFormSubmit(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorAddRowParentIsNull();
      return;
    }
    if (!this.formGroup.valid) {
      this.cmsToastrService.typeErrorFormInvalid();
      return;
    }
    this.dataModel.Keyword = '';
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
        this.dataModel.Keyword = listKeyword.join(',');
      }
    }
    this.DataEditContent();
  }
  DataGetOne(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.get_information_from_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,this.translate.instant('MESSAGE.Get_Information_List'));
    /*َAccess Field*/
    this.contentService.setAccessLoad();
    this.contentService
      .ServiceGetOneById(this.requestId)
      .subscribe(
        async (next) => {
          /*َAccess Field*/
          this.dataAccessModel = next.Access;
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
          this.loading.Stop(pName);
          this.dataModelResult = next;
          this.formInfo.FormSubmitAllow = true;
          if (next.IsSuccess) {
            this.dataModel = next.Item;
            const lat = this.dataModel.Geolocationlatitude;
            const lon = this.dataModel.Geolocationlongitude;
            if (lat > 0 && lon > 0) {
                 this.mapMarkerPoints=[];
              this.mapMarkerPoints.push({ lat, lon });
              this.receiveMap();
            }
            this.dataModel.Keyword = this.dataModel.Keyword + '';
            this.keywordDataModel = this.dataModel.Keyword.split(',');
            this.DataTagGetAll();
            this.DataOtherInfoGetAll();
            this.DataSimilarGetAllIds();
            this.loading.Stop(pName);
          } else {
            this.cmsToastrService.typeErrorGetOne(next.ErrorMessage);
          }
        },
        (error) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetOne(error);
        }
      );
  }
  DataTagGetAll(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = 'در حال دریافت اطلاعات تگها از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,'در حال دریافت اطلاعات تگها از سرور');
    const filteModel = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkContentId';
    filter.Value = this.requestId;
    filter.ClauseType = EnumClauseType.And;
    filteModel.Filters.push(filter);
    this.tagIdsData = [];
    this.contentTagService
      .ServiceGetAll(filteModel)
      .subscribe(
        async (next) => {
          this.loading.Stop(pName);
          this.dataContentTagModelResult = next;
          this.formInfo.FormSubmitAllow = true;
          if (next.IsSuccess) {
            const list = [];
            this.dataContentTagModelResult.ListItems.forEach(x => {
              list.push(x.LinkTagId);
            });
            this.tagIdsData = list;
            this.loading.Stop(pName);
          } else {
            this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
          }
        },
        (error) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(error);
        }
      );
  }
  DataOtherInfoGetAll(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = 'در حال دریافت سایر اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName, 'در حال دریافت سایر اطلاعات از سرور');
    const filteModel = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkContentId';
    filter.Value = this.requestId;
    filter.ClauseType = EnumClauseType.And;
    filteModel.Filters.push(filter);
    this.contentOtherInfoService
      .ServiceGetAll(filteModel)
      .subscribe(
        async (next) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.dataContentOtherInfoModelResult = next;
          if (next.IsSuccess) {
            this.otherInfoDataModel = next.ListItems;
            this.otherInfoTabledataSource.data = next.ListItems;
          } else {
            this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
          }
        },
        (error) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(error);
        }
      );
  }
  DataSimilarGetAllIds(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = 'در حال دریافت سایر اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,'در حال دریافت سایر اطلاعات از سرور');
    const filteModel = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkSourceId';
    filter.Value = this.requestId;
    filter.ClauseType = EnumClauseType.Or;
    filteModel.Filters.push(filter);
    filter.PropertyName = 'LinkDestinationId';
    filter.Value = this.requestId;
    filter.ClauseType = EnumClauseType.Or;
    filteModel.Filters.push(filter);
    this.contentSimilarService
      .ServiceGetAll(filteModel)
      .subscribe(
        async (next) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.dataContentSimilarModelResult = next;
          if (next.IsSuccess) {
            const listIds = Array<number>();
            next.ListItems.forEach(x => {
              if (x.LinkDestinationId === this.requestId) {
                listIds.push(x.LinkSourceId);
              } else {
                listIds.push(x.LinkDestinationId);
              }
            });
            this.DataSimilarGetAll(listIds);
          } else {
            this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
          }
        },
        (error) => {
          this.loading.Stop(pName);
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(error);
        }
      );
  }
  DataSimilarGetAll(ids: Array<number>): void {
    if (!ids || ids.length === 0) {
      return;
    }
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = 'در حال دریافت سایر اطلاعات از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,'در حال دریافت سایر اطلاعات از سرور');
    const filteModel = new FilterModel();
    ids.forEach(item => {
      if (item > 0) {
        const filter = new FilterDataModel();
        filter.PropertyName = 'Id';
        filter.Value = item;
        filter.ClauseType = EnumClauseType.Or;
        filteModel.Filters.push(filter);
      }
    });
    this.contentService
      .ServiceGetAll(filteModel)
      .subscribe(
        async (next) => {
          this.formInfo.FormSubmitAllow = true;
          if (next.IsSuccess) {
            this.similarDataModel = next.ListItems;
            this.similarTabledataSource.data = next.ListItems;
          } else {
            this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(error);
          this.loading.Stop(pName);
        }
      );
  }
  DataEditContent(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = this.translate.instant('MESSAGE.sending_information_to_the_server');
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,'در حال ارسال اطلاعات به سرور');
    this.contentService
      .ServiceEdit(this.dataModel)
      .subscribe(
        async (next) => {
          this.formInfo.FormSubmitAllow = true;
          this.dataModelResult = next;
          if (next.IsSuccess) {
            this.formInfo.FormAlert = this.translate.instant('MESSAGE.registration_completed_successfully');
            this.cmsToastrService.typeSuccessAdd();
            await this.DataActionAfterAddContentSuccessfulTag(this.dataModel);
            await this.DataActionAfterAddContentSuccessfulSimilar(this.dataModel);
            await this.DataActionAfterAddContentSuccessfulOtherInfo(this.dataModel);
            setTimeout(() => this.router.navigate(['/news/content']), 1000);
          } else {
            this.cmsToastrService.typeErrorAdd(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorAdd(error);
          this.loading.Stop(pName);
        }
      );
  }
  async DataActionAfterAddContentSuccessfulTag(model: NewsContentModel): Promise<any> {
    const dataListAdd = new Array<NewsContentTagModel>();
    const dataListDelete = new Array<NewsContentTagModel>();
    if (this.tagIdsData) {
      this.tagIdsData.forEach(item => {
        const row = new NewsContentTagModel();
        row.LinkContentId = model.Id;
        row.LinkTagId = item;
        if (!this.dataContentTagModelResult.ListItems || !this.dataContentTagModelResult.ListItems.find(x => x.LinkTagId === item)) {
          dataListAdd.push(row);
        }
      });
    }
    if (this.dataContentTagModelResult.ListItems) {
      this.dataContentTagModelResult.ListItems.forEach(item => {
        if (!this.tagIdsData || !this.tagIdsData.find(x => x === item.LinkTagId)) {
          dataListDelete.push(item);
        }
      });
    }
    if (dataListAdd && dataListAdd.length > 0) {
    }
    if (dataListDelete && dataListDelete.length > 0) {
    }
  }
  async DataActionAfterAddContentSuccessfulOtherInfo(model: NewsContentModel): Promise<any> {
    const dataListAdd = new Array<NewsContentOtherInfoModel>();
    const dataListDelete = new Array<NewsContentOtherInfoModel>();
    if (this.otherInfoDataModel) {
      this.otherInfoDataModel.forEach(item => {
        const row = new NewsContentOtherInfoModel();
        row.LinkContentId = model.Id;
        if (!this.dataContentOtherInfoModelResult.ListItems ||
          !item.Id ||
          !this.dataContentOtherInfoModelResult.ListItems.find(x => x.Id === item.Id)) {
          dataListAdd.push(row);
        }
      });
    }
    if (this.dataContentOtherInfoModelResult.ListItems) {
      this.dataContentOtherInfoModelResult.ListItems.forEach(item => {
        if (!this.otherInfoDataModel || !this.otherInfoDataModel.find(x => x.Id === item.Id)) {
          dataListDelete.push(item);
        }
      });
    }
    if (dataListAdd && dataListAdd.length > 0) {
    }
    if (dataListDelete && dataListDelete.length > 0) {
    }
  }
  async DataActionAfterAddContentSuccessfulSimilar(model: NewsContentModel): Promise<any> {
    const dataListAdd = new Array<NewsContentSimilarModel>();
    const dataListDelete = new Array<NewsContentSimilarModel>();
    if (this.similarDataModel) {
      this.similarDataModel.forEach(item => {
        const row = new NewsContentSimilarModel();
        row.LinkSourceId = model.Id;
        row.LinkDestinationId = item.Id;
        if (!this.dataContentSimilarModelResult.ListItems ||
          !this.dataContentSimilarModelResult.ListItems.find(x => x.LinkSourceId === item.Id || x.LinkDestinationId === item.Id)) {
          dataListAdd.push(row);
        }
      });
    }
    if (this.dataContentSimilarModelResult.ListItems) {
      this.dataContentSimilarModelResult.ListItems.forEach(item => {
        if (!this.similarDataModel || !this.similarDataModel.find(x => x.Id === item.LinkSourceId || x.Id === item.LinkDestinationId)) {
          dataListDelete.push(item);
        }
      });
    }
    if (dataListAdd && dataListAdd.length > 0) {
    }
    if (dataListDelete && dataListDelete.length > 0) {
    }
  }
  onActionSelectorSelect(model: NewsCategoryModel | null): void {
    if (!model || model.Id <= 0) {
      const message = 'دسته بندی اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.dataModel.LinkCategoryId = model.Id;
  }
  DataCategoryGetAll(): void {
    this.formInfo.FormSubmitAllow = false;
    this.formInfo.FormAlert = 'در حال دریافت اطلاعات دسته بندی از سرور';
    this.formInfo.FormError = '';
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,'در حال دریافت اطلاعات دسته بندی از سرور');
    const filteModel = new FilterModel();
    const filter = new FilterDataModel();
    filter.PropertyName = 'LinkContentId';
    filter.Value = this.requestId;
    filter.ClauseType = EnumClauseType.And;
    filteModel.Filters.push(filter);
    this.tagIdsData = [];
    this.contentCategoryService
      .ServiceGetAll(filteModel)
      .subscribe(
        async (next) => {
          const itemList = [];
          next.ListItems.forEach(element => {
            itemList.push(element.LinkCategoryId);
          });
          this.dataContentCategoryModel = itemList;
          this.formInfo.FormSubmitAllow = true;
          this.loading.Stop(pName);
        },
        (error) => {
          this.formInfo.FormSubmitAllow = true;
          this.cmsToastrService.typeErrorGetAll(error);
          this.loading.Stop(pName);
        }
      );
  }
  onActionCategorySelectChecked(model: number): void {
    if (!model || model <= 0) {
      const message = 'دسته بندی اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const entity = new NewsContentCategoryModel();
    entity.LinkCategoryId = model;
    entity.LinkContentId = this.dataModel.Id;
    this.contentCategoryService.ServiceAdd(entity).subscribe(
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
  onActionCategorySelectDisChecked(model: number): void {
    if (!model || model <= 0) {
      const message = 'دسته بندی اطلاعات مشخص نیست';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const entity = new NewsContentCategoryModel();
    entity.LinkCategoryId = model;
    entity.LinkContentId = this.dataModel.Id;
    this.contentCategoryService.ServiceDeleteEntity(entity).subscribe(
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
  onActionTagChange(ids: number[]): void {
    this.tagIdsData = ids;
  }
  onActionContentSimilarSelect(model: NewsContentModel | null): void {
    if (!model || model.Id <= 0) {
      return;
    }
    this.contentSimilarSelected = model;
  }
  onActionContentSimilarAddToLIst(): void {
    if (!this.contentSimilarSelected || this.contentSimilarSelected.Id <= 0) {
      return;
    }
    if (this.similarDataModel.find(x => x.Id === this.contentSimilarSelected.Id)) {
      this.cmsToastrService.typeErrorAddDuplicate();
      return;
    }
    this.similarDataModel.push(this.contentSimilarSelected);
    this.similarTabledataSource.data = this.similarDataModel;
  }
  onActionContentSimilarRemoveFromLIst(model: NewsContentModel | null): void {
    if (!model || model.Id <= 0) {
      return;
    }
    if (!this.similarDataModel || this.similarDataModel.length === 0) {
      return;
    }
    const retOut = new Array<NewsContentModel>();
    this.similarDataModel.forEach(x => {
      if (x.Id !== model.Id) {
        retOut.push(x);
      }
    });
    this.similarDataModel = retOut;
    this.similarTabledataSource.data = this.similarDataModel;
  }
  onActionContentOtherInfoAddToLIst(): void {
    if (!this.contentOtherInfoSelected) {
      return;
    }
    if (this.otherInfoDataModel.find(x => x.Title === this.contentOtherInfoSelected.Title)) {
      this.cmsToastrService.typeErrorAddDuplicate();
      return;
    }
    this.otherInfoDataModel.push(this.contentOtherInfoSelected);
    this.contentOtherInfoSelected = new NewsContentOtherInfoModel();
    this.otherInfoTabledataSource.data = this.otherInfoDataModel;
  }
  onActionContentOtherInfoRemoveFromLIst(index: number): void {

    if (index < 0) {
      return;
    }
    if (!this.otherInfoDataModel || this.otherInfoDataModel.length === 0) {
      return;
    }
    this.otherInfoDataModel.splice(index, 1);
    this.otherInfoTabledataSource.data = this.otherInfoDataModel;
  }
  onActionContentOtherInfoEditFromLIst(index: number): void {
    if (index < 0) {
      return;
    }
    if (!this.otherInfoDataModel || this.otherInfoDataModel.length === 0) {
      return;
    }
    this.contentOtherInfoSelected = this.otherInfoDataModel[index];
    this.otherInfoDataModel.splice(index, 1);
    this.otherInfoTabledataSource.data = this.otherInfoDataModel;
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
  onActionBackToParent(): void {
    this.router.navigate(['/news/content/']);
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
  receiveZoom(mode: leafletMap): void {
  }
}
