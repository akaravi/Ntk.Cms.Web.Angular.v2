
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  SmsMainApiPathModel,
  SmsMainApiPathService,
  EnumSortType,
  ErrorExceptionResult,
  FilterModel,
  TokenInfoModel,
  FilterDataModel,
  EnumRecordStatus,
  DataFieldInfoModel,
  CoreCurrencyModel,
  SmsMainApiPathCompanyModel,
  SmsMainApiPathCompanyService,
  SmsMainApiPathPublicConfigService,
  SmsMainApiPathPublicConfigModel
} from 'ntk-cms-api';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponentModels/base/componentOptionSearchModel';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ComponentOptionExportModel } from 'src/app/core/cmsComponentModels/base/componentOptionExportModel';
import { ComponentOptionStatistModel } from 'src/app/core/cmsComponentModels/base/componentOptionStatistModel';
import { MatSort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { SmsMainApiPathAddComponent } from '../add/add.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { SmsMainApiPathSendTestComponent } from '../sendTest/sendTest.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-sms-apipath-list',
  templateUrl: './list.component.html'
})
export class SmsMainApiPathListComponent implements OnInit, OnDestroy {
  requestLinkSiteId = 0;
  requestLinkCompanyId = '';
  requestLinkPublicConfigId = '';
  constructor(
    public contentService: SmsMainApiPathService,
    private smsMainApiPathCompanyService: SmsMainApiPathCompanyService,
    private smsMainApiPathPublicConfigService: SmsMainApiPathPublicConfigService,
    public publicHelper: PublicHelper,
    private activatedRoute: ActivatedRoute,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private router: Router,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    public dialog: MatDialog) {
    this.loading.cdr = this.cdr;
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };
    this.optionsExport.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionExport(model),
    };
    /*filter Sort*/
    this.filteModelContent.SortColumn = 'Id';
    this.filteModelContent.SortType = EnumSortType.Descending;
  }
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];

  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<SmsMainApiPathModel> = new ErrorExceptionResult<SmsMainApiPathModel>();
  dataModelCoreCurrencyResult: ErrorExceptionResult<CoreCurrencyModel> = new ErrorExceptionResult<CoreCurrencyModel>();
  dataModelCompanyResult: ErrorExceptionResult<SmsMainApiPathCompanyModel> = new ErrorExceptionResult<SmsMainApiPathCompanyModel>();
  dataModelPublicResult: ErrorExceptionResult<SmsMainApiPathPublicConfigModel> = new ErrorExceptionResult<SmsMainApiPathPublicConfigModel>();

  categoryModelSelected: SmsMainApiPathCompanyModel;

  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<SmsMainApiPathModel> = [];
  tableRowSelected: SmsMainApiPathModel = new SmsMainApiPathModel();
  tableSource: MatTableDataSource<SmsMainApiPathModel> = new MatTableDataSource<SmsMainApiPathModel>();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();


  tabledisplayedColumns: string[] = [
    'LinkMainImageIdSrc',
    'Id',
    'RecordStatus',
    'Title',
    'LinkApiPathCompanyId',
    'LinkPublicConfigId',
    'UpdatedDate',
    'Action'
  ];



  expandedElement: SmsMainApiPathModel | null;
  cmsApiStoreSubscribe: Subscription;

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.paramMap.get('LinkCompanyId')) {
      this.requestLinkCompanyId = this.activatedRoute.snapshot.paramMap.get('LinkCompanyId');
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkSiteId')) {
      this.requestLinkSiteId = +this.activatedRoute.snapshot.paramMap.get('LinkSiteId') || 0;
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkPublicConfigId')) {
      this.requestLinkPublicConfigId = this.activatedRoute.snapshot.paramMap.get('LinkPublicConfigId');
    }
    const filter = new FilterDataModel();
    if (this.requestLinkPublicConfigId?.length > 0) {
      filter.PropertyName = 'LinkPublicConfigId';
      filter.Value = this.requestLinkPublicConfigId;
      this.filteModelContent.Filters.push(filter);
    }
    if (this.requestLinkCompanyId.length > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkApiPathCompanyId';
      filter.Value = this.requestLinkCompanyId;
      this.filteModelContent.Filters.push(filter);
    }
    if (this.requestLinkSiteId > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkSiteId';
      filter.Value = this.requestLinkSiteId;
      this.filteModelContent.Filters.push(filter);
    }
    this.filteModelContent.SortColumn = 'Title';
    this.DataGetAll();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataGetAll();
      this.tokenInfo = next;
    });
    // this.getCurrency();
    this.getApiCopmanyList();
    this.getPublicConfig();
  }
  getPublicConfig(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.smsMainApiPathPublicConfigService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelPublicResult = next;
    });
  }
  getApiCopmanyList(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.smsMainApiPathCompanyService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelCompanyResult = next;
    });
  }
  // getCurrency(): void {
  //   const filter = new FilterModel();
  //   filter.RowPerPage = 100;
  //   this.coreCurrencyService.ServiceGetAll(filter).subscribe((next) => {
  //     this.dataModelCoreCurrencyResult = next;
  //   });
  // }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.tableRowSelected = new SmsMainApiPathModel();

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);


    this.filteModelContent.AccessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    /** filter Category */
    if (this.categoryModelSelected && this.categoryModelSelected.Id.length > 0) {
      let fastfilter = new FilterDataModel();
      fastfilter.PropertyName = 'LinkApiPathCompanyId';
      fastfilter.Value = this.categoryModelSelected.Id;
      filterModel.Filters.push(fastfilter);
    }
    /** filter Category */
    this.contentService.ServiceGetAllEditor(filterModel).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

          this.dataModelResult = next;
          this.tableSource.data = next.ListItems;

          if (this.optionsSearch.childMethods) {
            this.optionsSearch.childMethods.setAccess(next.Access);
          }
        }
        this.loading.Stop(pName);

      },
      (error) => {
        this.cmsToastrService.typeError(error);

        this.loading.Stop(pName);

      }
    );
  }


  onTableSortData(sort: MatSort): void {
    if (this.tableSource && this.tableSource.sort && this.tableSource.sort.active === sort.active) {
      if (this.tableSource.sort.start === 'asc') {
        sort.start = 'desc';
        this.filteModelContent.SortColumn = sort.active;
        this.filteModelContent.SortType = EnumSortType.Descending;
      } else if (this.tableSource.sort.start === 'desc') {
        this.filteModelContent.SortColumn = '';
        this.filteModelContent.SortType = EnumSortType.Ascending;
      } else {
        sort.start = 'desc';
      }
    } else {
      this.filteModelContent.SortColumn = sort.active;
      this.filteModelContent.SortType = EnumSortType.Ascending;
    }
    this.tableSource.sort = sort;
    this.filteModelContent.CurrentPageNumber = 0;
    this.DataGetAll();
  }
  onTablePageingData(event?: PageEvent): void {
    this.filteModelContent.CurrentPageNumber = event.pageIndex + 1;
    this.filteModelContent.RowPerPage = event.pageSize;
    this.DataGetAll();
  }


  onActionbuttonNewRow(): void {
    if (
      this.categoryModelSelected == null ||
      this.categoryModelSelected.Id.length === 0
    ) {
      const message = 'کمپانی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessAddRow
    ) {
      this.cmsToastrService.typeErrorAccessAdd();
      return;
    }
    const dialogRef = this.dialog.open(SmsMainApiPathAddComponent, {
      height: '90%',
      data: { LinkApiPathCompanyId: this.categoryModelSelected.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionbuttonEditRow(model: SmsMainApiPathModel = this.tableRowSelected): void {

    if (!model || !model.Id || model.Id.length === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = model;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    // const dialogRef = this.dialog.open(SmsMainApiPathEditComponent, {
    //   height: '90%',
    //   data: { id: this.tableRowSelected.Id }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result.dialogChangedDate) {
    //     this.DataGetAll();
    //   }
    // });
    this.router.navigate(['/sms/main/api-path/edit', this.tableRowSelected.Id]);

  }
  onActionbuttonDeleteRow(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const emessage = 'ردیفی برای حذف انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(emessage);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessDeleteRow
    ) {
      this.cmsToastrService.typeErrorAccessDelete();
      return;
    }


    const title = this.translate.instant('MESSAGE.Please_Confirm');
    const message = 'آیا مایل به حدف این محتوا می باشید ' + '?' + '<br> ( ' + this.tableRowSelected.Title + ' ) ';
    this.cmsConfirmationDialogService.confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + 'main';
          this.loading.Start(pName);

          this.contentService.ServiceDelete(this.tableRowSelected.Id).subscribe(
            (next) => {
              if (next.IsSuccess) {
                this.cmsToastrService.typeSuccessRemove();
                this.DataGetAll();
              } else {
                this.cmsToastrService.typeErrorRemove();
              }
              this.loading.Stop(pName);

            },
            (error) => {
              this.cmsToastrService.typeError(error);
              this.loading.Stop(pName);

            }
          );
        }
      }
      )
      .catch(() => {
        // console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
      }
      );

  }

  onActionSelectorSelect(model: SmsMainApiPathCompanyModel | null): void {
    this.filteModelContent = new FilterModel();
    this.categoryModelSelected = model;

    this.DataGetAll();
  }

  onActionbuttonStatist(): void {
    this.optionsStatist.data.show = !this.optionsStatist.data.show;
    if (!this.optionsStatist.data.show) {
      return;
    }
    const statist = new Map<string, number>();
    statist.set('Active', 0);
    statist.set('All', 0);
    this.contentService.ServiceGetCount(this.filteModelContent).subscribe(
      (next) => {
        if (next.IsSuccess) {
          statist.set('All', next.TotalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );

    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.PropertyName = 'RecordStatus';
    fastfilter.Value = EnumRecordStatus.Available;
    filterStatist1.Filters.push(fastfilter);
    this.contentService.ServiceGetCount(filterStatist1).subscribe(
      (next) => {
        if (next.IsSuccess) {
          statist.set('Active', next.TotalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
      }
      ,
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );

  }
  onActionbuttonSuperSedersList(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.router.navigate(['/bankpayment/privatesiteconfig/LinkPublicConfigId', this.tableRowSelected.Id]);
  }
  onActionbuttonMustSuperSedersList(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.router.navigate(['/bankpayment/privatesiteconfig/LinkPublicConfigId', this.tableRowSelected.Id]);
  }
  onActionbuttonNumbersList(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.router.navigate(['/bankpayment/privatesiteconfig/LinkPublicConfigId', this.tableRowSelected.Id]);
  }
  onActionbuttonPermitionList(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.router.navigate(['/sms/main/api-path-permission/LinkApiPathId', this.tableRowSelected.Id]);
  }
  onActionbuttonPriceServicesList(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    this.router.navigate(['/sms/main/api-path-price-service/LinkApiPathId', this.tableRowSelected.Id]);
  }

  onActionbuttonExport(): void {
    this.optionsExport.data.show = !this.optionsExport.data.show;
    this.optionsExport.childMethods.setExportFilterModel(this.filteModelContent);
  }
  onSubmitOptionExport(model: FilterModel): void {
    const exportlist = new Map<string, string>();
    exportlist.set('Download', 'loading ... ');
    this.contentService.ServiceExportFile(model).subscribe(
      (next) => {
        if (next.IsSuccess) {
          exportlist.set('Download', next.LinkFile);
          this.optionsExport.childMethods.setExportLinkFile(exportlist);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );
  }
  onActionbuttonSendTest(model: SmsMainApiPathModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {

      const message = 'ردیفی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    const dialogRef = this.dialog.open(SmsMainApiPathSendTestComponent, {
      height: '90%',
      data: { LinkApiPathId: this.tableRowSelected.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.Filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: SmsMainApiPathModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParent(): void {
    this.router.navigate(['/sms/main/api-path-company']);
  }
}
