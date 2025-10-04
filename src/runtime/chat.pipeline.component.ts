import {Component, ComponentFactoryResolver, OnDestroy, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {HeteroList} from "../common/tis.plugin";
import {EventSourceSubject, EventType, TISService} from "../common/tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {NzMessageService} from "ng-zorro-antd/message";

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    type?: 'text' | 'plugin' | 'error' | 'progress' | 'selection';
    pluginData?: any;
    selectionData?: {
        requestId: string;
        prompt: string;
        options: any;
        [key: string]: any
    };
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
                    <div class="header-content">
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
                                    <button nz-button nzType="primary" (click)="openPluginDialog(msg.pluginData)">
                                        <i nz-icon nzType="setting"></i> 配置插件
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
                                                <nz-tag *ngIf="option.installed" nzColor="success">已安装</nz-tag>
                                                <nz-tag *ngIf="!option.installed" nzColor="default">未安装</nz-tag>
                                            </div>
                                        </label>
                                    </nz-radio-group>
                                    <button nz-button nzType="primary"
                                            [disabled]="msg.selectionData['selectedIndex'] === undefined"
                                            (click)="submitSelection(msg.selectionData)">
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
                                    [disabled]="!inputText || isProcessing"
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
            display: flex;
            align-items: center;
        }

        .header-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
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

    private eventSource: EventSourceSubject | null = null;
    private currentTypingMessage: string = '';

    constructor(
        tisService: TISService,
        public drawer: NzDrawerRef<{ hetero: HeteroList }>,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private messageService: NzMessageService
    ) {
        super(tisService);
    }

    ngOnInit(): void {
        this.loadTemplates();
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
        if (!this.inputText || this.isProcessing) {
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
            `&resulthandler=exec_null&sessionId=${this.currentSessionId}&input=${encodeURIComponent(userInput)}`;

        this.eventSource = this.tisService.createEventSource(
            "tis-ai-agent", url, [
                EventType.AI_AGNET_ERROR, EventType.AI_AGNET_DONE, EventType.AI_AGNET_MESSAGE
                , EventType.AI_AGNET_PLUGIN, EventType.AI_AGNET_PROGRESS, EventType.AI_AGNET_INPUT_REQUEST
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
        const message: ChatMessage = {
            role: 'assistant',
            content: '插件配置',
            timestamp: Date.now(),
            type: 'plugin',
            pluginData: data
        };
        this.currentMessages.push(message);
        this.scrollToBottom();
    }

    private addSelectionMessage(data: any): void {
        const message: ChatMessage = {
            role: 'assistant',
            content: data.prompt,
            timestamp: Date.now(),
            type: 'selection',
            selectionData: {
                requestId: data.requestId,
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

    submitSelection(selectionData: any): void {
        if (selectionData.selectedIndex === undefined) {
            this.messageService.warning('请先选择一个选项');
            return;
        }

        const url: string = `/coredefine/corenodemanage.ajax?action=chat_pipeline_action&emethod=submitSelection`;

        this.jsonPost(url, {
            sessionId: this.currentSessionId,
            requestId: selectionData.requestId,
            selectedIndex: selectionData.selectedIndex
        }).then(response => {
            this.messageService.success('选择已提交');
        }).catch(error => {
            this.messageService.error('提交失败: ' + error);
        });
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

    openPluginDialog(pluginData: any): void {
        // TODO: 调用PluginsComponent.openPluginDialog显示插件配置对话框
        console.log('Open plugin dialog:', pluginData);
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
}
