import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  WebDesignerMainPageTemplateModel,
  WebDesignerMainPageTemplateService,
  EnumSortType,
  ErrorExceptionResult,
  FilterModel,
  TokenInfoModel,
  FilterDataModel,
  EnumRecordStatus,
  DataFieldInfoModel,
  CoreModuleModel} from 'ntk-cms-api';
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
import { WebDesignerMainPageTemplateEditComponent } from '../edit/edit.component';
import { WebDesignerMainPageTemplateAddComponent } from '../add/add.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-webdesigner-pagetemplate-list',
  templateUrl: './list.component.html',
})
export class WebDesignerMainPageTemplateListComponent implements OnInit, OnDestroy {
  constructor(
    public contentService: WebDesignerMainPageTemplateService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private tokenHelper: TokenHelper,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
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
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<WebDesignerMainPageTemplateModel> = new ErrorExceptionResult<WebDesignerMainPageTemplateModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<WebDesignerMainPageTemplateModel> = [];
  tableRowSelected: WebDesignerMainPageTemplateModel = new WebDesignerMainPageTemplateModel();
  tableSource: MatTableDataSource<WebDesignerMainPageTemplateModel> = new MatTableDataSource<WebDesignerMainPageTemplateModel>();
  dataModelCoreModuleResult: ErrorExceptionResult<CoreModuleModel> = new ErrorExceptionResult<CoreModuleModel>();
  tabledisplayedColumns: string[] = [
    'Id',
    'RecordStatus',
    'Title',
    'Folder',
    'IndexFile',
    'Action'
  ];
  expandedElement: WebDesignerMainPageTemplateModel | null;
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
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.tableRowSelected = new WebDesignerMainPageTemplateModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,this.translate.instant('MESSAGE.get_information_list'));
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
    const dialogRef = this.dialog.open(WebDesignerMainPageTemplateAddComponent, {
      height: '90%',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonEditRow(model: WebDesignerMainPageTemplateModel = this.tableRowSelected): void {
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
    const dialogRef = this.dialog.open(WebDesignerMainPageTemplateEditComponent, {
      height: '90%',
      data: { id: this.tableRowSelected.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonDeleteRow(model: WebDesignerMainPageTemplateModel = this.tableRowSelected): void {
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
    const message = this.translate.instant('MESSAGE.Do_you_want_to_delete_this_content') + '?' + '<br> ( ' + this.tableRowSelected.Title + ' ) ';
    this.cmsConfirmationDialogService.confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + 'contentService.ServiceDelete';
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
  onActionbuttonPageList(model: WebDesignerMainPageTemplateModel = this.tableRowSelected): void {
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
    this.router.navigate(['/webdesigner/page/LinkPageTemplateGuId', this.tableRowSelected.Id]);
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
  onActionTableRowSelect(row: WebDesignerMainPageTemplateModel): void {
    this.tableRowSelected = row;
  }
}