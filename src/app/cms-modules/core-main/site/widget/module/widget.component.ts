import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CoreModuleSiteService,
  EnumFilterDataModelSearchTypes,
  EnumRecordStatus,
  FilterDataModel,
  FilterModel,
  NtkCmsApiStoreService
} from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { WidgetInfoModel } from 'src/app/core/models/widget-info-model';

@Component({
  selector: 'app-core-site-widget-module',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class CoreSiteWidgetModuleComponent implements OnInit, OnDestroy {
  filteModelContent = new FilterModel();
  modelData = new Map<string, number>();
  widgetInfoModel = new WidgetInfoModel();
  cmsApiStoreSubscribe: Subscription;
  indexTheme = ['symbol-light-success', 'symbol-light-warning', 'symbol-light-danger', 'symbol-light-info'];
  loading = new ProgressSpinnerModel();

  constructor(
    private service: CoreModuleSiteService,
    private cmsApiStore: NtkCmsApiStoreService,
  ) { }
  ngOnInit(): void {
    this.widgetInfoModel.title = 'ماژول های ثبت شده';
    this.widgetInfoModel.description = '';
    this.widgetInfoModel.link = '/core/site/modulelist';

    this.onActionStatist();
    this.cmsApiStoreSubscribe = this.cmsApiStore.getState((state) => state.ntkCmsAPiState.tokenInfo).subscribe((next) => {
      this.onActionStatist();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();

  }

  onActionStatist(): void {
    this.loading.Start('Active');
    this.loading.Start('All');
    this.service.ServiceGetCount(this.filteModelContent).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.modelData.set('All', next.TotalRowCount);
        }
        this.loading.Stop('All');
      },
      (error) => {
        this.loading.Stop('All');
      }
    );
    const filterStatist1 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastfilter = new FilterDataModel();
    fastfilter.PropertyName = 'RecordStatus';
    fastfilter.Value = EnumRecordStatus.Available;
    filterStatist1.Filters.push(fastfilter);
    this.service.ServiceGetCount(filterStatist1).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.modelData.set('Active', next.TotalRowCount);
        }
        this.loading.Stop('Active');
      }
      ,
      (error) => {
        this.loading.Stop('Active');
      }
    );


    const filterStatist2 = JSON.parse(JSON.stringify(this.filteModelContent));
    const fastFilter2 = new FilterDataModel();
    fastFilter2.PropertyName = 'ExpireDate';
    fastFilter2.Value = new Date();
    fastFilter2.SearchType = EnumFilterDataModelSearchTypes.GreaterThan;
    filterStatist2.Filters.push(fastFilter2);
    // this.service.ServiceGetCount(filterStatist2).subscribe(
    //   (next) => {
    //     if (next.IsSuccess) {
    //       this.modelData.set('Expired Date', next.TotalRowCount);
    //     }
    //   }
    //   ,
    //   (error) => {
    //   }
    // );
  }
}
