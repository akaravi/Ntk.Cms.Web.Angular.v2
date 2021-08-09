import { Component, OnInit } from '@angular/core';
import { CoreModuleModel, ErrorExceptionResult } from 'ntk-cms-api';
import { ConfigInterface, DownloadModeEnum, TreeModel } from 'projects/ntk-cms-filemanager/src/public-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  expression = false;
  appLanguage = 'fa';
  itemSelected(v: any): void {

  }
  tree: TreeModel;
  constructor(
    public publicHelper: PublicHelper
  ) {
    const treeConfig: ConfigInterface = {
      baseURL: 'https://apicms.ir/api/v1/',
      baseUploadURL: 'https://apifile.ir/api/v1/',
      api: {
        listFile: 'FileContent/GetAll',
        listFolder: 'FileCategory/GetAll',
        uploadFile: 'upload',
        downloadFile: 'download',
        deleteFile: 'FileContent',
        deleteFolder: 'FileCategory',
        createFolder: 'FileCategory',
        createFile: 'FileContent',
        getOneFile: 'FileContent',
        getOneFolder: 'FileCategory',
        renameFile: 'FileContent',
        renameFolder: 'FileCategory',
        searchFiles: 'FileCategory/GetAll',
      },
      options: {
        title: 'Select File',
        allowFolderDownload: DownloadModeEnum.DOWNLOAD_FILES,
        showFilesInsideTree: false,
        showSelectFile: true,
        showSelectFolder: false,
      }
    };

    this.tree = new TreeModel(treeConfig);
    // this.node = this.tree.nodes;
  }
  env = environment;
  dataCoreModuleModelResult: ErrorExceptionResult<CoreModuleModel> = new ErrorExceptionResult<CoreModuleModel>();

  ngOnInit(): void {
    this.getCurrentSiteModule();
  }
  async getCurrentSiteModule(): Promise<void> {
    this.dataCoreModuleModelResult = await this.publicHelper.getCurrentSiteModule();
  }
  CheckModuleExist(name: string): boolean {
    if (!name || name.length === 0 || !this.dataCoreModuleModelResult.ListItems || this.dataCoreModuleModelResult.ListItems.length === 0) {
      return false;
    }
    const retMdule = this.dataCoreModuleModelResult.ListItems.find(x => x.ClassName.toLowerCase() === name.toLowerCase());
    if (retMdule && retMdule.Id > 0) {
      return true;
    }
    return false;
  }
}
