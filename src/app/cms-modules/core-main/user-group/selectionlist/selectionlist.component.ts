//**msh */
import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CoreEnumService, ErrorExceptionResult, FilterModel, CoreUserGroupModel, CoreUserGroupService } from 'ntk-cms-api';
import { FormControl } from '@angular/forms';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Output } from '@angular/core';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';


@Component({
  selector: 'app-core-usergroup-selectionlist',
  templateUrl: './selectionlist.component.html',
  styleUrls: ['./selectionlist.component.scss']
})
export class CoreUserGroupSelectionlistComponent implements OnInit {

  constructor(
    public coreEnumService: CoreEnumService,
    public categoryService: CoreUserGroupService,
    private cdr: ChangeDetectorRef,
    private cmsToastrService: CmsToastrService) {
    this.loading.cdr = this.cdr;
  }
  dataModelResult: ErrorExceptionResult<CoreUserGroupModel> = new ErrorExceptionResult<CoreUserGroupModel>();
  dataModelSelect: CoreUserGroupModel[] = [];
  dataIdsSelect: number[] = [];
  loading = new ProgressSpinnerModel();
  formControl = new FormControl();
  fieldsStatus: Map<number, boolean> = new Map<number, boolean>();

  @Input() optionDisabled = false;
  @Input() optionSelectFirstItem = false;
  @Input() optionPlaceholder = '';
  @Output() optionChange = new EventEmitter<CoreUserGroupModel[]>();
  @Output() optionSelectAdded = new EventEmitter();
  @Output() optionSelectRemoved = new EventEmitter();
  @Input() optionReload = () => this.onActionReload();
  @Input() set optionSelectForce(x: number[] | CoreUserGroupModel[]) {
    this.onActionSelectForce(x);
  }

  ngOnInit(): void {
    this.DataGetAll();
  }

  DataGetAll(): void {
    const filteModel = new FilterModel();
    filteModel.RowPerPage = 50;
    filteModel.AccessLoad = true;
    // this.loading.backdropEnabled = false;

    // tslint:disable-next-line: no-trailing-whitespace

    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    this.categoryService.ServiceGetAll(filteModel).subscribe({
      next: (ret) => {
        if (ret.IsSuccess) {
          this.dataModelResult = ret;
          this.dataModelResult.ListItems.forEach((el) => this.fieldsStatus.set(el.Id, false));
          this.dataIdsSelect.forEach((el) => this.fieldsStatus.set(el, true));
          this.dataModelResult.ListItems.forEach((el) => {
            if (this.fieldsStatus.get(el.Id)) {
              this.dataModelSelect.push(el);
            }
          });
        } else {
          this.cmsToastrService.typeErrorMessage(ret.ErrorMessage);
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
  onActionSelect(value: CoreUserGroupModel): void {

    if (this.fieldsStatus.get(value.Id)) {
      this.fieldsStatus.set(value.Id, false);
      this.optionSelectRemoved.emit(value);
      this.dataModelSelect.splice(this.dataModelSelect.indexOf(value), 1);
    } else {
      this.fieldsStatus.set(value.Id, true);
      this.optionSelectAdded.emit(value);
      this.dataModelSelect.push(value);
    }
    this.optionChange.emit(this.dataModelSelect);
  }


  onActionSelectForce(ids: number[] | CoreUserGroupModel[]): void {
    if (typeof ids === typeof Array(Number)) {
      ids.forEach(element => {
        this.dataIdsSelect.push(element);
      });
    } else if (typeof ids === typeof Array(CoreUserGroupModel)) {
      ids.forEach(element => {
        this.dataIdsSelect.push(element.Id);
      });
    }
    this.dataIdsSelect.forEach((el) => this.fieldsStatus.set(el, true));
  }

  onActionReload(): void {
    // this.dataModelSelect = new CoreUserGroupModel();
    this.DataGetAll();
  }
}
