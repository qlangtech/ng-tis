import {Component, ComponentFactoryResolver, model, OnDestroy, OnInit} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {BasicFormComponent} from "../common/basic.form.component";
import {
  ColsAndMeta,
  Descriptor,
  HeteroList,
  IFieldError,
  Item,
  ItemPropVal,
  PluginName,
  SavePluginEvent,
  SuccessAddedDBTabs,
  TisResponseResult,
  VerifyConfig
} from "../common/tis.plugin";
import {
  EventSourceSubject,
  EventType,
  ExecuteMultiSteps,
  ExecuteStep,
  MessageData,
  TISService
} from "../common/tis.service";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {NzMessageService} from "ng-zorro-antd/message";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {getUserProfile} from "../base/common/datax.common";
import {PluginsComponent} from "../common/plugins.component";
import {ProcessedDBRecord} from "../common/ds.utils";
import {DatasourceComponent} from "../offline/ds.component";
import {ExecAddModel} from "../offline/table.add.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {openIncrSyncChannalLaunchingProcessDialog} from "../common/launch.waitting.process.component";
import {NzStatusType} from "ng-zorro-antd/steps";
import {EMPTY, filter, Subject} from "rxjs";
import {
  CandidateDescriptorOption,
  ChatMessage,
  ChatSession,
  ColsAndMetaStatus,
  LaunchingProcessStatusMessage,
  LLMProvider,
  ManagerLink,
  PluginInstallStatus,
  SelectionOptionData,
  SubmitInfo,
  TaskTemplate
} from "./misc/chat.pipeline.utils";
import {DataxAddStep6ColsMetaSetterComponent} from "src/base/datax.add.step6.cols-meta-setter.component";
import {DataxDTO} from "../base/datax.add.component";
import {StepType} from "../common/steps.component";

@Component({
  // selector: 'nz-drawer-custom-component',
  animations: [
    trigger('slideVertical', [
      state('expanded', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      state('collapsed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden',
        padding: '0'
      })),
      transition('expanded <=> collapsed', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-20px) scale(0.95)'
        }),
        animate('600ms cubic-bezier(0.55, 0.0, 1, 1)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)'
        }))
      ])
    ])
  ],
  template: `

    <nz-layout class="chat-container">
      <!-- 左侧历史记录面板 -->
      <nz-sider nzWidth="250" nzTheme="light" class="chat-sidebar">
        <div class="sidebar-header">
          <button nz-button nzType="primary" nzBlock (click)="createNewSession()">
            <i nz-icon nzType="plus"></i> 新建对话
          </button>
        </div>
        <nz-list class="session-list" [nzDataSource]="sessions" nzSize="small">
          <nz-list-item *ngFor="let session of sessions"
                        [class.active]="session.id === currentSession?.id"
                        (click)="switchSession(session.id)">
            <div class="session-item">
              <div class="session-title">{{session.title}}</div>
              <div class="session-time">{{formatTime(session.createTime)}}</div>
            </div>
          </nz-list-item>
        </nz-list>
      </nz-sider>

      <!-- 主聊天区域 -->
      <nz-layout>
        <nz-spin [nzSpinning]="this.formDisabled" [nzDelay]="1000" nzSize="large">
          <nz-header class="chat-header">
            <item-prop-val *ngIf="itemPp" [formLevel]="1"
                           [disabled]="false"
                           [formControlSpan]="8" [labelSpan]="1" [pp]="itemPp"
                           [pluginImpl]="this.itemImpl"
                           (valChange)="llmChange($event)" [extendInfo]="tokenCounter"
            ></item-prop-val>
            <ng-template #tokenCounter>
                                <span class="token-counter" *ngIf="tokenCount>0"
                                      [class.token-animated]="tokenAnimating">
                                    <i nz-icon nzType="fire" nzTheme="fill" class="token-icon"></i>
                                    <span class="token-value">Tokens:{{tokenCount}}</span>
                                    <span class="token-burst" *ngIf="tokenAnimating">
                                        <i nz-icon nzType="fire" nzTheme="fill"></i>
                                    </span>
                                </span>
            </ng-template>

          </nz-header>
          <nz-content class="chat-content">
            <!-- 消息列表 -->
            <div class="messages-container" #messagesContainer *ngIf="hasMessages">

              <div *ngFor="let msg of currentSession?.messages" class="message"
                   [@messageAnimation]
                   [ngClass]="'message-' + msg.role">
                <div class="message-avatar">
                  <i nz-icon [nzType]="msg.role === 'user' ? 'user' : 'robot'" nzTheme="outline"></i>
                </div>
                <div class="message-content" [ngSwitch]="msg.type">
                  <!-- 文本消息 -->
                  <div *ngSwitchCase="'text'" class="message-text">
                    <span [innerHTML]="formatMessage(msg.content)"></span>
                    <ng-container
                      *ngTemplateOutlet="managerLinkTemplate; context: { managerLink: msg.managerLink }"></ng-container>
                  </div>
                  <!-- 增量进程启动过程 -->
                  <div *ngSwitchCase="'ai_agent_open_launching_process'" class="message-plugin">
                    <ng-container
                      *ngTemplateOutlet="launchingProcessTemplate; context: { launchMsg: toLaunchingProcessMessage(msg) }"></ng-container>
                  </div>

                  <!-- 错误消息 -->
                  <div *ngSwitchCase="'error'" class="message-error">
                    <nz-alert nzType="error" [nzMessage]="msg.content" nzShowIcon
                              [nzAction]="msg.managerLink?alterActionTemplate:null"></nz-alert>
                    <ng-template #alterActionTemplate>
                      <ng-container
                        *ngTemplateOutlet="managerLinkTemplate; context: { managerLink: msg.managerLink }"></ng-container>
                    </ng-template>
                  </div>

                  <!-- 进度消息 -->
                  <div *ngSwitchCase="'progress'" class="message-progress">
                    <nz-progress [nzPercent]="getProgressPercent(msg.content)"
                                 nzStatus="active"></nz-progress>
                    <span class="progress-text">{{msg.content}}</span>
                  </div>

                  <!-- LLM 调用状态消息 -->
                  <div *ngSwitchCase="'llm_chat_status'" class="message-llm-status">
                    <div class="llm-status-content">
                      <nz-spin nzSimple nzSize="small"></nz-spin>
                      <span class="llm-status-text">{{msg.content}}</span>
                    </div>
                  </div>

                  <!-- 插件配置消息 -->
                  <div *ngSwitchCase="'plugin'" class="message-plugin">
                    <!-- 倒计时或完成标记 -->
                    <ng-container
                      *ngTemplateOutlet="countdownTemplate; context: { message: ( msg )  }"></ng-container>
                    <nz-list nzBordered>
                      <nz-list-item>
                                                <span nz-typography> <ng-container
                                                  *ngFor="let err of msg.pluginData.errorMsg||[]">{{err}}</ng-container> </span>
                        <button nz-button nzType="primary" [disabled]="msg.resolved"
                                nzSize="small"
                                (click)="openPluginDialog(msg)">
                          <i nz-icon *ngIf="msg.pluginData.desc.supportIcon"
                             [nzType]="msg.pluginData.desc.endtype"></i>
                          配置{{msg.pluginData.desc.displayName}}实例
                        </button>
                      </nz-list-item>
                    </nz-list>
                  </div>

                  <div *ngSwitchCase="'ai_agent_tdfs_cols_meta_setter'" class="message-plugin">
                    <!-- 倒计时或完成标记 -->
                    <ng-container
                      *ngTemplateOutlet="countdownTemplate; context: { message: ( msg )  }"></ng-container>
                    <nz-list nzBordered>
                      <nz-list-item>
                                                <span nz-typography>设置列元数据类型，
                                                   <ng-container
                                                     *ngFor="let err of toColsAndMetaStatus(msg).errors">{{err.name + ":" + err.content + " "}}</ng-container>  </span>
                        <button nz-button nzType="primary" [disabled]="msg.resolved"
                                nzSize="small"
                                (click)="openTdfsColsMetaSetterDialog(msg)"><span nz-icon
                                                                                  nzType="edit"
                                                                                  nzTheme="outline"></span>设置
                        </button>
                      </nz-list-item>
                    </nz-list>
                  </div>


                  <!-- 选择目标表消息 -->
                  <div *ngSwitchCase="'select_tabs'" class="message-select-tabs">
                    <!-- 倒计时或完成标记 -->
                    <ng-container
                      *ngTemplateOutlet="countdownTemplate; context: { message: msg }"></ng-container>

                    <nz-list nzBordered>
                      <nz-list-item>
                        <span nz-typography>{{msg.content}}</span>
                        <button nz-button nzType="primary" [disabled]="msg.resolved"
                                nzSize="small"
                                (click)="openSelectTargetTablesDialog(msg)">
                          <i nz-icon nzType="setting"></i>设置目标表
                        </button>
                      </nz-list-item>
                    </nz-list>

                  </div>

                  <!-- 选择项消息 -->
                  <div *ngSwitchCase="'selection'" class="message-selection">
                    <!-- 倒计时或完成标记 -->
                    <ng-container
                      *ngTemplateOutlet="countdownTemplate; context: { message: msg }"></ng-container>
                    <div class="selection-prompt">{{msg.selectionData.prompt}}</div>
                    <nz-radio-group [disabled]="msg.resolved"
                                    [(ngModel)]="msg.selectionData['selectedIndex']"
                                    class="selection-options">
                      <label nz-radio *ngFor="let option of msg.selectionData.options.candidates"
                             [nzValue]="option.index">
                        <div class="selection-option">
                          <div class="option-name">{{option.name}}</div>
                          <div class="option-description"
                               *ngIf="option.description">{{option.description}}</div>
                          <div class="option-status" *ngIf="!option.disablePluginInstall">
                            <nz-tag *ngIf="option.installed" nzColor="success">已安装
                            </nz-tag>
                            <nz-tag *ngIf="!option.installed" nzColor="default">未安装
                            </nz-tag>
                            <button *ngIf="!option.installed"
                                    nz-button
                                    nzType="primary"
                                    nzSize="small"
                                    class="install-button"
                                    (click)="installOption(msg.selectionData, msg.requestId,option  ,$event)">
                              安装
                            </button>
                          </div>
                        </div>
                      </label>
                    </nz-radio-group>
                    <button nz-button nzType="primary" nzSize="small"
                            [disabled]="isSelectionDisabled(msg)"
                            (click)="submitSelection(msg)">
                      确认选择
                    </button>
                  </div>

                  <!-- 插件安装进度消息 -->
                  <div *ngSwitchCase="'ai_agent_plugin_install_status'"
                       class="message-plugin-install">
                    <ng-container
                      *ngTemplateOutlet="pluginInstallStatusTemplate; context: { statusMsg: toPluginInstallStatus(msg) }"></ng-container>
                  </div>

                  <!-- 默认情况（可选，用于处理未知类型） -->
                  <div *ngSwitchDefault class="message-default">
                    <span>{{msg.content}}</span>
                  </div>
                </div>
              </div>

              <!-- 打字机效果 -->
              <div *ngIf="isTyping" class="message message-assistant">
                <div class="message-avatar">
                  <i nz-icon nzType="robot" nzTheme="outline"></i>
                </div>
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="input-area"
                 [ngClass]="{'input-area-centered': !hasMessages, 'input-area-bottom': hasMessages}">
              <!-- 快捷模板按钮 -->
              <div class="template-buttons-wrapper">
                <div class="template-buttons"
                     [ngClass]="{'collapsed': isTemplatesCollapsed && hasMessages}">
                  <ng-container *ngFor="let template of templates; let i = index">
                    <button *ngIf="!isTemplatesCollapsed || !hasMessages || i < maxVisibleTemplates"
                            nz-button
                            nzSize="small"
                            class="template-btn"
                            [ngClass]="{'fade-in': !isTemplatesCollapsed || i < maxVisibleTemplates}"
                            (click)="useTemplate(template)">
                      {{template.name}}
                    </button>
                  </ng-container>

                  <!-- 收起状态下的省略提示 -->
                  <span *ngIf="isTemplatesCollapsed && hasMessages && templates.length > maxVisibleTemplates"
                        class="more-templates-hint">
                                        ...
                                    </span>

                  <!-- 展开/收起切换按钮 - 放在template-buttons内 -->
                  <button *ngIf="hasMessages && templates.length > maxVisibleTemplates"
                          nz-button
                          nzType="link"
                          nzSize="small"
                          class="template-toggle-btn"
                          (click)="toggleTemplates()">
                    <i nz-icon [nzType]="isTemplatesCollapsed ? 'plus-circle' : 'minus-circle'"></i>
                    {{ isTemplatesCollapsed ? '展开' : '收起' }}
                    <span class="template-count">{{templates.length}}</span>
                  </button>
                </div>
              </div>

              <!-- 输入框 -->
              <div class="input-container">
                <nz-textarea-count [nzMaxCharacterCount]="1000">
                <textarea nz-input
                          [(ngModel)]="inputText"
                          [rows]="hasMessages ? 3 : 7"
                          placeholder="请描述您的需求，例如：创建MySQL到Paimon的数据同步管道..."
                          (keydown.enter)="$event.ctrlKey && sendMessage()">
                </textarea>
                </nz-textarea-count>
                <ng-container [ngSwitch]="isProcessing">
                  <button *ngSwitchCase="false"
                          nz-button
                          nzType="primary"
                          [disabled]="!inputText || !selectedProviderId"
                          (click)="sendMessage()">
                    <i nz-icon nzType="send"></i> 发送
                  </button>
                  <button *ngSwitchCase="true"
                          nz-button
                          nzType="default"
                          (click)="cancelCurrentTask()">
                    <i nz-icon nzType="tis-stop" style="font-size: 20px"></i> 取消执行
                  </button>
                </ng-container>
              </div>
            </div>
          </nz-content>
        </nz-spin>
      </nz-layout>
    </nz-layout>

    <!-- 倒计时模板 -->
    <ng-template #countdownTemplate let-message="message">
      <div class="countdown-indicator" [ngSwitch]="getMessageCountdownStatus(message)">
        <!-- 倒计时进行中 -->
        <span *ngSwitchCase="'counting'" class="countdown-timer">
                    <i nz-icon nzType="clock-circle" nzTheme="outline"></i>
                    剩余时间: {{getMessageRemainingTime(message)}}秒
                </span>

        <!-- 已正常完成 -->
        <span *ngSwitchCase="'completed'" class="completion-mark">
                    <i nz-icon nzType="check-circle" nzTheme="fill" style="color: #52c41a;"></i>
                    已完成
                </span>

        <!-- 已取消 -->
        <span *ngSwitchCase="'cancelled'" class="cancelled-mark">
                    <i nz-icon nzType="stop" nzTheme="fill" style="color: #faad14;"></i>
                    已取消
                </span>

        <!-- 已超时 -->
        <span *ngSwitchCase="'timeout'" class="timeout-mark">
                    <i nz-icon nzType="close-circle" nzTheme="fill" style="color: #ff4d4f;"></i>
                    已超时
                </span>

        <!-- 默认情况（不显示任何内容） -->
        <span *ngSwitchDefault></span>
      </div>
    </ng-template>

    <!-- 增量进程启动状态模板 -->
    <ng-template #launchingProcessTemplate let-launchMsg="launchMsg">
      <nz-list nzBordered>
        <nz-list-item>
          <span nz-typography>增量启动状态日志显示中</span>
          <button nz-button nzType="default"
                  nzSize="small"
                  [disabled]="launchMsg.isDrawerOpen"
                  (click)="openLaunchingProcessDialog(launchMsg)">
            {{ launchMsg.isDrawerOpen ? '已打开' : '打开' }}
          </button>
        </nz-list-item>
      </nz-list>
    </ng-template>

    <!-- 插件安装状态模板 -->
    <ng-template #pluginInstallStatusTemplate let-statusMsg="statusMsg">
      <div class="plugin-install-header">
        <button nz-button nzType="text" nzSize="small" class="collapse-toggle-btn"
                (click)="toggleInstallMessageCollapse(statusMsg)"
                [nzTooltipTitle]="statusMsg.collapsed ? '展开详情' : '收起详情'"
                nz-tooltip>
          <i nz-icon [nzType]="statusMsg.collapsed ? 'right' : 'down'" nzTheme="outline"></i>
        </button>
        <i nz-icon nzType="download" nzTheme="outline"></i>
        <span class="plugin-install-title">{{statusMsg.content}}</span>
        <nz-tag *ngIf="statusMsg.resolved" nzColor="success" class="install-status-tag">
          <i nz-icon nzType="check-circle" nzTheme="outline"></i>
          安装完成
        </nz-tag>
      </div>
      <div class="plugin-install-body"
           [@slideVertical]="statusMsg.collapsed ? 'collapsed' : 'expanded'">
        <update-center [shallInit]="false" [plugins]="statusMsg.installJobs"></update-center>
      </div>
    </ng-template>

    <ng-template #managerLinkTemplate let-managerLink="managerLink">
      <ng-container *ngIf="managerLink">
        <ng-container [ngSwitch]="isRouterLink(managerLink)">
          <a *ngSwitchCase="true" ngca="managerLink"
             [routerLink]="managerLink.linkAddress"
             target="_blank"
             style="margin-left: 8px;">
            {{managerLink.linkText}}<i nz-icon nzType="tis-link"></i>
          </a>
          <a *ngSwitchCase="false"
             [href]="managerLink.linkAddress"
             target="_blank"
             style="margin-left: 8px;">
            {{managerLink.linkText}}<i nz-icon nzType="tis-link"></i>
          </a>
        </ng-container>
      </ng-container>
    </ng-template>
  `,
  styleUrls: ['./chat.pipeline.component.css']
})
export class ChatPipelineComponent extends BasicFormComponent implements OnInit, OnDestroy {
  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  // inputText, isProcessing, isTyping 等已移至 ChatSession 类中,通过 getter/setter 访问
  tokenCount: number = 0;
  tokenAnimating: boolean = false;
  previousTokenCount: number = 0;
  templates: TaskTemplate[] = [];
  llmProviders: LLMProvider[] = [];
  selectedProviderId: string = '';

  // 模板按钮展开/收起状态
  isTemplatesCollapsed: boolean = false;
  maxVisibleTemplates: number = 3; // 收起时显示的模板数量

  itemPp: ItemPropVal = null;
  itemImpl: string;
  // 等待用户输入超时时间
  applyUserInputMaxWaitMillis: number;

  // 计算属性：判断是否有消息
  get hasMessages(): boolean {
    return this.currentSession?.messages && this.currentSession.messages.length > 0;
  }

  // 计算属性：代理到当前会话的 inputText
  get inputText(): string {
    return this.currentSession?.inputText || '';
  }

  set inputText(value: string) {
    if (this.currentSession) {
      this.currentSession.inputText = value;
    }
  }

  // 计算属性：代理到当前会话的 isProcessing
  get isProcessing(): boolean {
    return this.currentSession?.isProcessing || false;
  }

  set isProcessing(value: boolean) {
    if (this.currentSession) {
      this.currentSession.isProcessing = value;
    }
  }

  // 计算属性：代理到当前会话的 isTyping
  get isTyping(): boolean {
    return this.currentSession?.isTyping || false;
  }

  set isTyping(value: boolean) {
    if (this.currentSession) {
      this.currentSession.isTyping = value;
    }
  }

  constructor(
    tisService: TISService,
    public drawer: NzDrawerRef<{ hetero: HeteroList }>,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private messageService: NzMessageService,
    private drawerService: NzDrawerService,
    // modalService: NzModalService,
    notification: NzNotificationService
  ) {
    super(tisService, null, notification);
  }

  isRouterLink(link: ManagerLink): boolean {
    return !(link.linkAddress.startsWith("https://") || link.linkAddress.startsWith("http://"));
  }

  ngOnInit(): void {
    getUserProfile(this, {action: "chat_pipeline_action", method: "get_page_initialize"})
      .then((result) => {
        //applyUserInputMaxWaitMillis
        this.applyUserInputMaxWaitMillis = result.result.bizresult.applyUserInputMaxWaitMillis;
        let hlist = result.hlist;
        aa: for (let item of hlist.items) {
          for (let pp of item.propVals) {
            if (pp.key === 'llm') {
              //console.log(pp.primary);
              this.setLLMCanNotBeEmptyError(pp);
              this.itemPp = pp;
              this.itemImpl = item.impl;
              this.selectedProviderId = pp.primary;
              break aa;
            }
          }
          throw new Error("have not find llm property");
        }
        let biz = result.result.bizresult;
        let tpls = biz.templates;
        let ses = biz.session;

        /**
         * initialize Session
         */
        const session = new ChatSession(
          ses.sessionId,
          '新对话 ' + new Date().toLocaleTimeString(),
          ses.createTime
        );
        // 设置消息显示回调，用于自动滚动到底部
        session.onMessageDisplayed = () => this.scrollToBottom();
        this.sessions.unshift(session);
        this.currentSession = session;

        /**
         * initialize template
         */
        this.templates = tpls;
      })
  }

  private setLLMCanNotBeEmptyError(pp: ItemPropVal) {
    const pattern = /^\s*$/;
    if (pattern.test(pp.primary || '')) {
      pp.error = '不能为空，请选择模型';
    }
  }

  ngOnDestroy(): void {
    // 清理所有会话的资源
    this.sessions.forEach(session => {
      session.cleanup();
    });
  }

  // 开始倒计时 - 代理到当前会话
  startCountdown(message: ChatMessage): void {
    this.currentSession?.startCountdown(message, this.applyUserInputMaxWaitMillis);
  }

  // 停止倒计时 - 代理到当前会话
  stopCountdown(message: ChatMessage): void {
    this.currentSession?.stopCountdown(message);
  }

  // 获取消息的剩余时间 - 代理到当前会话
  getMessageRemainingTime(message: ChatMessage): number {
    return this.currentSession?.getMessageRemainingTime(message) || 0;
  }

  // 获取消息的倒计时状态 - 代理到当前会话
  getMessageCountdownStatus(message: ChatMessage): 'counting' | 'completed' | 'cancelled' | 'timeout' | null {
    return this.currentSession?.getMessageCountdownStatus(message) || null;
  }


  llmChange(event: ItemPropVal) {
    if (!event.primary) {
      this.setLLMCanNotBeEmptyError(event);
      this.errNotify("模型不能设置为空");
      return;
    }
    this.httpPost('/coredefine/corenodemanage.ajax', `action=chat_pipeline_action&emethod=change_llm&llm=${event.primary}`)
      .then((r) => {
        if (r.success) {
          this.selectedProviderId = event.primary;
        }
      });
  }


  createNewSession(): void {
    this.httpPost('/coredefine/corenodemanage.ajax', 'action=chat_pipeline_action&emethod=create_session')
      .then((r) => {
        if (r.success) {
          const session = new ChatSession(
            r.bizresult.sessionId,
            '新对话 ' + new Date().toLocaleTimeString(),
            r.bizresult.createTime
          );
          // 设置消息显示回调，用于自动滚动到底部
          session.onMessageDisplayed = () => this.scrollToBottom();
          this.sessions.unshift(session);
          this.currentSession = session;
          // 新建会话时，重置模板展开状态
          this.isTemplatesCollapsed = false;
        }
      });
  }

  switchSession(sessionId: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      this.currentSession = session;
      // 每个会话维护自己的缓存，不需要清理和重建
    }
  }

  useTemplate(template: TaskTemplate): void {
    this.inputText = template.sampleText;
  }

  toggleTemplates(): void {
    this.isTemplatesCollapsed = !this.isTemplatesCollapsed;
  }

  // 切换插件安装消息的展开/收缩状态
  toggleInstallMessageCollapse(message: ChatMessage | PluginInstallStatus): void {
    if (message instanceof PluginInstallStatus) {
      message.toggleCollapse();
    }
  }

  sendMessage(): void {
    if (!this.inputText || this.isProcessing || !this.selectedProviderId) {
      if (!this.selectedProviderId) {
        this.messageService.warning('请先选择大模型提供者');
      }
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.inputText,
      timestamp: Date.now(),
      type: 'text'
    };

    this.currentSession?.addMessage(userMessage);

    const userInput = this.inputText;
    this.inputText = '';
    this.isProcessing = true;
    this.isTyping = true;

    // 当发送消息后，自动收起模板按钮（如果有多个模板的话）
    if (this.templates.length > this.maxVisibleTemplates) {
      this.isTemplatesCollapsed = true;
    }

    // 建立SSE连接
    this.connectSSE(userInput);
  }

  cancelCurrentTask(): void {
    // 调用后端取消接口
    const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=cancel_current_task`;
    const submitInfo: SubmitInfo = {
      sessionId: this.currentSession?.id || '',
      requestId: ''  // 取消操作不需要requestId，但为了保持结构一致
    };

    this.jsonPost(url, submitInfo)
      .then((response) => {
        if (response.success) {
          // 关闭SSE连接
          this.currentSession?.closeConnection();

          // 取消所有未完成的倒计时
          this.currentSession?.cancelAllCountdowns();

          // 重置状态
          this.isProcessing = false;
          this.isTyping = false;
          this.remoteLLMChatStatusMessage();
          // 显示成功通知
          this.successNotify('当前执行任务已经停止');
        } else {
          this.messageService.error('取消任务失败: ' + (response.msg || '未知错误'));
        }
      })
      .catch((error) => {
        this.messageService.error('取消任务失败: ' + error);
        // 即使失败也要重置状态，避免界面卡住
        this.isProcessing = false;
        this.isTyping = false;
      });
  }

  private connectSSE(userInput: string): void {
    if (!this.currentSession) {
      return;
    }

    const url = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=chat` +
      `&resulthandler=exec_null&sessionId=${this.currentSession.id}&input=${encodeURIComponent(userInput)}` +
      `&providerId=${this.selectedProviderId}`;

    this.currentSession.eventSource = this.tisService.createEventSource(
      "tis-ai-agent", url, [
        EventType.AI_AGNET_ERROR, EventType.AI_AGNET_DONE, EventType.AI_AGNET_MESSAGE
        , EventType.AI_AGNET_PLUGIN, EventType.AI_AGNET_PROGRESS, EventType.AI_AGNET_INPUT_REQUEST, EventType.AI_AGNET_SELECT_TABS
        , EventType.AI_AGNET_SELECTION_REQUEST
        , EventType.AI_AGNET_TOKEN, EventType.AI_AGNET_LLM_CHAT_STATUS
        , EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS
        , EventType.AI_AGNET_PLUGIN_INSTALL_STATUS
        , EventType.AI_AGNET_TDFS_COLS_META_SETTER
        /**
         * 监听启动执行状态日志
         */
        , EventType.TASK_MILESTONE, EventType.TASK_EXECUTE_STEPS, EventType.LOG_MESSAGE,
        //
        EventType.SSE_CLOSE]);
    let evts = this.currentSession.eventSource.events;
    evts.pipe(filter(e => !this.isLaunchingProcessEvts(e)))
      .subscribe((evt: [EventType, any]) => {
        let data = evt[1];
        switch (evt[0]) {
          case EventType.AI_AGNET_DONE: {
            this.isProcessing = false;
            this.isTyping = false;
            this.currentSession?.closeConnection();
            return;
          }
          case EventType.AI_AGNET_ERROR: {
            this.addErrorMessage(data);
            return;
          }
          case EventType.AI_AGNET_SELECT_TABS: {
            this.selectTargetTables(data);
            return;
          }
          case EventType.AI_AGNET_MESSAGE: {
            this.handleSSEMessage(data);
            return;
          }
          case EventType.AI_AGNET_PLUGIN: {
            this.addPluginMessage(data);
            return;
          }
          case EventType.AI_AGNET_PROGRESS: {
            this.addProgressMessage(data);
            return;
          }
          case EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS: {
            let launchingProcessEvts$ = evts.pipe(filter(this.isLaunchingProcessEvts));

            this.handleOpenLaunchingProcessStatus(data, new EventSourceSubject(this.currentSession?.eventSource?.targetResName || '', null, launchingProcessEvts$));
            return;
          }
          case EventType.AI_AGNET_SELECTION_REQUEST: {
            this.addSelectionMessage(data);
            return;
          }
          case EventType.AI_AGNET_TOKEN: {
            // const data = JSON.parse(event.data);
            const newCount = data.count;
            if (newCount !== this.previousTokenCount) {
              this.triggerTokenAnimation();
              this.previousTokenCount = this.tokenCount;
              this.tokenCount = newCount;
            }
            return;
          }
          case EventType.AI_AGNET_LLM_CHAT_STATUS: {
            this.handleLLMStatus(data);
            return;
          }
          case EventType.AI_AGNET_PLUGIN_INSTALL_STATUS: {
            this.handlePluginInstallStatus(data);
            return;
          }
          case  EventType.AI_AGNET_TDFS_COLS_META_SETTER: {
            this.handleDfsColsMetaSetter(data);
            return;
          }
          case EventType.SSE_CLOSE: {
            this.isProcessing = false;
            this.isTyping = false;
            this.messageService.error('连接失败，请重试');
            return;
          }
          default:
            throw new Error("can not resolve event type:" + evt[0]);
        }

      });
  }

  /**
   * 对
   * @param evt
   */
  isLaunchingProcessEvts(evt: [EventType, ExecuteMultiSteps | MessageData | ExecuteStep | Event]): boolean {
    switch (evt[0]) {
      case EventType.TASK_MILESTONE:
      case EventType.TASK_EXECUTE_STEPS:
      case EventType.LOG_MESSAGE: {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  private selectTargetTables(data: any) {
    // let hlist = PluginsComponent.wrapperHeteroList(data.config, null);
    let descMap = Descriptor.wrapDescriptors(data.dataXReaderDesc);
    for (const [impl, desc] of descMap) {
      const message: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        type: 'select_tabs',
        requestId: data.requestId,
        dataxName: data.dataxName,
        dataXReaderDesc: desc
      };
      this.currentSession?.enqueueMessage(message);
      this.startCountdown(message); // 启动倒计时
      return;
    }

    throw new Error("have not find any desc");
  }

  private handleSSEMessage(data: any): void {
    this.isTyping = false;

    const message: ChatMessage = {
      role: 'assistant',
      content: data.content,
      timestamp: Date.now(),
      type: data.type || 'text'
    };

    message.managerLink = (data.payloadLink as ManagerLink);

    this.currentSession?.enqueueMessage(message);
  }

  /**
   * 打开增量启动执行日志
   * @param data
   * @param subject
   * @private
   */
  private handleOpenLaunchingProcessStatus(data: any, subject: EventSourceSubject): void {
    this.isTyping = false;

    // 使用新的 LaunchingProcessStatusMessage 类
    const message = new LaunchingProcessStatusMessage(data);

    // 保存事件源主题引用
    message.eventSourceSubject = subject;

    // 订阅消息流，缓存历史消息
    subject.events.subscribe((evt: [EventType, any]) => {
      if (this.isLaunchingProcessEvts(evt)) {
        message.addCachedMessage(evt);
      }
    });

    this.currentSession?.enqueueMessage(message);

    // 自动打开抽屉对话框
    const drawerRef = openIncrSyncChannalLaunchingProcessDialog(this.drawerService, message.pipeline, subject);
    message.drawerRef = drawerRef;
    message.setDrawerOpen(true);

    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      message.setDrawerOpen(false);
      // 注意：不要在这里关闭 subject，因为用户可能会重新打开抽屉
      if (status === 'finish') {
        // this.nextStep.emit(this.dto);
      }
    })
  }

  // /**
  //  * 打开或重新打开增量进程启动状态抽屉对话框
  //  * @param msg LaunchingProcessStatusMessage 消息对象
  //  */
  // /**
  //  * 类型守卫函数：判断消息是否为 LaunchingProcessStatusMessage 类型
  //  * 用于模板中的类型识别
  //  */
  // isLaunchingProcessMessage(msg: ChatMessage): msg is LaunchingProcessStatusMessage {
  //     return msg instanceof LaunchingProcessStatusMessage;
  // }
  //
  // /**
  //  * 获取 LaunchingProcessStatusMessage 的 isDrawerOpen 状态
  //  * 专门用于模板中安全访问属性
  //  */
  // getLaunchingMessageDrawerStatus(msg: ChatMessage): boolean {
  //     if (msg instanceof LaunchingProcessStatusMessage) {
  //         return msg.isDrawerOpen;
  //     }
  //     return false;
  // }

  /**
   * 将 ChatMessage 转换为 LaunchingProcessStatusMessage
   * 如果类型不匹配则返回 null
   */
  asLaunchingProcessMessage(msg: ChatMessage): LaunchingProcessStatusMessage | null {
    if (msg instanceof LaunchingProcessStatusMessage) {
      return msg;
    }
    return null;
  }

  /**
   * 转换函数：将 ChatMessage 安全转换为 LaunchingProcessStatusMessage
   * 用于模板中的类型转换
   */
  toLaunchingProcessMessage(msg: ChatMessage): LaunchingProcessStatusMessage {
    if (msg instanceof LaunchingProcessStatusMessage) {
      return msg;
    }
    // 这里理论上不应该发生，因为只有在 type 匹配时才会调用
    throw new Error('Message is not a LaunchingProcessStatusMessage');
  }

  /**
   * 转换函数：将 ChatMessage 安全转换为 PluginInstallStatus
   * 用于模板中的类型转换
   */
  toPluginInstallStatus(msg: ChatMessage): PluginInstallStatus {
    if (msg instanceof PluginInstallStatus) {
      return msg;
    }
    // 这里理论上不应该发生，因为只有在 type 匹配时才会调用
    throw new Error('Message is not a PluginInstallStatus');
  }

  /**
   * 转换函数：将 ChatMessage 安全转换为 ColsAndMetaStatus
   * 用于模板中的类型转换
   */
  toColsAndMetaStatus(msg: ChatMessage): ColsAndMetaStatus {
    if (msg instanceof ColsAndMetaStatus) {
      return msg;
    }
    // 这里理论上不应该发生，因为只有在 type 匹配时才会调用
    throw new Error('Message is not a ColsAndMetaStatus');
  }

  openLaunchingProcessDialog(msg: ChatMessage): void {
    // 类型检查，确保是 LaunchingProcessStatusMessage
    if (!(msg instanceof LaunchingProcessStatusMessage)) {
      console.error('Invalid message type for launching process dialog');
      return;
    }

    const launchMsg = msg as LaunchingProcessStatusMessage;

    // 如果抽屉已经打开，不做任何操作
    if (launchMsg.isDrawerOpen) {
      return;
    }

    // 创建新的事件源主题，包含缓存的历史消息
    let subject: EventSourceSubject;

    if (launchMsg.cachedMessages.length > 0) {
      // 如果有缓存消息，创建一个新的 Subject 并重放缓存的消息
      const replayEvents$ = new Subject<[EventType, any]>();
      subject = new EventSourceSubject(
        this.currentSession.eventSource?.targetResName || '',
        null,
        replayEvents$.asObservable()
      );

      // 异步重放缓存的消息
      setTimeout(() => {
        launchMsg.cachedMessages.forEach(evt => {
          replayEvents$.next(evt);
        });
      }, 0);
    } else {
      // 如果没有缓存消息，使用原始的事件源
      subject = launchMsg.eventSourceSubject || new EventSourceSubject(
        this.currentSession?.eventSource?.targetResName || '',
        null,
        EMPTY
      );
    }

    // 打开抽屉对话框
    const drawerRef = openIncrSyncChannalLaunchingProcessDialog(
      this.drawerService,
      launchMsg.pipeline,
      subject
    );

    launchMsg.drawerRef = drawerRef;
    launchMsg.setDrawerOpen(true);

    // 监听抽屉关闭事件
    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      launchMsg.setDrawerOpen(false);
      // 保持 subject 和缓存的消息，以便下次重新打开
    });
  }

  private addProgressMessage(data: any): void {
    const message: ChatMessage = {
      role: 'assistant',
      content: `${data.task}: ${data.current}/${data.total}`,
      timestamp: Date.now(),
      type: 'progress'
    };
    this.currentSession?.enqueueMessage(message);
  }

  /**
   * 打开列设置对话框
   * @param data
   * @private
   */
  private handleDfsColsMetaSetter(data: any) {
    let errors = (data.content as TisResponseResult);
    errors.action_error_page_show = true;
    let colsAndMeta: ColsAndMeta = data.colsMetaViewBiz;

    const message = new ColsAndMetaStatus({
      content: '文件列Schema解析设置',
      requestId: data.requestId,
      dataxName: data.dataxName,
      colsAndMeta: colsAndMeta,
      errorInfo: this.tisService.processResult(errors),
      resolved: false
    });

    this.currentSession?.enqueueMessage(message);
    this.startCountdown(message); // 启动倒计时
  }

  /**
   * 打开TDFS列元数据设置对话框
   * @param msg
   */
  openTdfsColsMetaSetterDialog(msg: ChatMessage) {
    // 类型检查，确保是 ColsAndMetaStatus
    if (!(msg instanceof ColsAndMetaStatus)) {
      console.error('Invalid message type for cols meta setter dialog');
      throw new Error("message must be ColsAndMetaStatus instance");
    }

    const colsMetaMsg = msg as ColsAndMetaStatus;

    let dot = new DataxDTO();
    dot.processModel = StepType.CreateDatax;
    dot.dataxPipeName = colsMetaMsg.dataxName;

    const drawerRef = this.drawerService.create<DataxAddStep6ColsMetaSetterComponent, {}, {}>({
      nzWidth: "60%",
      nzHeight: "100%",
      nzPlacement: "right",
      nzContent: DataxAddStep6ColsMetaSetterComponent,
      nzContentParams: {
        "shallNotInitialTabView": true,
        "initData": colsMetaMsg.colsAndMeta,
        "dto": dot
      },
      nzClosable: true,
      nzMaskClosable: false
    });

    // 使用 afterOpen 钩子确保组件完全初始化后再订阅事件
    drawerRef.afterOpen.subscribe(() => {
      const component = drawerRef.getContentComponent();
      if (component && component.nextStep) {
        component.nextStep.subscribe((dto) => {

          const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=checkTdfsColsMetaSetterDialog`;
          let submitInfo: SubmitInfo =
            {
              sessionId: this.currentSession?.id || '',
              requestId: msg.requestId,
            };

          this.jsonPost(url, submitInfo)
            .then((biz) => {
              if (biz.success) {
                // 接收到 nextStep 事件后关闭抽屉
                drawerRef.close();
                // 标记消息为已完成
                colsMetaMsg.resolved = true;
                this.stopCountdown(colsMetaMsg);
              }
            });

        });
      }
    });

    return drawerRef;
  }

  // openWaittingProcessComponent(drawerService: NzDrawerService): NzDrawerRef {
  //     // let ctParams = {"obserable": subject};
  //     // if (launchTarget) {
  //     //     ctParams["launchTarget"] = launchTarget;
  //     // }
  //
  // }

  /**
   * @see openPluginDialog
   * @param data
   * @private
   */
  private addPluginMessage(data: any): void {
    // console.log(data.config);
    let hlist = PluginsComponent.wrapperHeteroList(data.config, null);
    let errors = data.content as TisResponseResult;
    errors.action_error_page_show = true;
    // console.log(errors);
    errors = this.tisService.processResult(errors);

    let pluginDesc: Descriptor = null;
    for (const [key, val] of hlist.descriptors) {
      pluginDesc = val;
      break;
    }
    for (const item of hlist.items) {
      if (!pluginDesc) {
        throw new Error("pluginDesc can not be null");
      }
      if (errors) {

        let pluginErrorFields = errors.errorfields;
        let index = 0;
        // let tmpHlist: HeteroList[] = [];
        // _heteroList.forEach((h) => {
        let items: Item[] = [item];
        if (pluginErrorFields && pluginErrorFields.length > 0) {
          let errorFields = pluginErrorFields[index++];

          if (errorFields && errorFields.length > 0) {
            let pluginErr = errorFields[0] as Array<IFieldError>;
            // let fieldErrors:string[] = [];
            if (pluginErr.length > 0) {
              if (!errors.errormsg) {
                errors.errormsg = [];
              }
              errors.errormsg.push("插件实例部分属性有误："
                + pluginErr.map((ferr) => {
                  let attr = item.dspt.findAttrDesc(ferr.name, false);
                  // console.log(attr.eprops);
                  return "'" + ((attr && attr.label) ? attr.label : ferr.name) + "'" + (ferr.content ? ferr.content : '')
                }).join("，") + "，请设置");
            }

            Item.processErrorField(<Array<Array<IFieldError>>>errorFields, items);
          }
        }
      }

      const message: ChatMessage = {
        role: 'assistant',
        content: '插件配置',
        timestamp: Date.now(),
        type: 'plugin',
        requestId: data.requestId,
        resolved: false,
        pluginData: {
          desc: pluginDesc,
          errorMsg: errors.errormsg,
          item: item,
          heteroIdentityId: hlist.identityId as PluginName
        }
      };

      // {Descriptor,Item}
      this.currentSession?.enqueueMessage(message);
      this.startCountdown(message); // 启动倒计时
      return;
    }

    console.log(hlist);
    throw new Error("hlist.items can not be empty:" + hlist.items.length);
  }


  /**
   * CandidateDescriptorOption
   * @param data
   * @private
   */
  private addSelectionMessage(data: any): void {
    const message: ChatMessage = {
      role: 'assistant',
      content: data.prompt,
      timestamp: Date.now(),
      type: 'selection',
      requestId: data.requestId,
      selectionData: {
        prompt: data.prompt,
        options: data.options,
        selectedIndex: undefined
      }
    };
    this.currentSession?.enqueueMessage(message);
    this.startCountdown(message); // 启动倒计时
  }

  submitSelection(chatMsg: ChatMessage): void {
    let selectionData = chatMsg.selectionData;
    if (selectionData.selectedIndex === undefined) {
      this.messageService.warning('请先选择一个选项');
      return;
    }

    const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=submitSelection`;
    let submitInfo: SubmitInfo =
      {
        sessionId: this.currentSession?.id || '',
        requestId: chatMsg.requestId,
        selectedIndex: selectionData.selectedIndex
      };
    this.jsonPost(url, submitInfo).then(response => {
      if (response.success) {
        chatMsg.resolved = true;
        this.stopCountdown(chatMsg); // 停止倒计时
        this.messageService.success('选择已提交');
      }

    }).catch(error => {
      this.messageService.error('提交失败: ' + error);
    });
  }


  installOption(selectionOpt: SelectionOptionData, requestId: string
    , option: CandidateDescriptorOption
    , event: Event): void {
    if (!requestId) {
      throw new Error("param requestId can not be empty");
    }
    let candidates = selectionOpt.options.candidates;
    // 阻止事件冒泡，防止触发radio选择
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const drawerRef
      = PluginManageComponent.openPluginManage(this.drawerService, option.extendpoint, option.endType, []);
    drawerRef.afterClose.subscribe((result) => {
      const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=checkInstallOption`;

      const submitInfo: SubmitInfo = {
        sessionId: this.currentSession?.id || '',
        requestId: requestId,
      };
      this.jsonPost(url, submitInfo).then(response => {
        let updateCandidates: Array<CandidateDescriptorOption> = response.bizresult;
        let local: CandidateDescriptorOption = null;
        let update: CandidateDescriptorOption = null;

        for (let idx = 0; idx < updateCandidates.length; idx++) {
          local = candidates[idx];
          update = updateCandidates[idx];
          //  console.log([candidates,local,update]);
          if (local.installed != update.installed) {
            local.installed = update.installed;
            if (local.installed) {
              this.messageService.success('插件' + local.name + '已安装');
            }
          }
        }

      }).catch(error => {
        this.messageService.error('提交失败: ' + error);
      });
    });

    // }

    // const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=installOption`;
    //
    // this.jsonPost(url, {
    //     sessionId: this.currentSessionId,
    //     optionIndex: option.index,
    //     optionName: option.name
    // }).then(response => {
    //     if (response.success) {
    //         // 更新选项状态为已安装
    //         option.installed = true;
    //         this.messageService.success(`${option.name} 安装成功`);
    //     } else {
    //         this.messageService.error(`安装失败: ${response.msg || '未知错误'}`);
    //     }
    // }).catch(error => {
    //     this.messageService.error(`安装失败: ${error}`);
    // });
  }

  isSelectionDisabled(chatMsg: ChatMessage): boolean {
    let selectionData: SelectionOptionData = chatMsg.selectionData;

    if (chatMsg.resolved || selectionData.selectedIndex === undefined) {
      return true;
    }

    const selectedOption = selectionData.options.candidates.find(
      (option: any) => option.index === selectionData.selectedIndex
    );

    return selectedOption && !selectedOption.installed;
  }

  private addErrorMessage(data: any): void {
    // 停止显示 LLM 调用状态消息
    this.remoteLLMChatStatusMessage();

    let error = data.message;
    const message: ChatMessage = {
      role: 'assistant',
      content: error,
      timestamp: Date.now(),
      type: 'error'
    };
    message.managerLink = (data.payloadLink as ManagerLink);
    this.currentSession?.enqueueMessage(message);
  }

  /**
   * 选择目标表
   * @param chatMsg
   */
  openSelectTargetTablesDialog(chatMsg: ChatMessage): void {

    if (!chatMsg.dataxName || !chatMsg.dataXReaderDesc) {
      throw new Error("!chatMsg.dataxName || !chatMsg.dataXReaderDesc");
    }

    DatasourceComponent.openAddTableDialog(this
      , (cpt) => {
        cpt.execAddMode = ExecAddModel.Pipeline;
        cpt.processMode.dtoSet = (dto) => {

          dto.tablePojo = null;
          dto.dataxPipeName = chatMsg.dataxName;
          dto.readerDescriptor = (chatMsg.dataXReaderDesc)

          if (!dto.readerDescriptor) {
            throw new Error("readerDescriptor can not be null");
          }
        }
      })
      .then((r: SuccessAddedDBTabs) => {
        // 提交服务服务端继续执行
        const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=confirmTableSelection`;

        const submitInfo: SubmitInfo = {
          sessionId: this.currentSession?.id || '',
          requestId: chatMsg.requestId,
          "selectedTabs": r.tabKeys
        };
        this.jsonPost(url, submitInfo).then((response) => {
          if (response.success) {
            chatMsg.resolved = true;
            this.stopCountdown(chatMsg); // 停止倒计时
            this.successNotify("已经选择了" + r.tabKeys.length + "张目标表");
          }
        }).catch(error => {
          this.messageService.error('提交失败: ' + error);
        });
      });

  }

  /**
   * @see addPluginMessage
   * @param chatMsg
   */
  openPluginDialog(chatMsg: ChatMessage): void {
    let requestId: string = chatMsg.requestId;
    let pluginData = chatMsg.pluginData;
    if (!requestId) {
      console.log(chatMsg);
      throw new Error("illegal argument requestId can not be empty");
    }
    if (!pluginData.desc || !pluginData.item) {
      console.log(pluginData);
      throw new Error("pluginDesc can not be null");
    }
    let saveOpt = new SavePluginEvent();
    saveOpt.verifyConfig = VerifyConfig.STRICT;
    saveOpt.skipPluginSave = true;
    saveOpt.serverForward = "coredefine:chat_pipeline_action:submit_plugin_props_complement";

    const submitInfo: SubmitInfo = {
      sessionId: this.currentSession?.id || '',
      requestId: requestId
    };

    saveOpt.postPayload = submitInfo;
    PluginsComponent.openPluginDialog({
        shallLoadSavedItems: false,
        item: pluginData.item,
        opt: saveOpt,
        savePluginEventCreator: () => saveOpt
      } //
      , this, pluginData.desc
      , {
        name: pluginData.heteroIdentityId, require: true
      }
      , `设置${pluginData.desc.displayName}实例`
      , (saveResult, plugin: ProcessedDBRecord) => {
        // console.log(saveResult);
        chatMsg.resolved = saveResult.saveSuccess;
        if (saveResult.saveSuccess) {
          this.stopCountdown(chatMsg); // 停止倒计时
        }
      });
    return;
    //}

    //  throw new Error("have not find any item,item size:" + pluginData.items.length);
  }

  formatMessage(content: string): string {
    // 简单的Markdown格式化
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
    }
    return date.toLocaleDateString('zh-CN');
  }

  getProgressPercent(content: string): number {
    const match = content.match(/(\d+)\/(\d+)/);
    if (match) {
      return Math.round((parseInt(match[1]) / parseInt(match[2])) * 100);
    }
    return 0;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private triggerTokenAnimation(): void {
    this.tokenAnimating = true;
    setTimeout(() => {
      this.tokenAnimating = false;
    }, 800); // 动画持续时间与CSS动画时长一致
  }

  /**
   * 处理LLM调用状态
   * @param data 包含status(Start/ERROR/Complete)和detail(可选的详情信息)
   */
  private handleLLMStatus(data: any): void {
    const status = data.status;
    const detail = data.detail;

    switch (status) {
      case 'Start':
        // 显示加载状态
        //this.formDisabled = true;
        // 添加LLM状态消息到聊天记录
        const statusMessage: ChatMessage = {
          role: 'system',
          content: detail ? `正在调用大模型处理: ${detail.substring(0, 50)}...` : '正在调用大模型处理...',
          timestamp: Date.now(),
          type: 'llm_chat_status'
        };
        this.currentSession?.enqueueMessage(statusMessage);
        this.scrollToBottom();
        break;
      case 'ERROR':
        // 显示错误状态
        // this.formDisabled = false;
        // 查找并移除最后一条llm_chat_status类型的消息
        // for (let i = this.currentMessages.length - 1; i >= 0; i--) {
        //     if (this.currentMessages[i].type === 'llm_chat_status') {
        //         this.currentMessages.splice(i, 1);
        //         break;
        //     }
        // }
        this.remoteLLMChatStatusMessage();
        // 添加错误消息到聊天记录
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: detail ? `大模型调用失败: ${detail}` : '大模型调用失败',
          timestamp: Date.now(),
          type: 'error'
        };
        this.currentSession?.enqueueMessage(errorMessage);
        this.scrollToBottom();
        break;
      case 'Complete':
        // 完成状态
        // this.formDisabled = false;
        // 查找并移除最后一条llm_chat_status类型的消息
        this.remoteLLMChatStatusMessage();
        // 可以选择添加成功消息，但通常不需要，因为会有返回的消息内容
        break;
      default:
        console.warn('Unknown LLM status:', status);
    }
  }

  private remoteLLMChatStatusMessage() {
    if (!this.currentSession) {
      return;
    }

    // 1. 先从待显示队列中查找并删除（如果消息还在队列中）
    for (let i = this.currentSession.pendingMessages.length - 1; i >= 0; i--) {
      if (this.currentSession.pendingMessages[i].type === 'llm_chat_status') {
        this.currentSession.pendingMessages.splice(i, 1);
        return; // 找到并删除后直接返回
      }
    }

    // 2. 如果队列中没有，再从已显示列表中查找并删除
    for (let i = this.currentSession.messages.length - 1; i >= 0; i--) {
      if (this.currentSession.messages[i].type === 'llm_chat_status') {
        this.currentSession.messages.splice(i, 1);
        return;
      }
    }
  }

  // close(): void {
  //   if (this.eventSource) {
  //     this.eventSource.close();
  //   }
  //   this.drawer.close();
  // }

  protected readonly model = model;


  /**
   * 处理插件安装状态
   * @param data 包含requestId和installJobs数组
   */
  private handlePluginInstallStatus(data: any): void {
    if (!this.currentSession) {
      return;
    }

    // 直接从当前会话的缓存中查找，O(1) 时间复杂度
    let installMessage = this.currentSession.pluginInstallStatusCache.get(data.requestId);

    if (!installMessage) {
      // 创建新的 PluginInstallStatus 实例
      installMessage = new PluginInstallStatus({
        content: '正在安装插件...',
        requestId: data.requestId,
        installJobs: data.installJobs
      });

      // 添加到消息列表
      this.currentSession.enqueueMessage(installMessage);
      // 添加到会话缓存
      this.currentSession.pluginInstallStatusCache.set(data.requestId, installMessage);
    } else {
      // 更新现有消息的安装任务状态
      installMessage.updateInstallJobs(data.installJobs);
    }

    // 检查是否所有插件都已安装完成
    const allCompleted = data.complete;
    installMessage.resolved = allCompleted;

    // 当安装完成时，自动收缩消息
    if (allCompleted && installMessage instanceof PluginInstallStatus) {
      installMessage.collapsed = true;
    }

    if (allCompleted) {
      // 所有插件安装完成，更新消息内容
      const successCount = data.installJobs.filter((job: any) =>
        job.status && job.status.type === 'Success'
      ).length;
      const failureCount = data.installJobs.filter((job: any) =>
        job.status && job.status.type === 'Failure'
      ).length;

      installMessage.content = `插件安装完成：${successCount} 个成功，${failureCount} 个失败`;

      // 延迟清理缓存，避免后续还有相关消息
      setTimeout(() => {
        this.currentSession?.pluginInstallStatusCache.delete(data.requestId);
      }, 5000);
    }
  }

  // /**
  //  * 关闭增量启动执行状态显示
  //  * @param msg
  //  */
  // openLaunchiopenngProcessDialog(msg: ChatMessage) {
  //
  // }


}
