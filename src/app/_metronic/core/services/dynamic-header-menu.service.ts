import { Injectable, OnDestroy } from '@angular/core';
import { CoreAuthService, CoreCpMainMenuModel, CoreCpMainMenuService, NtkCmsApiStoreService } from 'ntk-cms-api';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DynamicHeaderMenuConfig } from '../../configs/dynamic-header-menu.config';

const emptyMenuConfig = {
  items: []
};

@Injectable({
  providedIn: 'root'
})
export class DynamicHeaderMenuService implements OnDestroy {
  private menuConfigSubject = new BehaviorSubject<any>(emptyMenuConfig);
  menuConfig$: Observable<any>;
  constructor(
    private coreCpMainMenuService: CoreCpMainMenuService,
    public coreAuthService: CoreAuthService,
    private cmsApiStore: NtkCmsApiStoreService,
  ) {
    this.menuConfig$ = this.menuConfigSubject.asObservable();
    this.setMenu([]);
    // this.loadMenu();
    this.DataGetCpMenu();
    this.cmsApiStoreSubscribe = this.cmsApiStore.getState((state) => state.ntkCmsAPiState.tokenInfo).subscribe(() => {
      this.DataGetCpMenu();
    });
  }
  cmsApiStoreSubscribe: Subscription;
  // Here you able to load your menu from server/data-base/localeStorage
  // Default => from DynamicHeaderMenuConfig
  // private loadMenu() {
  //   this.setMenu(DynamicHeaderMenuConfig);
  // }

  private setMenu(menuConfig) {
    this.menuConfigSubject.next(menuConfig);
  }

  private getMenu(): any {
    return this.menuConfigSubject.value;
  }
  ngOnDestroy() {
    this.cmsApiStoreSubscribe.unsubscribe();
  }
  DataGetCpMenu(): void {
    const menuItems: any = [{
      title: 'Dashboard',
      root: true,
      alignment: 'left',
      page: '/dashboard',
      translate: 'MENU.DASHBOARD',
    }];
    this.coreCpMainMenuService.ServiceGetAllMenu(null).subscribe(
      (next) => {
        const list = [];
        next.ListItems.forEach(element => {
          list.push(this.listItemAdd(element, true));
        });

        menuItems.push({
          title: 'menu',
          bullet: 'dot',
          icon: 'flaticon-web',
          page: '',
          translate: 'MENU.MENU',
          mega: false,
          submenu: list
        });

        if (environment.loadDemoMenu) {
          DynamicHeaderMenuConfig.items.forEach(element => {
            menuItems.push(element);
          });
        }
        this.setMenu(menuItems);
      }
    );
  }
  listItemAdd(item: CoreCpMainMenuModel, rootStatus = false): any {
    let retOut: any;
    retOut = {
      title: item.Title,
      root: rootStatus,
      page: item.RouteAddressLink,
      Color: item.Color,
      Icon: item.Icon,
      svg: '',
      bullet: 'dot',
      mega: true,
    };
    if (item.Children && item.Children.length > 0) {
      retOut.submenu = this.listItemsChildAdd(item);
    }
    return retOut;
  }
  listItemsChildAdd(item: CoreCpMainMenuModel): any {
    const list = [];
    if (item && item.Children) {
      item.Children.forEach(element => {
        list.push(this.listItemAdd(element));
      });
    }
    return list;
  }
}
