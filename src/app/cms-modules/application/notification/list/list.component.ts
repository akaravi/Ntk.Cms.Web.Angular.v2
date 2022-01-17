import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  ApplicationAppModel,
  ApplicationLogNotificationModel,
  ApplicationLogNotificationService,
  DataFieldInfoModel,
  EnumRecordStatus,
  EnumSortType,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  TokenInfoModel
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
import { ApplicationLogNotificationViewComponent } from '../view/view.component';
import { ApplicationLogNotificationActionSendComponent } from '../action-send/action-send.component';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-application-notification-list',
  templateUrl: './list.component.html',
})
export class ApplicationLogNotificationListComponent implements OnInit, OnDestroy {
  requestLinkApplicationId = 0;
  requestLinkApplicationMemberId = '';
  constructor(
    private applicationLogNotificationService: ApplicationLogNotificationService,
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private translate: TranslateService,
    private tokenHelper: TokenHelper,
    public dialog: MatDialog) {
    this.loading.cdr = this.cdr;
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };
    this.optionsExport.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionExport(model),
    };
    /*filter Sort*/
    this.filteModelContent.SortColumn = 'CreatedDate';
    this.filteModelContent.SortType = EnumSortType.Descending;
  }
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<ApplicationLogNotificationModel> = new ErrorExceptionResult<ApplicationLogNotificationModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  categoryModelSelected: ApplicationAppModel;
  tableRowsSelected: Array<ApplicationLogNotificationModel> = [];
  tableRowSelected: ApplicationLogNotificationModel = new ApplicationLogNotificationModel();
  tableSource: MatTableDataSource<ApplicationLogNotificationModel> = new MatTableDataSource<ApplicationLogNotificationModel>();
  tabledisplayedColumns: string[] = [
    'Id',
    'RecordStatus',
    'LinkApplicationId',
    'LinkApplicationMemberId',
    'Title',
    'ContentType',
    'CreatedDate',
    'UpdatedDate',
    'Action'
  ];
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  expandedElement: ApplicationLogNotificationModel | null;
  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.requestLinkApplicationId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkApplicationId'));
    if (this.activatedRoute.snapshot.paramMap.get('LinkApplicationMemberId')) {
      this.requestLinkApplicationMemberId = this.activatedRoute.snapshot.paramMap.get('LinkApplicationMemberId');
    }
    if (this.requestLinkApplicationId > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkApplicationId';
      filter.Value = this.requestLinkApplicationId;
      this.filteModelContent.Filters.push(filter);
    }
    if (this.requestLinkApplicationMemberId.length > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkApplicationMemberId';
      filter.Value = this.requestLinkApplicationMemberId;
      this.filteModelContent.Filters.push(filter);
    }
    this.DataGetAll();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataGetAll();
      this.tokenInfo = next;
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.tableRowSelected = new ApplicationLogNotificationModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.filteModelContent.AccessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    const filter = new FilterDataModel();
    if (this.categoryModelSelected && this.categoryModelSelected.Id > 0) {
      filter.PropertyName = 'LinkApplicationId';
      filter.Value = this.categoryModelSelected.Id;
      filterModel.Filters.push(filter);
    }
    this.applicationLogNotificationService.ServiceGetAllEditor(filterModel).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        if (next.IsSuccess) {
          this.dataModelResult = next;
          this.tableSource.data = next.ListItems;
          if (this.tokenInfo.UserAccessAdminAllowToAllData || this.tokenInfo.UserAccessAdminAllowToProfessionalData) {
            this.tabledisplayedColumns = this.publicHelper.listAddIfNotExist(
              this.tabledisplayedColumns,
              'LinkSiteId',
              0
            );
          } else {
            this.tabledisplayedColumns = this.publicHelper.listRemoveIfExist(
              this.tabledisplayedColumns,
              'LinkSiteId'
            );
          }
          if (this.requestLinkApplicationId === 0) {
            this.tabledisplayedColumns = this.publicHelper.listRemoveIfExist(
              this.tabledisplayedColumns,
              'LinkApplicationId'
            );
          }
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
  onActionbuttonViewRow(model: ApplicationLogNotificationModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      this.cmsToastrService.typeErrorSelected();
      return;
    }
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessWatchRow
    ) {
      this.cmsToastrService.typeErrorAccessWatch();
      return;
    }
    const dialogRef = this.dialog.open(ApplicationLogNotificationViewComponent, {
      height: '90%',
      data: { id: this.tableRowSelected.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
      }
    });
  }
  onActionbuttonNewRow(): void {
    if (
      this.requestLinkApplicationId == null ||
      this.requestLinkApplicationId === 0
    ) {
      const message = this.translate.instant('MESSAGE.Content_Not_Selected');
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
  }
  onActionbuttonEditRow(model: ApplicationLogNotificationModel = this.tableRowSelected): void {
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
  }
  onActionbuttonDeleteRow(model: ApplicationLogNotificationModel = this.tableRowSelected): void {
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
  }
  onActionbuttonNotifictionActionSend(model: ApplicationLogNotificationModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      this.cmsToastrService.typeErrorSelected();
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
    const dialogRef = this.dialog.open(ApplicationLogNotificationActionSendComponent, {
      height: '90%',
      data: { LinkApplicationMemberId: this.tableRowSelected.LinkApplicationMemberId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
      }
    });
  }
  onActionSelectorSelect(model: ApplicationAppModel | null): void {
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
    this.applicationLogNotificationService.ServiceGetCount(this.filteModelContent).subscribe(
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
    this.applicationLogNotificationService.ServiceGetCount(filterStatist1).subscribe(
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
  onActionbuttonExport(): void {
    this.optionsExport.data.show = !this.optionsExport.data.show;
    this.optionsExport.childMethods.setExportFilterModel(this.filteModelContent);
  }
  onSubmitOptionExport(model: FilterModel): void {
    const exportlist = new Map<string, string>();
    exportlist.set('Download', 'loading ... ');
    this.applicationLogNotificationService.ServiceExportFile(model).subscribe(
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
  onActionbuttonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.Filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: ApplicationLogNotificationModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParent(): void {
    this.router.navigate(['/application/app/']);
  }
  onActionBackToParentMember(): void {
    this.router.navigate(['/application/memberinfo/']);
  }
}