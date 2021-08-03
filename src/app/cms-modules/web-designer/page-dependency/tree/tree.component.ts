import {
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
  WebDesignerMainPageDependencyModel,
  WebDesignerMainPageDependencyService,
  NtkCmsApiStoreService,
} from 'ntk-cms-api';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WebDesignerMainPageDependencyEditComponent } from '../edit/edit.component';
import { WebDesignerMainPageDependencyAddComponent } from '../add/add.component';


@Component({
  selector: 'app-webdesigner-pagedependency-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class WebDesignerMainPageDependencyTreeComponent implements OnInit, OnDestroy {
  constructor(
    private cmsApiStore: NtkCmsApiStoreService,
    private cmsToastrService: CmsToastrService,
    public coreEnumService: CoreEnumService,
    public categoryService: WebDesignerMainPageDependencyService,
    private router: Router,
    public dialog: MatDialog
  ) {
  }
  @Input() set optionSelectForce(x: number | WebDesignerMainPageDependencyModel) {
    this.onActionSelectForce(x);
  }
  dataModelSelect: WebDesignerMainPageDependencyModel = new WebDesignerMainPageDependencyModel();
  dataModelResult: ErrorExceptionResult<WebDesignerMainPageDependencyModel>
    = new ErrorExceptionResult<WebDesignerMainPageDependencyModel>();
  filteModel = new FilterModel();
  loading = new ProgressSpinnerModel();
  treeControl = new NestedTreeControl<WebDesignerMainPageDependencyModel>(node => null);
  dataSource = new MatTreeNestedDataSource<WebDesignerMainPageDependencyModel>();
  @Output() optionSelect = new EventEmitter<WebDesignerMainPageDependencyModel>();
  cmsApiStoreSubscribe: Subscription;
  @Input() optionReload = () => this.onActionReload();

  hasChild = (_: number, node: WebDesignerMainPageDependencyModel) => false;


  ngOnInit(): void {
    this.DataGetAll();
    this.cmsApiStoreSubscribe = this.cmsApiStore.getState((state) => state.ntkCmsAPiState.tokenInfo).subscribe(() => {
      this.DataGetAll();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetAll(): void {
    this.filteModel.RowPerPage = 200;
    this.filteModel.AccessLoad = true;
    this.loading.Globally = false;
    this.loading.Start('main');
    this.categoryService.ServiceGetAll(this.filteModel).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.dataModelResult = next;
          this.dataSource.data = this.dataModelResult.ListItems;
        }
        this.loading.Stop('main');

      },
      (error) => {
        this.loading.Stop('main');

        this.cmsToastrService.typeError(error);

      }
    );
  }
  onActionSelect(model: WebDesignerMainPageDependencyModel): void {
    this.dataModelSelect = model;
    this.optionSelect.emit(this.dataModelSelect);
  }
  onActionReload(): void {
    if (this.dataModelSelect && this.dataModelSelect.Id?.length > 0) {
      this.onActionSelect(this.dataModelSelect);
    }
    else {
      this.onActionSelect(null);
    }
    this.dataModelSelect = new WebDesignerMainPageDependencyModel();
    this.DataGetAll();
  }
  onActionSelectForce(id: number | WebDesignerMainPageDependencyModel): void {

  }

  onActionAdd(): void {
    const dialogRef = this.dialog.open(WebDesignerMainPageDependencyAddComponent, {
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }

  onActionEdit(): void {
    let id = '';
    if (this.dataModelSelect && this.dataModelSelect.Id?.length > 0) {
      id = this.dataModelSelect.Id;
    }
    if (id.length === 0) {
      const message = 'دسته بندی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    const dialogRef = this.dialog.open(WebDesignerMainPageDependencyEditComponent, {
      data: { id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.dialogChangedDate) {
        this.DataGetAll();
      }
    });
  }
}
