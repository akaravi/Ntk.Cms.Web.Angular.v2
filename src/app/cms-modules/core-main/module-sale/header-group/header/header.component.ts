import {
  CoreEnumService,
  EnumModel,
  ErrorExceptionResult,
  CoreModuleSaleHeaderGroupService,
  CoreModuleSaleHeaderGroupModel,
  DataFieldInfoModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';

@Component({
  selector: 'app-core-modulesaleheadergroup-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class CoreModuleSaleHeaderGroupHeaderComponent implements OnInit {
  constructor(
    public coreEnumService: CoreEnumService,
    public coreModuleSaleHeaderGroupService: CoreModuleSaleHeaderGroupService,
    public publicHelper: PublicHelper,
    private cdr: ChangeDetectorRef,
    private cmsToastrService: CmsToastrService,
  ) {
    this.loading.cdr = this.cdr;
  }
  @Input() optionId = 0;
  loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<CoreModuleSaleHeaderGroupModel> = new ErrorExceptionResult<CoreModuleSaleHeaderGroupModel>();
  fieldsInfo: Map<string, DataFieldInfoModel> = new Map<string, DataFieldInfoModel>();

  dataModelEnumRecordStatusResult: ErrorExceptionResult<EnumModel> = new ErrorExceptionResult<EnumModel>();



  ngOnInit(): void {
    if (this.optionId > 0) {
      this.DataGetOneContent();
    }
    this.getEnumRecordStatus();
  }
  async getEnumRecordStatus(): Promise<void> {
    this.dataModelEnumRecordStatusResult = await this.publicHelper.getEnumRecordStatus();
  }
  DataGetOneContent(): void {
    this.loading.Start(this.constructor.name + 'main');

    this.coreModuleSaleHeaderGroupService.setAccessLoad();
    this.coreModuleSaleHeaderGroupService.ServiceGetOneById(this.optionId).subscribe(
      (next) => {
        this.fieldsInfo = this.publicHelper.fieldInfoConvertor(next.Access);
        if (next.IsSuccess) {
          this.dataModelResult = next;
        } else {
          this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
        }
        this.loading.Stop(this.constructor.name + 'main');

      },
      (error) => {
        this.cmsToastrService.typeError(error);
        this.loading.Stop(this.constructor.name + 'main');

      }
    );
  }
}
