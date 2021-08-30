
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  CoreUserClaimContentModel,
  CoreUserClaimContentService,
  ErrorExceptionResult,
  FilterModel,
  NtkCmsApiStoreService,
  TokenInfoModel,
  DataFieldInfoModel,
  CoreUserClaimTypeModel,
  CoreUserClaimTypeService,
  CoreUserClaimCheckModel,
  CoreUserClaimCheckDtoModel,
} from 'ntk-cms-api';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponentModels/base/componentOptionSearchModel';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ComponentOptionExportModel } from 'src/app/core/cmsComponentModels/base/componentOptionExportModel';
import { ComponentOptionStatistModel } from 'src/app/core/cmsComponentModels/base/componentOptionStatistModel';

import { Subscription } from 'rxjs';
import { CoreUserClaimContentEditComponent } from '../edit/edit.component';
import { CoreUserClaimContentAddComponent } from '../add/add.component';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';

@Component({
  selector: 'app-core-userclaimcontent-checklist',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CoreUserClaimContentCheckListComponent implements OnInit, OnDestroy {

  requestLinkUserId = 0;
  requestLinkSiteId = 0;
  constructor(
    private coreUserClaimContentService: CoreUserClaimContentService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    private coreUserClaimTypeService: CoreUserClaimTypeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenHelper: TokenHelper,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.loading.cdr = this.cdr;
    this.requestLinkUserId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkUserId'));
    this.requestLinkSiteId = + Number(this.activatedRoute.snapshot.paramMap.get('LinkSiteId'));

  }
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];

  dataModelResult: ErrorExceptionResult<CoreUserClaimCheckModel> = new ErrorExceptionResult<CoreUserClaimCheckModel>();
  optionsSearch: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  optionsStatist: ComponentOptionStatistModel = new ComponentOptionStatistModel();
  optionsExport: ComponentOptionExportModel = new ComponentOptionExportModel();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowSelected: CoreUserClaimCheckModel = new CoreUserClaimCheckModel();
  tableSource: MatTableDataSource<CoreUserClaimCheckModel> = new MatTableDataSource<CoreUserClaimCheckModel>();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  categoryModelSelected: CoreUserClaimTypeModel = new CoreUserClaimTypeModel();
  dataModelCoreUserClaimTypeResult: ErrorExceptionResult<CoreUserClaimTypeModel> = new ErrorExceptionResult<CoreUserClaimTypeModel>();

  tabledisplayedColumns: string[] = [
    'TypeTitle',
    'IsApproved',
    'ApprovedResult',
    'ApproveCheckDate',
    'ApprovedExpireDate',
    'Action'
  ];



  expandedElement: CoreUserClaimContentModel | null;
  cmsApiStoreSubscribe: Subscription;

  ngOnInit(): void {
    this.DataGetAll();
    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.DataGetAll();
      this.tokenInfo = next;
    });
    this.getUserClaimType();
  }
  getUserClaimType(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.coreUserClaimTypeService.ServiceGetAll(filter).subscribe((next) => {
      this.dataModelCoreUserClaimTypeResult = next;
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowSelected = new CoreUserClaimCheckModel();
    this.loading.Start(this.constructor.name + 'main');



    if (this.requestLinkUserId > 0 && this.requestLinkSiteId > 0) {
      /** */
      const model = new CoreUserClaimCheckDtoModel();
      model.UserId = this.requestLinkUserId;
      model.SiteId = this.requestLinkSiteId;
      this.coreUserClaimContentService.setAccessLoad();
      this.coreUserClaimContentService.ServiceClaimCheck(model).subscribe(
        (next) => {
          if (next.IsSuccess) {
            this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

            this.dataModelResult = next;
            this.tableSource.data = next.ListItems;

            if (this.optionsSearch.childMethods) {
              this.optionsSearch.childMethods.setAccess(next.Access);
            }
          }
          this.loading.Stop(this.constructor.name + 'main');

        },
        (error) => {
          this.cmsToastrService.typeError(error);

          this.loading.Stop(this.constructor.name + 'main');

        }
      );
      /** */
    }
    else {
      /** */
      this.coreUserClaimContentService.setAccessLoad();
      this.coreUserClaimContentService.ServiceClaimCheckCurrent().subscribe(
        (next) => {
          if (next.IsSuccess) {
            this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);

            this.dataModelResult = next;
            this.tableSource.data = next.ListItems;

            if (this.optionsSearch.childMethods) {
              this.optionsSearch.childMethods.setAccess(next.Access);
            }
          }
          this.loading.Stop(this.constructor.name + 'main');

        },
        (error) => {
          this.cmsToastrService.typeError(error);

          this.loading.Stop(this.constructor.name + 'main');

        }
      );
      /** */
    }

  }

  onActionbuttonNewRow(): void {

    const dialogRef = this.dialog.open(CoreUserClaimContentAddComponent, {
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionbuttonEditRow(model: CoreUserClaimCheckModel = this.tableRowSelected): void {
    if (!model || !model.LinkTypeId || model.LinkTypeId === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.tableRowSelected = model;
    if (model.LinkContentId && model.LinkContentId > 0) {
      const dialogRef = this.dialog.open(CoreUserClaimContentEditComponent, {
        data: { id: this.tableRowSelected.LinkContentId }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.dialogChangedDate) {
          this.DataGetAll();
        }
      });
    } else {
      const dialogRef = this.dialog.open(CoreUserClaimContentAddComponent, {
        data: { LinkUserClaimTypeId: this.tableRowSelected.LinkTypeId }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.dialogChangedDate) {
          this.DataGetAll();
        }
      });
    }
  }



  onActionbuttonReload(): void {
    this.DataGetAll();
  }

  onActionTableRowSelect(row: CoreUserClaimCheckModel): void {
    this.tableRowSelected = row;
  }
  onActionBackToParent(): void {
    this.router.navigate(['/core/user/']);
  }
}
