import { Directive, Input, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CoreGuideService } from 'ntk-cms-api';
import { map } from 'rxjs/operators';
import { TokenHelper } from '../helpers/tokenHelper';
import { CmsToastrService } from '../services/cmsToastr.service';

@Directive({
  selector: '[tooltipGuide]'
})
export class TooltipGuideDirective {
  @Input() tooltipGuide: string;
  @Input() Identity: number;
  @Input() placement: string;
  @Input() delay: number;
  tooltip: HTMLElement;
  viewError = false;
  // 호스트 요소와 tooltip 요소 간의 거리
  offset = 10;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private tokenHelper: TokenHelper,
    private coreGuideService: CoreGuideService,
    private cmsToastrService: CmsToastrService,
  ) {
    this.tokenHelper.getCurrentToken().then((value) => {
      this.lang = value.Language;

    });

  }

  lang = '';

  @HostListener('mouseenter') onMouseEnter(): void {
    if (!this.tooltip) {
      this.tokenHelper.getCurrentToken().then((value) => {
        this.lang = value.Language;
      });
      this.show();
    }
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    if (this.tooltip) { this.hide(); }
  }

  show(): void {
    if (this.Identity && this.Identity > 0) {
      this.coreGuideService.ServiceGetOneById(this.Identity).pipe(
        map(
          (next) => {
            if (next.IsSuccess) {
              /*run */
              switch (this.lang) {
                case 'fa': {
                  this.create(next.Item.BodyFa);
                  break;
                }
                case 'en': {
                  this.create(next.Item.BodyEn);
                  break;
                }
                case 'ar': {
                  this.create(next.Item.BodyAr);
                  break;
                }
                case 'de': {
                  this.create(next.Item.BodyDe);
                  break;
                }
                default: {
                  this.create(next.Item.BodyFa);
                  break;
                }
              }

              this.setPosition();
              this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
              /*run */
            } else {
              if (this.viewError) {
                this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
              }
              /*run */
              this.create('Identity :' + this.Identity);
              this.setPosition();
              this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
              /*run */
            }
          },
          (error) => {
            if (this.viewError) {
              this.cmsToastrService.typeError(error);
            }
          })
      ).toPromise();
    } else if (this.tooltipGuide && this.tooltipGuide.length > 0) {
      this.coreGuideService.ServiceGetOneByKey(this.tooltipGuide).pipe(
        map(
          (next) => {
            if (next.IsSuccess) {
              /*run */
              switch (this.lang) {
                case 'fa': {
                  this.create(next.Item.BodyFa);
                  break;
                }
                case 'en': {
                  this.create(next.Item.BodyEn);
                  break;
                }
                case 'ar': {
                  this.create(next.Item.BodyAr);
                  break;
                }
                case 'de': {
                  this.create(next.Item.BodyDe);
                  break;
                }
                default: {
                  this.create(next.Item.BodyFa);
                  break;
                }
              }
              this.setPosition();
              this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
              /*run */
            } else {
              if (this.viewError) {
                this.cmsToastrService.typeErrorMessage(next.ErrorMessage);
              }
              /*run */
              this.create('Key :' + this.tooltipGuide);
              this.setPosition();
              this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
              /*run */
            }
          },
          (error) => {
            if (this.viewError) {
              this.cmsToastrService.typeError(error);
            }
          })
      ).toPromise();
    }
  }

  hide(): void {

    this.renderer.removeClass(this.tooltip, 'ng-tooltip-show');
    window.setTimeout(() => {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }, this.delay);
  }

  create(text: string): void {
    this.tooltip = this.renderer.createElement('span');
    text = text + '';
    if (text.indexOf('</') > 0 || text.indexOf('/>') > 0) {
      this.tooltip.insertAdjacentHTML('beforeend', text);
    } else {
      this.renderer.appendChild(
        this.tooltip,
        this.renderer.createText(text) // textNode
      );
    }


    this.renderer.appendChild(document.body, this.tooltip);
    // this.renderer.appendChild(this.el.nativeElement, this.tooltip);

    this.renderer.addClass(this.tooltip, 'ng-tooltip');
    this.renderer.addClass(this.tooltip, `ng-tooltip-${this.placement}`);

    // delay 설정
    this.renderer.setStyle(this.tooltip, '-webkit-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, '-moz-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, '-o-transition', `opacity ${this.delay}ms`);
    this.renderer.setStyle(this.tooltip, 'transition', `opacity ${this.delay}ms`);
  }

  setPosition(): void {
    // 호스트 요소의 사이즈와 위치 정보
    const hostPos = this.el.nativeElement.getBoundingClientRect();

    // tooltip 요소의 사이즈와 위치 정보
    const tooltipPos = this.tooltip.getBoundingClientRect();

    // window의 scroll top
    // getBoundingClientRect 메소드는 viewport에서의 상대적인 위치를 반환한다.
    // 스크롤이 발생한 경우, tooltip 요소의 top에 세로 스크롤 좌표값을 반영하여야 한다.
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let top = 0;
    let left = 0;

    if (this.placement === 'top') {
      top = hostPos.top - tooltipPos.height - this.offset;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    if (this.placement === 'bottom') {
      top = hostPos.bottom + this.offset;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    if (this.placement === 'left') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.left - tooltipPos.width - this.offset;
    }

    if (this.placement === 'right') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.right + this.offset;
    }

    // 스크롤이 발생한 경우, tooltip 요소의 top에 세로 스크롤 좌표값을 반영하여야 한다.
    this.renderer.setStyle(this.tooltip, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }
}
