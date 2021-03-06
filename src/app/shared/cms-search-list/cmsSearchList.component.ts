import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RuleSet, QueryBuilderFieldMap, Rule } from 'ngx-ntk-query-builder';
import { AccessModel, EnumClauseType, FilterDataModel } from 'ntk-cms-api';
import { ComponentOptionSearchModel } from 'src/app/core/cmsComponentModels/base/componentOptionSearchModel';

@Component({
  selector: 'app-cms-search-list',
  templateUrl: './cmsSearchList.component.html',
})
export class CmsSearchListComponent implements OnInit {
  static nextId = 0;
  id = ++CmsSearchListComponent.nextId;
  public optionsData: ComponentOptionSearchModel = new ComponentOptionSearchModel();
  @Output() optionsChange: EventEmitter<ComponentOptionSearchModel> = new EventEmitter<ComponentOptionSearchModel>();
  @Input() set options(model: ComponentOptionSearchModel) {
    if (!model) {
      model = new ComponentOptionSearchModel();
    }
    this.optionsData = model;
    this.optionsData.childMethods = {
      setAccess: (x: AccessModel) => this.setAccess(x),
    };
    this.optionsChange.emit(model);
  }
  get options(): ComponentOptionSearchModel {
    return this.optionsData;
  }


  filters: Array<FilterDataModel>;
  lang: string;
  model: any;
  query: RuleSet;
  fieldMap: QueryBuilderFieldMap = {};
  constructor(
    public translate: TranslateService,
  ) {
    this.lang = this.translate.currentLang;

  }
  ngOnInit(): void {
    // if (this.optionsData) {
    //   this.optionsData.childMethods = {
    //     setAccess: (x) => this.setAccess(x)
    //   };
    // }
  }
  setAccess(model: AccessModel): void {
    this.optionsData.data.access = model;
    if (!this.filters || this.filters.length === 0) {
      this.setFields();
    }
  }
  setFields(): void {
    if (
      this.optionsData &&
      this.optionsData.data.access &&
      this.optionsData.data.access.fieldsInfo
    ) {
      this.optionsData.data.access.fieldsInfo.forEach((column) => {
        if (!column.accessSearchField) { return; }
        if (
          column.fieldType === 'System.Int32' ||
          column.fieldType === 'System.Int64'
        ) {
          this.fieldMap[column.fieldName] = {
            name: column.fieldTitle,
            type: 'integer',
          };
        } else if (column.fieldType === 'System.String') {
          this.fieldMap[column.fieldName] = {
            name: column.fieldTitle,
            type: 'string',
          };
        } else if (column.fieldType === 'MongoDB.Bson.ObjectId') {
          this.fieldMap[column.fieldName] = {
            name: column.fieldName,
            type: 'string',
          };
        } else if (column.fieldType === 'System.Boolean') {
          this.fieldMap[column.fieldName] = {
            name: column.fieldTitle,
            type: 'select',

            options: [
              { name: '??????', value: true },
              { name: '??????', value: false },
            ],
          };
        } else if (column.fieldType === 'System.DateTime') {
          this.fieldMap[column.fieldName] = {
            name: column.fieldTitle,
            type: 'date',
            settings: {},
          };
        } else if (column.fieldType === 'link') {
          this.fieldMap[column.fieldName] = {
            name: column.fieldTitle,
            type: 'string',
          };
        } else {
          // console.log("Error: Type is not defined for columns! Please add 'type' property for each columns in gridOptions.");
        }
      });
    }
  }
  getRules(): void {
    this.filters = new Array<FilterDataModel>();
    let clauseType: EnumClauseType = EnumClauseType.And;
    if (!this.query || !this.query.condition) { return; }

    if (this.query.condition === 'or') { clauseType = EnumClauseType.Or; }
    this.query.rules.forEach((column) => {
      const ruleSet = column as RuleSet;
      const rule = column as Rule;
      if (
        ruleSet &&
        ruleSet.condition &&
        ruleSet.rules &&
        ruleSet.rules.length > 0
      ) {
        const filter = new FilterDataModel();
        filter.filters = this.getRulesSetChild(ruleSet);
        filter.clauseType = clauseType;
        this.filters.push(filter);
      } else if (rule) {
        const Filter = this.getRulesChild(rule);
        Filter.clauseType = clauseType;
        this.filters.push(Filter);
      }
    });
  }
  getRulesChild(rule: Rule): FilterDataModel {
    const searchType = this.getSearchType(rule.operator);
    const filter = new FilterDataModel();
    filter.propertyName = rule.field;
    filter.value = rule.value;
    filter.searchType = searchType;
    return filter;
  }
  getRulesSetChild(ruleSetInput: RuleSet): Array<FilterDataModel> {
    const Filters = new Array<FilterDataModel>();
    let clauseType: EnumClauseType = EnumClauseType.And;
    if (ruleSetInput.condition === 'or') { clauseType = EnumClauseType.Or; }
    ruleSetInput.rules.forEach((column) => {
      const ruleSet = column as RuleSet;
      const rule = column as Rule;
      if (
        ruleSet &&
        ruleSet.condition &&
        ruleSet.rules &&
        ruleSet.rules.length > 0
      ) {
        const filter = new FilterDataModel();
        filter.filters = this.getRulesSetChild(ruleSet);
        filter.clauseType = clauseType;
        Filters.push(filter);
      } else if (rule) {
        const filter = this.getRulesChild(rule);
        filter.clauseType = clauseType;
        Filters.push(filter);
      }
    });
    return Filters;
  }

  onSubmit(): void {
    this.getRules();
    if (this.optionsData.parentMethods) {
      this.optionsData.parentMethods.onSubmit(this.filters);
    }
  }
  onGetRules(): void {
    // console.log(this.query);
  }
  onSaveRules(): void {

  }
  onSetRules(): void {

  }
  getSearchType(operator: string): number {
    switch (operator) {
      case 'equal':
        return 0;
      case 'not_equal':
        return 1;
      case 'less':
        return 2;
      case 'greater':
        return 3;
      case 'between':
        return 4;
      case 'contains':
        return 5;
      case 'not_contains':
        return 6;
      case 'begins_with':
        return 7;
      case 'ends_with':
        return 8;
      case 'less_or_equal':
        return 9;
      case 'greater_or_equal':
        return 10;
    }
    return 0;
  }
}
