"""简历分析与优化：LaTeX 模板、AI 分析、对话式改进。"""

import json
from pathlib import Path
from typing import Optional

from .config import DATA_DIR, get_ai_config
from .ai_analyzer import call_ai_messages

# ---------------------------------------------------------------------------
# 数据文件
# ---------------------------------------------------------------------------

RESUME_FILE = DATA_DIR / "resume_content.txt"
RESUME_ANALYSIS_FILE = DATA_DIR / "resume_analysis.json"
RESUME_CHAT_FILE = DATA_DIR / "resume_chat_history.json"

# 多简历管理
RESUMES_DIR = DATA_DIR / "resumes"
RESUMES_DIR.mkdir(parents=True, exist_ok=True)
RESUME_INDEX_FILE = DATA_DIR / "resume_index.json"


def _load_resume_index() -> dict:
    """加载简历索引 {current: "default", list: [{id, name}]}"""
    if RESUME_INDEX_FILE.exists():
        try:
            return json.loads(RESUME_INDEX_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass
    return {"current": "default", "list": [{"id": "default", "name": "默认简历"}]}


def _save_resume_index(index: dict):
    RESUME_INDEX_FILE.write_text(
        json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")


def _resume_path(resume_id: str) -> Path:
    return RESUMES_DIR / f"{resume_id}.txt"


def _analysis_path(resume_id: str) -> Path:
    return RESUMES_DIR / f"{resume_id}_analysis.json"


def _chat_path(resume_id: str) -> Path:
    return RESUMES_DIR / f"{resume_id}_chat.json"


def get_resume_list() -> dict:
    """返回简历列表和当前选中。"""
    idx = _load_resume_index()
    # 迁移：如果旧文件存在且 default 不存在
    default_path = _resume_path("default")
    if not default_path.exists() and RESUME_FILE.exists():
        import shutil
        shutil.copy2(RESUME_FILE, default_path)
        if RESUME_ANALYSIS_FILE.exists():
            shutil.copy2(RESUME_ANALYSIS_FILE, _analysis_path("default"))
        if RESUME_CHAT_FILE.exists():
            shutil.copy2(RESUME_CHAT_FILE, _chat_path("default"))
    return idx


def switch_resume(resume_id: str):
    idx = _load_resume_index()
    idx["current"] = resume_id
    _save_resume_index(idx)


def create_resume(name: str) -> str:
    idx = _load_resume_index()
    new_id = f"resume_{len(idx['list']) + 1}"
    idx["list"].append({"id": new_id, "name": name})
    idx["current"] = new_id
    _save_resume_index(idx)
    _resume_path(new_id).write_text("", encoding="utf-8")
    return new_id


def delete_resume(resume_id: str):
    if resume_id == "default":
        return
    idx = _load_resume_index()
    idx["list"] = [r for r in idx["list"] if r["id"] != resume_id]
    if idx["current"] == resume_id:
        idx["current"] = "default"
    _save_resume_index(idx)
    for p in [_resume_path(resume_id), _analysis_path(resume_id), _chat_path(resume_id)]:
        if p.exists():
            p.unlink()


def rename_resume(resume_id: str, new_name: str):
    idx = _load_resume_index()
    for r in idx["list"]:
        if r["id"] == resume_id:
            r["name"] = new_name
            break
    _save_resume_index(idx)

# ---------------------------------------------------------------------------
# LaTeX 简历模板
# ---------------------------------------------------------------------------

RESUME_TEMPLATE = """# 张三

> `138-0000-0000` &emsp; `zhangsan@example.com` &emsp; [GitHub](https://github.com/zhangsan) &emsp; [LinkedIn](https://linkedin.com/in/zhangsan)

## 教育经历

<div alt="entry-title">
    <h3>XX 大学 - 硕士 - 计算机科学与技术</h3>
    <p>2022.09 - 2025.06</p>
</div>

- GPA：3.8 / 4.0，一等学业奖学金（前 5%），校级优秀毕业生
- 核心课程：高级算法、分布式系统、数据库内核、机器学习

<div alt="entry-title">
    <h3>XX 大学 - 学士 - 软件工程</h3>
    <p>2018.09 - 2022.06</p>
</div>

- GPA：3.6 / 4.0

## 工作经历

<div alt="entry-title">
    <h3>后端开发工程师（实习） - XX 科技有限公司</h3>
    <p>2024.06 - 2024.09</p>
</div>

技术栈：Go / MySQL / Redis / Kafka

- 主导用户中心微服务重构，将单体服务拆分为 5 个独立模块，接口 QPS 提升 40%
- 设计基于 Redis + Lua 的分布式限流方案，稳定支撑日均 500 万次 API 调用
- 定位并优化 12 条慢查询 SQL，核心接口 P99 延迟从 800ms 降至 120ms

## 项目经历

<div alt="entry-title">
    <h3>分布式键值存储引擎</h3>
    <a href="https://github.com/zhangsan/kv-engine">github.com/zhangsan/kv-engine</a>
</div>

个人项目 · Go / Raft / LSM-Tree / gRPC（2024.03 - 2024.05）

- 基于 Raft 共识算法实现 3 节点数据复制，支持自动选主、日志压缩和快照恢复
- 存储层采用 LSM-Tree + WAL 架构，写入吞吐量达 10 万 ops/s
- 完整单元测试 + 混沌测试（网络分区、节点宕机），代码覆盖率 85%

<div alt="entry-title">
    <h3>BrushUp — LeetCode 刷题助手</h3>
    <a href="https://github.com/zhangsan/brushup">github.com/zhangsan/brushup</a>
</div>

开源项目 · Python / ECharts / GraphQL / AI（2025.01 - 至今）

- 自动同步 LeetCode 刷题记录，基于间隔重复算法推送复习计划
- 接入 AI 对比官方题解，自动分析代码复杂度并给出优化建议
- 交互式 Web 看板，涵盖进度追踪、数据可视化、AI 对话

## 专业技能

- **编程语言**：Go, Python, Java, C++, SQL, JavaScript / TypeScript
- **框架 / 中间件**：Gin, Spring Boot, React, gRPC, Protobuf
- **基础设施**：MySQL, Redis, Kafka, Docker, Kubernetes, Linux
- **工具链**：Git, GitHub Actions, Prometheus, Grafana, Nginx
- **算法能力**：LeetCode Hot100 × 5 轮，ACM 省赛银牌
"""

# ---------------------------------------------------------------------------
# 简历存取
# ---------------------------------------------------------------------------


def _current_id() -> str:
    return _load_resume_index().get("current", "default")


_MAX_VERSIONS = 20


def _versions_dir(resume_id: str) -> Path:
    d = RESUMES_DIR / f"{resume_id}_versions"
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_resume(content: str):
    """保存当前简历内容，同时存版本快照。"""
    rid = _current_id()
    p = _resume_path(rid)
    # 保存版本快照（只在内容有变化时）
    old = p.read_text(encoding="utf-8") if p.exists() else ""
    if content.strip() and content.strip() != old.strip():
        from datetime import datetime
        vdir = _versions_dir(rid)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        (vdir / f"{ts}.txt").write_text(content, encoding="utf-8")
        # 清理旧版本
        versions = sorted(vdir.glob("*.txt"))
        while len(versions) > _MAX_VERSIONS:
            versions.pop(0).unlink()
    p.write_text(content, encoding="utf-8")


def get_resume_versions() -> list:
    """返回当前简历的版本列表 [{ts, preview}]。"""
    vdir = _versions_dir(_current_id())
    versions = []
    for f in sorted(vdir.glob("*.txt"), reverse=True):
        text = f.read_text(encoding="utf-8")
        preview = text[:80].replace("\n", " ")
        ts = f.stem  # 20250324_153000
        display = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]} {ts[9:11]}:{ts[11:13]}:{ts[13:15]}"
        versions.append({"file": f.name, "display": display, "preview": preview})
    return versions


def restore_resume_version(filename: str) -> str:
    """恢复指定版本。"""
    vdir = _versions_dir(_current_id())
    p = vdir / filename
    if p.exists():
        content = p.read_text(encoding="utf-8")
        _resume_path(_current_id()).write_text(content, encoding="utf-8")
        return content
    return ""


def load_resume() -> str:
    """加载当前简历内容。"""
    p = _resume_path(_current_id())
    if p.exists():
        return p.read_text(encoding="utf-8")
    return ""


def save_analysis(analysis: dict):
    """保存当前简历分析结果。"""
    _analysis_path(_current_id()).write_text(
        json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8")


def load_analysis() -> dict:
    """加载当前简历分析结果。"""
    p = _analysis_path(_current_id())
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass
    return {}


# ---------------------------------------------------------------------------
# 简历对话历史
# ---------------------------------------------------------------------------

_MAX_RESUME_HISTORY = 30


def load_resume_chat() -> list:
    p = _chat_path(_current_id())
    if not p.exists():
        return []
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []


def save_resume_chat(history: list):
    from .memory import compress_history
    compressed = compress_history(history)
    trimmed = compressed[-_MAX_RESUME_HISTORY * 2:]
    _chat_path(_current_id()).write_text(
        json.dumps(trimmed, ensure_ascii=False, indent=2), encoding="utf-8")


def clear_resume_chat():
    p = _chat_path(_current_id())
    if p.exists():
        p.unlink()


# ---------------------------------------------------------------------------
# AI 分析
# ---------------------------------------------------------------------------

_ANALYSIS_SYSTEM = """你是一位资深技术招聘专家和简历顾问，擅长帮助程序员优化简历。

请从以下维度分析这份简历，给出具体、可操作的建议：

### 整体评分（满分 100）
给出一个总分和简短评语。

### 内容分析
1. **个人信息**：联系方式是否完整、专业
2. **教育背景**：是否突出了相关课程和成绩
3. **工作/实习经历**：是否用 STAR 法则描述，是否量化了成果
4. **项目经历**：是否体现技术深度和解决问题能力
5. **技能清单**：是否与目标岗位匹配，排列是否合理

### 格式与排版
- 长度是否合适（建议 1 页）
- 要点是否精炼（每条 1-2 行）
- 是否有拼写/语法错误

### 亮点
列出 2-3 个简历中做得好的地方。

### 改进建议
按优先级列出 3-5 条具体的改进建议，每条说明：
- 当前问题
- 修改方向
- 修改示例（如适用）

请用中文回答，简洁专业。"""

_CHAT_SYSTEM = """你是一位资深技术招聘专家和简历顾问。用户正在优化他们的简历，请帮助他们改进。

用户当前的简历内容：
---
{resume}
---

{analysis_context}

请根据用户的问题给出具体、可操作的建议。用中文回答。

重要规则：当用户要求你修改简历内容时（如"帮我改写工作经历"、"优化项目描述"等），你必须：
1. 先简要说明你做了什么修改
2. 然后输出完整的修改后简历，用以下标记包裹：

```resume
（这里是完整的修改后简历 Markdown 内容）
```

注意：```resume 标记内必须是完整简历，不能只有片段。用户的简历是 Markdown 格式。"""


def analyze_resume(content: str) -> Optional[str]:
    """AI 分析简历，返回分析文本。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return None

    messages = [{"role": "user", "content": f"请分析以下简历：\n\n{content}"}]
    return call_ai_messages(messages, ai_config, system=_ANALYSIS_SYSTEM)


def chat_resume(user_message: str, history: list,
                resume_content: str, analysis_text: str = "") -> Optional[str]:
    """简历优化对话。自动注入共享记忆。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return None

    from .memory import format_memory_for_prompt, extract_and_save_memory

    analysis_ctx = ""
    if analysis_text:
        analysis_ctx = f"之前的 AI 分析结果：\n{analysis_text[:2000]}"

    system = _CHAT_SYSTEM.format(
        resume=resume_content[:4000],
        analysis_context=analysis_ctx,
    )
    memory_text = format_memory_for_prompt()
    if memory_text:
        system += memory_text

    messages = list(history)
    messages.append({"role": "user", "content": user_message})
    reply = call_ai_messages(messages, ai_config, system=system)

    if reply:
        try:
            extract_and_save_memory(user_message, reply, source="简历优化")
        except Exception:
            pass

    return reply


# ---------------------------------------------------------------------------
# 面试题生成 & 模拟面试
# ---------------------------------------------------------------------------

INTERVIEW_FILE = DATA_DIR / "interview_questions.json"
INTERVIEW_CHAT_FILE = DATA_DIR / "interview_chat_history.json"

_INTERVIEW_GEN_SYSTEM = """你是一位资深技术面试官。请根据候选人的简历，生成一份有针对性的面试题清单。

要求：
1. 题目必须紧扣简历中的项目经历、技术栈和工作内容
2. 按类别分组，每组 3-5 题
3. 标注难度（基础 / 进阶 / 深挖）
4. 包含以下类别：
   - **项目深挖**：针对简历中每个项目的细节追问
   - **技术原理**：考察简历中提到的核心技术的底层原理
   - **系统设计**：基于简历经验出的设计题
   - **算法编程**：与简历技术栈相关的算法题
   - **行为面试**：团队协作、挑战、成长类问题

请按以下 Markdown 格式输出：

## 项目深挖
1. **[基础]** 题目内容
2. **[进阶]** 题目内容
...

## 技术原理
...

用中文回答。"""

_MOCK_INTERVIEW_SYSTEM = """你是一位严格但友善的技术面试官，正在面试候选人。

候选人的简历：
---
{resume}
---

面试规则：
1. 每次只问一个问题，等候选人回答后再继续
2. 根据候选人的回答进行追问，不断深挖
3. 如果回答不够好，给出提示引导，不要直接给答案
4. 如果回答得好，给予肯定并过渡到下一个问题
5. 结合简历中的项目和技术栈来提问
6. 适当穿插基础原理、系统设计、行为面试等不同类型的问题
7. 保持对话自然流畅，像真实面试一样

现在开始面试。先简短自我介绍（一句话），然后提出第一个问题。"""


def generate_interview_questions(resume_content: str) -> Optional[str]:
    """根据简历生成面试题列表。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return None

    messages = [{"role": "user", "content": f"请根据以下简历生成面试题：\n\n{resume_content}"}]
    result = call_ai_messages(messages, ai_config, system=_INTERVIEW_GEN_SYSTEM)
    if result:
        INTERVIEW_FILE.write_text(
            json.dumps({"questions": result}, ensure_ascii=False, indent=2),
            encoding="utf-8")
    return result


def load_interview_questions() -> str:
    if INTERVIEW_FILE.exists():
        try:
            data = json.loads(INTERVIEW_FILE.read_text(encoding="utf-8"))
            return data.get("questions", "")
        except (json.JSONDecodeError, IOError):
            pass
    return ""


def load_interview_chat() -> list:
    if not INTERVIEW_CHAT_FILE.exists():
        return []
    try:
        data = json.loads(INTERVIEW_CHAT_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []


def save_interview_chat(history: list):
    from .memory import compress_history
    compressed = compress_history(history)
    trimmed = compressed[-60:]
    INTERVIEW_CHAT_FILE.write_text(
        json.dumps(trimmed, ensure_ascii=False, indent=2), encoding="utf-8")


def clear_interview_chat():
    if INTERVIEW_CHAT_FILE.exists():
        INTERVIEW_CHAT_FILE.unlink()


def chat_interview(user_message: str, history: list,
                   resume_content: str) -> Optional[str]:
    """模拟面试对话。自动注入共享记忆。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return None

    from .memory import format_memory_for_prompt, extract_and_save_memory

    system = _MOCK_INTERVIEW_SYSTEM.format(resume=resume_content[:4000])
    memory_text = format_memory_for_prompt()
    if memory_text:
        system += memory_text

    messages = list(history)
    messages.append({"role": "user", "content": user_message})
    reply = call_ai_messages(messages, ai_config, system=system)

    if reply:
        try:
            extract_and_save_memory(user_message, reply, source="模拟面试")
        except Exception:
            pass

    return reply


# ---------------------------------------------------------------------------
# 面试评估报告
# ---------------------------------------------------------------------------

INTERVIEW_REPORT_FILE = DATA_DIR / "interview_report.json"

_REPORT_SYSTEM = """你是面试评估专家。请根据以下模拟面试的完整对话，生成一份结构化的评估报告。

请严格按以下格式输出：

## 总评
- 综合评分：X / 10
- 一句话总结

## 各维度评分

| 维度 | 评分 | 评语 |
|------|------|------|
| 项目深挖 | X/10 | 简短评语 |
| 技术原理 | X/10 | 简短评语 |
| 系统设计 | X/10 | 简短评语 |
| 算法编程 | X/10 | 简短评语 |
| 沟通表达 | X/10 | 简短评语 |
| 应变能力 | X/10 | 简短评语 |

## 亮点
- 列出 2-3 个回答得好的地方

## 需改进
- 列出 3-5 个需要加强的地方，附具体建议

## 推荐复习
- 基于面试暴露的薄弱点，推荐 3-5 个需要复习的知识点

用中文回答。"""


def generate_interview_report(history: list) -> Optional[str]:
    """根据面试对话生成评估报告。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"] or not history:
        return None

    conv = ""
    for m in history:
        role = "面试官" if m["role"] == "assistant" else "候选人"
        conv += f"{role}：{m['content']}\n\n"

    messages = [{"role": "user", "content": f"请根据以下面试对话生成评估报告：\n\n{conv}"}]
    result = call_ai_messages(messages, ai_config, system=_REPORT_SYSTEM)
    if result:
        INTERVIEW_REPORT_FILE.write_text(
            json.dumps({"report": result}, ensure_ascii=False, indent=2),
            encoding="utf-8")
    return result


def load_interview_report() -> str:
    if INTERVIEW_REPORT_FILE.exists():
        try:
            return json.loads(INTERVIEW_REPORT_FILE.read_text(encoding="utf-8")).get("report", "")
        except (json.JSONDecodeError, IOError):
            pass
    return ""
