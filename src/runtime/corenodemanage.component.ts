import {Component, ElementRef, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {TriggerDumpComponent} from "./trigger_dump.component";
// import {SolrCfgEditComponent} from "../corecfg/solrcfg.edit.component";
import {SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
import {PojoComponent} from "./pojo.component";
import {SyncConfigComponent} from "./sync.cfg.component";
import {CopyOtherCoreComponent} from "./copy.other.core.component";
import {SnapshotChangeLogComponent} from "./snapshot.change.log";
import {ActivatedRoute, Router} from "@angular/router";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';

console.log(dagreD3);

// 这个类专门负责router
@Component({
  template: `
      <br/>
      <nz-row [nzGutter]="16">
          <nz-col [nzSpan]="6">
              <nz-card class="primary-card">
                  <nz-statistic [nzValue]="(instanceDirDesc.allcount | number)!" [nzTitle]="'总记录数(条)'"></nz-statistic>
              </nz-card>
          </nz-col>
          <nz-col [nzSpan]="6">
              <nz-card class="primary-card">
                  <nz-statistic [nzValue]="(2019.111 | number: '1.0-2')!" [nzTitle]="'当天更新次数'"></nz-statistic>
              </nz-card>
          </nz-col>
          <nz-col [nzSpan]="12">
              <nz-card nzTitle="副本目录信息" class="primary-card">
                  {{instanceDirDesc.desc}}
              </nz-card>
          </nz-col>
      </nz-row>
      <nz-row [nzGutter]="16">
          <nz-col [nzSpan]="24">
              <br/>
              <nz-card [nzTitle]="'节点拓扑'">
                  <svg id="svg-canvas" #svgblock width='100%' height=600></svg>
              </nz-card>
          </nz-col>
      </nz-row>
  `,
  styles: [`
      .primary-card {
          height: 150px;
      }

      .clusters rect {
          fill: #00ffd0;
          stroke: #999;
          stroke-width: 1.5px;
      }

      text {
          font-weight: 300;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
          font-size: 14px;
      }

      .node rect {
          stroke: #999;
          fill: #fff;
          stroke-width: 1.5px;
      }

      .edgePath path {
          stroke: #333;
          stroke-width: 1.5px;
      }
  `]
})
export class CorenodemanageComponent extends AppFormComponent {
// http://localhost:8080/coredefine/corenodemanage.ajax?action=core_action&emethod=get_view_data
  app: any;
  config: any;
  instanceDirDesc: any = {allcount: 0};

  @ViewChild('svgblock', {static: false}) svgblock: ElementRef;

  constructor(tisService: TISService, modalService: NgbModal
    , route: ActivatedRoute, private router: Router) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=get_view_data')
      .then((r) => {
        if (r.success) {
          this.app = r.bizresult.app;
          this.config = r.bizresult.config;
          this.instanceDirDesc = r.bizresult.instanceDirDesc;
          this.paintToplog(app, this.createGraph(), r.bizresult.topology);
        }
      });
  }

  private paintToplog(app: CurrentCollection, g: any, data: any): void {
    console.log(data);
    let appname = app.appName;
    g.setNode(appname, {label: appname, style: 'fill: white;stroke-width: 1.5px;stroke: #999'});

    data.shareds.forEach((shard) => {
      g.setNode(shard.name, {label: shard.name, clusterLabelPos: 'top', style: 'fill: #d3d7e8;stroke-width: 1.5px;stroke: #999'});

      shard.replics.forEach((r) => {
        g.setNode(r.name, {label: r.name, shape: "ellipse", style: 'fill: white;cursor: pointer;'});
        g.setParent(r.name, shard.name);
        g.setEdge(r.name, appname, {style: 'stroke: #333;stroke-width: 1.5px;fill: none;'});
      });
    });
    g.nodes().forEach(function (v) {
      let node = g.node(v);
      // console.log(node);
      // node.elem.onclick = function () {
      //   console.log("xxxxx");
      // };
      // Round the corners of the nodes
      node.rx = node.ry = 5;
    });
    let render = new dagreD3.render();

// Set up an SVG group so that we can translate the final graph.
    let svg = d3.select(this.svgblock.nativeElement),
      svgGroup = svg.append("g");
// Run the renderer. This is what draws the final graph.
    render(svg.select("g"), g);

    svg.selectAll("g.node").on("click", function (d) {

    });

// Center the graph
    let xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
    // svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svgGroup.attr("transform", "translate(" + 100 + ", 20)");
    // console.log(g.graph().height);
    svg.attr("height", g.graph().height + 40);
  }


  private createGraph(): any {

    // Create the input graph
    let g = new dagreD3.graphlib.Graph({compound: true})
      .setGraph({
        nodesep: 10,
        ranksep: 40,
        rankdir: "LR",
        marginx: 10,
        marginy: 20
      })
      .setDefaultEdgeLabel(function () {
        return {};
      });
    return g;
  }

  public jsonString(v: any): string {
    return JSON.stringify(v);
  }

  // 立刻触发全量索引构建
  public triggerFullBuild(): void {

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'event_submit_do_trigger_fullbuild_task=y&action=core_action')
      .then((d) => {
        if (d.success) {
          if (d.bizresult) {
            let msg: any = [];
            msg.push({
              'content': '全量索引构建已经触发'
              , 'link': {'content': '状态日志', 'href': './buildprogress/' + d.bizresult.taskid}
            });

            this.processResult({success: true, 'msg': msg});
          } else {
            alert("重复触发了");
          }
        } else {
          this.processResult(d);
        }
      });


    // let msg: any = [];
    // msg.push({
    //   'content': '全量索引构建已经触发'
    //   , 'link': {'content': '查看构建状态', 'href': './buildprogress/' + 123}
    // });
    //
    // this.processResultWithTimeout({'success': true, 'msg': msg}, 10000);


  }


// 打开模态对话框
  public openModal(): void {

  }

  // 配置同步到线上
  public openSyncConfigDialog(): void {
    // this.modalService.open(SyncConfigComponent, {size: 'lg'});
    this.openLargeDialog(SyncConfigComponent);
  }

  // 变更历史
  public openSnapshotVerChangeLog(): void {
    // this.modalService.open(SnapshotChangeLogComponent, {windowClass: 'schema-edit-modal'});
    this.openNormalDialog(SnapshotChangeLogComponent);
  }

  // 从其他索引拷贝索引配置
  public openCopyOtherIndexDialog(): void {
    // this.modalService.open(CopyOtherCoreComponent, {size: 'lg'});
    this.openLargeDialog(CopyOtherCoreComponent);
  }

  public openTriggerFullDumpDialog(): void {
    // 打开触发全量构建对话框
    //   const modalRef = this.modalService.open(TriggerDumpComponent);
    this.openNormalDialog(TriggerDumpComponent);

  }

  // 打开Schema编辑页面
  public openSchemaDialog(snapshotId: number, editable: boolean): void {
    var modalRef: NgbModalRef =
      this.openLargeDialog(SchemaXmlEditComponent);
    modalRef.componentInstance.snapshotid = snapshotId;

  }

  // 打开Pojo编辑页面
  public openPojoDialog(): void {
    // var modalRef: NgbModalRef = this.modalService.open(PojoComponent, {windowClass: 'schema-edit-modal'});

    this.openNormalDialog(PojoComponent);

  }


  public pushConfigAndEffect(): void {

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&needReload=true&emethod=update_schema_all_server').then((r) => {
      this.processResult(r);
    });
  }

  public pushConfig(): void {
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&needReload=false&emethod=update_schema_all_server').then((r) => {
      this.processResult(r);
    });
  }

  // 打开solr编辑页面
  public openSolrConfigDialog(snapshotId: number, editable: boolean): void {
    // let modalRef: NgbModalRef
    //   =  // this.modalService.open(SolrCfgEditComponent, {windowClass: 'schema-edit-modal'});
    // this.openNormalDialog(SolrCfgEditComponent);
    // modalRef.componentInstance.snapshotid = snapshotId;
  }

  public openGlobalParametersDialog() {


  }

  // closeResult: string;
  //
  // public opendialog(content: any): void {
  //
  //   this.modalService.open(content).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  //   console.info("haha");
  // }
  //
  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }
  gotoFullBuildHistory() {
    // <a class="dropdown-item" routerLink="./full_build_history"></a>
    this.router.navigate(["/offline/wf/build_history/45"]);
  }
}
