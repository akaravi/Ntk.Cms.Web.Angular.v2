import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationAppService, ApplicationMemberInfoService, EnumRecordStatus, FilterDataModel, FilterModel, NtkCmsApiStoreService } from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { WidgetInfoModel } from 'src/app/core/models/widget-info-model';
@Component({
  selector: 'app-application-memberinfo-widget',
  templateUrl: './widget.component.html',
})
export class ApplicationMemberInfoWidgetComponent implements OnInit, OnDestroy {
  filteModelContent = new FilterModel();
  modelData = new Map<string, number>();
  widgetInfoModel = new WidgetInfoModel();
  cmsApiStoreSubscribe: Subscription;
  indexTheme = ['symbol-light-success', 'symbol-light-warning', 'symbol-light-danger', 'symbol-light-info'];
  @Input()
  loading = new ProgressSpinnerModel();
  constructor(
    private service: ApplicationMemberInfoService,
    private cdr: ChangeDetectorRef,
    private tokenHelper: TokenHelper,
    public translate: TranslateService,
  ) {
    this.loading.cdr = this.cdr;
  }
  ngOnInit(): void {
    this.widgetInfoModel.title = 'کاربران شما';
    this.widgetInfoModel.description = 'کاربرانی که در اپلیکیشن های شما وارد شده اند';
    this.widgetInfoModel.link = '/application/memberinfo';
    this.onActionStatist();
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.onActionStatist();
    });
  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  onActionStatist(): void {
    this.loading.Start(this.constructor.name + 'Active', this.translate.instant('MESSAGE.Get_active_member_of_application_statistics'));
    this.loading.Start(this.constructor.name + 'All' , this.translate.instant('MESSAGE.Get_statistics_on_all_member_of_application'));
    this.modelData.set('Active', 0);
    this.modelData.set('All', 1);
    this.service.ServiceGetCount(this.filteModelContent).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.modelData.set('All', next.TotalRowCount);
        }
        this.loading.Stop(this.constructor.name + 'All');
      },
      (error) => {
        this.loading.Stop(this.constructor.name + 'All');
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
        this.loading.Stop(this.constructor.name + 'Active');
      }
      ,
      (error) => {
        this.loading.Stop(this.constructor.name + 'Active');
      }
    );
  }
}