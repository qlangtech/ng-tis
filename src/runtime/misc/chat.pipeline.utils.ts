import {EventSourceSubject, EventType} from "../../common/tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {ColsAndMeta, Descriptor, IFieldError, Item, PluginName, TisErorsResult} from "../../common/tis.plugin";
import {InstallPluginItem} from "../../base/plugin.update.center.component";

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    managerLink?: ManagerLink;
    timestamp: number;
    type?: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs' | 'llm_chat_status' | EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS | EventType.AI_AGNET_PLUGIN_INSTALL_STATUS | EventType.AI_AGNET_TDFS_COLS_META_SETTER;
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


/**
 * 专门用于处理插件安装状态的消息类
 * 封装了插件安装相关的状态和安装任务信息
 */
export class PluginInstallStatus implements ChatMessage {
    role: 'user' | 'assistant' | 'system' = 'assistant';
    content: string;
    timestamp: number;
    type: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs' | 'llm_chat_status' | EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS | EventType.AI_AGNET_PLUGIN_INSTALL_STATUS = EventType.AI_AGNET_PLUGIN_INSTALL_STATUS;

    // 专用属性
    requestId: string;                         // 请求ID
    collapsed: boolean = false;                // 是否收缩显示
    installJobs: InstallPluginItem[] = [];                  // 插件安装任务列表
    resolved?: boolean;                        // 是否已完成

    constructor(data: any) {
        this.content = data.content || '正在安装插件...';
        this.timestamp = Date.now();
        this.requestId = data.requestId;
        this.installJobs = data.installJobs || [];
        this.resolved = data.resolved || false;
    }

    /**
     * 切换展开/收缩状态
     */
    toggleCollapse(): void {
        this.collapsed = !this.collapsed;
    }

    /**
     * 更新安装任务状态
     */
    updateInstallJobs(jobs: any[]): void {
        this.installJobs = jobs;
    }
}

/**
 * 专门用于处理文件列Schema解析设置的消息类
 * 封装了列元数据和错误信息
 */
export class ColsAndMetaStatus implements ChatMessage {
    role: 'user' | 'assistant' | 'system' = 'assistant';
    content: string;
    timestamp: number;
    type: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs' | 'llm_chat_status' | EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS | EventType.AI_AGNET_PLUGIN_INSTALL_STATUS | EventType.AI_AGNET_TDFS_COLS_META_SETTER = EventType.AI_AGNET_TDFS_COLS_META_SETTER;

    // 专用属性
    requestId: string;              // 请求ID
    dataxName: string;              // DataX管道名称
    colsAndMeta: ColsAndMeta;       // 列元数据信息
    errorInfo: TisErorsResult;      // 错误信息
    resolved?: boolean;             // 是否已完成

    private _errors: Array<IFieldError>;

    constructor(data: any) {
        this.content = data.content || '文件列Schema解析设置';
        this.timestamp = Date.now();
        this.requestId = data.requestId;
        this.dataxName = data.dataxName;
        this.colsAndMeta = data.colsAndMeta;
        this.errorInfo = data.errorInfo;
        this.resolved = data.resolved || false;

        if (!this.dataxName) {
            throw new Error("dataxName can not be null");
        }
        if (!this.colsAndMeta) {
            throw new Error("colsAndMeta can not be null");
        }
    }

    public get errors(): Array<IFieldError> {
        if (!this._errors) {
            for (let g1 of this.errorInfo.errorfields as Array<Array<Array<IFieldError>>>) {
                for (let g2 of g1) {
                    return this._errors = g2;
                }
            }
            this._errors = [];
        }
        return this._errors;
    }

}

/**
 * 专门用于处理增量进程启动状态的消息类
 * 封装了抽屉对话框相关的状态和缓存消息
 */
export class LaunchingProcessStatusMessage implements ChatMessage {
    role: 'user' | 'assistant' | 'system' = 'assistant';
    content: string;
    timestamp: number;
    type: 'text' | 'plugin' | 'error' | 'progress' | 'selection' | 'select_tabs' | 'llm_chat_status' | EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS = EventType.AI_AGNET_OPEN_LAUNCHING_PROCESS;

    // 专用属性
    pipeline: string;                           // pipeline 名称
    drawerRef?: NzDrawerRef<any>;              // 抽屉对话框引用
    isDrawerOpen: boolean = false;             // 抽屉是否打开
    cachedMessages: Array<[EventType, any]> = [];  // 缓存的历史消息
    eventSourceSubject?: EventSourceSubject;   // 事件源主题

    constructor(data: any) {
        this.content = data.content;
        this.timestamp = Date.now();
        this.pipeline = data.dataxName;
        if (!this.pipeline) {
            throw new Error("pipeline can not be null");
        }
    }

    /**
     * 添加消息到缓存
     */
    addCachedMessage(evt: [EventType, any]): void {
        this.cachedMessages.push(evt);
    }

    /**
     * 设置抽屉打开状态
     */
    setDrawerOpen(open: boolean): void {
        this.isDrawerOpen = open;
    }
}

export interface ManagerLink {
    linkAddress: string;
    linkText: string;
}

export interface SubmitInfo {
    requestId: string;
    sessionId: string;

    [key: string]: any;
}

export interface SelectionOptionData {
    prompt: string;
    options: { // fieldName: string,
        candidates: Array<CandidateDescriptorOption>
    };

    [key: string]: any
}

export interface CandidateDescriptorOption {
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
    /**
     * 不需要安装插件
     */
    disablePluginInstall: boolean;
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

export class ChatSession {
    id: string;
    title: string;
    createTime: number;
    messages: ChatMessage[];
    // 会话级别的状态
    isProcessing: boolean;  // 该会话是否正在处理
    inputText: string;      // 该会话的输入草稿
    isTyping: boolean = false;  // 是否正在打字

    // SSE 连接
    eventSource: EventSourceSubject | null = null;

    // 倒计时管理
    messageCountdowns: Map<ChatMessage, {
        startTime: number,
        remainingTime: number,
        timer?: any,
        timeout?: boolean,
        cancelled?: boolean
    }> = new Map();

    // 插件安装状态消息缓存
    pluginInstallStatusCache: Map<string, PluginInstallStatus> = new Map();

    // 消息队列相关
    pendingMessages: ChatMessage[] = [];  // 待显示的消息队列
    messageQueueTimer: any = null;        // 定时器
    messageQueueInterval: number = 1000;  // 1秒推送一条

    // 消息显示回调（用于触发滚动等操作）
    onMessageDisplayed?: () => void;

    constructor(id: string, title: string, createTime: number) {
        this.id = id;
        this.title = title;
        this.createTime = createTime;
        this.messages = [];
        this.isProcessing = false;
        this.inputText = '';
    }

    /**
     * 向当前会话添加消息（立即显示，用于用户消息等需要即时显示的场景）
     * @param message 要添加的消息
     */
    addMessage(message: ChatMessage): void {
        this.messages.push(message);
        // 触发消息显示回调（用于滚动等操作）
        this.onMessageDisplayed?.();
    }

    /**
     * 将消息加入队列（用于SSE推送的消息，避免多条消息同时闪现）
     * @param message 要排队的消息
     */
    enqueueMessage(message: ChatMessage): void {
        this.pendingMessages.push(message);
        // 如果定时器未启动，启动它
        if (!this.messageQueueTimer) {
            this.startMessageQueue();
        }
    }

    /**
     * 启动消息队列处理定时器
     */
    private startMessageQueue(): void {
        this.messageQueueTimer = setInterval(() => {
            if (this.pendingMessages.length > 0) {
                // 从队列头部取出一条消息
                const message = this.pendingMessages.shift();
                if (message) {
                    // 实际添加到显示列表
                    this.messages.push(message);
                    // 触发消息显示回调（用于滚动等操作）
                    this.onMessageDisplayed?.();
                }
            } else {
                // 队列为空，停止定时器
                this.stopMessageQueue();
            }
        }, this.messageQueueInterval);
    }

    /**
     * 停止消息队列处理定时器
     */
    private stopMessageQueue(): void {
        if (this.messageQueueTimer) {
            clearInterval(this.messageQueueTimer);
            this.messageQueueTimer = null;
        }
    }

    /**
     * 立即显示所有队列中的消息（用于特殊情况，如会话切换或销毁）
     */
    flushMessageQueue(): void {
        while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift();
            if (message) {
                this.messages.push(message);
            }
        }
        this.stopMessageQueue();
    }

    /**
     * 关闭 SSE 连接
     */
    closeConnection(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /**
     * 清理会话资源
     */
    cleanup(): void {
        // 关闭连接
        this.closeConnection();

        // 停止消息队列并清理
        this.stopMessageQueue();
        this.pendingMessages = [];

        // 清理所有倒计时
        this.messageCountdowns.forEach((countdown) => {
            if (countdown.timer) {
                clearInterval(countdown.timer);
            }
        });
        this.messageCountdowns.clear();

        // 清理插件安装状态缓存
        this.pluginInstallStatusCache.clear();
    }

    /**
     * 启动消息倒计时
     */
    startCountdown(message: ChatMessage, totalMillis: number): void {
        if (!totalMillis || message.resolved) {
            return;
        }

        const startTime = Date.now();
        const totalSeconds = Math.floor(totalMillis / 1000);

        const countdownData = {
            startTime: startTime,
            remainingTime: totalSeconds,
            timeout: false,
            timer: setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remaining = totalSeconds - elapsed;

                if (message.resolved) {
                    // 如果已经被处理，直接停止倒计时
                    this.stopCountdown(message);
                } else if (remaining <= 0) {
                    // 倒计时结束，设置超时状态
                    const cd = this.messageCountdowns.get(message);
                    if (cd) {
                        cd.remainingTime = 0;
                        cd.timeout = true;
                        clearInterval(cd.timer);
                        cd.timer = null;
                        // 设置 message 为已处理
                        message.resolved = true;
                    }
                } else {
                    const cd = this.messageCountdowns.get(message);
                    if (cd) {
                        cd.remainingTime = remaining;
                    }
                }
            }, 1000)
        };

        this.messageCountdowns.set(message, countdownData);
    }

    /**
     * 停止消息倒计时
     */
    stopCountdown(message: ChatMessage): void {
        const countdown = this.messageCountdowns.get(message);
        if (countdown && countdown.timer) {
            clearInterval(countdown.timer);
            countdown.timer = null;
        }
    }

    /**
     * 获取消息的剩余时间
     */
    getMessageRemainingTime(message: ChatMessage): number {
        const countdown = this.messageCountdowns.get(message);
        return countdown ? countdown.remainingTime : 0;
    }

    /**
     * 获取消息的倒计时状态
     */
    getMessageCountdownStatus(message: ChatMessage): 'counting' | 'completed' | 'cancelled' | 'timeout' | null {
        // 首先检查是否是需要倒计时的消息类型
        if (message.type !== 'selection' && message.type !== 'select_tabs'
            && message.type !== 'plugin' && message.type !== EventType.AI_AGNET_TDFS_COLS_META_SETTER) {
            return null;
        }

        const countdown = this.messageCountdowns.get(message);

        // 如果有倒计时信息且被取消
        if (countdown && countdown.cancelled === true) {
            return 'cancelled';
        }

        // 如果有倒计时信息且已超时
        if (countdown && countdown.timeout === true) {
            return 'timeout';
        }

        // 如果消息已处理（但不是超时也不是取消）
        if (message.resolved && (!countdown || (!countdown.timeout && !countdown.cancelled))) {
            return 'completed';
        }

        // 如果正在倒计时中（包括剩余时间为0但还未标记为超时的情况）
        if (!message.resolved && countdown && countdown.remainingTime >= 0) {
            return 'counting';
        }

        return null;
    }

    /**
     * 取消所有未完成消息的倒计时
     */
    cancelAllCountdowns(): void {
        this.messages.forEach((message) => {
            // 检查是否是需要倒计时的消息类型且尚未处理
            if ((message.type === 'selection' || message.type === 'select_tabs' || message.type === 'plugin')
                && !message.resolved) {
                // 停止倒计时
                const countdown = this.messageCountdowns.get(message);
                if (countdown) {
                    if (countdown.timer) {
                        clearInterval(countdown.timer);
                        countdown.timer = null;
                    }
                    // 设置为取消状态
                    countdown.cancelled = true;
                }
                // 标记消息为已处理
                message.resolved = true;
            }
        });
    }
}

export interface TaskTemplate {
    id: string;
    name: string;
    description: string;
    sampleText: string;
}

export interface LLMProvider {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'error';
    createTime?: number;
}
