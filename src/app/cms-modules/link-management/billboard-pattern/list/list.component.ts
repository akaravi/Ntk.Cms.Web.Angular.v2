//**msh */
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  EnumSortType,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  LinkManagementBillboardPatternModel,
  LinkManagementBillboardPatternService,
  TokenInfoModel,
  EnumRecordStatus,
  DataFieldInfoModel,
} from 'ntk-cms-api';
import { PublicHelper } from '../../../../core/helpers/publicHelper';
import { CmsToastrService } from '../../../../core/services/cmsToastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerModel } from '../../../../core/models/progressSpinnerModel';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponentModels/base/componentOptionSearchModel';
import { ComponentOptionStatistModel } from 'src/app/core/cmsComponentModels/base/componentOptionStatistModel';
import { ComponentOptionExportModel } from 'src/app/core/cmsComponentModels/base/componentOptionExportModel';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LinkManagementBillboardPatternDeleteComponent } from '../delete/delete.component';
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-linkmanagement-billboard-pattern-list',
  templateUrl: './list.component.html',
})
export class LinkManagementBillboardPatternListComponent implements OnInit, OnDestroy {

  constructor(
    public publicHelper: PublicHelper,
    public contentService: LinkManagementBillboardPatternService,
    private cmsToastrService: CmsToastrService,
    private router: Router,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public translate: TranslateService,

  ) {
    this.loading.cdr = this.cdr;this.loading.message = this.translate.instant('MESSAGE.Receiving_information');

    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };
    this.optionsExport.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionExport(model),
    };
    /*filter Sort*/
    this.filteModelContent.sortColumn = 'Id';
    this.filteModelContent.sortType = EnumSortType.Descending;

  }
  filteModelContent = new FilterModel();
  categoryModelSelected: LinkManagementBillboardPatternModel;
  dataModelResult: ErrorExceptionResult<LinkManagementBillboardPatternModel> = new ErrorExceptionResult<LinkManagementBillboardPatternModel>();

  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<LinkManagementBillboardPatternModel> = [];
  tableRowSelected: LinkManagementBillboardPatternModel = new LinkManagementBillboardPatternModel();
  tableSource: MatTableDataSource<LinkManagementBillboardPatternModel> = new MatTableDataSource<LinkManagementBillboardPatternModel>();
  tabledisplayedColumns: string[] = [
    'LinkMainImageIdSrc',
    'Id',
    'RecordStatus',
    'Title',
    'CreatedDate',
    'UpdatedDate',
    'Action'
  ];
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {

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
    this.tabledisplayedColumns=this.publicHelper.TabledisplayedColumnsCheckByAllDataAccess(this.tabledisplayedColumns,[],this.tokenInfo);
    this.tableRowsSelected = [];
    this.tableRowSelected = new LinkManagementBillboardPatternModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName, this.translate.instant('MESSAGE.get_information_list'));
    this.filteModelContent.accessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    if (this.categoryModelSelected && this.categoryModelSelected.id > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkCategoryId';
      filter.value = this.categoryModelSelected.id;
      filterModel.filters.push(filter);
    }
    this.contentService.setAccessLoad();
    this.contentService.ServiceGetAllEditor(filterModel).subscribe({
      next: (ret) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(ret.access);

        if (ret.isSuccess) {
          this.dataModelResult = ret;
          this.tableSource.data = ret.listItems;
         
          if (this.optionsSearch.childMethods) {
            this.optionsSearch.childMethods.setAccess(ret.access);
          }
        } else {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
        this.loading.Stop(pName);

      },
      error: (er) => {
        this.cmsToastrService.typeError(er);

        this.loading.Stop(pName);
      }
    }
    );
  }

  onTableSortData(sort: MatSort): void {
    if (this.tableSource && this.tableSource.sort && this.tableSource.sort.active === sort.active) {
      if (this.tableSource.sort.start === 'asc') {
        sort.start = 'desc';
        this.filteModelContent.sortColumn = sort.active;
        this.filteModelContent.sortType = EnumSortType.Descending;
      } else if (this.tableSource.sort.start === 'desc') {
        this.filteModelContent.sortColumn = '';
        this.filteModelContent.sortType = EnumSortType.Ascending;
      } else {
        sort.start = 'desc';
      }
    } else {
      this.filteModelContent.sortColumn = sort.active;
      this.filteModelContent.sortType = EnumSortType.Ascending;
    }
    this.tableSource.sort = sort;
    this.filteModelContent.currentPageNumber = 0;
    this.DataGetAll();
  }
  onTablePageingData(event?: PageEvent): void {
    this.filteModelContent.currentPageNumber = event.pageIndex + 1;
    this.filteModelContent.rowPerPage = event.pageSize;
    this.DataGetAll();
  }

  onActionSelectorSelect(model: LinkManagementBillboardPatternModel | null): void {
    this.filteModelContent = new FilterModel();
    this.categoryModelSelected = model;

    this.DataGetAll();
  }

  onActionbuttonNewRow(): void {
    if (
      this.categoryModelSelected == null ||
      this.categoryModelSelected.id === 0
    ) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorCategoryNotSelected');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessAddRow
    ) {
      this.cmsToastrService.typeErrorAccessAdd();
      return;
    }
    this.router.navigate(['/linkmanagement/billboard-pattern/add', this.categoryModelSelected.id]);
  }

  onActionbuttonEditRow(model: LinkManagementBillboardPatternModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = model;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    this.router.navigate(['/linkmanagement/billboard-pattern/edit', this.tableRowSelected.id]);
  }
  onActionbuttonDeleteRow(model: LinkManagementBillboardPatternModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id === 0) {
      const emessage = this.translate.instant('MESSAGE.no_row_selected_to_delete');
      this.cmsToastrService.typeErrorSelected(emessage); return;
    }
    this.tableRowSelected = model;

    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessDeleteRow
    ) {
      this.cmsToastrService.typeErrorAccessDelete();
      return;
    }
    const dialogRef = this.dialog.open(LinkManagementBillboardPatternDeleteComponent, { height: '90%', data: { id: this.tableRowSelected.id } });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
  onActionbuttonStatist(): void {
    this.optionsStatist.data.show = !this.optionsStatist.data.show;
    if (!this.optionsStatist.data.show) {
      return;
    }
    const statist = new Map<string, number>();
    statist.set('Active', 0);
    statist.set('All', 0);
    this.contentService.ServiceGetCount(this.filteModelContent).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          statist.set('All', ret.totalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        } else {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
      }
    }
    );

    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.propertyName = 'RecordStatus';
    fastfilter.value = EnumRecordStatus.Available;
    filterStatist1.filters.push(fastfilter);
    this.contentService.ServiceGetCount(filterStatist1).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          statist.set('Active', ret.totalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        } else {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
      }
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
    this.contentService.ServiceExportFile(model).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          exportlist.set('Download', ret.linkFile);
          this.optionsExport.childMethods.setExportLinkFile(exportlist);
        } else {
          this.cmsToastrService.typeErrorMessage(ret.errorMessage);
        }
      },
      error: (er) => {
        this.cmsToastrService.typeError(er);
      }
    }
    );
  }

  onActionbuttonReload(): void {
    this.DataGetAll();
  }
  onSubmitOptionsSearch(model: any): void {
    this.filteModelContent.filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: LinkManagementBillboardPatternModel): void {
    this.tableRowSelected = row;
  }


  onActionbuttonComment(model: LinkManagementBillboardPatternModel = this.tableRowSelected): void {
    if (!model || !model.id || model.id === 0) {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorSelectedRow');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.router.navigate(['/linkmanagement/billboard-log/', model.id]);
  }
}
