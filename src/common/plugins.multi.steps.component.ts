import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy
} from "@angular/core";
import {AppFormComponent, CurrentCollection} from "./basic.form.component";
import {TISService} from "./tis.service";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {
    createExtraDataXParam, Descriptor,
    HeteroList, Item,
    MultiStepsDescriptor, PluginMeta,
    PluginSaveResponse,
    PluginType,
    SavePluginEvent
} from "./tis.plugin";
import {PluginExtraProps} from "../runtime/misc/RCDeployment";
import {DataxDTO} from "../base/datax.add.component";
import {PluginsComponent} from "./plugins.component";
import {on} from "codemirror";


@Component({
    selector: 'tis-plugins-multi-steps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="container">
            <nz-steps id="left" *ngIf="stepDesc"
                      [nzCurrent]="currentStep" nzDirection="vertical" nzSize="small">
                <nz-step *ngFor="let step of stepDesc.steps" [nzTitle]="step.name"
                         [nzDescription]="step.description"></nz-step>
            </nz-steps>
            <div id="right">
                <tis-steps-tools-bar
                        [goBackBtnShow]="true" (goOn)="createStepNext()" (goBack)="goBack()">
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
    stepDesc: MultiStepsDescriptor
    pluginCategory: Array<PluginType> = [];
    currentStep = 0;
    savePlugin = new EventEmitter<SavePluginEvent>();
    _savePluginEventCreator: () => SavePluginEvent;
    _hlist: HeteroList[] = [];
    hostPluginCategory: PluginType;

    stepSavedPlugin: Map<number, Item> = new Map;

    @Input()
    set hlist(hlist: HeteroList[]) {
        this._hlist = hlist;
        this.pluginCategory = hlist.map((h) => h.pluginCategory);
        for (let oneOf of this.pluginCategory) {
            this.hostPluginCategory = oneOf;
            break;
        }
    }


    constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService) {
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
        for (let [index, item] of this.stepSavedPlugin) {
            postStepSavedPlugin.push(index);
            postStepSavedPlugin.push(item);
        }
        evt.postPayload = Object.assign({"stepSavedPlugin": postStepSavedPlugin}, this.stepDesc.stepExecContext);


        //console.log([evt,this.stepSavedPlugin,postStepSavedPlugin]);
        this.savePlugin.emit(evt);
    }

    afterSave($event: PluginSaveResponse) {
        if (!$event.saveSuccess) {
            return;
        }

        let biz = $event.biz();
        let nextPluingDesc: Map<string, Descriptor> = biz.nextStepPluginDesc;
        let finalStep: boolean = biz.finalStep;
        // 已经保存下来的第一步插件内容
        let savePlugin = biz.currentSaved;

        let currentStepIndex: number = biz["currentStepIndex"];
        let nextStepIndex: number = biz["nextStepPluginIndex"];
        this.stepSavedPlugin.set(currentStepIndex, savePlugin as Item);

        // console.log(this.stepSavedPlugin);

        let nextHlist = new HeteroList();
        nextHlist.updateDescriptor(nextPluingDesc);

        let h: HeteroList = PluginsComponent.wrapperHeteroList(nextHlist, this.hostPluginCategory);
        for (let [key, desc] of h.descriptors) {
            h.extensionPoint = desc.extendPoint;
            break;
        }
        PluginsComponent.addDefaultItem(this.hostPluginCategory as PluginMeta, h);
        this._hlist = [h];
        this.currentStep = nextStepIndex;
        // console.log(this._hlist);
        //  this.hlist = PluginsComponent.pluginDesc(desc.firstStep, stepPluginCategory);
    }

    goBack() {

    }
}
