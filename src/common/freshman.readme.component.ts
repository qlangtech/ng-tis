
import {Component, OnInit} from "@angular/core";


@Component({
  selector: "full-build-history",
  template: `
    <div class="welcome-dialog">
      <div class="header">
        <p>开启您的数据集成之旅，让数据流动更简单高效</p>
      </div>

      <div class="content">
        <!-- 新人指南 -->
        <div class="guide-section">
          <div class="section-title">
            <h2>🚀新人快速启航</h2>
          </div>
          <ul class="link-list">
            <li><a href="https://tis.pub/docs/install/tis/uber" target="_blank">→ 3分钟极速安装指南</a></li>
<!--            <li><a href="https://tis.pub/core-concepts" target="_blank">→ 核心概念图解（数据源/管道/任务）</a></li>-->
            <li><a href="https://tis.pub/docs/example/mysql-sync-doris/" target="_blank">→ 创建第一条数据管道实战(MySQL->Doris)</a>
               <br/>
              <blibli videoId="BV1eh4y1o7yQ">批量</blibli>
              <blibli videoId="BV1nX4y1h7SW">实时增量</blibli>
            </li>

            <li><a href="https://tis.pub/docs/#tis%E6%94%AF%E6%8C%81%E7%9A%84%E7%AB%AF%E7%B1%BB%E5%9E%8B" target="_blank">→ 了解TIS支持的数据端类型</a></li>

<!--            <li><a href="https://tis.pub/faq" target="_blank">→ 新手避坑指南（高频问题解答）</a></li>-->
          </ul>
        </div>

        <!-- 使用进阶 -->
        <div class="guide-section">
          <div class="section-title">
            <h2>🌟技能进阶之路</h2>
          </div>
          <ul class="link-list">
<!--            <li><a href="https://tis.pub/advanced-config" target="_blank">→ 企业级配置最佳实践</a></li>-->
<!--            <li><a href="https://tis.pub/performance-optimization" target="_blank">→ 性能调优秘籍</a></li>-->
            <li><a href="https://tis.pub/docs/develop/plugin-develop-detail" target="_blank">→ 自定义插件开发指南</a> &nbsp; <a href="https://tis.pub/docs/develop/plugin-develop" target="_blank">→ 开发流程说明</a></li>
            <li><a href="https://tis.pub/docs/install/powerjob/k8s/" target="_blank">→ 单机版本扩展到分布式集群部署方案</a></li>
            <li><a href="https://tis.pub/docs/install/integer-dolphinscheduler/" target="_blank">→ 与Apache DolphinScheduler整合</a></li>
          </ul>
        </div>
      </div>
    </div>

  `,
  styles: [
    `
    `
  ]
})
export class FreshmanReadmeComponent  implements OnInit {
    ngOnInit(): void {
    }
}
