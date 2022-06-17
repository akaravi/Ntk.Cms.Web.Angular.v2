import {
  Component,
  Input,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  DoCheck,
} from '@angular/core';
import {
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { OverlayService } from '../overlay/overlay.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';

@Component({
  selector: 'app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.scss'],
})
export class ProgressSpinnerComponent implements DoCheck, OnInit {
  @Input()
  set options(modelInput: ProgressSpinnerModel) {
    this.optionsData = modelInput;
  }
  get options(): ProgressSpinnerModel {
    return this.optionsData;
  }
  optionsData: ProgressSpinnerModel;

  @ViewChild('progressSpinnerRef', { static: true })
  private progressSpinnerRef: TemplateRef<any>;
  private progressSpinnerOverlayConfig: OverlayConfig;
  private overlayRef: OverlayRef;
  constructor(
    private vcRef: ViewContainerRef,
    private overlayService: OverlayService
  ) { }
  ngOnInit(): void {
    
    if (!this.optionsData || !this.optionsData.Globally) {
      return;
    }
    // Config for Overlay Service
    this.progressSpinnerOverlayConfig = {
      hasBackdrop: this.optionsData.backdropEnabled,
    };
    if (this.optionsData.positionGloballyCenter) {
      this.progressSpinnerOverlayConfig.positionStrategy = this.overlayService.positionGloballyCenter();
    }
    this.overlayRef = this.overlayService.createOverlay(
      this.progressSpinnerOverlayConfig
    );
  }
  ngDoCheck(): void {
    if (!this.optionsData || !this.optionsData.Globally) {
      return;
    }

    // Based on status of displayProgressSpinner attach/detach overlay to progress spinner template
    if (this.optionsData.display && !this.overlayRef.hasAttached()) {
      this.overlayService.attachTemplatePortal(
        this.overlayRef,
        this.progressSpinnerRef,
        this.vcRef
      );
    } else if (!this.optionsData.display && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
