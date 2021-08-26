import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ApplicationAppService, EnumRecordStatus, FilterDataModel, FilterModel, NtkCmsApiStoreService } from 'ntk-cms-api';
import { Subscription } from 'rxjs';
import { TokenHelper } from 'src/app/core/helpers/tokenHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { WidgetInfoModel } from 'src/app/core/models/widget-info-model';

@Component({
  selector: 'app-application-app-widget-create',
  templateUrl: './widget-create.component.html',
  styleUrls: ['./widget-create.component.scss']
})

export class ApplicationAppWidgetCreateComponent implements OnInit, OnDestroy {
  @Input() cssClass = '';

  constructor(
    private service: ApplicationAppService,
    private cmsApiStore: NtkCmsApiStoreService,
    private cdr: ChangeDetectorRef,
    private tokenHelper: TokenHelper,
  ) {
    this.loading.cdr = this.cdr;
   }
  filteModelContent = new FilterModel();
  widgetInfoModel = new WidgetInfoModel();
  cmsApiStoreSubscribe: Subscription;
  loading = new ProgressSpinnerModel();
  rowExist = false;
  ngOnInit() {
    this.widgetInfoModel.title = 'بررسی اپلیکیشن ها';
    this.widgetInfoModel.description = 'نرم افزاری برای معرفی شما';
    this.widgetInfoModel.link = '/application/app';

    this.onActionStatist();
    this.cmsApiStoreSubscribe = this.tokenHelper.getCurrentTokenOnChange().subscribe((next) => {
      this.onActionStatist();
    });

  }
  ngOnDestroy(): void {
    this.cmsApiStoreSubscribe.unsubscribe();
  }

  onActionStatist(): void {
    this.loading.Start(this.constructor.name + 'All');
    this.service.ServiceGetExist(this.filteModelContent).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.rowExist = true;
          this.widgetInfoModel.title = 'اپلیکیشن خود را مدیریت کنید';
          this.widgetInfoModel.link = '/application/app';
        }
        else {
          this.widgetInfoModel.title = 'اپلیکیشن خود را بسازید';
          this.widgetInfoModel.link = '/application/app/add';
        }
        this.loading.Stop(this.constructor.name + 'All');

      },
      (error) => {
        this.widgetInfoModel.title = 'اپلیکیشن خود را بسازید';
        this.widgetInfoModel.link = '/application/app';
        this.loading.Stop(this.constructor.name + 'All');
      }
    );

  }
  translateHelp(t: string, v: string): string {
    return t + v;
  }
}
