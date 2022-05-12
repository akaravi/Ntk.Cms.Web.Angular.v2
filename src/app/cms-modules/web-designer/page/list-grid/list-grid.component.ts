
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  WebDesignerMainPageModel,
  WebDesignerMainPageService,
  EnumSortType,
  ErrorExceptionResult,
  FilterModel,
  TokenInfoModel,
  FilterDataModel,
  EnumRecordStatus,
  DataFieldInfoModel,
  WebDesignerMainPageTemplateModel,
  WebDesignerMainPageTemplateService,
  CoreSiteCategoryModel,
  CoreSiteCategoryService
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
import { WebDesignerMainPageEditComponent } from '../edit/edit.component';
import { WebDesignerMainPageAddComponent } from '../add/add.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { environment } from 'src/environments/environment';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-webdesigner-page-list-grid',
  templateUrl: './list-grid.component.html',
})
export class WebDesignerMainPageListGridComponent implements OnInit, OnDestroy {
  requestLinkPageParentGuId = '';
  requestLinkPageTemplateGuId = '';
  requestLinkPageDependencyGuId = '';
  constructor(
    public contentService: WebDesignerMainPageService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private webDesignerMainPageTemplateService: WebDesignerMainPageTemplateService,
    private coreSiteCategoryService: CoreSiteCategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public dialog: MatDialog) {
    this.loading.cdr = this.cdr;
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageTemplateGuId')) {
      this.requestLinkPageTemplateGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageTemplateGuId');
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageDependencyGuId')) {
      this.requestLinkPageDependencyGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageDependencyGuId');
    }
    if (this.activatedRoute.snapshot.paramMap.get('LinkPageParentGuId')) {
      this.requestLinkPageParentGuId = this.activatedRoute.snapshot.paramMap.get('LinkPageParentGuId');
    }
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };
    this.optionsExport.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionExport(model),
    };
    /*filter Sort*/
    this.filteModelContent.SortColumn = 'CreatedDate';
    this.filteModelContent.SortType = EnumSortType.Descending;
    if (this.requestLinkPageTemplateGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkPageTemplateGuId';
      filter.Value = this.requestLinkPageTemplateGuId;
      this.filteModelContent.Filters.push(filter);
    }
    if (this.requestLinkPageDependencyGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkPageDependencyGuId';
      filter.Value = this.requestLinkPageDependencyGuId;
      this.filteModelContent.Filters.push(filter);
    }
    if (this.requestLinkPageParentGuId.length > 0) {
      const filter = new FilterDataModel();
      filter.PropertyName = 'LinkPageParentGuId';
      filter.Value = this.requestLinkPageParentGuId;
      this.filteModelContent.Filters.push(filter);
    }
  }
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<WebDesignerMainPageModel> = new ErrorExceptionResult<WebDesignerMainPageModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<WebDesignerMainPageModel> = [];
  tableRowSelected: WebDesignerMainPageModel = new WebDesignerMainPageModel();
  tableSource: MatTableDataSource<WebDesignerMainPageModel> = new MatTableDataSource<WebDesignerMainPageModel>();
  dataModelWebDesignerMainPageTemplateResult: ErrorExceptionResult<WebDesignerMainPageTemplateModel> = new ErrorExceptionResult<WebDesignerMainPageTemplateModel>();
  dataModelCoreSiteCategoryResult: ErrorExceptionResult<CoreSiteCategoryModel> = new ErrorExceptionResult<CoreSiteCategoryModel>();
  tabledisplayedColumns: string[] = [
    'ThumbnailImageSrc',
    'Id',
    'RecordStatus',
    'Title',
    // 'LinkPageParentGuId',
    // 'LinkPageDependencyGuId',
    'LinkPageTemplateGuId',
    'PageDependencyIsDefaultPage',
    'PageDependencyIsDefaultPageLinkSiteCategoryId',
    'Action'
  ];
  expandedElement: WebDesignerMainPageModel | null;
  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.filteModelContent.SortColumn = 'Title';
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
      this.DataGetAll();
    });
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.tokenInfo = next;
      this.DataGetAll();
    });
    this.getModuleList();
    this.getSiteCategory();
  }
  getModuleList(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.webDesignerMainPageTemplateService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelWebDesignerMainPageTemplateResult = next;
    });
  }
  getSiteCategory(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.coreSiteCategoryService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelCoreSiteCategoryResult = next;
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.tableRowSelected = new WebDesignerMainPageModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);
    this.filteModelContent.AccessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
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
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessAddRow
    ) {
      this.cmsToastrService.typeErrorAccessAdd();
      return;
    }
    const dialogRef = this.dialog.open(WebDesignerMainPageAddComponent, {
      height: '90%',
      data: { LinkPageDependencyGuId: this.requestLinkPageDependencyGuId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonEditRow(model: WebDesignerMainPageModel = this.tableRowSelected): void {
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
    const dialogRef = this.dialog.open(WebDesignerMainPageEditComponent, {
      height: '90%',
      data: { id: this.tableRowSelected.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonDeleteRow(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const emessage = this.translate.instant('MESSAGE.no_row_selected_to_delete');
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
  onActionbuttonGoToSiteCategoryList(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const message = this.translate.instant('MESSAGE.no_row_selected_to_display');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.tableRowSelected = model;
    this.router.navigate(['/core/siteSiteCategory/', this.tableRowSelected.Id]);
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
  onActionbuttonHtmlEditor(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
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
    const urlTemplate = environment.cmsServerConfig.configHtmlBuilderServerPath + 'htmlbuilder/?id=' + model.Id
      + '&token=' + encodeURIComponent(this.tokenInfo.Token);
    // this.document.location.href = urlTemplate;
    window.open(urlTemplate, '_blank');
  }
  onActionbuttonHtmlView(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
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
    const urlTemplate = environment.cmsServerConfig.configMvcServerPath + 'page/' + model.Id + '?RenderViewPageByMaster=true&preview=true';
    // this.document.location.href = urlTemplate;
    window.open(urlTemplate, '_blank');
  }
  onActionbuttonSiteRouteView(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
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
    this.contentService.ServiceWebRoute(model.Id).subscribe(
      (next) => {
        if (next.IsSuccess) {
          window.open(next.Item, '_blank');
        }
        else {
          this.cmsToastrService.typeError(next.ErrorMessage);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );

  }
  onActionbuttonHtmlViewWithOutParent(model: WebDesignerMainPageModel = this.tableRowSelected): void {
    if (!model || !model.Id || model.Id.length === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
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
    const urlTemplate = environment.cmsServerConfig.configMvcServerPath + 'page/' + model.Id + '?RenderViewPageByMaster=false&preview=true';
    // this.document.location.href = urlTemplate;
    window.open(urlTemplate, '_blank');
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
  onActionbuttonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.Filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: WebDesignerMainPageModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParentTemplate(): void {
    this.router.navigate(['/webdesigner/pagetemplate']);
  }
  onActionBackToParentDependency(): void {
    this.router.navigate(['/webdesigner/pagedependency']);
  }
}