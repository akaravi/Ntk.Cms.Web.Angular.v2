import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CoreRoutes } from './core.routing';
import { CoreModuleService } from 'ntk-cms-api';

@NgModule({
  imports: [
    CoreRoutes,
    CommonModule,
    // FormsModule,
    // ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    // SharedModule.forRoot(),
    // AngularEditorModule,
  ],
  declarations: [
    CoreComponent,
  ],
  exports: [

  ],
  providers: [
    CoreModuleService
  ]
})
export class CoreModule { }
