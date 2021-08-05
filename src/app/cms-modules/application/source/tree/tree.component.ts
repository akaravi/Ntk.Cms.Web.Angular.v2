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
  CoreAuthService,
  CoreEnumService,
  ErrorExceptionResult,
  FilterModel,
  ApplicationSourceModel,
  ApplicationSourceService,
  NtkCmsApiStoreService,
} from 'ntk-cms-api';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-application-source-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class ApplicationSourceTreeComponent  implements OnInit, OnDestroy {
  constructor(
    private cmsApiStore: NtkCmsApiStoreService,
    private cmsToastrService: CmsToastrService,
    public coreEnumService: CoreEnumService,
    public categoryService: ApplicationSourceService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {
  }
  @Input() set optionSelectForce(x: number | ApplicationSourceModel) {
    this.onActionSelectForce(x);
  }
  dataModelSelect: ApplicationSourceModel = new ApplicationSourceModel();
  dataModelResult: ErrorExceptionResult<ApplicationSourceModel> = new ErrorExceptionResult<ApplicationSourceModel>();
  filteModel = new FilterModel();
  loading = new ProgressSpinnerModel();
  treeControl = new NestedTreeControl<ApplicationSourceModel>(node => null);
  dataSource = new MatTreeNestedDataSource<ApplicationSourceModel>();
  @Output() optionSelect = new EventEmitter<ApplicationSourceModel>();
  cmsApiStoreSubscribe: Subscription;
  @Input() optionReload = () => this.onActionReload();

  hasChild = (_: number, node: ApplicationSourceModel) => false;


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
    this.cdr.detectChanges();
    this.categoryService.ServiceGetAll(this.filteModel).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.dataModelResult = next;
          this.dataSource.data = this.dataModelResult.ListItems;
        }
        this.loading.Stop('main');
        this.cdr.detectChanges();
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop('main');
        this.cdr.detectChanges();
      }
    );
  }
  onActionSelect(model: ApplicationSourceModel): void {
    this.dataModelSelect = model;
    this.optionSelect.emit(this.dataModelSelect);
  }
  onActionReload(): void {
    if (this.dataModelSelect && this.dataModelSelect.Id > 0) {
      this.onActionSelect(this.dataModelSelect);
    }
    else {
      this.onActionSelect(null);
    }
    this.dataModelSelect = new ApplicationSourceModel();
    this.DataGetAll();
  }
  onActionSelectForce(id: number | ApplicationSourceModel): void {

  }

  onActionAdd(): void {
    this.router.navigate(['/application/source/add']);

  }

  onActionEdit(): void {
    let id = 0;
    if (this.dataModelSelect && this.dataModelSelect.Id > 0) {
      id = this.dataModelSelect.Id;
    }
    if (id === 0) {
      const message = 'دسته بندی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.router.navigate(['/application/source/edit/', id]);
  }

  onActionDelete(): void {

    let id = 0;
    if (this.dataModelSelect && this.dataModelSelect.Id > 0) {
      id = this.dataModelSelect.Id;
    }
    if (id === 0) {
      const message = 'دسته بندی انتخاب نشده است';
      this.cmsToastrService.typeErrorSelected(message);
      return;
    }
    this.router.navigate(['/application/source/delete/', id]);

  }
}
