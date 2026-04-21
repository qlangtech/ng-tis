import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Breadcrumb} from "../runtime/misc/RCDeployment";
import {ActivatedRoute} from "@angular/router";
import {KEY_OBJECT_TYPE, KEY_TARGET_NAME} from "./base.manage-routing.module";
import {Descriptor} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {ClassicPreset, GetSchemes, NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from "rete-area-plugin";
import {ConnectionPlugin, Presets as ConnectionPresets} from "rete-connection-plugin";
import {AngularArea2D, AngularPlugin, Presets as AngularPresets} from "rete-angular-plugin/17";
import {ObjectType, ObjectTypeDetail, ObjectTypeProperty} from "./common/ontology.common";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {TableTransformerComponent} from "../common/selectedtab/table.transformer.component";
import {OntologyColumnDetailComponent} from "./ontology.column.detail.component";

type Schemes = GetSchemes<ClassicPreset.Node, ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>>;
type AreaExtra = AngularArea2D<Schemes>;

type ObjMenuKey = 'overview' | 'properties' | 'datasources';

@Component({
  styles: [`
    .obj-sider {
      background: #fff;
      border-right: 1px solid #f0f0f0;
      padding: 12px 0;
    }

    .obj-content {
      padding: 0 24px;
      min-height: 400px;
    }

    .profile-card {
      margin-bottom: 16px;
    }

    .rete-wrapper {
      position: relative;
      width: 100%;
      height: 400px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    }

    .rete-toolbar {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 4px;
    }

    .rete-toolbar button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fff;
      font-size: 16px;
      line-height: 1;
    }

    .rete-toolbar button:hover {
      background: #e6f7ff;
      border-color: #1890ff;
    }

    /* Rete.js 节点样式覆盖 */
    .rete-wrapper ::ng-deep .rete-node {
      min-width: 80px !important;
      width: auto !important;
      padding: 6px 10px !important;
      background: #8c8c8c !important;
      color: #fff !important;
      border-radius: 6px !important;
      border: 1px solid #595959 !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2) !important;
    }

    .rete-wrapper ::ng-deep .rete-node .title {
      font-size: 12px !important;
      font-weight: 500 !important;
      padding: 0 !important;
      margin: 0 !important;
      color: #fff !important;
      background: transparent !important;
    }

    .rete-wrapper ::ng-deep .rete-node .output-title,
    .rete-wrapper ::ng-deep .rete-node .input-title {
      display: none !important;
    }

    /* 隐藏 socket 圆形图标 */
    .rete-wrapper ::ng-deep .rete-socket {
      width: 0 !important;
      height: 0 !important;
      min-width: 0 !important;
      min-height: 0 !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .rete-wrapper ::ng-deep .rete-node .output,
    .rete-wrapper ::ng-deep .rete-node .input {
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
  `],
  template: `
    <tis-page-header *ngIf="breadcrumb" [breadcrumb]="breadcrumb.breadcrumb" [title]="breadcrumb.name">
      <tis-header-tool>
      </tis-header-tool>
    </tis-page-header>

    <nz-layout *ngIf="objectTypeDetail">
      <nz-sider class="obj-sider" [nzWidth]="200">
        <ul nz-menu nzMode="inline">
          <li nz-menu-item [nzSelected]="selectedMenu === 'overview'" (click)="selectMenu('overview')">
            <span nz-icon nzType="dashboard" nzTheme="outline"></span>
            <span>Overview</span>
          </li>
          <li nz-menu-item [nzSelected]="selectedMenu === 'properties'" (click)="selectMenu('properties')">
            <span nz-icon nzType="unordered-list" nzTheme="outline"></span>
            <span>Properties</span>
          </li>
          <li nz-menu-item [nzSelected]="selectedMenu === 'datasources'" (click)="selectMenu('datasources')">
            <span nz-icon nzType="database" nzTheme="outline"></span>
            <span>Datasources</span>
          </li>
        </ul>
      </nz-sider>

      <nz-content class="obj-content">

        <!-- Overview -->
        <ng-container *ngIf="selectedMenu === 'overview'">
          <nz-card class="profile-card" nzTitle="Profile">
            <nz-descriptions nzBordered [nzColumn]="2">
              <nz-descriptions-item nzTitle="名称">{{ objectTypeDetail.name }}</nz-descriptions-item>
              <nz-descriptions-item nzTitle="Properties 数量">{{ objectTypeDetail.properties?.length || 0 }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Link Types 数量">{{ objectTypeDetail.linkTypes?.length || 0 }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Datasources 数量">{{ objectTypeDetail.datasources?.length || 0 }}
              </nz-descriptions-item>
            </nz-descriptions>
          </nz-card>

          <nz-card nzTitle="Properties" style="margin-bottom: 16px;">

            <tis-page [rows]="objectTypeDetail.properties" [spinning]="formDisabled" [tabSize]="'small'">
              <tis-col title="名称" width="25">
                <ng-template let-col='r'>
                  <button nz-button nzType="link" nzSize="small" (click)="gotoCol(col)">{{ col.name }}
                  </button>
                </ng-template>
              </tis-col>
              <tis-col title="类型" width="16">
                <ng-template let-col='r'>
                  <i nz-icon class="icon-badge" [nzType]="col.typeEnd" nzTheme="outline"></i>  {{ col.type }}
                </ng-template>
              </tis-col>
              <tis-col title="描述" field="description">
              </tis-col>
            </tis-page>
          </nz-card>

          <nz-card nzTitle="Link Types">
            <div class="rete-wrapper rete-ontology-graph">
              <div class="rete-toolbar">
                <button title="放大" (click)="zoomIn()">+</button>
                <button title="缩小" (click)="zoomOut()">−</button>
                <button title="适应画布" (click)="zoomToFit()">
                  <span nz-icon nzType="fullscreen" nzTheme="outline"></span>
                </button>
              </div>
              <div #reteContainer style="width: 100%; height: 100%;"></div>
            </div>
          </nz-card>
        </ng-container>

        <!-- Properties -->
        <ng-container *ngIf="selectedMenu === 'properties'">
          <h3>Properties</h3>
          <nz-table #propDetailTable [nzData]="objectTypeDetail.properties" [nzLoading]="formDisabled" nzSize="small">
            <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>描述</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let prop of propDetailTable.data">
              <td>{{ prop.name }}</td>
              <td>{{ prop.type }}</td>
              <td>{{ prop.description }}</td>
            </tr>
            </tbody>
          </nz-table>
        </ng-container>

        <!-- Datasources -->
        <ng-container *ngIf="selectedMenu === 'datasources'">
          <h3>Datasources</h3>
          <nz-table #dsTable [nzData]="objectTypeDetail.datasources" [nzLoading]="formDisabled" nzSize="small">
            <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let ds of dsTable.data">
              <td>{{ ds.name }}</td>
              <td>{{ ds.type }}</td>
            </tr>
            </tbody>
          </nz-table>
        </ng-container>
      </nz-content>
    </nz-layout>
  `
})
export class OntologyObjectTypeDetailComponent extends BasicFormComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('reteContainer') reteContainer: ElementRef;
  breadcrumb: Breadcrumb;
  objectTypeDetail: ObjectTypeDetail;
  objectType: ObjectType;
  selectedMenu: ObjMenuKey = 'overview';
  // private ontologyName: string;
  // private objectTypeName: string;
  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService,
              private route: ActivatedRoute, private injector: Injector, private drawerService: NzDrawerService) {
    super(tisService, modalService, notification);
  }

  get objectTypeName(): string {
    return this.objectType.name;
  }

  get ontologyName(): string {
    return this.objectType.domain;
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {

    let snapshot = this.route.snapshot;
    let params = snapshot.params;

    // this.route.params.subscribe(params => {
    // this.ontologyName = params[KEY_TARGET_NAME];
    // this.objectTypeName = params[KEY_OBJECT_TYPE];
    this.objectType = {
      name: params[KEY_OBJECT_TYPE],
      ds: snapshot.fragment,
      domain: params[KEY_TARGET_NAME]
    }
    this.breadcrumb = {
      "breadcrumb": ["Ontology", "/base/ontology", this.objectType.domain, "/base/ontology/" + this.objectType.name],
      "name": this.objectType.name
    };
    this.loadObjectTypeDetail(snapshot.fragment);
  }


  ngOnDestroy(): void {
    if (this.area) {
      this.area.destroy();
    }
  }

  loadObjectTypeDetail(dataSource: string) {
    this.httpPost('/runtime/applist.ajax',
      'emethod=get_object_type&action=ontology_action&ontology=' + this.ontologyName + '&ds=' + dataSource + '&object-type=' + this.objectTypeName)
      .then((r) => {
        if (r.success) {
          let detail = r.bizresult;
          let objType = detail["object-type"];
          this.objectTypeDetail = {
            name: this.objectTypeName,
            properties: objType.cols,
            linkTypes: detail["link-types"] || [],
            datasources: []
          };
          setTimeout(() => {
            if (this.selectedMenu === 'overview' && this.reteContainer) {
              this.initReteGraph();
            }
          }, 100);
        }
      });
  }

  public gotoCol(prop: ObjectTypeProperty) {
    // console.log(prop);

    const drawerRef = this.drawerService.create<OntologyColumnDetailComponent, {}, {}>({
      // 此处宽度不能用百分比，不然内部的codemirror显示会有问题
      nzWidth: "900px",
      // nzHeight: "80%",
      nzPlacement: "right",
      nzMaskClosable: true,
      nzTitle: `Ontology Property ‘${prop.name}’ Detail`,
      nzContent: OntologyColumnDetailComponent,
      nzWrapClassName: 'get-gen-cfg-file',
      nzData: {
        // readonly: true,
        prop: prop,
        objectType: this.objectType
      }
    });

  }

  selectMenu(menu: ObjMenuKey) {
    this.selectedMenu = menu;
    if (menu === 'overview') {
      setTimeout(() => {
        if (this.reteContainer) {
          this.initReteGraph();
        }
      }, 100);
    }
  }

  // 缩放操作
  zoomIn() {
    if (this.area) {
      const {k, x, y} = this.area.area.transform;
      this.area.area.zoom(k * 1.2, 0, 0);
    }
  }

  zoomOut() {
    if (this.area) {
      const {k, x, y} = this.area.area.transform;
      this.area.area.zoom(k / 1.2, 0, 0);
    }
  }

  zoomToFit() {
    if (this.area && this.editor) {
      AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }
  }

  private async initReteGraph() {
    const container = this.reteContainer.nativeElement;
    if (!container || !this.objectTypeDetail) return;

    // 清理之前的实例
    if (this.area) {
      this.area.destroy();
    }
    // 清理容器内的 rete 内容（保留 toolbar 所在的父级不变）
    container.innerHTML = '';

    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const angularRender = new AngularPlugin<Schemes, AreaExtra>({injector: this.injector});

    angularRender.addPreset(AngularPresets.classic.setup());
    connection.addPreset(ConnectionPresets.classic.setup());

    this.editor.use(this.area);
    this.area.use(connection);
    this.area.use(angularRender);

    // 画布中心坐标
    const centerX = 300;
    const centerY = 180;

    // 中心节点：当前 Object Type（不添加 input/output 以减小节点大小）
    const centerNode = new ClassicPreset.Node(this.objectType.name);
    centerNode.addOutput('out', new ClassicPreset.Output(new ClassicPreset.Socket('link'), '', false));
    await this.editor.addNode(centerNode);
    await this.area.translate(centerNode.id, {x: centerX, y: centerY});

    const linkTypes = this.objectTypeDetail.linkTypes || [];

    if (linkTypes.length === 0) {
      // 没有 link type 时，显示 "Create new Link Type" 占位节点
      const placeholderNode = new ClassicPreset.Node('+ Create new Link Type');

      placeholderNode.addInput('in', new ClassicPreset.Input(new ClassicPreset.Socket('link'), '', false));
      await this.editor.addNode(placeholderNode);

      // 点击占位节点时打开"添加 Link Type"对话框
      this.area.addPipe(context => {
        if (context.type === 'nodepicked' && context.data.id === placeholderNode.id) {
          this.openAddLinkTypeDialog();
        }
        return context;
      });

      // 连线
      const conn = new ClassicPreset.Connection(centerNode, 'out', placeholderNode, 'in');
      await this.editor.addConnection(conn);

      // 放在右侧
      await this.area.translate(placeholderNode.id, {x: centerX + 250, y: centerY});
    } else {
      // 为每个 link type 创建关联节点，围绕中心节点环形分布
      const radius = 180;
      const angleStep = (2 * Math.PI) / linkTypes.length;
      // 起始角度从右侧开始
      const startAngle = 0;

      for (let i = 0; i < linkTypes.length; i++) {
        const lt = linkTypes[i];
        const targetName = lt.targetType === this.objectType.name ? lt.sourceType : lt.targetType;
        const linkedNode = new ClassicPreset.Node(targetName);
        linkedNode.addInput('in', new ClassicPreset.Input(new ClassicPreset.Socket('link'), '', false));
        await this.editor.addNode(linkedNode);

        // 连线
        const conn = new ClassicPreset.Connection(centerNode, 'out', linkedNode, 'in');
        await this.editor.addConnection(conn);

        // 放置关联节点在圆周上
        const angle = startAngle + angleStep * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        await this.area.translate(linkedNode.id, {x, y});
      }
    }

    // 自适应缩放
    setTimeout(() => {
      AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }, 50);
  }

  openAddLinkTypeDialog(desc?: Descriptor) {
    // PluginsComponent.openPluginInstanceAddDialog(this, desc || null,
    //   {name: 'ontology-linker', require: true, extraParam: 'ontology_' + this.ontologyName},
    //   '添加 Link Type',
    //   (_, db) => {
    //     // this.loadObjectTypeDetail();
    //   });
  }
}
