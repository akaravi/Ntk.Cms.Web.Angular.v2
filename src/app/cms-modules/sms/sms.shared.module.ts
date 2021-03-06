import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SharedModule } from 'src/app/shared.module';
import { SmsMainApiPathSelectorComponent } from './main/api-path/selector/selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreEnumService, SmsMainApiPathService, SmsMainApiNumberService } from 'ntk-cms-api';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SmsMainApiNumberSelectorComponent } from './main/api-number/selector/selector.component';
import { SmsMainApiPathTreeComponent } from './main/api-path/tree/tree.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    NgxMaterialTimepickerModule,
  ],
  declarations: [
    SmsMainApiPathSelectorComponent,
    SmsMainApiNumberSelectorComponent,
    SmsMainApiPathTreeComponent,
  ],
  exports: [
    SmsMainApiPathSelectorComponent,
    SmsMainApiNumberSelectorComponent,
    SmsMainApiPathTreeComponent,
  ],
  providers: [
    CoreEnumService,
    SmsMainApiPathService,
    SmsMainApiNumberService,

  
  ]
})
export class SmsSharedModule { }
