import {Component, ComponentFactoryResolver, model, OnDestroy, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {
    Descriptor,
    HeteroList, IFieldError, Item,
    ItemPropVal,
    PluginName,
    SavePluginEvent,
    SuccessAddedDBTabs, TisResponseResult,
    VerifyConfig
} from "../common/tis.plugin";
import {EventSourceSubject, EventType, TISService} from "../common/tis.service";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {NzMessageService} from "ng-zorro-antd/message";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {getUserProfile} from "../base/common/datax.common";
import {PluginsComponent} from "../common/plugins.component";
import {ProcessedDBRecord} from "../common/ds.utils";
import {DatasourceComponent} from "../offline/ds.component";
import {ExecAddModel} from "../offline/table.add.component";
import {NzNotificationService} from "ng-zorro-antd/notification";

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    type?: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs';
    // 设置插件用
    pluginData?: { desc: Descriptor, errorMsg: string[], item: Item, heteroIdentityId: PluginName };
    dataxName?: string;
    // 选表时候用
    dataXReaderDesc?: Descriptor;
    requestId?: string;
    selectionData?: SelectionOptionData;
    // 该消息是否已经被处理
    resolved?: boolean;
}

interface SubmitInfo {
    requestId: string;
    sessionId: string;

    [key: string]: any;
}

interface SelectionOptionData {
    prompt: string;
    options: { fieldName: string, candidates: Array<CandidateDescriptorOption> };

    [key: string]: any
}

interface CandidateDescriptorOption {
    index: number;
    // plugin display name
    name: string;
    /**
     * 插件扩展点
     */
    extendpoint: string;
    /**
     * 目标端类型，例如：mysql，doris，starRocks
     */
    endType?: string;
    description: string;
    installed: boolean;
    /**
     * plugin 的实现类
     */
    version?: string;
}

interface SelectionDataOptions {
    /**
     * relevant field name
     * */
    fieldName: string;
    candidates: Array<CandidateDescriptorOption>
}

interface ChatSession {
    id: string;
    title: string;
    createTime: number;
    messages: ChatMessage[];
}

interface TaskTemplate {
    id: string;
    name: string;
    description: string;
    sampleText: string;
}

interface LLMProvider {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'error';
    createTime?: number;
}

@Component({
    // selector: 'nz-drawer-custom-component',
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
                                  [class.active]="session.id === currentSessionId"
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
                        <div>
                            <item-prop-val *ngIf="itemPp" [formLevel]="1"
                                           [disabled]="false"
                                           [formControlSpan]="7" [labelSpan]="1" [pp]="itemPp"
                                           [pluginImpl]="this.itemImpl"
                                           (valChange)="llmChange($event)"
                            ></item-prop-val>
                            <div class="token-counter" *ngIf="tokenCount > -1">
                                <i nz-icon nzType="fire" nzTheme="fill"></i>
                                Token使用: {{tokenCount}}
                            </div>
                        </div>
                    </nz-header>
                    <nz-content class="chat-content">
                        <!-- 消息列表 -->
                        <div class="messages-container" #messagesContainer *ngIf="hasMessages">
                            <div *ngFor="let msg of currentMessages" class="message" [ngClass]="'message-' + msg.role">
                                <div class="message-avatar">
                                    <i nz-icon [nzType]="msg.role === 'user' ? 'user' : 'robot'" nzTheme="outline"></i>
                                </div>
                                <div class="message-content" [ngSwitch]="msg.type">
                                    <!-- 文本消息 -->
                                    <div *ngSwitchCase="'text'" class="message-text"
                                         [innerHTML]="formatMessage(msg.content)"></div>

                                    <!-- 错误消息 -->
                                    <div *ngSwitchCase="'error'" class="message-error">
                                        <nz-alert nzType="error" [nzMessage]="msg.content" nzShowIcon></nz-alert>
                                    </div>

                                    <!-- 进度消息 -->
                                    <div *ngSwitchCase="'progress'" class="message-progress">
                                        <nz-progress [nzPercent]="getProgressPercent(msg.content)"
                                                     nzStatus="active"></nz-progress>
                                        <span class="progress-text">{{msg.content}}</span>
                                    </div>

                                    <!-- 插件配置消息 -->
                                    <div *ngSwitchCase="'plugin'" class="message-plugin">
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

                                    <!-- 选择目标表消息 -->
                                    <div *ngSwitchCase="'select_tabs'" class="message-select-tabs">


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
                                        <div class="selection-prompt">{{msg.selectionData.prompt}}</div>
                                        <nz-radio-group [disabled]="msg.resolved"
                                                        [(ngModel)]="msg.selectionData['selectedIndex']"
                                                        class="selection-options">
                                            <label nz-radio *ngFor="let option of msg.selectionData.options.candidates"
                                                   [nzValue]="option.index">
                                                <div class="selection-option">
                                                    <div class="option-name">{{option.name}}</div>
                                                    <div class="option-description">{{option.description}}</div>
                                                    <div class="option-status">
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
                                <button nz-button
                                        nzType="primary"
                                        [disabled]="!inputText || isProcessing || !selectedProviderId"
                                        (click)="sendMessage()">
                                    <i nz-icon nzType="send"></i> 发送
                                </button>
                            </div>
                        </div>
                    </nz-content>
                </nz-spin>
            </nz-layout>
        </nz-layout>
    `,
    styles: [`
        :host {
            display: block;
            height: 100%;
        }

        .chat-container {
            height: 100%;
            background: #f5f5f5;
        }

        /* 修复 nz-spin 容器高度问题 - 限制在当前组件内 */
        :host ::ng-deep .chat-container .ant-spin-nested-loading {
            height: 100%;
        }

        :host ::ng-deep .chat-container .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        /* 确保内部 nz-layout 也能正确高度 */
        .chat-container nz-layout nz-layout {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        /* 确保 nz-header 不会压缩 */
        nz-header.chat-header {
            flex-shrink: 0;
        }

        /* 确保 nz-content 占满剩余空间 */
        nz-content.chat-content {
            flex: 1;
            overflow: hidden;
        }

        .chat-sidebar {
            border-right: 1px solid #e8e8e8;
            background: #fff;
        }

        .sidebar-header {
            padding: 16px;
            border-bottom: 1px solid #e8e8e8;
        }

        .session-list {
            overflow-y: auto;
            height: calc(100% - 65px);
        }

        .session-item {
            cursor: pointer;
            padding: 8px 12px;
        }

        .session-item:hover {
            background: #f0f0f0;
        }

        nz-list-item.active .session-item {
            background: #e6f7ff;
            border-left: 3px solid #1890ff;
        }

        .session-title {
            font-size: 14px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
        }

        .chat-header {
            background: #fff;
            padding: 0 24px;
            border-bottom: 1px solid #e8e8e8;

        }

        .chat-container .header-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-container .llm-provider-selector {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .provider-label {
            font-size: 14px;
            color: #333;
            white-space: nowrap;
        }

        .provider-select {
            min-width: 200px;
        }

        .status-active {
            color: #52c41a;
        }

        .status-inactive {
            color: #faad14;
        }

        .status-error {
            color: #ff4d4f;
        }

        .token-counter {
            color: #ff7875;
            font-size: 14px;
        }

        .chat-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #fff;
            margin: 16px;
            border-radius: 4px;
            position: relative;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .message {
            display: flex;
            margin-bottom: 20px;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message-user {
            flex-direction: row-reverse;
        }

        .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 12px;
            flex-shrink: 0;
        }

        .message-user .message-avatar {
            background: #87d068;
            color: white;
        }

        .message-assistant .message-avatar {
            background: #1890ff;
            color: white;
        }

        .message-content {
            max-width: 70%;
            background: #f0f2f5;
            padding: 12px 16px;
            border-radius: 8px;
            word-break: break-word;
        }

        .message-user .message-content {
            background: #e6f7ff;
        }

        .message-text {
            white-space: pre-wrap;
        }

        .message-error {
            margin-top: 8px;
        }

        .message-progress {
            min-width: 300px;
        }

        .progress-text {
            display: block;
            margin-top: 8px;
            font-size: 12px;
            color: #666;
        }

        .message-selection {
            min-width: 400px;
        }

        .message-plugin {
            min-width: 600px;
        }

        .message-select-tabs {
            min-width: 600px;
            width: 100%;
            max-width: 800px;
        }

        .message-select-tabs nz-list {
            width: 100%;
        }

        .selection-prompt {
            font-weight: 500;
            margin-bottom: 12px;
            color: #333;
        }

        .chat-container .selection-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }

        .selection-option {
            padding: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            background: white;
        }

        .chat-container .option-name {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .chat-container .option-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }

        .chat-container .option-status {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .install-button {
            margin-left: 8px;
        }

        .chat-container .typing-indicator {
            display: flex;
            align-items: center;
        }

        .chat-container .typing-indicator span {
            height: 8px;
            width: 8px;
            background: #999;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
            animation: typing 1.4s infinite;
        }

        .chat-container .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .chat-container .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-10px);
            }
        }

        .input-area {
            padding: 16px;
            background: #fff;
            width: 100%;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-area-centered {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            padding: 24px;
            background: linear-gradient(to bottom, #ffffff, #fafafa);
            max-width: 800px;
        }

        .input-area-centered .template-buttons-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .input-area-centered .template-buttons {
            justify-content: center;
            margin-bottom: 16px;
        }

        .input-area-centered .input-container {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .input-area-bottom {
            position: relative;
            border-top: 1px solid #e8e8e8;
            max-width: none;
            margin: 0;
        }

        .chat-container .template-buttons-wrapper {
            position: relative;
            margin-bottom: 12px;
        }

        .chat-container .template-toggle-btn {
            transition: all 0.3s ease;
            display: inline-flex !important;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 500;
            margin-left: 8px;
            box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
        }

        .chat-container .template-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }

        .chat-container .template-toggle-btn i {
            font-size: 14px;
        }

        .chat-container .template-toggle-btn .template-count {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
            margin-left: 4px;
            font-weight: bold;
            color: #fff;
        }

        .chat-container .template-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            transition: all 0.3s ease;
        }

        .chat-container .template-buttons.collapsed {
            /* 移除max-height限制，让按钮能正常显示 */
        }

        .chat-container .template-btn {
            animation: fadeInScale 0.3s ease;
            background: #fafafa;
            border-color: #d9d9d9;
        }

        .chat-container .template-btn:hover {
            background: #fff;
            border-color: #40a9ff;
            color: #40a9ff;
        }

        .chat-container .template-btn.fade-in {
            animation: fadeInScale 0.3s ease;
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .chat-container .more-templates-hint {
            display: inline-flex;
            align-items: center;
            padding: 0 8px;
            color: #999;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 2px;
        }

        .chat-container .input-container {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .chat-container .input-container nz-textarea-count {
            flex: 1;
        }

        .chat-container .input-area-bottom .input-container {
            max-width: none;
            width: 100%;
        }

        .chat-container .input-area-bottom .template-buttons {
            max-width: none;
            width: 100%;
        }
    `]
})
export class ChatPipelineComponent extends BasicFormComponent implements OnInit, OnDestroy {
    sessions: ChatSession[] = [];
    currentSessionId: string = '';
    currentMessages: ChatMessage[] = [];
    inputText: string = '';
    isProcessing: boolean = false;
    isTyping: boolean = false;
    tokenCount: number = 0;
    templates: TaskTemplate[] = [];
    llmProviders: LLMProvider[] = [];
    selectedProviderId: string = '';

    // 模板按钮展开/收起状态
    isTemplatesCollapsed: boolean = false;
    maxVisibleTemplates: number = 3; // 收起时显示的模板数量

    itemPp: ItemPropVal = null;
    itemImpl: string;

    // 计算属性：判断是否有消息
    get hasMessages(): boolean {
        return this.currentMessages && this.currentMessages.length > 0;
    }

    private eventSource: EventSourceSubject | null = null;
    private currentTypingMessage: string = '';

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

    ngOnInit(): void {
        getUserProfile(this, {action: "chat_pipeline_action", method: "get_page_initialize"})
            .then((result) => {
                let hlist = result.hlist;
                aa: for (let item of hlist.items) {
                    for (let pp of item.propVals) {
                        if (pp.key === 'llm') {
                            // console.log(item.impl);
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
                const session: ChatSession = {
                    id: ses.sessionId,
                    title: '新对话 ' + new Date().toLocaleTimeString(),
                    createTime: ses.createTime,
                    messages: []
                };
                this.sessions.unshift(session);
                this.currentSessionId = session.id;
                this.currentMessages = [];

                /**
                 * initialize template
                 */
                this.templates = tpls;
            })
    }

    ngOnDestroy(): void {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }


    llmChange(event: ItemPropVal) {

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
                    const session: ChatSession = {
                        id: r.bizresult.sessionId,
                        title: '新对话 ' + new Date().toLocaleTimeString(),
                        createTime: r.bizresult.createTime,
                        messages: []
                    };
                    this.sessions.unshift(session);
                    this.currentSessionId = session.id;
                    this.currentMessages = [];
                    // 新建会话时，重置模板展开状态
                    this.isTemplatesCollapsed = false;
                }
            });
    }

    switchSession(sessionId: string): void {
        this.currentSessionId = sessionId;
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            this.currentMessages = session.messages;
        }
    }

    useTemplate(template: TaskTemplate): void {
        this.inputText = template.sampleText;
    }

    toggleTemplates(): void {
        this.isTemplatesCollapsed = !this.isTemplatesCollapsed;
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

        this.currentMessages.push(userMessage);
        const session = this.sessions.find(s => s.id === this.currentSessionId);
        if (session) {
            session.messages.push(userMessage);
        }

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

    private connectSSE(userInput: string): void {
        const url = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=chat` +
            `&resulthandler=exec_null&sessionId=${this.currentSessionId}&input=${encodeURIComponent(userInput)}` +
            `&providerId=${this.selectedProviderId}`;

        this.eventSource = this.tisService.createEventSource(
            "tis-ai-agent", url, [
                EventType.AI_AGNET_ERROR, EventType.AI_AGNET_DONE, EventType.AI_AGNET_MESSAGE
                , EventType.AI_AGNET_PLUGIN, EventType.AI_AGNET_PROGRESS, EventType.AI_AGNET_INPUT_REQUEST, EventType.AI_AGNET_SELECT_TABS
                , EventType.AI_AGNET_SELECTION_REQUEST, EventType.AI_AGNET_TOKEN, EventType.SSE_CLOSE]);
        this.eventSource.events.subscribe((evt: [EventType, any]) => {
            let data = evt[1];
            switch (evt[0]) {
                case EventType.AI_AGNET_DONE: {
                    this.isProcessing = false;
                    this.isTyping = false;
                    if (this.eventSource) {
                        this.eventSource.close();
                        this.eventSource = null;
                    }
                    return;
                }
                case EventType.AI_AGNET_ERROR: {
                    this.addErrorMessage(data.message);
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
                case EventType.AI_AGNET_SELECTION_REQUEST: {
                    this.addSelectionMessage(data);
                    return;
                }
                case EventType.AI_AGNET_TOKEN: {
                    // const data = JSON.parse(event.data);
                    this.tokenCount = data.count;
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
            this.currentMessages.push(message);
            this.scrollToBottom();
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

        this.currentMessages.push(message);
        const session = this.sessions.find(s => s.id === this.currentSessionId);
        if (session) {
            session.messages.push(message);
        }

        this.scrollToBottom();
    }

    private addProgressMessage(data: any): void {
        const message: ChatMessage = {
            role: 'assistant',
            content: `${data.task}: ${data.current}/${data.total}`,
            timestamp: Date.now(),
            type: 'progress'
        };
        this.currentMessages.push(message);
        this.scrollToBottom();
    }

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
                pluginData: {desc: pluginDesc, errorMsg: errors.errormsg, item: item, heteroIdentityId: hlist.identityId as PluginName}
            };

            // {Descriptor,Item}
            this.currentMessages.push(message);
            this.scrollToBottom();
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
        this.currentMessages.push(message);
        const session = this.sessions.find(s => s.id === this.currentSessionId);
        if (session) {
            session.messages.push(message);
        }
        this.scrollToBottom();
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
                sessionId: this.currentSessionId,
                requestId: chatMsg.requestId,
                selectedIndex: selectionData.selectedIndex
            };
        this.jsonPost(url, submitInfo).then(response => {
            if (response.success) {
                chatMsg.resolved = true;
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
        let candidates = selectionOpt.options;
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
                sessionId: this.currentSessionId,
                requestId: requestId,
            };
            this.jsonPost(url, submitInfo).then(response => {
                let updateCandidates: Array<CandidateDescriptorOption> = response.bizresult;
                let local: CandidateDescriptorOption = null;
                let update: CandidateDescriptorOption = null;
                for (let idx = 0; idx < updateCandidates.length; idx++) {
                    local = candidates[idx];
                    update = updateCandidates[idx];
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

    private addErrorMessage(error: string): void {
        const message: ChatMessage = {
            role: 'assistant',
            content: error,
            timestamp: Date.now(),
            type: 'error'
        };
        this.currentMessages.push(message);
        this.scrollToBottom();
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
                    sessionId: this.currentSessionId,
                    requestId: chatMsg.requestId,
                    "selectedTabs": r.tabKeys
                };
                this.jsonPost(url, submitInfo).then((response) => {
                    if (response.success) {
                        chatMsg.resolved = true;
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
        // let pluginDesc: Descriptor = null;
        // for (const [key, val] of pluginData.descriptors) {
        //     pluginDesc = val;
        //     break;
        // }
        //  for (const item of pluginData.items) {
        if (!pluginData.desc || !pluginData.item) {
            console.log(pluginData);
            throw new Error("pluginDesc can not be null");
        }
        let saveOpt = new SavePluginEvent();
        saveOpt.verifyConfig = VerifyConfig.STRICT;
        saveOpt.skipPluginSave = true;
        saveOpt.serverForward = "coredefine:chat_pipeline_action:submit_plugin_props_complement";

        const submitInfo: SubmitInfo = {
            sessionId: this.currentSessionId,
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
                console.log(saveResult);
                chatMsg.resolved = saveResult.saveSuccess;
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

    close(): void {
        if (this.eventSource) {
            this.eventSource.close();
        }
        this.drawer.close();
    }

    protected readonly model = model;


}
