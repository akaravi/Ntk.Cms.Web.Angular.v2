import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {
  CoreEnumService,
  ErrorExceptionResult,
  FilterDataModel,
  FilterModel,
  SmsMainApiPathCompanyModel,
  SmsMainApiPathCompanyService,
  EnumFilterDataModelSearchTypes,
  EnumClauseType
} from 'ntk-cms-api';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { Output } from '@angular/core';


@Component({
  selector: 'app-sms-apipathcompany-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SmsMainApiPathCompanySelectorComponent implements OnInit {

  constructor(
    public coreEnumService: CoreEnumService,
    private cdr: ChangeDetectorRef,
    public categoryService: SmsMainApiPathCompanyService) {
    this.loading.cdr = this.cdr;
  }

  dataModelResult: ErrorExceptionResult<SmsMainApiPathCompanyModel> = new ErrorExceptionResult<SmsMainApiPathCompanyModel>();
  dataModelSelect: SmsMainApiPathCompanyModel = new SmsMainApiPathCompanyModel();
  loading = new ProgressSpinnerModel();
  formControl = new FormControl();
  filteredOptions: Observable<SmsMainApiPathCompanyModel[]>;
  @Input() optionDisabled = false;
  @Input() optionSelectFirstItem = false;
  @Input() optionPlaceholder = '';
  @Output() optionSelect = new EventEmitter<SmsMainApiPathCompanyModel>();
  @Input() optionReload = () => this.onActionReload();
  @Input() set optionSelectForce(x: string | SmsMainApiPathCompanyModel) {
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
        // tap(() => this.myControl.setValue(this.options[0]))
      );
  }

  displayFn(model?: SmsMainApiPathCompanyModel): string | undefined {
    return model ? (model.Title) : undefined;
  }
  displayOption(model?: SmsMainApiPathCompanyModel): string | undefined {
    return model ? (model.Title) : undefined;
  }
  async DataGetAll(text: string | number | any): Promise<SmsMainApiPathCompanyModel[]> {
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
    this.loading.Start('DataGetAll');
    return await this.categoryService.ServiceGetAll(filteModel)
      .pipe(
        map(response => {
          this.dataModelResult = response;
          /*select First Item */
          if (this.optionSelectFirstItem &&
            (!this.dataModelSelect || !this.dataModelSelect.Id || this.dataModelSelect.Id.length <= 0) &&
            this.dataModelResult.ListItems.length > 0) {
            this.optionSelectFirstItem = false;
            setTimeout(() => { this.formControl.setValue(this.dataModelResult.ListItems[0]); }, 1000);
            this.onActionSelect(this.dataModelResult.ListItems[0]);
          }
          /*select First Item */
          this.loading.Stop('DataGetAll');
          return response.ListItems;
        })
      ).toPromise();
  }
  onActionSelect(model: SmsMainApiPathCompanyModel): void {
    if (this.optionDisabled) {
      return;
    }
    this.dataModelSelect = model;
    this.optionSelect.emit(this.dataModelSelect);
  }
  onActionSelectClear(): void {
    if (this.optionDisabled) {
      return;
    }
    this.formControl.setValue(null);
    this.optionSelect.emit(null);
  }

  push(newvalue: SmsMainApiPathCompanyModel): Observable<SmsMainApiPathCompanyModel[]> {
    return this.filteredOptions.pipe(map(items => {
      if (items.find(x => x.Id === newvalue.Id)) {
        return items;
      }
      items.push(newvalue);
      return items;
    }));

  }
  onActionSelectForce(id: string | SmsMainApiPathCompanyModel): void {
    if (typeof id === 'string' && id.length > 0) {
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
          this.optionSelect.emit(next.Item);
        }
      });
      return;
    }
    if (typeof id === typeof SmsMainApiPathCompanyModel) {
      this.filteredOptions = this.push((id as SmsMainApiPathCompanyModel));
      this.dataModelSelect = (id as SmsMainApiPathCompanyModel);
      this.formControl.setValue(id);
      return;
    }
    this.formControl.setValue(null);
  }

  onActionReload(): void {
    this.dataModelSelect = new SmsMainApiPathCompanyModel();
    this.DataGetAll(null);
  }
}
