import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewInit,
  Input,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  EstatePropertyModel,
  EstatePropertyService,
  EnumSortType,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  TokenInfoModel,
  EstatePropertyTypeLanduseModel,
  EnumRecordStatus,
  DataFieldInfoModel,
  EnumFilterDataModelSearchTypes,
} from "ntk-cms-api";
import { ComponentOptionSearchModel } from "src/app/core/cmsComponentModels/base/componentOptionSearchModel";
import { PublicHelper } from "src/app/core/helpers/publicHelper";
import { ProgressSpinnerModel } from "src/app/core/models/progressSpinnerModel";
import { CmsToastrService } from "src/app/core/services/cmsToastr.service";
import { MatDialog } from "@angular/material/dialog";
import { ComponentOptionExportModel } from "src/app/core/cmsComponentModels/base/componentOptionExportModel";
import { ComponentOptionStatistModel } from "src/app/core/cmsComponentModels/base/componentOptionStatistModel";
import { MatSort } from "@angular/material/sort";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { CmsConfirmationDialogService } from "src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service";
import { TokenHelper } from "src/app/core/helpers/tokenHelper";
import { CmsLinkToComponent } from "src/app/shared/cms-link-to/cms-link-to.component";
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: "app-estate-property-list",
  templateUrl: "./list.component.html",
})
export class EstatePropertyListComponent
  implements OnInit, OnDestroy, AfterViewInit {
  requestLinkPropertyTypeLanduseId = "";
  requestLinkPropertyTypeUsageId = "";
  requestLinkContractTypeId = "";
  requestLinkBillboardId = "";
  requestLinkCustomerOrderId = "";
  requestInChecking = false;
  constructor(
    private estatePropertyService: EstatePropertyService,
    private activatedRoute: ActivatedRoute,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    private tokenHelper: TokenHelper,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
    this.requestLinkPropertyTypeLanduseId =
      this.activatedRoute.snapshot.paramMap.get("LinkPropertyTypeLanduseId");
    this.requestLinkPropertyTypeUsageId =
      this.activatedRoute.snapshot.paramMap.get("LinkPropertyTypeUsageId");
    this.requestLinkContractTypeId =
      this.activatedRoute.snapshot.paramMap.get("LinkContractTypeId");
    this.requestLinkBillboardId =
      this.activatedRoute.snapshot.paramMap.get("LinkBillboardId");
    this.requestLinkCustomerOrderId = this.activatedRoute.snapshot.paramMap.get(
      "LinkCustomerOrderId"
    );
    if (this.activatedRoute.snapshot.paramMap.get("InChecking")) {
      this.searchInChecking =
        this.activatedRoute.snapshot.paramMap.get("InChecking") === "true";
    }
    this.optionsSearch.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionsSearch(model),
    };
    this.optionsExport.parentMethods = {
      onSubmit: (model) => this.onSubmitOptionExport(model),
    };
    /*filter Sort*/
    this.filteModelProperty.SortColumn = "CreatedDate";
    this.filteModelProperty.SortType = EnumSortType.Descending;
    if (
      this.requestLinkPropertyTypeLanduseId &&
      this.requestLinkPropertyTypeLanduseId.length > 0
    ) {
      const filter = new FilterDataModel();
      filter.PropertyName = "LinkPropertyTypeLanduseId";
      filter.Value = this.requestLinkPropertyTypeLanduseId;
      this.filteModelProperty.Filters.push(filter);
    }
    if (
      this.requestLinkPropertyTypeUsageId &&
      this.requestLinkPropertyTypeUsageId.length > 0
    ) {
      const filter = new FilterDataModel();
      filter.PropertyName = "LinkPropertyTypeUsageId";
      filter.Value = this.requestLinkPropertyTypeUsageId;
      this.filteModelProperty.Filters.push(filter);
    }
    if (
      this.requestLinkContractTypeId &&
      this.requestLinkContractTypeId.length > 0
    ) {
      const filter = new FilterDataModel();
      filter.PropertyName = "Contracts";
      filter.PropertyAnyName = "LinkEstateContractTypeId";
      filter.Value = this.requestLinkContractTypeId;
      this.filteModelProperty.Filters.push(filter);
    }
  }
  @Input() optionloadComponent = true;
  @Input() optionloadByRoute = true;

  @Input() set optionLinkCustomerOrderId(id: string) {
    if (id && id.length > 0) {
      this.requestLinkCustomerOrderId = id;
    }
  }
  @Input() set optionLinkBillboardId(id: string) {
    if (id && id.length > 0) {
      this.requestLinkBillboardId = id;
    }
  }

  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tablePropertySelected = [];
  searchInChecking = false;
  searchInCheckingChecked = false;
  filteModelProperty = new FilterModel();
  dataModelResult: ErrorExceptionResult<EstatePropertyModel> =
    new ErrorExceptionResult<EstatePropertyModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel =
    new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<EstatePropertyModel> = [];
  tableRowSelected: EstatePropertyModel = new EstatePropertyModel();
  tableSource: MatTableDataSource<EstatePropertyModel> =
    new MatTableDataSource<EstatePropertyModel>();
  categoryModelSelected: EstatePropertyTypeLanduseModel;
  tabledisplayedColumns: string[] = [
    "LinkMainImageIdSrc",
    "Id",
    "RecordStatus",
    "MainAdminRecordStatus",
    "IsSoldIt",
    "ViewConfigHiddenInList",
    "LinkSiteId",
    "Title",
    "ViewCount",
    "CreatedDate",
    "UpdatedDate",
    "Action",
    "LinkTo",
  ];
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<
    string,
    DataFieldInfoModel
  >();
  cmsApiStoreSubscribe: Subscription;
  ngOnInit(): void {
    this.DataGetAll();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.tokenHelper
      .getCurrentTokenOnChange()
      .subscribe((next) => {
        this.DataGetAll();
        this.tokenInfo = next;
      });
  }

  ngAfterViewInit(): void {
    if (this.searchInChecking) {
      this.searchInCheckingChecked = true;
    }
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }

  DataGetAll(): void {
    if (!this.optionloadComponent) {
      return;
    }
    this.tableRowsSelected = [];
    this.tableRowSelected = new EstatePropertyModel();

    const pName = this.constructor.name + "main";
    this.loading.Start(pName,this.translate.instant('MESSAGE.Get_Information_List'));
    this.filteModelProperty.AccessLoad = true;
    /*filter CLone*/
    const filterModel = JSON.parse(JSON.stringify(this.filteModelProperty));
    /*filter CLone*/
    if (
      this.categoryModelSelected &&
      this.categoryModelSelected.Id &&
      this.categoryModelSelected.Id.length > 0
    ) {
      const filter = new FilterDataModel();
      filter.PropertyName = "LinkPropertyTypeLanduseId";
      filter.Value = this.categoryModelSelected.Id;
      filterModel.Filters.push(filter);
    }
    if (this.searchInChecking) {
      const filter = new FilterDataModel();
      filter.PropertyName = "RecordStatus";
      filter.Value = EnumRecordStatus.Available;
      filter.SearchType = EnumFilterDataModelSearchTypes.NotEqual;
      filterModel.Filters.push(filter);
    }
    if (
      this.tokenInfo.UserAccessAdminAllowToAllData ||
      this.tokenInfo.UserAccessAdminAllowToProfessionalData
    ) {
      this.tabledisplayedColumns = this.publicHelper.listAddIfNotExist(
        this.tabledisplayedColumns,
        "LinkSiteId",
        0
      );
      this.tabledisplayedColumns = this.publicHelper.listAddIfNotExist(
        this.tabledisplayedColumns,
        "Id",
        0
      );
    } else {
      this.tabledisplayedColumns = this.publicHelper.listRemoveIfExist(
        this.tabledisplayedColumns,
        "LinkSiteId"
      );
      this.tabledisplayedColumns = this.publicHelper.listRemoveIfExist(
        this.tabledisplayedColumns,
        "Id"
      );
    }
    if (this.requestLinkBillboardId && this.requestLinkBillboardId.length > 0) {
      // ** */
      this.estatePropertyService
        .ServiceGetAllWithBillboardId(this.requestLinkBillboardId, filterModel)
        .subscribe(
          (next) => {
            this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
            if (next.IsSuccess) {
              this.dataModelResult = next;
              this.tableSource.data = next.ListItems;
              if (this.optionsSearch.childMethods) {
                this.optionsSearch.childMethods.setAccess(next.Access);
              }
            } else {
              this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
            }
            this.loading.Stop(pName);
          },
          (error) => {
            this.cmsToastrService.typeError(error);

            this.loading.Stop(pName);
          }
        );
      // ** */
    } else if (
      this.requestLinkCustomerOrderId &&
      this.requestLinkCustomerOrderId.length > 0
    ) {
      // ** */
      this.estatePropertyService
        .ServiceGetAllWithCustomerOrderId(
          this.requestLinkCustomerOrderId,
          filterModel
        )
        .subscribe(
          (next) => {
            this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
            if (next.IsSuccess) {
              this.dataModelResult = next;
              this.tableSource.data = next.ListItems;
              if (this.optionsSearch.childMethods) {
                this.optionsSearch.childMethods.setAccess(next.Access);
              }
            } else {
              this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
            }
            this.loading.Stop(pName);
          },
          (error) => {
            this.cmsToastrService.typeError(error);

            this.loading.Stop(pName);
          }
        );
      // ** */
    } else {
      // ** */
      this.estatePropertyService.ServiceGetAllEditor(filterModel).subscribe(
        (next) => {
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
          if (next.IsSuccess) {
            this.dataModelResult = next;
            this.tableSource.data = next.ListItems;

            if (this.optionsSearch.childMethods) {
              this.optionsSearch.childMethods.setAccess(next.Access);
            }
          } else {
            this.cmsToastrService.typeErrorGetAll(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.cmsToastrService.typeError(error);

          this.loading.Stop(pName);
        }
      );
      //** */
    }
  }

  onTableSortData(sort: MatSort): void {
    if (
      this.tableSource &&
      this.tableSource.sort &&
      this.tableSource.sort.active === sort.active
    ) {
      if (this.tableSource.sort.start === "asc") {
        sort.start = "desc";
        this.filteModelProperty.SortColumn = sort.active;
        this.filteModelProperty.SortType = EnumSortType.Descending;
      } else if (this.tableSource.sort.start === "desc") {
        this.filteModelProperty.SortColumn = "";
        this.filteModelProperty.SortType = EnumSortType.Ascending;
      } else {
        sort.start = "desc";
      }
    } else {
      this.filteModelProperty.SortColumn = sort.active;
      this.filteModelProperty.SortType = EnumSortType.Ascending;
    }
    this.tableSource.sort = sort;
    this.filteModelProperty.CurrentPageNumber = 0;
    this.DataGetAll();
  }
  onTablePageingData(event?: PageEvent): void {
    this.filteModelProperty.CurrentPageNumber = event.pageIndex + 1;
    this.filteModelProperty.RowPerPage = event.pageSize;
    this.DataGetAll();
  }

  onActionbuttonNewRow(): void {
    if (
      this.categoryModelSelected == null &&
      this.categoryModelSelected &&
      this.categoryModelSelected.Id &&
      this.categoryModelSelected.Id.length === 0 &&
      (this.requestLinkPropertyTypeLanduseId == null ||
        this.requestLinkPropertyTypeLanduseId.length === 0)
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
    let parentId: string = this.requestLinkPropertyTypeLanduseId;
    if (
      this.categoryModelSelected &&
      this.categoryModelSelected.Id.length > 0
    ) {
      parentId = this.categoryModelSelected.Id;
    }
    if (parentId && parentId.length > 0) {
      this.router.navigate([
        "/estate/property/add/LinkPropertyTypeLanduseId",
        parentId,
      ]);
    } else {
      this.router.navigate(["/estate/property/add"]);
    }
  }

  onActionSelectorSelect(model: EstatePropertyTypeLanduseModel | null): void {
    this.filteModelProperty = new FilterModel();
    this.categoryModelSelected = model;

    this.DataGetAll();
  }

  onActionbuttonEditRow(
    mode: EstatePropertyModel = this.tableRowSelected
  ): void {
    if (!mode || !mode.Id || mode.Id.length === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = mode;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    this.router.navigate(["/estate/property/edit", this.tableRowSelected.Id]);
  }
  onActionbuttonAdsRow(
    mode: EstatePropertyModel = this.tableRowSelected
  ): void {
    if (!mode || !mode.Id || mode.Id.length === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = mode;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessEditRow
    ) {
      this.cmsToastrService.typeErrorAccessEdit();
      return;
    }
    this.router.navigate([
      "/estate/property-ads/LinkPropertyId",
      this.tableRowSelected.Id,
    ]);
  }

  onActionbuttonDeleteRow(
    mode: EstatePropertyModel = this.tableRowSelected
  ): void {
    if (mode == null || !mode.Id || mode.Id.length === 0) {
      this.cmsToastrService.typeErrorDeleteRowIsNull();
      return;
    }
    this.tableRowSelected = mode;
    if (
      this.dataModelResult == null ||
      this.dataModelResult.Access == null ||
      !this.dataModelResult.Access.AccessDeleteRow
    ) {
      this.cmsToastrService.typeErrorAccessDelete();
      return;
    }
    const title = this.translate.instant('MESSAGE.Please_Confirm');
    const message =
    this.translate.instant('MESSAGE.Do_You_Want_To_Delete_This_Content') +
      "<br> ( " +
      this.tableRowSelected.Title +
      " ) ";
    this.cmsConfirmationDialogService
      .confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + "main";
          this.loading.Start(pName,this.translate.instant('MESSAGE.Deleting_Information'));
          this.estatePropertyService
            .ServiceDelete(this.tableRowSelected.Id)
            .subscribe(
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
      })
      .catch(() => {
        // console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
      });
  }
  onActionbuttonStatist(): void {
    this.optionsStatist.data.show = !this.optionsStatist.data.show;
    if (!this.optionsStatist.data.show) {
      return;
    }
    const statist = new Map<string, number>();
    statist.set("Active", 0);
    statist.set("All", 0);
    this.estatePropertyService
      .ServiceGetCount(this.filteModelProperty)
      .subscribe(
        (next) => {
          if (next.IsSuccess) {
            statist.set("All", next.TotalRowCount);
            this.optionsStatist.childMethods.setStatistValue(statist);
          }
        },
        (error) => {
          this.cmsToastrService.typeError(error);
        }
      );

    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelProperty));
    const fastfilter = new FilterDataModel();
    fastfilter.PropertyName = "RecordStatus";
    fastfilter.Value = EnumRecordStatus.Available;
    filterStatist1.Filters.push(fastfilter);
    this.estatePropertyService.ServiceGetCount(filterStatist1).subscribe(
      (next) => {
        if (next.IsSuccess) {
          statist.set("Active", next.TotalRowCount);
          this.optionsStatist.childMethods.setStatistValue(statist);
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );
  }
  onActionbuttonExport(): void {
    this.optionsExport.data.show = !this.optionsExport.data.show;
    this.optionsExport.childMethods.setExportFilterModel(
      this.filteModelProperty
    );
  }

  onActionbuttonInChecking(model: boolean): void {
    this.searchInChecking = model;
    this.DataGetAll();
  }
  onSubmitOptionExport(model: FilterModel): void {
    const exportlist = new Map<string, string>();
    exportlist.set("Download", "loading ... ");
    this.estatePropertyService.ServiceExportFile(model).subscribe(
      (next) => {
        if (next.IsSuccess) {
          exportlist.set("Download", next.LinkFile);
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
    this.filteModelProperty.Filters = model;
    this.DataGetAll();
  }
  onActionTableRowSelect(row: EstatePropertyModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParent(): void {
    this.router.navigate(["/ticketing/departemen/"]);
  }
  onActionbuttonLinkTo(
    model: EstatePropertyModel = this.tableRowSelected
  ): void {
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

    const pName = this.constructor.name + "ServiceGetOneById";
    this.loading.Start(pName,this.translate.instant('MESSAGE.Get_Property_Information'));
    this.estatePropertyService
      .ServiceGetOneById(this.tableRowSelected.Id)
      .subscribe(
        (next) => {
          if (next.IsSuccess) {
            //open popup
            const dialogRef = this.dialog.open(CmsLinkToComponent, {
              // height: "90%",
              data: {
                Title: next.Item.Title,
                UrlViewContentQRCodeBase64: next.Item.UrlViewContentQRCodeBase64,
                UrlViewContent: next.Item.UrlViewContent,
              },
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result && result.dialogChangedDate) {
                this.DataGetAll();
              }
            });
            //open popup
          } else {
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
}
