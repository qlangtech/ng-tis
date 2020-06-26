import {AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  BasicFormComponent, DumpTable, ERMetaNode, LinkKey,
  // tslint:disable-next-line:no-unused-variable
} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
// @ts-ignore
import * as $ from 'jquery';

import {Grid} from "@antv/g6/build/plugins.js";

import * as G6 from '@antv/g6';
// import Grid from '@antv/g6';
import {WorkflowAddComponent} from "./workflow.add.component";
import {consoleTestResultHandler} from "tslint/lib/test";
// import {EdgeConfig} from "@antv/g6/lib/types";
//  @ts-ignore
// import {} from 'ng-sidebar';
// import {Droppable} from '@shopify/draggable';
// @ts-ignore
// import { Graph } from '@antv/g6';
// @ts-ignore
// @ts-ignore

// @ts-ignore
// import * as $ from 'jquery';
// import 'codemirror/mode/sql/sql.js';
// import 'codemirror/lib/codemirror.css';
// import {EditorConfiguration, fromTextArea} from 'codemirror';
// @ts-ignore
// import {Shape} from '@antv/g6';
// console.log(G6);

const edgeActiveStyle = {
  'endArrow': true,
  'cursor': 'pointer',
  'lineAppendWidth': 8,
  'lineWidth': 3
};


const edgeViewStyle = {
  'endArrow': true,
  'lineWidth': 1
};

// https://g6.antv.vision/zh/examples/shape/customEdge#edgeMulLabel
// 注册自定义边
G6.registerEdge('multipleLabelsEdge', {
  options: {
    style: {
      stroke: '#000',
    },
  },
  labelAutoRotate: true,
  draw: function (cfg: any, group: any) {
    // console.log("start draw edge");
    const startPoint = cfg.startPoint,
      endPoint = cfg.endPoint;
    const stroke = (cfg.style && cfg.style.stroke) || this.options.style.stroke;

    const shape = group.addShape('path', {
      attrs: {
        stroke,
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
      },
      name: 'path-shape',
    });
    if (cfg.label && cfg.label.length) {
      // 绘制左边的label
      group.addShape('text', {
        attrs: {
          text: cfg.label[0],
          fill: '#595959',
          textAlign: 'start',
          textBaseline: 'middle',
          x: startPoint.x,
          y: startPoint.y - 10,
        },
        name: 'left-text-shape',
      });
      if (cfg.label.length > 1) {
        // 绘制右边的label
        group.addShape('text', {
          attrs: {
            text: cfg.label[1],
            fill: '#595959',
            textAlign: 'end',
            textBaseline: 'middle',
            x: endPoint.x,
            y: endPoint.y - 10,
          },
          name: 'right-text-shape',
        });
      }
    }
    // 返回边的keyShape
    return shape;
  },
});

// https://g6.antv.vision/zh/docs/manual/advanced/mode-and-custom-behavior
G6.registerBehavior('click-add-edge', {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      'node:click': 'onClick', // 监听事件 node:click，响应函数时 onClick
      'mousemove': 'onMousemove', // 监听事件 mousemove，响应函数时 onMousemove
      'edge:click': 'onEdgeClick', // 监听事件 edge:click，响应函数时 onEdgeClick
    };
  },
  // getEvents 中定义的 'node:click' 的响应函数
  onClick(ev: any) {
    const node = ev.item;
    const graph = this.graph;
    // 鼠标当前点击的节点的位置
    const point = {x: ev.x, y: ev.y};
    const model = node.getModel();
    if (this.addingEdge && this.edge) {
      graph.updateItem(this.edge, {
        target: model.id,
      });

      this.edge = null;
      this.addingEdge = false;
    } else {
      // 在图上新增一条边，结束点是鼠标当前点击的节点的位置
      let edgeCfg = {
        id: WorkflowAddComponent.getUUID(),
        source: model.id,
        // @ts-ignore
        target: point,
        // @ts-ignore
       // label: ["test", "label"],
        style: edgeViewStyle
      };
      this.edge = graph.addItem('edge', edgeCfg);
      this.addingEdge = true;
    }
  },
  // getEvents 中定义的 mousemove 的响应函数
  onMousemove(ev: any) {
    // 鼠标的当前位置
    const point = {x: ev.x, y: ev.y};
    if (this.addingEdge && this.edge) {
      // 更新边的结束点位置为当前鼠标位置
      let edgeCfg = {target: point};
      this.graph.updateItem(this.edge,
        edgeCfg);
    }
  },
  // getEvents 中定义的 'edge:click' 的响应函数
  onEdgeClick(ev: any) {
    const currentEdge = ev.item;
    const graph = this.graph;
    // 拖拽过程中，点击会点击到新增的边上
    if (this.addingEdge && this.edge === currentEdge) {
      graph.removeItem(this.edge);
      this.edge = null;
      this.addingEdge = false;
    }
  },
});

const MODE_DRAG = "dragnode";
const MODE_DEFAULT = "default";

@Component({
  selector: `offline-er`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <div id="tool-bar">
          <!--
         {{this._editMode}}
         <button nz-button (click)="changeStyle(true)">changeStyle</button>
         -->
          <nz-input-group nzCompact [nzSize]="'small'">
              <nz-radio-group [(ngModel)]="editMode" [nzButtonStyle]="'solid'" nzSize="small">
                  <label nz-radio-button nzValue="default">关系</label>
                  <label nz-radio-button nzValue="dragnode">元数据</label>
              </nz-radio-group>
          </nz-input-group>
      </div>
      <div id="er_canvas_container"></div>
  `,
  styles: [
      `
          #tool-bar {
              background-color: #eeeeee;
              padding: 5px;
              border-bottom: 1px solid #a6a6a6;
          }
    `]
})
// 设置表之间的ER实体关系
export class WorkflowERComponent
  extends BasicFormComponent implements OnInit, AfterContentInit, AfterViewInit {
  // g6graph
  private graph: any;
  private _editMode: "dragnode" | 'default' = MODE_DRAG;
  // dumpNodes: { x: number, y: number, nodeMeta: DumpTable }[] = [];

  @Output() edgeClick = new EventEmitter<any>();

  @Output() nodeClick = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NgbModal) {
    super(tisService, modalService);
  }

  // @ts-ignore
  set editMode(val: "dragnode" | 'default') {
    if (this.graph) {
      this.graph.setMode(val);
    }
    this.changeStyle(MODE_DRAG === val);
    // console.log(val);
    this._editMode = val;
  }

  get editMode(): "dragnode" | 'default' {
    return this._editMode;
  }

  @Input()
  public set dumpNodes(vals: ERRules
                       // {
                       //   dumpNodes: { x: number, y: number, nodeMeta: DumpTable }[],
                       //   linkList: {
                       //     'id': string
                       //     , 'cardinality': string
                       //     , 'child': { id: string }
                       //     , 'parent': { id: string }
                       //     , 'joinerKeys': [{ 'childKey': string, 'parentKey': string }] }[]
                       // }
  ) {
    if (!this.graph || !vals || !vals.dumpNodes || vals.dumpNodes.length < 1) {
      return;
    }
    let data: { nodes: any[], edges: any[] } = {
      nodes: [],
      edges: []
    };

    vals.linkList.forEach((r) => {

      // data.edges.push(r);
      // console.log(r);
      WorkflowAddComponent.addEdge(data, r.id, r.child.id, r.parent.id, edgeActiveStyle);
    });

    vals.dumpNodes.forEach((n) => {
      // console.log(n);
      if (n.extraMeta) {

      }
      data.nodes.push(n);
    });

    this.graph.data(data);
    this.graph.render();
    vals.linkList.forEach((r) => {
      let joinerKeys: { 'childKey': string, 'parentKey': string }[] = r.joinerKeys;
      let old = this.graph.findById(r.id);
      old.linkrule = {'linkKeyList': joinerKeys, 'cardinality': r.cardinality};
    });
  }

  public get g6Graph(): any {
    this.graph.save();
    return this.graph;
  }

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    const grid = new Grid({
      cell: 20,
      type: 'dot'
    });
    let canvas_container = $('#er_canvas_container')[0];
    this.graph = new G6.Graph({
      container: canvas_container,
      plugins: [grid],
      width: 3000,
      height: 1500,
      defaultEdge: {
        type: 'multipleLabelsEdge',
        // labelCfg: {
        //   autoRotate: true,
        //   style: {
        //     // A white stroke with width 5 helps show the label more clearly avoiding the interference of the overlapped edge
        //     stroke: 'white',
        //     lineWidth: 5,
        //   },
        // },
      },
      modes: {
        'click': ['click-select'],
        'default': ['drag-node', 'click-add-edge'],
        'dragnode': ['drag-node'],
        'addEdge': ['click-select'],
      }
    });
    this.graph.on('node:click', (evt: any) => {
      let nodeInfo = evt.item._cfg.model;
      // console.log(evt.item);
      if (this._editMode === MODE_DRAG) {
        // this.nodeClick.emit({'g6': this.graph, 'dumpnode': nodeInfo.nodeMeta, 'ermeta': evt.item.ermeta});
        this.nodeClick.emit({'g6': this.graph, 'dumpnode': nodeInfo.nodeMeta, 'ermeta': nodeInfo.extraMeta});
      }
    });
    this.graph.on('edge:click', (evt: any) => {
      if (!evt.item._cfg) {
        return;
      }
      if (!(this.editMode === MODE_DRAG)) {
        return;
      }
      let edgeInfo = evt.item._cfg.model;
      if (!edgeInfo || !edgeInfo.sourceNode || !edgeInfo.targetNode) {
        return;
      }
      // console.log(evt);
      let linkrule: any;
      if (!evt.item.linkrule) {
        linkrule = {'linkKeyList': [], 'cardinality': ''};
      } else {
        linkrule = evt.item.linkrule;
      }
      // 接收者: erNodesEdgeClick()
      // 'linkrule': { linkKeyList: LinkKey[], cardinality: string }
      this.edgeClick.emit({
        'g6': this.graph
        , 'id': edgeInfo.id
        , 'sourceNode': edgeInfo.sourceNode._cfg.model.nodeMeta
        , 'targetNode': edgeInfo.targetNode._cfg.model.nodeMeta
        , 'linkrule': linkrule // {'linkKeyList': linkrule.}
      });
    });
    this.editMode = MODE_DRAG;
  }

  ngOnInit(): void {
  }

  changeStyle(active: boolean) {
    // let edges = this.graph.getEdges();
    let j = this.graph.save();
    // console.log(j.edges);
    j.edges.forEach((edge: any) => {
      edge.style = active ? edgeActiveStyle : edgeViewStyle;
      // this.graph.refreshItem(edge);
    });
    this.graph.changeData(j);
  }
}

export interface ERRules {
  dumpNodes: { x: number, y: number, nodeMeta: DumpTable, extraMeta?: ERMetaNode }[];
  linkList: LinkRule[];
}

// export class TabExtraMeta {
//   monitorTrigger = true;
//   primaryIndexTab = false;
//   primaryIndexColumnName: string;
//   colTransfers: ColTransfer[] = [];
// }

// export class ColTransfer {
//   colKey: string;
//   param: string;
//   transfer: string;
// }

export class LinkRule {
  'id': string;
  'cardinality': string;
  'child': { id: string };
  'parent': { id: string };
  'joinerKeys': { 'childKey': string, 'parentKey': string }[] = [];
}







