/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';
import G6, {Graph, GraphData} from '@antv/g6';
import {DAGMonitorService, DAGNode, DAGTopology, NodeStatus} from '../service/dag.monitor.service';

function getStatusIconChar(status: string): string {
  switch (status) {
    case 'WAITING':  return '⏱';
    case 'QUEUED':   return '⋯';
    case 'RUNNING':  return '⚙';
    case 'SUCCEED':  return '✓';
    case 'FAILED':   return '✗';
    case 'STOPPED':  return '■';
    default:         return '?';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'WAITING':  return '#d9d9d9';
    case 'QUEUED':   return '#722ed1';
    case 'RUNNING':  return '#1890ff';
    case 'SUCCEED':  return '#52c41a';
    case 'FAILED':   return '#f5222d';
    case 'STOPPED':  return '#faad14';
    default:         return '#d9d9d9';
  }
}

const NODE_LABEL_MAX_LENGTH = 25;
const NODE_LABEL_LINE_WIDTH = 12;

function formatNodeLabel(name: string): string {
  let text = name;
  if (text.length > NODE_LABEL_MAX_LENGTH) {
    text = text.substring(0, NODE_LABEL_MAX_LENGTH) + '...';
  }
  if (text.length > NODE_LABEL_LINE_WIDTH) {
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += NODE_LABEL_LINE_WIDTH) {
      lines.push(text.substring(i, i + NODE_LABEL_LINE_WIDTH));
    }
    return lines.join('\n');
  }
  return text;
}

function rotateMatrix(cx: number, cy: number, angle: number): number[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cos, sin, 0, -sin, cos, 0, cx - cx * cos + cy * sin, cy - cx * sin - cy * cos, 1];
}

function getArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): any[] {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [['M', x1, y1], ['A', r, r, 0, largeArc, 1, x2, y2]];
}

function addRunningSpinner(group: any, cx: number, cy: number, r: number): void {
  const spinnerR = r + 3;
  const arcPath = getArcPath(cx, cy, spinnerR, 0, Math.PI * 1.5);

  const spinner = group.addShape('path', {
    attrs: {path: arcPath, stroke: '#1890ff', lineWidth: 2, lineCap: 'round'},
    name: 'running-spinner',
  });

  spinner.animate(
    (ratio) => ({matrix: rotateMatrix(cx, cy, ratio * Math.PI * 2)}),
    {duration: 1200, repeat: true}
  );
}

G6.registerNode('dag-status-node', {
  afterDraw(cfg, group) {
    const status = cfg.nodeStatus as string;
    if (!status) return;

    const x = -60 + 2;
    const y = -30 + 2;
    const r = 8;

    group.addShape('circle', {
      attrs: {
        x: x + r,
        y: y + r,
        r,
        fill: getStatusBadgeColor(status),
        stroke: '#fff',
        lineWidth: 1,
      },
      name: 'status-badge',
    });

    const iconShape = group.addShape('text', {
      attrs: {
        x: x + r,
        y: y + r,
        text: getStatusIconChar(status),
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
        fill: '#fff',
        textAlign: 'center',
        textBaseline: 'middle',
      },
      name: 'status-icon',
    });

    if (status === 'RUNNING') {
      addRunningSpinner(group, x + r, y + r, r);
    }
  },

  afterUpdate(cfg, item) {
    const group = item.getContainer();
    const status = cfg.nodeStatus as string;

    const badge = group.find(el => el.get('name') === 'status-badge');
    if (badge) {
      badge.attr('fill', getStatusBadgeColor(status));
    }

    const icon = group.find(el => el.get('name') === 'status-icon');
    if (icon) {
      icon.stopAnimate();
      icon.attr({text: getStatusIconChar(status), matrix: null});
    }

    const oldSpinner = group.find(el => el.get('name') === 'running-spinner');
    if (oldSpinner) {
      oldSpinner.stopAnimate();
      oldSpinner.remove(true);
    }

    if (status === 'RUNNING') {
      const cx = -60 + 2 + 8;
      const cy = -30 + 2 + 8;
      addRunningSpinner(group, cx, cy, 8);
    }
  },
}, 'rect');

@Component({
  selector: 'dag-graph-viewer',
  template: `
    <div class="dag-graph-container">
      <div #graphContainer id="dag-graph-container" style="width: 100%; height: 600px;"></div>
    </div>
  `,
  styles: [`
    .dag-graph-container {
      position: relative;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fafafa;
    }

    #dag-graph-container {
      background: white;
    }
  `]
})
export class DAGGraphViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() topology: DAGTopology | null = null;
  @Input() autoRefresh: boolean = false;
  @Output() nodeClick = new EventEmitter<DAGNode>();
  @ViewChild('graphContainer', {static: true}) graphContainer: ElementRef;

  private graph: Graph | null = null;
  private rendered = false;

  private layoutPresets = [
    { name: '水平居中', config: { type: 'dagre', rankdir: 'LR', nodesep: 50, ranksep: 100 } },
    { name: '水平紧凑', config: { type: 'dagre', rankdir: 'LR', align: 'UL', nodesep: 50, ranksep: 100 } },
    { name: '垂直布局', config: { type: 'dagre', rankdir: 'TB', nodesep: 50, ranksep: 80 } },
  ];
  currentLayoutIndex = 0;

  constructor(private monitorService: DAGMonitorService) {
  }

  ngAfterViewInit(): void {
    this.initGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topology'] && this.graph && this.topology) {
      this.updateGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.graph) {
      this.graph.destroy();
    }
  }

  private initGraph(): void {
    const container = this.graphContainer.nativeElement;

    if (!container) {
      return;
    }

    const width = container.scrollWidth || container.offsetWidth;
    const height = container.scrollHeight || container.offsetHeight || 600;

    // 懒加载 tab 场景下，容器可能尚无尺寸，延迟重试
    if (width <= 0) {
      setTimeout(() => this.initGraph(), 100);
      return;
    }

    const tooltip = new G6.Tooltip({
      offsetX: 10,
      offsetY: 10,
      itemTypes: ['node'],
      getContent: (e) => {
        const model = e.item?.getModel();
        const fullLabel = (model as any)?.fullLabel || model?.label || '';
        return `<div style="padding: 4px 8px; font-size: 12px;">${fullLabel}</div>`;
      },
      shouldBegin: (e) => {
        const model = e.item?.getModel();
        const fullLabel = (model as any)?.fullLabel || '';
        return fullLabel.length > NODE_LABEL_LINE_WIDTH;
      }
    });

    this.graph = new G6.Graph({
      container,
      width,
      height,
      plugins: [tooltip],
      modes: {
        default: ['drag-canvas', 'drag-node']
      },
      layout: {
        type: 'dagre',
        rankdir: 'LR',
        nodesep: 50,
        ranksep: 100
      },
      defaultNode: {
        type: 'dag-status-node',
        size: [120, 60],
        style: {
          radius: 4,
          stroke: '#5B8FF9',
          fill: '#C6E5FF',
          lineWidth: 2
        },
        labelCfg: {
          style: {
            fill: '#000',
            fontSize: 12
          }
        }
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: '#8c8c8c'
          },
          stroke: '#8c8c8c',
          lineWidth: 2
        }
      },
      nodeStateStyles: {
        hover: {
          fillOpacity: 0.8,
          lineWidth: 3
        },
        selected: {
          lineWidth: 3,
          stroke: '#1890ff'
        }
      }
    });

    // 首次布局完成后自动适应画布
    this.graph.on('afterlayout', () => {
      if (!this.rendered) {
        this.rendered = true;
        const c = this.graphContainer.nativeElement;
        if (c && c.offsetWidth > 0 && c.offsetHeight > 0) {
          this.graph?.fitView(20);
        }
      }
    });

    // 监听节点点击事件
    this.graph.on('node:click', (evt) => {
      const node = evt.item;
      if (node) {
        const model = node.getModel();
        const dagNode = this.topology?.nodes.find(n => n.id === model.id);
        if (dagNode) {
          this.nodeClick.emit(dagNode);
        }
      }
    });

    // 监听节点悬停事件
    this.graph.on('node:mouseenter', (evt) => {
      const node = evt.item;
      if (node) {
        this.graph?.setItemState(node, 'hover', true);
      }
    });

    this.graph.on('node:mouseleave', (evt) => {
      const node = evt.item;
      if (node) {
        this.graph?.setItemState(node, 'hover', false);
      }
    });

    if (this.topology) {
      this.updateGraph();
    }
  }

  private updateGraph(): void {
    if (!this.graph || !this.topology) {
      return;
    }

    if (!this.rendered) {
      // 首次：完整渲染 + dagre 布局，fitView 由 afterlayout 事件处理
      const graphData: GraphData = {
        nodes: this.topology.nodes.map(node => ({
          id: node.id,
          label: formatNodeLabel(node.name),
          fullLabel: node.name,
          nodeStatus: node.status,
          style: {
            fill: this.getNodeFillColor(node.status),
            stroke: this.getNodeStrokeColor(node.status)
          }
        })),
        edges: this.topology.edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }))
      };
      this.graph.data(graphData);
      this.graph.render();
    } else {
      // 后续刷新：只更新节点样式，不重新布局
      for (const node of this.topology.nodes) {
        const item = this.graph.findById(node.id);
        if (item) {
          this.graph.updateItem(item, {
            nodeStatus: node.status,
            style: {
              fill: this.getNodeFillColor(node.status),
              stroke: this.getNodeStrokeColor(node.status)
            }
          });
        }
      }
    }
  }

  private getNodeFillColor(status: NodeStatus): string {
    switch (status) {
      case NodeStatus.WAITING:
        return '#f0f0f0'; // 浅灰色
      case NodeStatus.QUEUED:
        return '#f9f0ff'; // 浅紫色
      case NodeStatus.RUNNING:
        return '#bae7ff'; // 浅蓝色
      case NodeStatus.SUCCEED:
        return '#b7eb8f'; // 浅绿色
      case NodeStatus.FAILED:
        return '#ffccc7'; // 浅红色
      case NodeStatus.STOPPED:
        return '#ffe7ba'; // 浅橙色
      default:
        return '#f0f0f0';
    }
  }

  private getNodeStrokeColor(status: NodeStatus): string {
    return this.monitorService.getNodeStatusColor(status);
  }

  switchLayout(): string {
    this.currentLayoutIndex = (this.currentLayoutIndex + 1) % this.layoutPresets.length;
    const preset = this.layoutPresets[this.currentLayoutIndex];
    if (this.graph) {
      const layoutCfg = this.graph.get('layout');
      if (layoutCfg) {
        delete layoutCfg.align;
      }
      this.graph.updateLayout(preset.config);
      this.rendered = false;
    }
    return preset.name;
  }

  getCurrentLayoutName(): string {
    return this.layoutPresets[this.currentLayoutIndex].name;
  }

  fitView(): void {
    if (this.graph) {
      this.graph.fitView(20);
    }
  }

  zoomIn(): void {
    if (this.graph) {
      const currentZoom = this.graph.getZoom();
      this.graph.zoomTo(currentZoom * 1.2);
    }
  }

  zoomOut(): void {
    if (this.graph) {
      const currentZoom = this.graph.getZoom();
      this.graph.zoomTo(currentZoom * 0.8);
    }
  }

  resetZoom(): void {
    if (this.graph) {
      this.graph.zoomTo(1);
      this.graph.fitCenter();
    }
  }

  refresh(): void {
    if (this.topology) {
      this.updateGraph();
    }
  }
}
