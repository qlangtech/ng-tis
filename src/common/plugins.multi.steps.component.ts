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
        // this._savePluginEventCreator = () => {
        //   let evt = new SavePluginEvent();
        //   evt.overwriteHttpHeaderOfAppName(this.dto.dataxPipeName);
        //   return evt;
        // };
        //  let eprops: PluginExtraProps = this.dto.writerDescriptor.eprops;
        //   let extraParam = createExtraDataXParam(this.dto.dataxPipeName) ;
        //   extraParam += (',' + DataxDTO.KEY_PROCESS_MODEL + '_' + this.dto.processModel);
        //   this.pluginCategory = {
        //     name: 'dataxWriter', require: true, extraParam: extraParam
        //     , descFilter: {
        //     //  endType: () => eprops.endType,
        //       localDescFilter: (_) => true
        //     }
        //   };

        super.ngOnInit();
    }

    protected initialize(app: CurrentCollection): void {
    }

    ngAfterContentInit(): void {
    }

    ngAfterViewInit(): void {
    }

    createStepNext() {
        let evt: SavePluginEvent = new SavePluginEvent();
        let postStepSavedPlugin: Array<any> = [];
        // 因为Map数据结构无法http上传
        for (let [index, hlist] of this.stepSavedPlugin) {
            if (!hlist.isUnWrapperPhase) {
                postStepSavedPlugin.push(index);
                aa: for (let h of hlist.hlist) {
                    for (let item of h.items) {
                        postStepSavedPlugin.push(item);
                        break aa;
                    }
                }
            }


        }
        evt.postPayload = Object.assign({"stepSavedPlugin": postStepSavedPlugin}, this.hostDesc.stepExecContext);


        //console.log([evt,this.stepSavedPlugin,postStepSavedPlugin]);
        this.savePlugin.emit(evt);
    }


    afterSave($event: PluginSaveResponse) {
        // console.log($event);
        try {
            if (!$event.saveSuccess) {
                return;
            }
            try {
                this.cd.detach();
                // 以下biz内参数均在OneStepOfMultiSteps.manipuldateProcess() 方法内设置
                let biz = $event.biz();


                // 已经保存下来的第一步插件内容
                let savePlugin: Item = biz.currentSaved;

                let currentStepIndex: number = biz["currentStepIndex"];
                let nextStepIndex: number = biz["nextStepPluginIndex"];
                for (let h of this._hlist) {
                    for (let [impl, desc] of h.descriptors) {
                        // let savedItem = Object.assign(new Item(desc), savePlugin);
                        // savedItem.wrapItemVals();
                        // h.items = [savedItem];
                        h.items = [desc.wrapItemVals(savePlugin)];
                        // console.log(savedItem);
                        this.stepSavedPlugin.set(currentStepIndex, new HistorySavedStep(this._hlist, this.isFinalPhase));
                    }
                    break;
                }

                if (nextStepIndex) {

                    let nextPluingDesc: Map<string, Descriptor> = Descriptor.wrapDescriptors(biz["nextStepPluginDesc"]);
                    console.log(nextPluingDesc);
                    let finalStep: boolean = biz["finalStep"];
                    this.isFinalPhase = finalStep;
                    // 如果还有下一步的话，尝试初始化
                    let nxt = this.stepSavedPlugin.get(nextStepIndex);
                    if (nxt) {
                        if (nxt.isUnWrapperPhase) {
                            nxt.wrapper(nextPluingDesc);
                        }
                        this._hlist = nxt.hlist;
                    } else {
                        // console.log(this.stepSavedPlugin);
                        let nextHlist = new HeteroList();
                        nextHlist.updateDescriptor(nextPluingDesc);

                        let h: HeteroList = PluginsComponent.wrapperHeteroList(nextHlist, this.hostPluginCategory);
                        for (let [key, desc] of h.descriptors) {
                            h.extensionPoint = desc.extendPoint;
                            break;
                        }
                        PluginsComponent.addDefaultItem(this.hostPluginCategory as PluginMeta, h);
                        // console.log(h);
                        this._hlist = [h];
                    }
                    this.currentStep = nextStepIndex;
                    // console.log(this._hlist);
                    //  this.hlist = PluginsComponent.pluginDesc(desc.firstStep, stepPluginCategory);
                } else {
                    this.isFinalPhase = true;
                }


            } finally {
                this.cd.reattach();
            }

            // 检查是否需要执行最终提交
            if (this.pendingFinalSubmit) {
                this.pendingFinalSubmit = false;
                this.submitFinalForm();
            }
        } finally {
            this.formDisabled = false;
        }
    }

    goBack() {
        let preHlist = this.stepSavedPlugin.get(--this.currentStep);
        console.log(preHlist);
        this._hlist = preHlist.hlist;
        this.isFinalPhase = preHlist.finalStep;
    }

    saveForm($event: MouseEvent) {
        // 设置标志位，表示这次保存后需要执行最终提交
        this.pendingFinalSubmit = true;
        // 触发当前步骤的保存，afterSave() 会检测 pendingFinalSubmit 并执行最终提交
        this.createStepNext();
    }

    private submitFinalForm() {
        // 最后一步需要向主host plugin提交记录
        let hostHetero: HeteroList[] = [];
        let oneH = new HeteroList();
        hostHetero.push(oneH);

        let maxIdx = -1;
        for (let [idx, _] of this.stepSavedPlugin) {
            console.log(["idx:", idx]);
            if (idx >= maxIdx) {
                maxIdx = idx;
            }
        }
        let savedItems: Item[] = new Array(maxIdx + 1);
        for (let [idx, historyStored] of this.stepSavedPlugin) {
            savedItems[idx] = historyStored.savedItem;
        }
        let hostItem = new Item(this.hostDesc);
        hostItem.vals[KEY_MULTI_STEPS_SAVED_ITEMS] = savedItems;
        oneH.items = [hostItem];
        //savedItems;

        let savEvt = new SavePluginEvent(true);

        PluginsComponent.postHeteroList(this, this.pluginCategory, hostHetero, savEvt, false
            , (r) => {

                // 覆盖掉
                r.bizresult[KEY_MULTI_STEPS_SAVED_ITEMS] = savedItems;
                let response = new PluginSaveResponse(r.success, false, savEvt, r.bizresult);

                this.afterSuccessSubmitFinalForm.emit(response);
                console.log(this.afterSuccessSubmitFinalForm.observers.length);
            }).then((result) => {

        });
    }
}
