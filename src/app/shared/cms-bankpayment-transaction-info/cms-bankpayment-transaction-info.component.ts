import {
  ErrorExceptionResult,
  BlogCategoryModel,
  BankPaymentPrivateSiteConfigService,
  BankPaymentPrivateSiteConfigModel,
  BankPaymentTransactionService,
  BankPaymentTransactionModel,
} from 'ntk-cms-api';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';

import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { NodeInterface } from 'src/filemanager-api';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cms-bankpayment-transaction-info',
  templateUrl: './cms-bankpayment-transaction-info.component.html',
  styleUrls: ['./cms-bankpayment-transaction-info.component.scss'],
})
export class CmsBankpaymentTransactionInfoComponent implements OnInit {
  requestId=0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public bankPaymentTransactionService: BankPaymentTransactionService,
    private dialogRef: MatDialogRef<CmsBankpaymentTransactionInfoComponent>,

    private cmsToastrService: CmsToastrService,
    private cdr: ChangeDetectorRef,
    public publicHelper: PublicHelper,
  ) {
    this.loading.cdr = this.cdr;
    if (data) {
      this.requestId =+ data.Id || 0;
    }

  }
  @Input() loading = new ProgressSpinnerModel();
  dataModelResult: ErrorExceptionResult<BankPaymentTransactionModel> = new ErrorExceptionResult<BankPaymentTransactionModel>();
  ngOnInit(): void {
    if (this.requestId <= 0) {
      this.cmsToastrService.typeErrorComponentAction();
      this.dialogRef.close({ dialogChangedDate: false });
      return;
    }
    this.DataGeOne();
  }
  DataGeOne(): void {
      const pName = this.constructor.name + 'main';
      this.loading.Start(pName);
      this.bankPaymentTransactionService.ServiceGetOneById(this.requestId).subscribe(
        (next) => {
          if (next.IsSuccess) {
            this.dataModelResult = next;
          }
          else {
            this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
          }
          this.loading.Stop(pName);
        },
        (error) => {
          this.cmsToastrService.typeError(error);
          this.loading.Stop(pName);
        }
      );
  }
  onFormCancel(): void {
    this.dialogRef.close({ dialogChangedDate: true });
  }
}
