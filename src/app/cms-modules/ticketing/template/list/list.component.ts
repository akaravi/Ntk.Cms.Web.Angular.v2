import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  TicketingTemplateModel,
  TicketingTemplateService,
  EnumSortType,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  NtkCmsApiStoreService,
  TokenInfoModel,
  TicketingDepartemenModel,
  EnumRecordStatus,
  DataFieldInfoModel
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
import { TicketingTemplateEditComponent } from '../edit/edit.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { TicketingTemplateAddComponent } from '../add/add.component';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-application-app-list',
  templateUrl: './list.component.html',
})
export class TicketingTemplateListComponent implements OnInit, OnDestroy {
  requestDepartemenId = 0;
  constructor(
    public contentService: TicketingTemplateService,
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private router: Router,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    public dialog: MatDialog) {
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
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];

  filteModelContent = new FilterModel();
  dataModelResult: ErrorExceptionResult<TicketingTemplateModel> = new ErrorExceptionResult<TicketingTemplateModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<TicketingTemplateModel> = [];
  tableRowSelected: TicketingTemplateModel = new TicketingTemplateModel();
  tableSource: MatTableDataSource<TicketingTemplateModel> = new MatTableDataSource<TicketingTemplateModel>();
  categoryModelSelected: TicketingDepartemenModel;

  tabledisplayedColumns: string[] = [
    'Id',
    'RecordStatus',
    'Title',
    'Action'
  ];
  cmsApiStoreSubscribe: Subscription;



  ngOnInit(): void {
    this.requestDepartemenId = + Number(this.activatedRoute.snapshot.paramMap.get('DepartemenId'));
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
    this.tableRowSelected = new TicketingTemplateModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName,this.translate.instant('MESSAGE.get_information_list'));
    this.filteModelContent.accessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelContent));
    /*filter CLone*/
    const filter = new FilterDataModel();
    if (this.requestDepartemenId > 0) {
      filter.propertyName = 'LinkTicketingDepartemenId';
      filter.value = this.requestDepartemenId;
      filterModel.filters.push(filter);
    }
    if (this.categoryModelSelected && this.categoryModelSelected.id > 0) {
      filter.propertyName = 'LinkTicketingDepartemenId';
      filter.value = this.categoryModelSelected.id;
      filterModel.filters.push(filter);
    }
    this.contentService.ServiceGetAllEditor(filterModel).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.access);
        if (next.isSuccess) {
          this.dataModelResult = next;
          this.tableSource.data = next.listItems;
     
          if (this.optionsSearch.childMethods) {
            this.optionsSearch.childMethods.setAccess(next.access);
          }
        }
        else {
          this.cmsToastrService.typeErrorGetAll(next.errorMessage);

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


  onActionbuttonNewRow(): void {
    if (this.categoryModelSelected == null &&
      (this.categoryModelSelected && this.categoryModelSelected.id === 0) &&
      (this.requestDepartemenId == null || this.requestDepartemenId === 0)
    ) {
      const message = this.translate.instant('MESSAGE.Content_not_selected');
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
    let parentId: number = this.requestDepartemenId;
    if (this.categoryModelSelected && this.categoryModelSelected.id > 0) {
      parentId = this.categoryModelSelected.id;
    }
    const dialogRef = this.dialog.open(TicketingTemplateAddComponent, {
      height: '90%',
      data: { parentId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionSelectorSelect(model: TicketingDepartemenModel | null): void {
    this.filteModelContent = new FilterModel();
    this.categoryModelSelected = model;

    this.DataGetAll();
  }
  onActionbuttonEditRow(mode: TicketingTemplateModel = this.tableRowSelected): void {
    if (!mode || !mode.id || mode.id === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = mode;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }

    const dialogRef = this.dialog.open(TicketingTemplateEditComponent, {
      height: '90%',
      data: { id: this.tableRowSelected.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });


  }
  onActionbuttonDeleteRow(mode: TicketingTemplateModel = this.tableRowSelected): void {
    if (mode == null || !mode.id || mode.id === 0) {
      const emessage = this.translate.instant('MESSAGE.No_row_selected_for_editing');
      this.cmsToastrService.typeErrorSelected(emessage);
      return;
    }
    this.tableRowSelected = mode;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.access == null ||
      !this.dataModelResult.access.accessDeleteRow
    ) {
      this.cmsToastrService.typeErrorAccessDelete();
      return;
    }
    const title = this.translate.instant('MESSAGE.Please_Confirm');
    const message = this.translate.instant('MESSAGE.Do_you_want_to_delete_this_content') + '?' + '<br> ( ' + this.tableRowSelected.title + ' ) ';
    this.cmsConfirmationDialogService.confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

          this.contentService.ServiceDelete(this.tableRowSelected.id).subscribe(
            (next) => {
              if (next.isSuccess) {
                this.cmsToastrService.typeSuccessRemove();
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
        if (next.isSuccess) {
          statist.set('All', next.totalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );

    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.propertyName = 'RecordStatus';
    fastfilter.value = EnumRecordStatus.Available;
    filterStatist1.filters.push(fastfilter);
    this.contentService.ServiceGetCount(filterStatist1).subscribe(
      (next) => {
        if (next.isSuccess) {
          statist.set('Active', next.totalRowCount);
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
    this.contentService.ServiceExportFile(model).subscribe(
      (next) => {
        if (next.isSuccess) {
          exportlist.set('Download', next.linkFile);
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
    this.filteModelContent.filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: TicketingTemplateModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParent(): void {
    this.router.navigate(['/ticketing/departemen/']);
  }

}
