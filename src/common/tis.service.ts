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

import {EventEmitter, Injectable, NgZone, Type} from '@angular/core';

import {CurrentCollection, WSMessage} from './basic.form.component';
import {Observable, Observer, Subject} from "rxjs";
// @ts-ignore
import * as NProgress from 'nprogress/nprogress.js';
import {NzNotificationService} from "ng-zorro-antd/notification";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {SavePluginEvent, TisResponseResult} from "./tis.plugin";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {ErrorDetailComponent} from "../base/error.detail.component";
import {TISBaseProfile} from "./navigate.bar.component";
import {LocalStorageService} from "./local-storage.service";
import {LatestSelectedIndex} from "./LatestSelectedIndex";
import {ConfirmType, ModalOptions, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {ActivatedRoute, Router} from "@angular/router";
import {openParamsCfg, TargetPluginCfg} from "./plugins.component";
import {SelectedTabDTO} from "./selectedtab/plugin-sub-form.component";
import {FreshmanReadmeComponent} from "./freshman.readme.component";

declare var TIS: any;

export const WS_CLOSE_MSG = 'event_close_ws';
//result = result.set('appname', this.currApp.appName);
//       result = result.set('appid', '' + this.currApp.appid);
export const KEY_APPNAME = 'appname';

export const KEY_APP_ID = 'appid';

export enum SystemError {
    FLINK_INSTANCE_LOSS_OF_CONTACT = 'FLINK_INSTANCE_LOSS_OF_CONTACT',
    FLINK_SESSION_CLUSTER_LOSS_OF_CONTACT = 'FLINK_SESSION_CLUSTER_LOSS_OF_CONTACT',
    POWER_JOB_CLUSTER_LOSS_OF_CONTACT = 'POWER_JOB_CLUSTER_LOSS_OF_CONTACT',
    // TIS 刚打开时候还没有阅读新人指南
    TIS_FRESHMAN_README_HAVE_NOT_READ = 'TIS_FRESHMAN_README_HAVE_NOT_READ',
    HTTP_CONNECT_FAILD = 'HTTP_CONNECT_FAILD',
    LICENSE_INVALID = 'LICENSE_INVALID'
}

// "errCode":{
//   "code":"FLINK_SESSION_CLUSTER_LOSS_OF_CONTACT",
//     "payload":{
//     "targetName":"flink-cluster"
//   }
// },

interface ErrorVal {
    code: SystemError;
    payload: [string: any]
}

export interface TISCoreService {
    httpPost(url: string, body: string, e?: SavePluginEvent): Promise<TisResponseResult>;

    openDialog(component: any, options: ModalOptions<any>): NzModalRef<any>

    openConfirmDialog<T>(options?: ModalOptions<T>, confirmType?: ConfirmType): NzModalRef<T>;
}

export function createFreshmanReadmeDialogStrategy(okEventEmitter: EventEmitter<any>, cancelEventEmitter: EventEmitter<any>): SysErrorRestoreStrategy {
    return {
        title: "🎉 欢迎加入TIS数据集成大家庭！",
        okText: "已经了解了(不再显示)",
        cancelText: "稍后再看",
        modelContent: FreshmanReadmeComponent,
        onOKExec: okEventEmitter,
        isInfo: true,
        onCancel: cancelEventEmitter,
        afterSuccessRestore: (errVal) => {
            // this.router.navigate(["/base/flink-cluster-list"], {relativeTo: this.route});
            // console.log([this.router]);
            // console.log('afterSuccessRestore');
        }
    }
}

export function createSystemErrorProcessDialogModelOptions(sysErrorRestoreStrategy: SysErrorRestoreStrategy, errContent: string): ModalOptions {
    let config: ModalOptions = {
        nzWidth: 500,
        nzClosable: false,
        nzTitle: sysErrorRestoreStrategy.title,
        nzContent: sysErrorRestoreStrategy.modelContent || errContent,
        nzOkText: sysErrorRestoreStrategy.okText,
        nzCancelText: sysErrorRestoreStrategy.cancelText,
        nzOnOk: sysErrorRestoreStrategy.onOKExec,

        // nzOnCancel: null,
        // nzAfterClose: null,
    }

    if (sysErrorRestoreStrategy.onCancel) {
        config.nzOnCancel = sysErrorRestoreStrategy.onCancel;
    }
    return config;
}

// @ts-ignore
@Injectable()
export class TISService implements TISCoreService {
    // 导航栏头部的应用是否可以选择？
    // private appSelectable: boolean = false;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
    // https://medium.com/@lwojciechowski/websockets-with-angular2-and-rxjs-8b6c5be02fac
    // private socket: Subject<MessageEvent>;
    private currApp: CurrentCollection;
    public execId: string;
    private _tisMeta: TISBaseProfile;
    private _selectedTab: SelectedTabDTO;
    private _test: boolean = false;

    public static openSysErrorDetail(drawerService: NzDrawerService, showErrlistLink: boolean, logFileName: string) {
        const drawerRef = drawerService.create<ErrorDetailComponent, {}, {}>({
            nzWidth: "70%",
            nzPlacement: "right",
            nzTitle: "系统异常",
            nzContent: ErrorDetailComponent,
            nzWrapClassName: 'get-gen-cfg-file',
            nzContentParams: {logFileName: logFileName, showErrlistLink: showErrlistLink}
        });
    }

    constructor(protected http: HttpClient, private router: Router, private route: ActivatedRoute
        , private modalService: NzModalService
        , public notification: NzNotificationService, private drawerService: NzDrawerService, public _zone: NgZone, private _localStorageService: LocalStorageService) {
    }

    public openDialog(component: any, options: ModalOptions<any>): NzModalRef<any> {

        let option: ModalOptions = {
            // nzTitle: title,
            nzWidth: "800px",
            nzContent: component,
            nzFooter: null,
            nzMaskClosable: false
        };
        return this.modalService.create(Object.assign(option, options));
    }

    public openConfirmDialog<T>(options?: ModalOptions<T>, confirmType?: ConfirmType): NzModalRef<T> {
        return this.modalService.confirm(options, confirmType);
    }

    // public set tisMeta(meta: TISBaseProfile) {
    //   //console.log(["tisMeta",meta]);
    //   this._tisMeta = meta;
    // }

    // public get containMeta(): boolean {
    //   return !!this._tisMeta;
    // }

    public get test(): boolean {
        return this._test;
    }

    public set test(val: boolean) {
        this._test = val;
    }

    public get tisMeta(): Promise<TISBaseProfile> {
        // console.log(["getTisMeta", this._tisMeta]);
        if (!this._tisMeta) {
            // throw new Error("_tisMeta can not be null");

            let webExecuteCallback = (r: TisResponseResult): TisResponseResult => {
                // NProgress.done();
                return r;
            }
            let getUserUrl = `/runtime/applist.ajax`;
            return this.httpPost(getUserUrl, 'emethod=get_user_info&action=user_action').then(webExecuteCallback).then((r) => {
                // console.log(r);
                if (r.success) {

                    let biz: TISBaseProfile = r.bizresult;
                    let selectedApps: LatestSelectedIndex = LatestSelectedIndex.popularSelectedIndex(biz, this._localStorageService);
                    this._tisMeta = Object.assign(biz, {
                        latestSelectedAppsIndex: () => {
                            return selectedApps;
                        }
                    });
                    return this._tisMeta;
                }
                // else {
                //   //  r.errormsg
                //   const {logFileName, errorVal, errCode, errContent} = this.parseError(r);
                //   if(errCode === SystemError.TIS_FRESHMAN_README_HAVE_NOT_READ){
                //
                //   }
                // }
            });
        }
        return new Promise((resolve) => {
            resolve(this._tisMeta);
        });
    }

    // 一个websocket的例子 https://tutorialedge.net/post/typescript/angular/angular-websockets-tutorial/
    // 创建websocket
    public wsconnect(url: string): Subject<MessageEvent> {
        // if (!this.socket) {
        let socket = this.wscreate(url);
        // }
        return socket;
    }

    get selectedTab(): SelectedTabDTO {
        return this._selectedTab;
    }

    set selectedTab(value: SelectedTabDTO) {
        this._selectedTab = value;
    }

    private wscreate(url: string): Subject<MessageEvent> {
        let ws = new WebSocket(url);
        let observable = Observable.create(
            (obs: Observer<MessageEvent>) => {
                ws.onmessage = obs.next.bind(obs);
                // ws.onerror = obs.error.bind(obs);
                // TODO： 奇怪 这里接收不到onError的消息，这个后期需要查一下
                //       ws.onerror = function () {
                // console.log("error");
                //       };
                ws.onclose = obs.complete.bind(obs);
                return ws.close.bind(ws);
            }
        );
        let observer = {
            next: (data: WSMessage) => {
                if (data.logtype === WS_CLOSE_MSG) {
                    ws.close();
                    return;
                }
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            },
        };
        return Subject.create(observer, observable);
    }


    // 是否是日常环境
    public get daily(): boolean {
        return TIS.daily;
    }

    // 通过部门id
    public getIndexListByDptId(dptid: number): Promise<any> {

        return this.http.get<TisResponseResult>('/tjs' + '/runtime/changedomain.ajax?event_submit_do_select_change=y&action=change_domain_action&bizid=' + dptid)
            .toPromise()
            .then(response => response.bizresult as any)
            .catch(this.handleError);
    }

    public set currentApp(currApp: CurrentCollection) {
        // console.log("currentApp");
        //   let err = new Error();
        //   console.log(err.stack);
        // console.log(currApp);
        this.currApp = currApp;
    }

    public get currentApp(): CurrentCollection {
        return this.currApp;
    }

// 发送http post请求
    public httpPost(url: string, body: string, e?: SavePluginEvent): Promise<TisResponseResult> {

        let headers = new HttpHeaders();
        headers = headers.append('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        headers = this.appendHeaders(headers, e);
        let params: HttpParams = new HttpParams();
        let indexOf = url.indexOf('?');
        if (indexOf > -1) {
            let ps = url.substr(indexOf + 1);
            let pArray: string[] = ps.split("&");
            pArray.forEach((r) => {
                let kv: string[] = r.split("=");
                params = params.append(kv[0], kv[1]);
            });
        }
        let opts = {'headers': headers, 'params': params};
        return this.http.post<TisResponseResult>('/tjs' + url, body, opts)
            .toPromise()
            .then((response) => {
                // console.log(response);
                let result = this.processResult(response, e);
                if (result) {
                    return result;
                }
                return Promise.reject(response);
            }).catch(this.handleError);
    }

    protected appendHeaders(headers: HttpHeaders, e: SavePluginEvent): HttpHeaders {
        let result = headers;
        // console.log(this.currApp);
        if (this.currApp && this.currApp.appName) {
            result = result.set(KEY_APPNAME, this.currApp.appName);
            result = result.set(KEY_APP_ID, '' + this.currApp.appid);
        }
        if (this.execId) {
            result = result.set("execId", this.execId);
        }
        if (e && e.overwriteHttpHeader) {
            e.overwriteHttpHeader.forEach((val, key) => {
                result = result.set(key, val);
            });
        }
        // console.log([e, result]);
        return result;
        // return headers;
    }


    // 发送json表单
    public jsonPost(url: string, body: any, e?: SavePluginEvent): Promise<TisResponseResult> {
        let headers = new HttpHeaders();
        headers = headers.set('content-type', 'text/json; charset=UTF-8');
        let opts = {'headers': this.appendHeaders(headers, e)};
        //  console.log(opts);
        return this.http.post<TisResponseResult>('/tjs' + url, body, opts).pipe()
            .toPromise()
            // @ts-ignore
            .then((response) => {
                let result = this.processResult(response, e);
                if (result) {
                    return result;
                } else {
                    return response;
                }
                // return () => Promise.reject(response);
            }).catch(this.handleError);
    }

    public jsonp(url: string): Promise<TisResponseResult> {

        return this.http.jsonp('/tjs' + url, "callback").pipe().toPromise()
            .then(response => {
                let tisResult: TisResponseResult = {success: true, bizresult: response};
                return tisResult;
            }).catch(this.handleError)
    }

    public jPost(url: string, o: any): Promise<TisResponseResult> {
        return this.jsonPost(url, JSON.stringify(o));
    }

    protected parseError(result: TisResponseResult): {
        "logFileName": string[],
        "errorVal": ErrorVal,
        "errCode": SystemError,
        "errContent": string
    } {
        // faild
        let errs: Array<any> = result.errormsg;
        let logFileName: string[];
        let errorVal: ErrorVal = null;
        let errCode: SystemError = null;
        let errContent = '<ul class="list-ul-msg">' + errs.map((r) => {
            if (typeof r === 'string') {
                return `<li>${r}</li>`
            } else if (typeof r === 'object') {
                // {
                //   "logFileName":"20220504130948886",
                //   "message":"IllegalStateException: xxxxxxxxxxxxxxxxxxxxx"
                // }
                if (r.errCode) {
                    errorVal = r.errCode;
                    errCode = SystemError[errorVal.code];
                    if (!errCode) {
                        throw new Error("invalid errCode:" + r.errCode);
                    }
                    errorVal.code = errCode;
                }
                logFileName = [r.logFileName];
                return `<li><a>详细</a> ${r.message}  </li>`
            } else {
                throw new Error('illegal type:' + r);
            }
        }).join('') + '</ul>';
        return {"logFileName": logFileName, "errorVal": errorVal, "errCode": errCode, "errContent": errContent};
    }

    public processResult(result: TisResponseResult, e?: SavePluginEvent): TisResponseResult {
        // console.log(result);
        if (result.success) {
            // console.log([result.msg, e, (result.msg && result.msg.length > 0) , ( e === undefined || !e.notShowBizMsg) , ( (e === undefined) || !e.createOrGetNotebook)]);
            if ((result.msg && result.msg.length > 0)
                && (e === undefined || !e.notShowBizMsg)) {
                //   console.log([result.msg, this.notification]);
                let msgContent = '<ul class="list-ul-msg">' + result.msg.map((r) => `<li>${r}</li>`).join('') + '</ul>';
                this.notification.create('success', '成功', msgContent, {nzDuration: 6000});
            }
            return result;
        } else {


            // 在页面上显示错误
            if (!!result.action_error_page_show) {
                return result;
            }

            // faild
            // let errs: Array<any> = result.errormsg;
            //  let logFileName: string[];
            // let errorVal: ErrorVal = null;
            // let errCode: SystemError = null;
            //  let errContent = '<ul class="list-ul-msg">' + errs.map((r) => {
            //    if (typeof r === 'string') {
            //      return `<li>${r}</li>`
            //    } else if (typeof r === 'object') {
            //      // {
            //      //   "logFileName":"20220504130948886",
            //      //   "message":"IllegalStateException: xxxxxxxxxxxxxxxxxxxxx"
            //      // }
            //      if (r.errCode) {
            //        errorVal = r.errCode;
            //        errCode = SystemError[errorVal.code];
            //        if (!errCode) {
            //          throw new Error("invalid errCode:" + r.errCode);
            //        }
            //        errorVal.code = errCode;
            //      }
            //      logFileName = [r.logFileName];
            //      return `<li><a>详细</a> ${r.message}  </li>`
            //    } else {
            //      throw new Error('illegal type:' + r);
            //    }
            //  }).join('') + '</ul>';

            const {logFileName, errorVal, errCode, errContent} = this.parseError(result);


            if (errCode) {
                // console.log(errCode);
                let sysErrorRestoreStrategy: SysErrorRestoreStrategy = null;
                let mref: NzModalRef = null;
                let okEventEmitter = new EventEmitter<any>();
                switch (errCode) {
                    case SystemError.HTTP_CONNECT_FAILD: {
                        break;
                    }
                    case SystemError.LICENSE_INVALID: {
                        let licenseOKEventEmitter = new EventEmitter<any>();
                        licenseOKEventEmitter.subscribe(() => {
                            // console.log("licenseOKEventEmitter");
                            openParamsCfg( new TargetPluginCfg("License"), '', null, this);
                            if (mref) {
                                mref.close();
                            }
                        });
                        sysErrorRestoreStrategy = {
                            title: "License实效",
                            okText: "配置",
                            cancelText: "等等再说",
                            onOKExec: licenseOKEventEmitter,
                            afterSuccessRestore: (errVal) => {
                                console.log(errVal);
                                // this.router.navigate(["/x", errVal.payload[KEY_APPNAME]], {relativeTo: this.route});
                            }
                        }
                        break;
                    }
                    case SystemError.FLINK_INSTANCE_LOSS_OF_CONTACT: {

                        sysErrorRestoreStrategy = {
                            title: "服务端Flink服务已经失联，是否要重新创建增量通道？",
                            okText: "重新创建",
                            cancelText: "等等再说",
                            onOKExec: okEventEmitter,
                            afterSuccessRestore: (errVal) => {
                                this.router.navigate(["/x", errVal.payload[KEY_APPNAME]], {relativeTo: this.route});
                            }
                        }

                        break;
                    }
                    case SystemError.FLINK_SESSION_CLUSTER_LOSS_OF_CONTACT: {
                        sysErrorRestoreStrategy = {
                            title: "服务端Flink Session服务已经失联，是否要重新创建？",
                            okText: "重新创建",
                            cancelText: "等等再说",
                            onOKExec: okEventEmitter,
                            afterSuccessRestore: (errVal) => {
                                this.router.navigate(["/base/flink-cluster-list"], {relativeTo: this.route});
                            }
                        }
                        break;
                    }
                    case SystemError.TIS_FRESHMAN_README_HAVE_NOT_READ: {
                        let cancelEventEmitter = new EventEmitter<any>();
                        let refreshComponent = () => {
                            // 刷新当前页面
                            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                                console.log(this.router.url);
                                this.router.navigate([this.router.url]);
                            });
                        };
                        cancelEventEmitter.subscribe((next) => {
                            // 当前时间加1个星期
                            if (mref) {
                                let cfg = mref.getConfig();
                                cfg.nzOkLoading = true;
                                errorVal.payload["remindMeLater"] = true;
                                TISService.restoreExcpetion(this, errorVal)
                                    .then((r) => {
                                        mref.close();
                                        refreshComponent();
                                    }).finally(() => {
                                    cfg.nzOkLoading = false;
                                });
                            }
                        })
                        sysErrorRestoreStrategy = createFreshmanReadmeDialogStrategy(okEventEmitter, cancelEventEmitter);
                        sysErrorRestoreStrategy.afterSuccessRestore = refreshComponent;
                        break;
                    }
                    case SystemError.POWER_JOB_CLUSTER_LOSS_OF_CONTACT: {
                        sysErrorRestoreStrategy = {
                            title: "PowerJob服务已经失联，是否要重新创建？",
                            okText: "重新创建",
                            cancelText: "等等再说",
                            onOKExec: okEventEmitter,
                            afterSuccessRestore: (errVal) => {
                                // https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
                                this.router.navigateByUrl('/', {skipLocationChange: true})
                                    .then(() => {
                                        this.router.navigate(["/base/datax-worker"]);
                                    });
                            }
                        }
                        break;
                    }
                    default:
                        throw new Error("invalid errorCode:" + errCode);
                }

                if (sysErrorRestoreStrategy) {
                    okEventEmitter.subscribe((ist) => {
                        if (mref) {
                            let cfg = mref.getConfig();
                            cfg.nzOkLoading = true;
                            TISService.restoreExcpetion(this, errorVal)
                                .then((r) => {
                                    sysErrorRestoreStrategy.afterSuccessRestore(errorVal);
                                    // TODO 页面重定向
                                    //  this.router.navigate(["/x", this.currApp.appName], {relativeTo: this.route});
                                    mref.close();
                                }).finally(() => {
                                cfg.nzOkLoading = false;
                            });
                        }
                    });
                    let config = createSystemErrorProcessDialogModelOptions(sysErrorRestoreStrategy, errContent);
                    // if(sysErrorRestoreStrategy.afterClose){
                    //   config.nzOnCancel = sysErrorRestoreStrategy.afterClose;
                    // }

                    mref = sysErrorRestoreStrategy.isInfo
                        ? this.modalService.create(config)
                        : this.modalService.error(config);
                } else {
                    this.defaultSystemErrorHandle(errContent, logFileName);
                }


            } else {
                // console.log(errContent);
                this.defaultSystemErrorHandle(errContent, logFileName);
            }

            if (result.errorfields && result.errorfields.length > 0) {
                return result;
            }
            // return result;
        }
    }

    private defaultSystemErrorHandle(errContent: string, logFileName: string[]) {
        let nref = this.notification.create('error', '错误', errContent, {nzDuration: 6000, nzStyle: {width: "600px"}})
        nref.onClick.subscribe((ee) => {
            let pe = <PointerEvent>ee;
            let target: any = pe.target;
            if (target.nodeName === 'A') {
                // console.log(logFileName);
                // this.drawerService.create()
                TISService.openSysErrorDetail(this.drawerService, true, logFileName[0]);
            }
        })
    }

    public static channelDelete(tisService: TISService): Promise<TisResponseResult> {
        return tisService.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_delete=y&action=core_action").then((r) => {
            if (r.success) {
                return r;
            }
        });
    }

    /**
     * 恢复系统异常
     * @param tisService
     * @private
     */
    private static restoreExcpetion(tisService: TISService, errorVal: ErrorVal): Promise<TisResponseResult> {

        let params = "event_submit_do_exception_restore=y&action=collection_action&errorCode=" + errorVal.code;
        for (let key in errorVal.payload) {
            params += ('&' + key + "=" + errorVal.payload[key]);
        }

        return tisService.httpPost('/config/addapp.ajax', params).then((r) => {
            if (r.success) {
                return r;
            }
        });
    }

    protected handleError = (error: any): Promise<any> => {
        console.log(error);
        if (error instanceof HttpErrorResponse) {
            let err: HttpErrorResponse = error;
            this.notification.create('error', '错误', `系统发生错误，请联系系统管理员<br> ${err.message} <br> ${err.error} `, {
                nzPlacement: 'topLeft',
                nzDuration: 60000,
                nzStyle: {width: "800px"}
            });
        }
        // console.log(this);

        NProgress.done();
        // console.log(error);
        return Promise.reject(error.message || error);
    }

    /**
     * https://dev.to/icolomina/subscribing-to-server-sent-events-with-angular-ee8
     *
     * 好奇 zone.js 的作用
     * https://medium.com/@chrisbautistaaa/server-sent-events-in-angular-node-908830cc29aa
     * @param sseUrl
     */
    public createEventSource(targetResName: string, sseUrl: string, focuse?: EventType[]): EventSourceSubject {

        const eventSource = new EventSource("/tjs" + sseUrl);
        // console.log("onmessage");

        return new EventSourceSubject(targetResName, eventSource
            , new Observable(observer => {

                eventSource.onmessage = (event: MessageEvent) => {
                    this._zone.run(() => {
                        // console.log(event.data);
                        const messageData: MessageData = JSON.parse(event.data);
                        observer.next([EventType.LOG_MESSAGE, messageData]);
                    });
                };

                if (focuse) {
                    focuse.forEach((evtType) => {
                        eventSource.addEventListener(evtType, (event: MessageEvent) => {
                            try {
                                const messageData = JSON.parse(event.data);
                                observer.next([evtType, messageData]);
                            } catch (e) {
                                console.log(['catch err', e])
                            }
                        }, false);
                    });
                }

                eventSource.addEventListener(EventType.TASK_MILESTONE, (event: MessageEvent) => {
                    try {
                        const messageData: ExecuteStep = JSON.parse(event.data);
                        observer.next([EventType.TASK_MILESTONE, messageData]);
                    } catch (e) {
                        console.log(['catch err', e])
                    }
                }, false);
                //
                //
                eventSource.addEventListener(EventType.TASK_EXECUTE_STEPS, (event: MessageEvent) => {
                    try {
                        const messageData: ExecuteMultiSteps = JSON.parse(event.data);
                        observer.next([EventType.TASK_EXECUTE_STEPS, messageData]);
                    } catch (e) {
                        console.log(['catch err', e])
                    }
                }, false);


                eventSource.onerror = (event) => {
                    this._zone.run(() => {
                        console.log(event);
                        // 服务端colse也会在客户端trigger error 消息
                        //throw new Error();
                        // console.log(["receive error", event]);
                        //  observer.error(event);

                        observer.next([EventType.SSE_CLOSE, event]);
                        eventSource.close();
                        observer.complete();
                    });
                }


            }));


    }
}


export interface SysErrorRestoreStrategy {
    title: string;
    okText: string;
    cancelText: string;
    modelContent?: Type<any>
    onCancel?: EventEmitter<any>,
    afterClose?: EventEmitter<any>,
    onOKExec: EventEmitter<any>;
    /**
     * 是否是普通通知
     */
    isInfo?: boolean,
    afterSuccessRestore: (errVal: ErrorVal) => void
};

export class EventSourceSubject {
    constructor(public targetResName: string, private eventSource: EventSource
        , private observable: Observable<[EventType, ExecuteMultiSteps | MessageData | ExecuteStep | Event]>) {

    }

    public close(): void {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    public get events(): Observable<[EventType, ExecuteMultiSteps | MessageData | ExecuteStep | Event]> {
        return this.observable;
    }
}

export enum EventType {
    TASK_MILESTONE = 'taskMilestone',
    TASK_EXECUTE_STEPS = "executeSteps",
    LOG_MESSAGE = 'message',
    SSE_CLOSE = 'sseClose',

    /**
     * AI AGENT relevant
     */
        // 开始 打开启动增量通道启动执行进度对话框
    AI_AGNET_OPEN_LAUNCHING_PROCESS = 'ai_agent_open_launching_process',
    /**
     * 当执行tdfs（非rdbms）同步mysql（rdbms）类型的场景
     * 只有在reader为非rdbms，writer为rdbms的情况下进入该component设置
     * ColsMetaSetter
     */
    AI_AGNET_TDFS_COLS_META_SETTER = 'ai_agent_tdfs_cols_meta_setter',
    AI_AGNET_INPUT_REQUEST = 'ai_agent_input_request',
    AI_AGNET_MESSAGE = 'ai_agent_message',
    AI_AGNET_TOKEN = 'ai_agent_token',
    AI_AGNET_PROGRESS = 'ai_agent_progress',
    AI_AGNET_PLUGIN = 'ai_agent_plugin',
    AI_AGNET_ERROR = 'ai_agent_error',
    // 选表
    AI_AGNET_SELECT_TABS = 'ai_agent_select_tabs',
    // 选择使用插件类型 mysql-v5 or mysql-v8
    AI_AGNET_SELECTION_REQUEST = 'ai_agent_selection_request',
    // 大模型调用状态
    AI_AGNET_LLM_CHAT_STATUS = 'ai_agent_llm_chat_status',
    AI_AGNET_DONE = 'ai_agent_done',
    // 插件安装进度展示
    AI_AGNET_PLUGIN_INSTALL_STATUS = ("ai_agent_plugin_install_status")
}

export interface MessageData {
    level: string;
    time: number;
    msg: string;
}


export interface ExecuteMultiSteps {
    taskName: string,
    steps: Array<ExecuteStep>
}

export class ExecuteStep {
    name: string;
    describe: string;
    complete: boolean;
    success: boolean;

    _processing: boolean = false;

    get processIcon(): string {
        return this._processing ? 'loading' : null;
    }
}
