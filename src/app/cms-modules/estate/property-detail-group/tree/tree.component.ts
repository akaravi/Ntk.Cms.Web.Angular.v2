//**msh */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeNestedDataSource,
} from '@angular/material/tree';
import {
  CoreEnumService,
  ErrorExceptionResult,
  FilterModel,
  EstatePropertyDetailGroupModel,
  EstatePropertyDetailGroupService,
  FilterDataModel,
} from 'ntk-cms-api';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EstatePropertyDetailGroupEditComponent } from '../edit/edit.component';
import { EstatePropertyDetailGroupAddComponent } from '../add/add.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-estate-detailgroup-tree',
  templateUrl: './tree.component.html'
})
export class EstatePropertyDetailGroupTreeComponent implements OnInit, OnDestroy {
  requestLinkPropertyTypeLanduseId = '';
  constructor(
    private cmsToastrService: CmsToastrService,
    public coreEnumService: CoreEnumService,
    public categoryService: EstatePropertyDetailGroupService,
    private cmsConfirmationDialogService: CmsConfirmationDialogService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private tokenHelper: TokenHelper,
  ) {
    this.loading.cdr = this.cdr;this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
  }
  @Input() set optionSelectForce(x: number | EstatePropertyDetailGroupModel) {
    this.onActionSelectForce(x);
  }
  dataModelSelect: EstatePropertyDetailGroupModel = new EstatePropertyDetailGroupModel();
  dataModelResult: ErrorExceptionResult<EstatePropertyDetailGroupModel> = new ErrorExceptionResult<EstatePropertyDetailGroupModel>();
  filteModel = new FilterModel();
  @Input() loading = new ProgressSpinnerModel();
  treeControl = new NestedTreeControl<EstatePropertyDetailGroupModel>(node => null);
  dataSource = new MatTreeNestedDataSource<EstatePropertyDetailGroupModel>();
  @Output() optionChange = new EventEmitter<EstatePropertyDetailGroupModel>();
  cmsApiStoreSubscribe: Subscription;

  @Input() set optionLinkPropertyTypeLanduseId(id: string) {
    this.requestLinkPropertyTypeLanduseId = id;
    this.filteModel = new FilterModel();
    if (id && id.length > 0) {
      const filter = new FilterDataModel();
      filter.propertyName = 'LinkPropertyTypeLanduseId';
      filter.value = id;
      this.filteModel.filters.push(filter);
    }
  }
  @Input() optionReload = () => this.onActionReload();
  hasChild = (_: number, node: EstatePropertyDetailGroupModel) => false;


  ngOnInit(): void {
    this.DataGetAll();
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((value) => {
      this.DataGetAll();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.filteModel.rowPerPage = 200;
    this.filteModel.accessLoad = true;

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.categoryService.ServiceGetAll(this.filteModel).subscribe({
      next: (ret) => {
        if (ret.isSuccess) {
          this.dataModelResult = ret;
          this.dataSource.data = this.dataModelResult.listItems;
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
  onActionSelect(model: EstatePropertyDetailGroupModel): void {
    this.dataModelSelect = model;
    this.optionChange.emit(this.dataModelSelect);
  }
  onActionReload(): void {
    if (this.dataModelSelect && this.dataModelSelect.id && this.dataModelSelect.id.length > 0) {
      this.onActionSelect(this.dataModelSelect);
    }
    else {
      this.onActionSelect(null);
    }
    this.dataModelSelect = new EstatePropertyDetailGroupModel();
    this.DataGetAll();
  }
  onActionSelectForce(id: number | EstatePropertyDetailGroupModel): void {

  }

  onActionAdd(): void {
    const dialogRef = this.dialog.open(EstatePropertyDetailGroupAddComponent, {
      height: '90%',
      data: { linkPropertyTypeLanduseId: this.requestLinkPropertyTypeLanduseId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionEdit(): void {
    let id = '';
    if (this.dataModelSelect && this.dataModelSelect.id && this.dataModelSelect.id.length > 0) {
      id = this.dataModelSelect.id;
    }
    if (id === '') {
      const message = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorCategoryNotSelected');
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const dialogRef = this.dialog.open(EstatePropertyDetailGroupEditComponent, {
      height: '90%',
      data: { id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionDelete(): void {

    let id = '';
    if (this.dataModelSelect && this.dataModelSelect.id && this.dataModelSelect.id.length > 0) {
      id = this.dataModelSelect.id;
    }
    if (id === '') {
      const message1 = this.translate.instant('ERRORMESSAGE.MESSAGE.typeErrorCategoryNotSelected');
      this.cmsToastrService.typeErrorSelected(message1);
      return;
    }

    const title = this.translate.instant('MESSAGE.Please_Confirm');
    const message = this.translate.instant('MESSAGE.Do_you_want_to_delete_this_content') + '?' + '<br> ( ' + this.dataModelSelect.title + ' ) ';
    this.cmsConfirmationDialogService.confirm(title, message)
      .then((confirmed) => {
        if (confirmed) {
          const pName = this.constructor.name + 'main';
          this.loading.Start(pName);

          this.categoryService.ServiceDelete(this.dataModelSelect.id).subscribe({
            next: (ret) => {
              if (ret.isSuccess) {
                this.cmsToastrService.typeSuccessRemove();
                this.DataGetAll();
              } else {
                this.cmsToastrService.typeErrorRemove();
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
      }
      )
      .catch(() => {
        // console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)')
      }
      );
  }
}
