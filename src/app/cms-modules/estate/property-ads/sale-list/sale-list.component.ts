
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  EstateAdsTypeService,
  ErrorExceptionResult,
  FilterModel,
  NtkCmsApiStoreService,
  TokenInfoModel,
  DataFieldInfoModel,
  EstateAdsTypeModel,
  CoreEnumService,
  EnumInfoModel,
  CoreModuleService,
  CoreModuleModel,
  CoreModuleSaleInvoiceDetailModel,
  CoreModuleSaleInvoiceModel,
  CoreModuleSaleItemModel,
  CoreSiteService,
} from 'ntk-cms-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EstatePropertyAdsSalePaymentComponent } from '../sale-payment/sale-payment.component';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';

@Component({
  selector: 'app-estate-propertyads-salelist',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss']
})
export class EstatePropertyAdsSaleListComponent implements OnInit, OnDestroy {
  constructor(
    private estateAdsTypeService: EstateAdsTypeService,
    private coreSiteService: CoreSiteService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    public coreEnumService: CoreEnumService,
    private coreModuleService: CoreModuleService,
    private tokenHelper: TokenHelper,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog) {
    this.loading.cdr = this.cdr;
  }
  showBuy = false;
  comment: string;
  author: string;
  dataSource: any;
  flag = false;
  tableContentSelected = [];
  dataModel: CoreModuleSaleInvoiceDetailModel = new CoreModuleSaleInvoiceDetailModel();
  dataModelResult: ErrorExceptionResult<EstateAdsTypeModel> = new ErrorExceptionResult<EstateAdsTypeModel>();
  dataModelItemResult: ErrorExceptionResult<CoreModuleSaleItemModel> = new ErrorExceptionResult<CoreModuleSaleItemModel>();
  dataModelRegResult: ErrorExceptionResult<CoreModuleSaleInvoiceModel> = new ErrorExceptionResult<CoreModuleSaleInvoiceModel>();
  tokenInfo = new TokenInfoModel();
  loading = new ProgressSpinnerModel();
  tableRowsSelected: Array<EstateAdsTypeModel> = [];
  tableRowSelected: EstateAdsTypeModel = new EstateAdsTypeModel();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();
  categoryModelSelected: EstateAdsTypeModel = new EstateAdsTypeModel();
  dataModelEnumCmsModuleSaleItemTypeResult: ErrorExceptionResult<EnumInfoModel> = new ErrorExceptionResult<EnumInfoModel>();
  dataModelCoreModuleResult: ErrorExceptionResult<CoreModuleModel> = new ErrorExceptionResult<CoreModuleModel>();

  tabledisplayedColumns: string[] = [
    'LinkModuleId',
    'EnumCmsModuleSaleItemType',
    'FromDate',
    'ExpireDate',
  ];



  expandedElement: CoreModuleSaleItemModel | null;
  cmsApiStoreSubscribe: Subscription;
  currency = '';

  ngOnInit(): void {

    this.tokenHelper.getCurrentToken().then((value) => {
      this.tokenInfo = value;
    });

    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {

      this.tokenInfo = next;
    });
    // this.getEnumCmsModuleSaleItemType();

    this.DataGetAll();
    this.DataGetCurrency();
  }
  DataGetCurrency(): void {
    this.coreSiteService.ServiceGetCurrencyMaster().subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.currency = next.Item;
        }
      },
      (error) => {
        this.cmsToastrService.typeError(error);
      }
    );
  }
  getModuleList(): void {
    const filter = new FilterModel();
    filter.RowPerPage = 100;
    this.coreModuleService.ServiceGetAllModuleName(filter).subscribe((next) => {
      this.dataModelCoreModuleResult = next;
    });
  }
  getEnumCmsModuleSaleItemType(): void {
    this.coreEnumService.ServiceEnumCmsModuleSaleItemType().subscribe((next) => {
      this.dataModelEnumCmsModuleSaleItemTypeResult = next;
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.tableRowsSelected = [];
    this.tableRowSelected = new EstateAdsTypeModel();
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);



    this.showBuy = false;
    const model = new FilterModel();
    this.estateAdsTypeService.ServiceGetAllSale(model).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.showBuy = true;
          this.dataModelResult = next;
          this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        }
        else {
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


  onActionbuttonDetail(model: EstateAdsTypeModel): void {
    this.tableRowSelected = model;
  }
  onActionbuttonBuy(model: EstateAdsTypeModel): void {
    this.tableRowSelected = model;

    const dialogRef = this.dialog.open(EstatePropertyAdsSalePaymentComponent, {
      height: '90%',
      data: { LinkHeaderId: model.Id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {

      }
    });
  }

  onActionBackToParent(): void {
    this.router.navigate(['/core/modulesale/Header']);
  }
}