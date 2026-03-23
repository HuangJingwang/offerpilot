<div align="center">

# OfferPilot

**刷题、复习、简历，一个工具搞定。**

[![Python](https://img.shields.io/badge/Python-3.9+-3776ab?logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)]()

自动同步 LeetCode 刷题记录，间隔复习不遗漏，AI 分析代码质量，顺便还能帮你改简历。

</div>

---

## 它能做什么

**刷题方面：**
- 自动拉取 LeetCode CN 的 AC 记录，不用手动打卡
- 每题 5 轮间隔复习（1/3/7/14 天），到期自动提醒
- AI 对比官方题解，指出你的代码哪里可以更优，给出改进版本
- 15 个算法分类的掌握度雷达图，薄弱点一目了然

**简历方面：**
- 提供 LaTeX 简历模板
- AI 逐项分析简历内容，给出修改建议
- 可以根据简历生成面试题，AI 模拟面试官逐题追问

## 快速开始

```bash
git clone https://github.com/HuangJingwang/offerpilot.git
cd leetcode_auto && pip install -e .

leetcode           # 首次运行：登录 + 同步
leetcode --web     # 打开 Web 看板
```

## Web 看板

`leetcode --web` 会在浏览器中打开一个本地看板，包含以下页面：

| 页面 | 内容 |
|:-----|:-----|
| 总览 | 统计卡片、今日推荐、完成率仪表盘、各轮进度、分类雷达、热力图 |
| AI 对话 | 基于你的刷题数据回答问题，推荐题目、制定计划 |
| 进度表 | Hot100 完整进度，支持搜索和筛选 |
| 待复习 | 今日到期的复习题目 |
| 打卡记录 | 每日打卡时间线 + 趋势图 |
| 代码优化 | AI 代码分析：复杂度对比、优化建议、改进代码 |
| 简历优化 | 简历分析 + 面试题生成 + 模拟面试 |

支持中英文切换，后台同步后自动刷新。

## 主要特点

### AI 代码分析

同步时自动检测提交的 runtime/memory 百分位。表现不理想的题目，AI 会获取官方题解进行对比，输出复杂度分析、具体问题和改进后的代码。

### 间隔复习

| R1 | R2 (+1天) | R3 (+3天) | R4 (+7天) | R5 (+14天) |
|:--:|:---------:|:---------:|:---------:|:----------:|
| 首次做题 | 次日巩固 | 短期记忆 | 中期巩固 | 长期记忆 |

自动追踪每道题的完成日期，每天告诉你该复习哪些题。

### 跨场景记忆

刷题对话、简历分析、模拟面试之间共享记忆。比如面试中发现某个知识点不熟，这个信息会被记住，之后刷题时 AI 会针对性推荐相关题目。对话过长时自动压缩为摘要，不丢上下文。

### 后台运行

```bash
leetcode --daemon 1h             # 每小时自动同步
leetcode --remind-daemon         # 每天定时推送复习提醒
```

注册一次即可，关终端不影响。macOS / Linux / Windows 均支持。

## AI 配置

在 `~/.leetcode_auto/.env` 中添加（支持 OpenAI / Claude / 兼容接口）：

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-xxx
AI_MODEL=gpt-4o              # 可选
AI_BASE_URL=https://...      # 可选
```

不配置 AI 也能正常使用刷题同步和看板功能。

## 全部命令

```
leetcode                   同步今日刷题 + AI 分析
leetcode --web             Web 看板
leetcode --chat            AI 对话（终端）
leetcode --status          终端进度面板
leetcode --heatmap         刷题热力图
leetcode --optimize        待优化题目
leetcode --weakness        薄弱点分析
leetcode --report          每周报告
leetcode --badge           SVG 进度徽章
leetcode --login           重新登录
leetcode --daemon <spec>   后台同步（30m / 1h / 23:00 / status / stop）
leetcode --remind          今日待刷/待复习
leetcode --remind-daemon   每日通知（start / status / stop）
```

## FAQ

<details>
<summary><b>Cookie 过期了怎么办？</b></summary>
运行 <code>leetcode --login</code> 重新登录即可。
</details>

<details>
<summary><b>对话记录会保存吗？</b></summary>
会。三个场景（刷题/简历/面试）各自保存历史，共享跨场景记忆。历史过长时自动压缩。
</details>

<details>
<summary><b>Web 看板需要联网吗？</b></summary>
需要加载 ECharts 等 CDN 资源，刷题数据在本地。AI 功能需要联网。
</details>

## Contributing

欢迎提交 Issue 和 Pull Request。

## License

[MIT](LICENSE) &copy; 2025 OfferPilot
