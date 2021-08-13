import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';


import {
  AuthRenewTokenModel,
  CoreAuthService,
  CoreSiteModel,
  CoreSiteService,
  ErrorExceptionResult,
  FilterModel,
  FormInfoModel
} from 'ntk-cms-api';
import { CmsToastrService } from '../../../../core/services/cmsToastr.service';
import { TranslationService } from 'src/app/core/i18n/translation.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';


@Component({
  selector: 'app-site-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class CoreSiteSelectionComponent implements OnInit {

  constructor(
    private coreAuthService: CoreAuthService,
    private translationService: TranslationService,
    private coreSiteService: CoreSiteService,
    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.loading.cdr = cdr;
  }
  loading = new ProgressSpinnerModel();


  filterModel = new FilterModel();
  dataModelResult: ErrorExceptionResult<CoreSiteModel>;
  formInfo: FormInfoModel = new FormInfoModel();
  statusCheckExistWebSite = true;
  selectSiteId = 0;
  ngOnInit(): void {
    // this.dataModel = this.activatedRoute.snapshot.data.list;
    this.DataGetAll();
  }
  DataGetAll(): void {
    const processName = 'DataGetAll';
    this.loading.Start(processName);

    this.coreSiteService.ServiceGetAll(null).subscribe(
      (next) => {
        if (next.IsSuccess) {
          this.dataModelResult = next;
          this.statusCheckExistWebSite = false;
        }
        else {
          this.cmsToastrService.typeError(next.ErrorMessage);
        }
        this.loading.Stop(processName);
        this.cdr.detectChanges();

      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(processName);
        this.cdr.detectChanges();
      }
    );
  }
  onActionClickSelectSite(id: number): void {
    if (!this.formInfo.ButtonSubmittedEnabled) {
      return;
    }
    this.selectSiteId = id;
    this.formInfo.ButtonSubmittedEnabled = false;
    let authModel: AuthRenewTokenModel;
    authModel = new AuthRenewTokenModel();
    authModel.SiteId = id;
    authModel.Lang = this.translationService.getSelectedLanguage();


    const processName = 'ServiceRenewToken';
    this.loading.Start(processName);

    this.coreAuthService.ServiceRenewToken(authModel).subscribe(
      (res) => {
        if (res.IsSuccess) {
          this.cmsToastrService.typeSuccessSelected();
          this.loading.Stop(processName);
          this.router.navigate(['/']);
        }
        else {
          this.cmsToastrService.typeErrorSelected();
          this.formInfo.ButtonSubmittedEnabled = true;
        }
        this.loading.Stop(processName);
        this.cdr.detectChanges();
      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.formInfo.ButtonSubmittedEnabled = true;
        this.loading.Stop(processName);
        this.cdr.detectChanges();
      }
    );

  }

  onActionAddFirstSite(model: ErrorExceptionResult<any>): void {
    if (model.IsSuccess) {
      let authModel: AuthRenewTokenModel;
      authModel = new AuthRenewTokenModel();

      const processName = 'onActionAddFirstSite';
      this.loading.Start(processName);

      this.coreAuthService.ServiceRenewToken(authModel).subscribe(
        (next) => {
          if (next.IsSuccess) {
            this.router.navigate([environment.cmsUiConfig.Pathdashboard]);
          }
          this.loading.Stop(processName);
          this.cdr.detectChanges();
        },
        (error) => {
          this.cmsToastrService.typeError(error);
          this.loading.Stop(processName);
          this.cdr.detectChanges();
        }
      );
    }
  }
}
