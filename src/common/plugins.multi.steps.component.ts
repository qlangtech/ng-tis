import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy, Output
} from "@angular/core";
import {AppFormComponent, CurrentCollection} from "./basic.form.component";
import {TISService} from "./tis.service";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {
    createExtraDataXParam, Descriptor,
    HeteroList, HistorySavedStep, Item,
    MultiStepsDescriptor, PluginMeta,
    PluginSaveResponse,
    PluginType,
    SavePluginEvent
} from "./tis.plugin";
import {PluginExtraProps} from "../runtime/misc/RCDeployment";
import {DataxDTO} from "../base/datax.add.component";
import {PluginsComponent} from "./plugins.component";
import {on} from "codemirror";

export const KEY_MULTI_STEPS_SAVED_ITEMS = "multiStepsSavedItems";

@Component({
    selector: 'tis-plugins-multi-steps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="container">
            <nz-steps id="left" *ngIf="hostDesc"
                      [nzCurrent]="currentStep" nzDirection="vertical" nzSize="small">
                <nz-step *ngFor="let step of hostDesc.steps" [nzTitle]="step.name"
                         [nzDescription]="step.description"></nz-step>
            </nz-steps>
            <div id="right">
                <tis-steps-tools-bar [formDisabled]="formDisabled"
                                     [goBackBtnShow]="currentStep>0" [goOnBtnShow]="!isFinalPhase"
                                     (goOn)="createStepNext()" (goBack)="goBack()">
                    <final-exec-controller *ngIf="isFinalPhase">
                        <button [disabled]="formDisabled" nz-button nzType="primary" (click)="saveForm($event)">
                            <i nz-icon nzType="save" nzTheme="outline"></i>提交
                        </button>
                    </final-exec-controller>
                </tis-steps-tools-bar>
                <tis-plugins [savePluginEventCreator]="_savePluginEventCreator" (afterSave)="afterSave($event)"
                             [pluginMeta]="pluginCategory"
                             [savePlugin]="savePlugin" [showSaveButton]="false" [shallInitializePluginItems]="false"
                             [compactVerticalLayout]="true"
                             [_heteroList]="_hlist" #pluginComponent></tis-plugins>


            </div>
        </div>

    `,
    styles: [
        `
            .container {
                display: flex;
                flex-direction: row;
                gap: 24px;
            }

            #left {
                width: 200px;
                flex-shrink: 0;
                align-self: flex-start;
                padding: 16px;
                background-color: #fafafa;
                border-radius: 4px;
                opacity: 0.85;
            }

            #right {
                flex: 1;
                min-width: 0;
            }
        `
    ]
})
export class PluginsMultiStepsComponent extends AppFormComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    @Input()
    hostDesc: MultiStepsDescriptor
    @Output()
    afterSuccessSubmitFinalForm = new EventEmitter<PluginSaveResponse>();
    pluginCategory: Array<PluginType> = [];
    currentStep = 0;
    savePlugin = new EventEmitter<SavePluginEvent>();
    _savePluginEventCreator: () => SavePluginEvent;
    _hlist: HeteroList[] = [];
    hostPluginCategory: PluginType;

    @Input()
    stepSavedPlugin: Map<number, HistorySavedStep> = new Map;

    /**
     * 是否为编辑模式
     * true: 编辑已有插件
     * false: 添加新插件(默认)
     */
    @Input()
    editMode: boolean = false;

    // 当前是否是最后一步
    isFinalPhase: boolean = false;
    // 是否等待执行最终提交
    private pendingFinalSubmit: boolean = false;


    @Input()
    set hlist(hlist: HeteroList[]) {
        this._hlist = hlist;
        this.pluginCategory = hlist.map((h) => h.pluginCategory);
        for (let oneOf of this.pluginCategory) {
            this.hostPluginCategory = oneOf;
            break;
        }
    }


    constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
        super(tisService, route, modalService, notification);
    }


    ngOnInit() {
        super.ngOnInit();
        if (this.editMode) {
            let newCurrent: number = (this.hostDesc.steps.length - 1);
            let historyStep: HistorySavedStep = this.stepSavedPlugin.get(newCurrent);

            // 添加空值检查,确保历史步骤存在
            if (!historyStep) {
                console.error(`History step not found for index ${newCurrent}`);
                return;
            }

            this.hlist = historyStep.hlist;
            this.currentStep = newCurrent;
            this.isFinalPhase = historyStep.finalStep;
        }
    }

    protected initialize(app: CurrentCollection): void {
    }

    ngAfterContentInit(): void {
    }

    ngAfterViewInit(): void {
    }

    /**
     * 创建并提交下一步的保存事件
     * 将Map结构的历史步骤数据转换为数组格式，以便HTTP传输
     */
    createStepNext() {
        const evt: SavePluginEvent = new SavePluginEvent();
        const postStepSavedPlugin = this.convertStepSavedPluginToArray();

        evt.postPayload = {
            stepSavedPlugin: postStepSavedPlugin,
            ...this.hostDesc.stepExecContext
        };

        this.savePlugin.emit(evt);
    }

    /**
     * 将Map结构的步骤数据转换为数组
     * 数组格式：[index1, item1, index2, item2, ...]
     * 只转换已经完成的步骤（非UnWrapperPhase）
     */
    private convertStepSavedPluginToArray(): Array<any> {
        const result: Array<any> = [];

        for (const [index, hlist] of this.stepSavedPlugin) {
            if (hlist.isUnWrapperPhase) {
                continue;
            }

            result.push(index);

            const firstItem = this.getFirstItemFromHlist(hlist.hlist);
            if (firstItem) {
                result.push(firstItem);
            }
        }

        return result;
    }

    /**
     * 从HeteroList数组中获取第一个Item
     */
    private getFirstItemFromHlist(hlist: HeteroList[]): Item | null {
        for (const h of hlist) {
            for (const item of h.items) {
                return item;
            }
        }
        return null;
    }


    /**
     * 处理步骤保存后的回调
     * 该方法会在每个步骤保存成功后被调用，负责：
     * 1. 保存当前步骤到历史记录
     * 2. 准备下一步的UI和数据
     * 3. 如果是最后一步，执行最终提交
     */
    afterSave($event: PluginSaveResponse) {
        try {
            if (!$event.saveSuccess) {
                return;
            }

            this.updateStepState($event);

            // 检查是否需要执行最终提交
            if (this.pendingFinalSubmit) {
                this.executeFinalSubmit();
            }
        } finally {
            this.formDisabled = false;
        }
    }

    /**
     * 更新步骤状态
     * 使用detach/reattach来优化变更检测性能
     */
    private updateStepState($event: PluginSaveResponse) {
        this.cd.detach();
        try {
            // 以下biz内参数均在OneStepOfMultiSteps.manipuldateProcess() 方法内设置
            const biz = $event.biz();

            this.saveCurrentStepToHistory(biz);
            this.prepareNextStep(biz);
        } finally {
            this.cd.reattach();
        }
    }

    /**
     * 保存当前步骤到历史记录
     */
    private saveCurrentStepToHistory(biz: any) {
        const savePlugin: Item = biz.currentSaved;
        const currentStepIndex: number = biz["currentStepIndex"];

        for (let h of this._hlist) {
            for (let [impl, desc] of h.descriptors) {
                h.items = [desc.wrapItemVals(savePlugin)];
                this.stepSavedPlugin.set(currentStepIndex, new HistorySavedStep(this._hlist, this.isFinalPhase));
            }
            break;
        }
    }

    /**
     * 准备下一步
     * 如果有下一步，初始化下一步的UI；否则标记为最终阶段
     */
    private prepareNextStep(biz: any) {
        const nextStepIndex: number = biz["nextStepPluginIndex"];

        if (!nextStepIndex) {
            this.isFinalPhase = true;
            return;
        }

        const nextPluginDesc: Map<string, Descriptor> = Descriptor.wrapDescriptors(biz["nextStepPluginDesc"]);
        console.log(nextPluginDesc);

        const finalStep: boolean = biz["finalStep"];
        this.isFinalPhase = finalStep;

        this.initializeNextStep(nextStepIndex, nextPluginDesc);
        this.currentStep = nextStepIndex;
    }

    /**
     * 初始化下一步的UI
     * 如果该步骤之前已经访问过，则恢复历史状态；否则创建新的HeteroList
     */
    private initializeNextStep(nextStepIndex: number, nextPluginDesc: Map<string, Descriptor>) {
        const nxt = this.stepSavedPlugin.get(nextStepIndex);

        if (nxt) {
            // 恢复历史步骤
            if (nxt.isUnWrapperPhase) {
                nxt.wrapper(nextPluginDesc);
            }
            console.log(["nxt", nxt.hlist])
            this._hlist = nxt.hlist;
        } else {
            // 创建新步骤
            this._hlist = this.createNewStepHlist(nextPluginDesc);
            console.log(["nxt not exist", this._hlist, nextPluginDesc])
        }
    }

    /**
     * 创建新步骤的HeteroList
     */
    private createNewStepHlist(nextPluginDesc: Map<string, Descriptor>): HeteroList[] {
        // const nextHlist = new HeteroList();
        // nextHlist.updateDescriptor(nextPluginDesc);

        const h: HeteroList = new HeteroList();// PluginsComponent.wrapperHeteroList(nextHlist, this.hostPluginCategory);
        h.updateDescriptor(nextPluginDesc);
        h.pluginCategory = this.hostPluginCategory;
        //console.log([h,nextPluginDesc,this.hostPluginCategory]);
        for (let [key, desc] of h.descriptors) {
            h.extensionPoint = desc.extendPoint;
            break;
        }
        PluginsComponent.addDefaultItem(this.hostPluginCategory as PluginMeta, h);

        return [h];
    }

    /**
     * 执行最终提交
     */
    private executeFinalSubmit() {
        this.pendingFinalSubmit = false;
        this.submitFinalForm();
    }

    /**
     * 后退到上一步
     * 从历史记录中恢复上一步的状态
     */
    goBack() {
        const preHlist = this.stepSavedPlugin.get(--this.currentStep);
        console.log(preHlist);
        this._hlist = preHlist.hlist;
        this.isFinalPhase = preHlist.finalStep;
    }

    /**
     * 保存表单（最后一步的提交按钮）
     * 设置标志位，先保存当前步骤，然后在afterSave中执行最终提交
     */
    saveForm($event: MouseEvent) {
        // 设置标志位，表示这次保存后需要执行最终提交
        this.pendingFinalSubmit = true;
        // 触发当前步骤的保存，afterSave() 会检测 pendingFinalSubmit 并执行最终提交
        this.createStepNext();
    }

    /**
     * 提交最终表单
     * 将所有步骤的配置组装成宿主插件实例并提交到后端
     */
    private submitFinalForm() {
        // 创建宿主插件的HeteroList
        const hostHetero: HeteroList[] = [];
        const oneH = new HeteroList();
        hostHetero.push(oneH);

        // 收集所有步骤的Item
        const savedItems: Item[] = this.collectAllStepItems();

        // 创建宿主插件Item，将所有步骤Item设置到multiStepsSavedItems属性中
        const hostItem = new Item(this.hostDesc);
        hostItem.vals[KEY_MULTI_STEPS_SAVED_ITEMS] = savedItems;
        oneH.items = [hostItem];

        // 创建保存事件并提交
        const savEvt = new SavePluginEvent(true);

        PluginsComponent.postHeteroList(this, this.pluginCategory, hostHetero, savEvt, false
            , (r) => {
                // 覆盖返回结果中的multiStepsSavedItems，保持完整的步骤数据
                r.bizresult[KEY_MULTI_STEPS_SAVED_ITEMS] = savedItems;
                const response = new PluginSaveResponse(r.success, false, savEvt, r.bizresult);

                this.afterSuccessSubmitFinalForm.emit(response);
                console.log(this.afterSuccessSubmitFinalForm.observers.length);
            }).then((result) => {

        });
    }

    /**
     * 收集所有步骤的Item
     * 按步骤索引顺序组装成数组
     */
    private collectAllStepItems(): Item[] {
        let maxIdx = -1;
        for (const [idx, _] of this.stepSavedPlugin) {
            console.log(["idx:", idx]);
            if (idx >= maxIdx) {
                maxIdx = idx;
            }
        }

        const savedItems: Item[] = new Array(maxIdx + 1);
        for (const [idx, historyStored] of this.stepSavedPlugin) {
            savedItems[idx] = historyStored.savedItem;
        }

        return savedItems;
    }
}
