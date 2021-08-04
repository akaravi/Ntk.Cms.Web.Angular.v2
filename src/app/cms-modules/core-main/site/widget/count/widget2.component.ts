import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BlogContentService, CoreSiteService, EnumRecordStatus, FilterDataModel, FilterModel, NtkCmsApiStoreService } from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { WidgetInfoModel } from 'src/app/core/models/widget-info-model';

@Component({
  selector: 'app-core-site-widget-count2',
  templateUrl: './widget2.component.html',
  styleUrls: ['./widget2.component.scss']
})

export class CoreSiteWidgetCount2Component implements OnInit, OnDestroy {
  @Input() cssClass = '';
  @Input() widgetHeight = '200px';
  @Input() baseColor = 'success';
  @Input() iconColor = 'success';
  textInverseCSSClass;
  svgCSSClass;
  constructor(
    private service: CoreSiteService,
    private cmsApiStore: NtkCmsApiStoreService,
    private cdr: ChangeDetectorRef,
  ) { }
  filteModelContent = new FilterModel();
  modelData = new Map<string, number>();
  widgetInfoModel = new WidgetInfoModel();
  cmsApiStoreSubscribe: Subscription;
  loading = new ProgressSpinnerModel();
  ngOnInit() {
    this.widgetInfoModel.title = 'سایت های عضو';
    this.widgetInfoModel.description = '';
    this.widgetInfoModel.link = '/site/list';

    this.onActionStatist();
    this.cmsApiStoreSubscribe = this.cmsApiStore.getState((state) => state.ntkCmsAPiState.tokenInfo).subscribe((next) => {
      this.onActionStatist();
    });

    this.cssClass = `bg-${this.baseColor} ${this.cssClass}`;
    this.textInverseCSSClass = `text-inverse-${this.baseColor}`;
    this.svgCSSClass = `svg-icon--${this.iconColor}`;
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();

  }

  onActionStatist(): void {
    this.loading.Start('Active');
    this.loading.Start('All');
    this.modelData.set('Active', 0);
    this.modelData.set('All', 0);
    this.service.ServiceGetCount(this.filteModelContent).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.modelData.set('All', next.TotalRowCount);
        }
        this.loading.Stop('All');
        this.cdr.detectChanges();
      },
      (error) => {
        this.loading.Stop('All');
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
      ,
      (error) => {
        this.loading.Stop('Active');
        this.cdr.detectChanges();
      }
    );
  }
  translateHelp(t: string, v: string): string {
    return t + v;
  }
}