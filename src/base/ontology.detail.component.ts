import {AfterViewInit, Component, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Breadcrumb} from "../runtime/misc/RCDeployment";
import {ActivatedRoute, Router} from "@angular/router";
import {KEY_TARGET_NAME} from "./base.manage-routing.module";
import {Descriptor} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {ObjectType, OntologyDetail} from "./common/ontology.common";


type MenuKey = 'objectTypes' | 'linkTypes' | 'valueTypes' | 'sharedProperty';

@Component({
  styles: [`
    .ontology-sider {
      background: #fff;
      border-right: 1px solid #f0f0f0;
      padding: 12px 0;
    }

    .ontology-content {
      padding: 10px 24px;
      min-height: 400px;
    }

    .item-row {
      cursor: pointer;
      padding: 8px 16px;
      border-bottom: 1px solid #f5f5f5;
    }

    .item-row:hover {
      background: #e6f7ff;
    }
  `],
  template: `
    <tis-page-header *ngIf="breadcrumb" [breadcrumb]="breadcrumb.breadcrumb" [title]="breadcrumb.name">
      <tis-header-tool>
      </tis-header-tool>
    </tis-page-header>

    <nz-layout *ngIf="ontologyDetail">
      <nz-sider class="ontology-sider" [nzWidth]="220">
        <ul nz-menu nzMode="inline">
          <li nz-menu-item [nzSelected]="selectedMenu === 'objectTypes'" (click)="selectMenu('objectTypes')">
            <span nz-icon nzType="appstore" nzTheme="outline"></span>
            <span>Object Types</span>
          </li>
          <li nz-menu-item [nzSelected]="selectedMenu === 'linkTypes'" (click)="selectMenu('linkTypes')">
            <span nz-icon nzType="link" nzTheme="outline"></span>
            <span>Link Types</span>
          </li>
          <li nz-menu-item [nzSelected]="selectedMenu === 'sharedProperty'" (click)="selectMenu('sharedProperty')">
            <span nz-icon nzType="share-alt" nzTheme="outline"></span>
            <span>Shared Properties</span>
          </li>
          <li nz-menu-item [nzSelected]="selectedMenu === 'valueTypes'" (click)="selectMenu('valueTypes')">
            <span nz-icon nzType="tag" nzTheme="outline"></span>
            <span>Value Types</span>
          </li>
        </ul>
      </nz-sider>
      <nz-content class="ontology-content ">
        <!-- Object Types -->
        <ng-container *ngIf="selectedMenu === 'objectTypes'">
          <h3>Object Types
            <tis-plugin-add-btn (afterPluginAddClose)="loadDetail()"
                                [btnStyle]="'width: 5em'"
                                (primaryBtnClick)="primaryBtnClick($event, 'objectTypes')"
                                (addPlugin)="addPluginClick($event, 'objectTypes')" [btnSize]="'small'"
                                [extendPoint]="'com.qlangtech.tis.plugin.ontology.OntologyObjectType'"
                                [initDescriptors]="true" [lazyInitDescriptors]="true"
                                [descriptors]="[]">
              <i class="fa fa-plus" aria-hidden="true"></i> 添加
            </tis-plugin-add-btn>
          </h3>

          <tis-page [rows]="ontologyDetail.objectTypes" [spinning]="formDisabled">
            <tis-col title="名称" width="16">
              <ng-template let-objType='r'>
                <button nz-button nzType="link" nzSize="small" (click)="gotoObjectType(objType)">{{ objType.name }}
                </button>
              </ng-template>
            </tis-col>
            <tis-col title="数据源" width="16" field="ds">
            </tis-col>
            <tis-col title="Column Size" field="colSize">
            </tis-col>


          </tis-page>

          <!--          <nz-list nzBordered [nzLoading]="formDisabled">-->
          <!--            <nz-list-item *ngFor="let obj of ontologyDetail.objectTypes">-->
          <!--              <button nz-button nzType="link" (click)="gotoObjectType(obj)">{{ obj.name }}</button>-->
          <!--            </nz-list-item>-->
          <!--            <nz-list-empty *ngIf="ontologyDetail.objectTypes.length === 0"-->
          <!--                           nzNoResult="暂无 Object Types"></nz-list-empty>-->
          <!--          </nz-list>-->
        </ng-container>

        <!-- Shared Property -->
        <ng-container *ngIf="selectedMenu === 'sharedProperty'">
          <h3>Shared Properties
            <tis-plugin-add-btn (afterPluginAddClose)="loadDetail()"
                                [btnStyle]="'width: 5em'"
                                (primaryBtnClick)="primaryBtnClick($event, 'sharedProperty')"
                                (addPlugin)="addPluginClick($event, 'sharedProperty')" [btnSize]="'small'"
                                [extendPoint]="'com.qlangtech.tis.plugin.ontology.OntologySharedProperty'"
                                [initDescriptors]="true" [lazyInitDescriptors]="true"
                                [descriptors]="[]">
              <i class="fa fa-plus" aria-hidden="true"></i> 添加
            </tis-plugin-add-btn>
          </h3>
          <nz-list nzBordered [nzLoading]="formDisabled">
            <nz-list-item *ngFor="let obj of ontologyDetail.objectTypes">
              <button nz-button nzType="link" (click)="gotoObjectType(obj)">{{ obj.name }}</button>
            </nz-list-item>
            <nz-list-empty *ngIf="ontologyDetail.objectTypes.length === 0"
                           nzNoResult="暂无 Object Types"></nz-list-empty>
          </nz-list>
        </ng-container>

        <!-- Link Types -->
        <ng-container *ngIf="selectedMenu === 'linkTypes'">
          <h3>Link Types
            <tis-plugin-add-btn (afterPluginAddClose)="loadDetail()"
                                [btnStyle]="'width: 5em'"
                                (primaryBtnClick)="primaryBtnClick($event, 'linkTypes')"
                                (addPlugin)="addPluginClick($event, 'linkTypes')" [btnSize]="'small'"
                                [extendPoint]="'com.qlangtech.tis.plugin.ontology.OntologyLinker'"
                                [initDescriptors]="true" [lazyInitDescriptors]="true"
                                [descriptors]="[]">
              <i class="fa fa-plus" aria-hidden="true"></i> 添加
            </tis-plugin-add-btn>
          </h3>
          <nz-table #linkTable [nzData]="ontologyDetail.linkTypes" [nzLoading]="formDisabled" nzSize="small">
            <thead>
            <tr>
              <th>名称</th>
              <th>源类型</th>
              <th>目标类型</th>
              <th>描述</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let link of linkTable.data">
              <td>{{ link.name }}</td>
              <td>{{ link.sourceType }}</td>
              <td>{{ link.targetType }}</td>
              <td>{{ link.description }}</td>
            </tr>
            </tbody>
          </nz-table>
        </ng-container>

        <!-- Value Types -->
        <ng-container *ngIf="selectedMenu === 'valueTypes'">
          <h3>Value Types
            <tis-plugin-add-btn (afterPluginAddClose)="loadDetail()"
                                [btnStyle]="'width: 5em'"
                                (primaryBtnClick)="primaryBtnClick($event, 'valueTypes')"
                                (addPlugin)="addPluginClick($event, 'valueTypes')" [btnSize]="'small'"
                                [extendPoint]="'com.qlangtech.tis.plugin.ontology.OntologyValueType'"
                                [initDescriptors]="true" [lazyInitDescriptors]="true"
                                [descriptors]="[]">
              <i class="fa fa-plus" aria-hidden="true"></i> 添加
            </tis-plugin-add-btn>
          </h3>
          <nz-table #vtTable [nzData]="ontologyDetail.valueTypes" [nzLoading]="formDisabled" nzSize="small">
            <thead>
            <tr>
              <th>名称</th>
              <th>描述</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let vt of vtTable.data">
              <td>{{ vt.name }}</td>
              <td>{{ vt.description }}</td>
            </tr>
            </tbody>
          </nz-table>
        </ng-container>
      </nz-content>
    </nz-layout>
  `
})
export class OntologyDetailComponent extends BasicFormComponent implements AfterViewInit, OnInit {
  breadcrumb: Breadcrumb;
  ontologyDetail: OntologyDetail;
  selectedMenu: MenuKey = 'objectTypes';
  private ontologyName: string;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService,
              private route: ActivatedRoute, private router: Router) {
    super(tisService, modalService, notification);
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ontologyName = params[KEY_TARGET_NAME];
      this.breadcrumb = {
        "breadcrumb": ["Ontology", "/base/ontology"],
        "name": this.ontologyName
      };
      this.loadDetail();
    });
  }

  loadDetail() {
    this.httpPost('/runtime/applist.ajax',
      'emethod=get_ontology_detail&action=ontology_action&ontology=' + this.ontologyName)
      .then((r) => {
        if (r.success) {
          this.ontologyDetail = r.bizresult;
        }
      });
  }

  //
  // clickObjectType(objType: ObjectType) {
  // this.router.navigate('/ontology/' + this.ontologyName + '/' + objType);
  // }

  selectMenu(menu: MenuKey) {
    this.selectedMenu = menu;
  }

  gotoObjectType(obj: ObjectType) {
    this.router.navigate(['/base/ontology', this.ontologyName, obj.name], {fragment: obj.ds});
  }

  primaryBtnClick(pluginDesc: Descriptor[], type: MenuKey) {
    for (let desc of pluginDesc) {
      this.addPluginClick(desc, type);
      return;
    }
  }

  addPluginClick(pluginDesc: Descriptor, type: MenuKey) {
    let heteroName: string;
    let title: string;
    if (type === 'objectTypes') {
      heteroName = 'ontology-domain';
      title = '添加 Object Type';
    } else if (type === 'linkTypes') {
      heteroName = 'ontology-linker';
      title = '添加 Link Type';
    } else if (type === 'valueTypes') {
      heteroName = 'ontology-value-type';
      title = '添加 Value Type';
    } else if (type === 'sharedProperty') {
      heteroName = 'ontology-value-type';
      title = '添加 Shared Property';
    }
    PluginsComponent.openPluginInstanceAddDialog(this, pluginDesc,
      {
        name: heteroName, require: true, extraParam: "ontology_" + this.ontologyName, descFilter: {
          localDescFilter: () => true
        }
      },
      title,
      (_, db) => {
        this.loadDetail();
      });
  }
}
