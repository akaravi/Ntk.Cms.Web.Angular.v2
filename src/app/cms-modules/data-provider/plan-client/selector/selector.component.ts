import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {
  CoreEnumService,
  EnumClauseType,
  EnumFilterDataModelSearchTypes,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  DataProviderPlanClientModel,
  DataProviderPlanClientService,
} from 'ntk-cms-api';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Output } from '@angular/core';


@Component({
  selector: 'app-data-provider-plan-client-selector',
  templateUrl: './selector.component.html',
})
export class DataProviderPlanClientSelectorComponent implements OnInit {
  constructor(
    public coreEnumService: CoreEnumService,
    private cdr: ChangeDetectorRef,
    public categoryService: DataProviderPlanClientService) {
    this.loading.cdr = this.cdr;

  }
  dataModelResult: ErrorExceptionResult<DataProviderPlanClientModel> = new ErrorExceptionResult<DataProviderPlanClientModel>();
  dataModelSelect: DataProviderPlanClientModel = new DataProviderPlanClientModel();
  loading = new ProgressSpinnerModel();
  formControl = new FormControl();
  filteredOptions: Observable<DataProviderPlanClientModel[]>;
  @Input() optionPlaceholder = '';
  @Input() optionSelectFirstItem = false;
  @Output() optionChange = new EventEmitter<DataProviderPlanClientModel>();
  @Input() optionReload = () => this.onActionReload();
  @Input() set optionSelectForce(x: number | DataProviderPlanClientModel) {
    this.onActionSelectForce(x);
  }

  ngOnInit(): void {
    this.loadOptions();
  }
  loadOptions(): void {
    this.filteredOptions = this.formControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap(val => {
          if (typeof val === 'string' || typeof val === 'number') {
            return this.DataGetAll(val || '');
          }
          return [];
        }),
      );
  }

  async DataGetAll(text: string | number | any): Promise<DataProviderPlanClientModel[]> {
    const filteModel = new FilterModel();
    filteModel.RowPerPage = 20;
    filteModel.AccessLoad = true;
    let filter = new FilterDataModel();
    filter.PropertyName = 'Title';
    filter.Value = text;
    filter.SearchType = EnumFilterDataModelSearchTypes.Contains;
    filter.ClauseType = EnumClauseType.Or;
    filteModel.Filters.push(filter);
    if (text && typeof +text === 'number' && +text > 0) {
      filter = new FilterDataModel();
      filter.PropertyName = 'Id';
      filter.Value = text;
      filter.SearchType = EnumFilterDataModelSearchTypes.Equal;
      filter.ClauseType = EnumClauseType.Or;
      filteModel.Filters.push(filter);
    }
    
    const pName = this.constructor.name + 'main';
    this.loading.Start(pName);

    return await this.categoryService.ServiceGetAll(filteModel)
      .pipe(
        map(response => {
          this.dataModelResult = response;
          /*select First Item */
          if (this.optionSelectFirstItem &&
            (!this.dataModelSelect || !this.dataModelSelect.Id || this.dataModelSelect.Id <= 0) &&
            this.dataModelResult.ListItems.length > 0) {
            this.optionSelectFirstItem = false;
            setTimeout(() => { this.formControl.setValue(this.dataModelResult.ListItems[0]); }, 1000);
            this.onActionSelect(this.dataModelResult.ListItems[0]);
          }
          /*select First Item */
          this.loading.Stop(pName);

          return response.ListItems;
        })
      ).toPromise();
  }
  onActionSelect(model: DataProviderPlanClientModel): void {
    this.dataModelSelect = model;
    this.optionChange.emit(this.dataModelSelect);

  }
  onActionSelectClear(): void {
    this.formControl.setValue(null);
    this.optionChange.emit(null);
  }
  push(newvalue: DataProviderPlanClientModel): Observable<DataProviderPlanClientModel[]> {
    return this.filteredOptions.pipe(map(items => {
      if (items.find(x => x.Id === newvalue.Id)) {
        return items;
      }
      items.push(newvalue);
      return items;
    }));

  }
  onActionSelectForce(id: number | DataProviderPlanClientModel): void {
    if (typeof id === 'number' && id > 0) {
      if (this.dataModelSelect && this.dataModelSelect.Id === id) {
        return;
      }
      if (this.dataModelResult && this.dataModelResult.ListItems && this.dataModelResult.ListItems.find(x => x.Id === id)) {
        const item = this.dataModelResult.ListItems.find(x => x.Id === id);
        this.dataModelSelect = item;
        this.formControl.setValue(item);
        return;
      }
      this.categoryService.ServiceGetOneById(id).subscribe((next) => {
        if (next.IsSuccess) {
          this.filteredOptions = this.push(next.Item);
          this.dataModelSelect = next.Item;
          this.formControl.setValue(next.Item);
          this.optionChange.emit(next.Item);
        }
      });
      return;
    }
    if (typeof id === typeof DataProviderPlanClientModel) {
      this.filteredOptions = this.push((id as DataProviderPlanClientModel));
      this.dataModelSelect = (id as DataProviderPlanClientModel);
      this.formControl.setValue(id);
      return;
    }
    this.formControl.setValue(null);
  }

  onActionReload(): void {
    this.dataModelSelect = new DataProviderPlanClientModel();
    this.DataGetAll(null);
  }
}