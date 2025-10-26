import {Component, ComponentFactoryResolver, model, OnDestroy, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {
    Descriptor,
    HeteroList,
    ItemPropVal,
    PluginName,
    SavePluginEvent,
    SuccessAddedDBTabs,
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
import {NzModalService} from "ng-zorro-antd/modal";

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    type?: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs';
    pluginData?: HeteroList;
    dataxName?: string;
    dataXReaderDesc?: Descriptor;
    requestId?: string;
    selectionData?: SelectionOptionData;
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

                <nz-header class="chat-header">
                    <div>
                        <item-prop-val *ngIf="itemPp" [formLevel]="1"
                                       [disabled]="false"
                                       [formControlSpan]="7" [labelSpan]="1" [pp]="itemPp" [pluginImpl]="this.itemImpl"
                                       (valChange)="llmChange($event)"
                        ></item-prop-val>
                        <!--                        <div class="llm-provider-selector">-->
                        <!--                            <span class="provider-label">模型:</span>-->
                        <!--                            <nz-select [(ngModel)]="selectedProviderId"-->
                        <!--                                       placeholder="请选择大模型提供者"-->
                        <!--                                       nzShowSearch-->
                        <!--                                       nzAllowClear-->
                        <!--                                       class="provider-select"-->
                        <!--                                       (ngModelChange)="onProviderChange($event)">-->
                        <!--                                <nz-option *ngFor="let provider of llmProviders"-->
                        <!--                                           [nzValue]="provider.id"-->
                        <!--                                           [nzLabel]="provider.name">-->
                        <!--                                    <span>-->
                        <!--                                        <i nz-icon-->
                        <!--                                           [nzType]="getProviderIcon(provider.status)"-->
                        <!--                                           [class]="'status-' + provider.status"></i>-->
                        <!--                                        {{provider.name}}-->
                        <!--                                    </span>-->
                        <!--                                </nz-option>-->
                        <!--                            </nz-select>-->
                        <!--                            <button nz-button-->
                        <!--                                    nzType="primary"-->
                        <!--                                    nzSize="small"-->
                        <!--                                    (click)="createLLMProvider()"-->
                        <!--                                    nz-tooltip="创建新的模型提供者">-->
                        <!--                                <i nz-icon nzType="plus"></i>-->
                        <!--                            </button>-->
                        <!--                        </div>-->
                        <div class="token-counter" *ngIf="tokenCount > 0">
                            <i nz-icon nzType="fire" nzTheme="fill"></i>
                            Token使用: {{tokenCount}}
                        </div>
                    </div>
                </nz-header>
                <nz-content class="chat-content">
                    <!-- 消息列表 -->
                    <div class="messages-container" #messagesContainer>
                        <div *ngFor="let msg of currentMessages" class="message" [ngClass]="'message-' + msg.role">
                            <div class="message-avatar">
                                <i nz-icon [nzType]="msg.role === 'user' ? 'user' : 'robot'" nzTheme="outline"></i>
                            </div>
                            <div class="message-content">
                                <div *ngIf="msg.type === 'text'" class="message-text"
                                     [innerHTML]="formatMessage(msg.content)"></div>
                                <div *ngIf="msg.type === 'error'" class="message-error">
                                    <nz-alert nzType="error" [nzMessage]="msg.content" nzShowIcon></nz-alert>
                                </div>
                                <div *ngIf="msg.type === 'progress'" class="message-progress">
                                    <nz-progress [nzPercent]="getProgressPercent(msg.content)"
                                                 nzStatus="active"></nz-progress>
                                    <span class="progress-text">{{msg.content}}</span>
                                </div>
                                <div *ngIf="msg.type === 'plugin'" class="message-plugin">
                                    <button nz-button nzType="primary" nzSize="small"
                                            (click)="openPluginDialog(msg)">
                                        <i nz-icon nzType="setting"></i> 配置插件
                                    </button>
                                </div>
                                <div *ngIf="msg.type === 'select_tabs'" class="message-select-tabs">
                                    <button nz-button nzType="primary" nzSize="small"
                                            (click)="openSelectTargetTablesDialog(msg)">
                                        <i nz-icon nzType="setting"></i>设置目标表
                                    </button>
                                </div>
                                <div *ngIf="msg.type === 'selection'" class="message-selection">
                                    <div class="selection-prompt">{{msg.selectionData.prompt}}</div>
                                    <nz-radio-group [(ngModel)]="msg.selectionData['selectedIndex']"
                                                    class="selection-options">
                                        <label nz-radio *ngFor="let option of msg.selectionData.options.candidates"
                                               [nzValue]="option.index">
                                            <div class="selection-option">
                                                <div class="option-name">{{option.name}}</div>
                                                <div class="option-description">{{option.description}}</div>
                                                <div class="option-status">
                                                    <nz-tag *ngIf="option.installed" nzColor="success">已安装</nz-tag>
                                                    <nz-tag *ngIf="!option.installed" nzColor="default">未安装</nz-tag>
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
                                            [disabled]="isSelectionDisabled(msg.selectionData)"
                                            (click)="submitSelection(msg)">
                                        确认选择
                                    </button>
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
                    <div class="input-area">
                        <!-- 快捷模板按钮 -->
                        <div class="template-buttons">
                            <button *ngFor="let template of templates"
                                    nz-button
                                    nzSize="small"
                                    (click)="useTemplate(template)">
                                {{template.name}}
                            </button>
                        </div>

                        <!-- 输入框 -->
                        <div class="input-container">
                            <nz-textarea-count [nzMaxCharacterCount]="1000">
                <textarea nz-input
                          [(ngModel)]="inputText"
                          rows="2"
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
            </nz-layout>
        </nz-layout>
    `,
    styles: [`
        .chat-container {
            height: 100%;
            background: #f5f5f5;
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

        .header-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .llm-provider-selector {
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

        .selection-prompt {
            font-weight: 500;
            margin-bottom: 12px;
            color: #333;
        }

        .selection-options {
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

        .option-name {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .option-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }

        .option-status {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .install-button {
            margin-left: 8px;
        }

        .typing-indicator {
            display: flex;
            align-items: center;
        }

        .typing-indicator span {
            height: 8px;
            width: 8px;
            background: #999;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
            animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
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
            border-top: 1px solid #e8e8e8;
            padding: 16px;
            background: #fff;
        }

        .template-buttons {
            margin-bottom: 12px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .input-container {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        .input-container nz-textarea-count {
            flex: 1;
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

    itemPp: ItemPropVal = null;
    itemImpl: string;

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
        this.loadTemplates();
        this.loadLLMProviders();
        this.createNewSession();
    }

    ngOnDestroy(): void {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    loadTemplates(): void {
        this.httpPost('/coredefine/corenodemanage.ajax', 'action=chat_pipeline_action&emethod=get_templates')
            .then((r) => {
                if (r.success) {
                    this.templates = r.bizresult;
                }
            });
    }

    // createLLMProvider(): void {
    //     const drawerRef = PluginManageComponent.openPluginManage(
    //         this.drawerService,
    //         'com.qlangtech.tis.extension.impl.LLMProvider',
    //         '',
    //         []
    //     );
    //
    //     drawerRef.afterClose.subscribe((result) => {
    //         if (result) {
    //             this.loadLLMProviders();
    //             this.messageService.success('大模型提供者创建成功');
    //         }
    //     });
    // }

    llmChange(event: ItemPropVal) {

        this.httpPost('/coredefine/corenodemanage.ajax', `action=chat_pipeline_action&emethod=change_llm&llm=${event.primary}`)
            .then((r) => {
                if (r.success) {
                    this.selectedProviderId = event.primary;
                    // this.templates = r.bizresult;

                    // this.successNotify()
                }
            });
    }

    loadLLMProviders(): void {

        getUserProfile(this).then((result) => {
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
        })
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
                content: '选择目标表',
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

    private addPluginMessage(data: any): void {
        // console.log(data.config);
        let hlist = PluginsComponent.wrapperHeteroList(data.config, null);

        const message: ChatMessage = {
            role: 'assistant',
            content: '插件配置',
            timestamp: Date.now(),
            type: 'plugin',
            requestId: data.requestId,
            pluginData: hlist
        };
        this.currentMessages.push(message);
        this.scrollToBottom();
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
            this.messageService.success('选择已提交');
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

    isSelectionDisabled(selectionData: SelectionOptionData): boolean {
        if (selectionData.selectedIndex === undefined) {
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
                        this.successNotify("已经选择了" + r.tabKeys.length + "张目标表");
                    }
                }).catch(error => {
                    this.messageService.error('提交失败: ' + error);
                });
            });

    }

    openPluginDialog(chatMsg: ChatMessage): void {
        let requestId: string = chatMsg.requestId;
        let pluginData: HeteroList = chatMsg.pluginData;
        if (!requestId) {
            console.log(chatMsg);
            throw new Error("illegal argument requestId can not be empty");
        }
        let pluginDesc: Descriptor = null;
        for (const [key, val] of pluginData.descriptors) {
            pluginDesc = val;
            break;
        }
        for (const item of pluginData.items) {
            if (!pluginDesc) {
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
                    item: item,
                    opt: saveOpt,
                    savePluginEventCreator: () => saveOpt
                } //
                , this, pluginDesc
                , {
                    name: pluginData.identityId as PluginName, require: true
                }
                , `设置${pluginDesc.displayName}实例`
                , (saveResult, plugin: ProcessedDBRecord) => {

                });
            return;
        }

        throw new Error("have not find any item,item size:" + pluginData.items.length);
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
