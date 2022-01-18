import { EnumDeviceType, EnumOperatingSystemType } from 'ntk-cms-api';

export const environment = {
  production: true,
  appVersion: '13.0.1028.1',
  USERDATA_KEY: 'authf649fc9a5f55',
  loadDemoMenu: false,
  loadDemoDashboard: false,
  ProgressConsoleLog: false,
  leafletUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  cmsServerConfig: {
    configApiRetry: 1,
    configApiServerPath: 'https://apicms.ir/api/v1/',
    configMvcServerPath: 'https://ntkcms.ir/',
    configHtmlBuilderServerPath: 'https://htmlbuilder.ntkcms.ir/',
    configFileServerPath: 'https://apifile.ir/api/v1/',
    configQDocServerPath: 'https://qdoc.ir/api/chat',
  },
  cmsUiConfig: {
    Pathlogin: '/auth/singin',
    Pathlogout: '/auth/singout',
    PathRegistery: '/auth/registery',
    PathSelectSite: '/core/site/select',
    Pathdashboard: '/dashboard/',
    ToolbarLinkUrlPath: 'https://ntk.ir',
  },
  cmsTokenConfig: {
    SecurityKey: '123456789',
    ClientMACAddress: '',
    OSType: EnumOperatingSystemType.Windows,
    DeviceType: EnumDeviceType.WebSite,
    PackageName: '',
  }
};

