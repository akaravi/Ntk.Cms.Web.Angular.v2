import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { NgxNtkQueryBuilderModule } from 'ngx-ntk-query-builder';
import { TreeModule } from '@circlon/angular-tree-component';
import { TruncatePipe } from '../core/pipe/truncate.pipe';
import { PersianDate } from '../core/pipe/PersianDatePipe/persian-date.pipe';
import { CmsSearchListComponent } from './cms-search-list/cmsSearchList.component';
import { CmsStatistListComponent } from './cms-statist-list/cmsStatistList.component';
import { CmsExportListComponent } from './cms-export-list/cmsExportList.component';
import { CmsMapComponent } from './cms-map/cms-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TagInputModule } from 'ngx-chips';
import { RecordStatusClassPipe } from '../core/pipe/recordStatusClass.pipe';
import { BoolStatusClassPipe } from '../core/pipe/boolStatusClass.pipe';
import { PersianDateFull } from '../core/pipe/PersianDatePipe/persian-date-full.pipe';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner.component';
import { OverlayService } from './overlay/overlay.service';
import { HttpConfigInterceptor } from '../core/interceptor/httpConfigInterceptor';
import { KeysPipe } from '../core/pipe/keys.pipe';
import { EnumsPipe } from '../core/pipe/enums.pipe';
import { PrettyjsonPipe } from '../core/pipe/prettyjson.pipe';
import { CmsSiteSelectorComponent } from './cms-site-selector/cmsSiteSelector.component';
import { CmsUserSelectorComponent } from './cms-user-selector/cmsUserSelector.component';
import { CmsMemberSelectorComponent } from './cms-member-selector/cmsMemberSelector.component';
import {
  ApplicationAppService,
  BankPaymentEnumService,
  BankPaymentPrivateSiteConfigService,
  BankPaymentTransactionService,
  CoreCurrencyService,
  CoreGuideService,
  CoreLocationService,
  CoreSiteCategoryService,
  CoreSiteService,
  CoreUserGroupService,
  CoreUserService,
  MemberUserService
} from 'ntk-cms-api';
import { PasswordStrengthComponent } from './password-strength/password-strength.component';
import { CmsJsonListComponent } from './cms-json-list/cmsJsonList.component';
import { CmsGuideComponent } from './cms-guide/cms-guide.component';
import { TooltipGuideDirective } from '../core/directive/tooltip-guide.directive';
import { TooltipDirective } from '../core/directive/tooltip.directive';
import { CmsFormBuilderPropertiesComponent } from './cms-form-builder-properties/cms-form-builder-properties.component';
import { CmsModuleSelectorComponent } from './cms-module-selector/cms-module-selector.component';
import { CmsSiteCategorySelectorComponent } from './cms-site-category-selector/cmsSiteCategorySelector.component';
import { CmsUserGroupSelectorComponent } from './cms-user-group-selector/cmsUserGroupSelector.component';
import { CmsTitlePipe } from '../core/pipe/cms-title.pipe';
import { CmsApplicationSelectorComponent } from './cms-application-selector/cms-application-selector.component';
import { CmsBankpaymentGridComponent } from './cms-bankpayment-grid/cms-bankpayment-grid.component';
import { CmsCurrencySelectorComponent } from './cms-currency-selector/cms-currency-selector.component';
import { CmsLocationSelectorComponent } from './cms-location-selector/cms-location-selector.component';
import { ValueArrayPipe } from '../core/pipe/valueArray.pipe';
import { StringComponent } from '../core/dynamic-input-builder/string/string.component';
import { IntComponent } from '../core/dynamic-input-builder/int/int.component';
import { BooleanComponent } from '../core/dynamic-input-builder/boolean/boolean.component';
import { FloatComponent } from '../core/dynamic-input-builder/float/float.component';
import { DateComponent } from '../core/dynamic-input-builder/date/date.component';
import { TextAreaComponent } from '../core/dynamic-input-builder/text-area/text-area.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CmsSiteCategorySelectionListComponent } from './cms-site-category-selection-list/cmsSiteCategorySelectionList.component';
import { CmsFilesSelectorComponent } from './cms-files-selector/cms-files-selector.component';
import { CmsFileManagerModule } from 'src/filemanager-api';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CmsTagAutocompleteComponent } from './cms-tag-autocomplete/cms-tag-autocomplete.component';
import { TranslationModule } from '../core/i18n/translation.module';
import { CmsTokenAccessComponent } from './cms-token-access/cmsTokenAccess.component';
import { CmsHtmlNoticeComponent } from './cms-html-notice/cms-html-notice.component';

import { CmsHtmlCardComponent } from './cms-html-card/cms-html-card.component';
import { CmsHtmlModalComponent } from './cms-html-modal/cms-html-modal.component';
import { CmsHtmlListComponent } from './cms-html-list/cms-html-list.component';
import { CmsHtmlTreeComponent } from './cms-html-tree/cms-html-tree.component';
import { CmsHtmlTreeActionDirective, CmsHtmlTreeBodyDirective, CmsHtmlTreeFooterDirective, CmsHtmlTreeHeaderDirective } from '../core/directive/cms-html-tree.directive';
import { FirstLetterPipe } from '../core/pipe/first-letter.pipe';
import { SafePipe } from '../core/pipe/safe.pipe';
import { MatInputCommifiedDirective } from '../core/directive/mat-input-commified.directive';
import { PhoneDirective } from '../core/directive/phone.directive';
import { CmsImageThumbnailPipe } from '../core/pipe/cms-image-thumbnail.pipe';
import { CmsLocationCompleteComponent } from './cms-location-autocomplete/cms-location-autocomplete.component';
import { CmsQDocComponent } from './cms-qdoc/cms-qdoc.component';
import { CmsLinkToComponent } from './cms-link-to/cms-link-to.component';
import { CmsBankpaymentTransactionInfoComponent } from './cms-bankpayment-transaction-info/cms-bankpayment-transaction-info.component';
import { CmsViewComponent } from './cms-view/cms-view.component';
import { DirDirective } from '../core/directive/dir.drection';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
    imports: [
        CommonModule,
        TranslationModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        HttpClientModule,
        MaterialModule,
        TreeModule,
        NgxNtkQueryBuilderModule,
        LeafletModule,
        TagInputModule,
        NgbDropdownModule,
        CmsFileManagerModule.forRoot(),
        ClipboardModule,
        InlineSVGModule,
    ],
    declarations: [
        // common and shared components/directives/pipes between more than one module and components will be listed here.
        PersianDate,
        PersianDateFull,
        /** pipe */
        TruncatePipe,
        KeysPipe,
        EnumsPipe,
        CmsTitlePipe,
        CmsImageThumbnailPipe,
        PrettyjsonPipe,
        RecordStatusClassPipe,
        BoolStatusClassPipe,
        ValueArrayPipe,
        FirstLetterPipe,
        SafePipe,
        /** Component */
        LanguageSelectorComponent,
        CmsSearchListComponent,
        CmsStatistListComponent,
        CmsExportListComponent,
        CmsSiteSelectorComponent,
        CmsCurrencySelectorComponent,
        CmsLocationSelectorComponent,
        CmsLocationCompleteComponent,
        CmsApplicationSelectorComponent,
        CmsSiteCategorySelectorComponent,
        CmsSiteCategorySelectionListComponent,
        CmsUserSelectorComponent,
        CmsUserGroupSelectorComponent,
        CmsMemberSelectorComponent,
        CmsModuleSelectorComponent,
        CmsQDocComponent,
        CmsViewComponent,
        CmsLinkToComponent,
        CmsMapComponent,
        CmsTagAutocompleteComponent,
        ProgressSpinnerComponent,
        PasswordStrengthComponent,
        CmsJsonListComponent,
        CmsGuideComponent,
        CmsFormBuilderPropertiesComponent,
        CmsBankpaymentGridComponent,
        CmsBankpaymentTransactionInfoComponent,
        CmsFilesSelectorComponent,
        CmsTokenAccessComponent,
        CmsHtmlNoticeComponent,
        CmsHtmlCardComponent,
        CmsHtmlModalComponent,
        CmsHtmlListComponent,
        CmsHtmlTreeComponent,
        /** input */
        StringComponent,
        IntComponent,
        BooleanComponent,
        FloatComponent,
        DateComponent,
        TextAreaComponent,
        /** Directive */
        TooltipGuideDirective,
        TooltipDirective,
        DirDirective,
        PhoneDirective,
        CmsHtmlTreeHeaderDirective,
        CmsHtmlTreeActionDirective,
        CmsHtmlTreeBodyDirective,
        CmsHtmlTreeFooterDirective,
        MatInputCommifiedDirective,
    ],
    exports: [
        // common and shared components/directives/pipes between more than one module and components will be listed here.
        CommonModule,
        TranslationModule,
        FormsModule,
        HttpClientModule,
        MaterialModule,
        CmsFileManagerModule,
        TreeModule,
        ClipboardModule,
        PersianDate,
        PersianDateFull,
        /** pipe */
        TruncatePipe,
        FirstLetterPipe,
        SafePipe,
        KeysPipe,
        EnumsPipe,
        CmsTitlePipe,
        CmsImageThumbnailPipe,
        PrettyjsonPipe,
        RecordStatusClassPipe,
        BoolStatusClassPipe,
        ValueArrayPipe,
        /** Component */
        LanguageSelectorComponent,
        CmsSearchListComponent,
        CmsStatistListComponent,
        CmsExportListComponent,
        CmsSiteSelectorComponent,
        CmsCurrencySelectorComponent,
        CmsLocationSelectorComponent,
        CmsLocationCompleteComponent,
        CmsApplicationSelectorComponent,
        CmsSiteCategorySelectorComponent,
        CmsSiteCategorySelectionListComponent,
        CmsUserSelectorComponent,
        CmsUserGroupSelectorComponent,
        CmsMemberSelectorComponent,
        CmsModuleSelectorComponent,
        CmsMapComponent,
        CmsQDocComponent,
        CmsViewComponent,
        CmsLinkToComponent,
        CmsTagAutocompleteComponent,
        ProgressSpinnerComponent,
        PasswordStrengthComponent,
        CmsJsonListComponent,
        CmsGuideComponent,
        CmsFormBuilderPropertiesComponent,
        CmsBankpaymentGridComponent,
        CmsBankpaymentTransactionInfoComponent,
        CmsFilesSelectorComponent,
        CmsTokenAccessComponent,
        CmsHtmlNoticeComponent,
        CmsHtmlCardComponent,
        CmsHtmlModalComponent,
        CmsHtmlListComponent,
        CmsHtmlTreeComponent,
        /** input */
        StringComponent,
        IntComponent,
        BooleanComponent,
        FloatComponent,
        DateComponent,
        TextAreaComponent,
        /** Directive */
        TooltipGuideDirective,
        TooltipDirective,
        DirDirective,
        PhoneDirective,
        CmsHtmlTreeHeaderDirective,
        CmsHtmlTreeActionDirective,
        CmsHtmlTreeBodyDirective,
        CmsHtmlTreeFooterDirective,
        MatInputCommifiedDirective,
    ],
    providers: [
        OverlayService,
        { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
        MemberUserService,
        CoreUserService,
        CoreUserGroupService,
        CoreSiteService,
        CoreSiteCategoryService,
        CoreGuideService,
        CoreCurrencyService,
        CoreLocationService,
        ApplicationAppService,
        BankPaymentPrivateSiteConfigService,
        BankPaymentTransactionService,
        BankPaymentEnumService,
    ]
    /* No providers here! Since they’ll be already provided in AppModule. */
})
export class SharedModule {
  static forRoot(): any {
    // Forcing the whole app to use the returned providers from the AppModule only.
    return {
      ngModule: SharedModule,
      providers: [
        /* All of your services here. It will hold the services needed by `itself`. */
      ],
    };
  }
}
