import {BasicFormComponent} from "./basic.form.component";
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
            <span class="icon">🚀</span>
            <h2>新人快速启航</h2>
          </div>
          <ul class="link-list">
            <li><a href="https://tis.pub/quick-start" target="_blank">→ 3分钟极速安装指南</a></li>
            <li><a href="https://tis.pub/core-concepts" target="_blank">→ 核心概念图解（数据源/管道/任务）</a></li>
            <li><a href="https://tis.pub/first-pipeline" target="_blank">→ 创建第一条数据管道实战</a></li>
            <li><a href="https://tis.pub/faq" target="_blank">→ 新手避坑指南（高频问题解答）</a></li>
          </ul>
        </div>

        <!-- 分隔装饰 -->
        <div class="divider">
          <div class="line"></div>
          <div class="tis-logo">TIS</div>
          <div class="line"></div>
        </div>

        <!-- 使用进阶 -->
        <div class="guide-section">
          <div class="section-title">
            <span class="icon">🌟</span>
            <h2>技能升级之路</h2>
          </div>
          <ul class="link-list">
            <li><a href="https://tis.pub/advanced-config" target="_blank">→ 企业级配置最佳实践</a></li>
            <li><a href="https://tis.pub/performance-optimization" target="_blank">→ 性能调优秘籍</a></li>
            <li><a href="https://tis.pub/plugin-development" target="_blank">→ 自定义插件开发指南</a></li>
            <li><a href="https://tis.pub/cluster-deployment" target="_blank">→ 分布式集群部署方案</a></li>
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
