"""AI 代码分析：对比用户提交与官方题解，给出优化建议。

支持 Claude (Anthropic) 和 OpenAI 两种 Provider，通过环境变量配置：
    AI_PROVIDER=claude|openai
    AI_API_KEY=sk-xxx
    AI_MODEL=claude-sonnet-4-20250514  (可选，留空用默认)
    AI_BASE_URL=https://...            (可选，自定义 API 地址)
"""

import json
import re
from typing import Optional

import requests

from .config import get_ai_config, LEETCODE_API_URL

# ---------------------------------------------------------------------------
# 获取 LeetCode 官方题解
# ---------------------------------------------------------------------------

_SOLUTION_QUERY = """
query questionSolution($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        title
        translatedTitle
        difficulty
        content
        translatedContent
        topicTags { name translatedName }
        solution { content }
    }
}
"""


def fetch_official_solution(
    session: str, csrf: str, title_slug: str,
) -> dict:
    """获取题目描述和官方题解。"""
    headers = {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.cn",
        "Cookie": f"LEETCODE_SESSION={session}; csrftoken={csrf}",
        "x-csrftoken": csrf,
    }
    payload = {
        "query": _SOLUTION_QUERY,
        "variables": {"titleSlug": title_slug},
    }
    try:
        resp = requests.post(
            LEETCODE_API_URL, json=payload, headers=headers, timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        q = data.get("data", {}).get("question") or {}
        solution_content = ""
        sol = q.get("solution")
        if sol and sol.get("content"):
            solution_content = sol["content"]
        # 清理 HTML 标签，保留文本
        clean = re.sub(r"<[^>]+>", "", solution_content)
        return {
            "title": q.get("translatedTitle") or q.get("title", ""),
            "difficulty": q.get("difficulty", ""),
            "tags": [
                t.get("translatedName") or t.get("name", "")
                for t in (q.get("topicTags") or [])
            ],
            "solution_text": clean[:3000],  # 截断避免 token 过多
            "has_solution": bool(solution_content),
        }
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# AI 调用（统一接口）
# ---------------------------------------------------------------------------

_ANALYSIS_PROMPT = """你是一个算法优化专家。请对比分析用户的 LeetCode 提交代码，给出具体的优化建议。

## 题目信息
- 题目：{title}
- 难度：{difficulty}
- 分类：{tags}
- 用户代码语言：{lang}
- 运行时间：{runtime}（击败 {runtime_pct:.1f}% 用户）
- 内存使用：{memory}（击败 {memory_pct:.1f}% 用户）

## 用户提交的代码
```{lang_lower}
{user_code}
```

{solution_section}

## 请按以下格式输出分析（严格使用这些标记）：

### 时间复杂度
当前：O(?)
最优：O(?)

### 空间复杂度
当前：O(?)
最优：O(?)

### 问题分析
（简要指出用户代码中影响性能的 1-3 个关键问题）

### 优化建议
（给出具体的优化方向和思路，不需要写完整代码，但要足够具体让用户能据此改进）

### 优化后代码
```{lang_lower}
（写出优化后的完整代码）
```

请用中文回答，简洁直接。"""


def _build_prompt(opt: dict, solution_info: dict) -> str:
    """构建分析 prompt。"""
    solution_section = ""
    if solution_info.get("has_solution"):
        solution_section = (
            "## 官方题解参考\n"
            f"{solution_info['solution_text'][:2000]}\n"
        )
    else:
        solution_section = "（无官方题解，请基于算法知识分析）"

    tags = ", ".join(solution_info.get("tags", [])) or opt.get("category", "")

    return _ANALYSIS_PROMPT.format(
        title=opt.get("title", ""),
        difficulty=solution_info.get("difficulty", ""),
        tags=tags,
        lang=opt.get("lang", ""),
        lang_lower=(opt.get("lang") or "").lower(),
        runtime=opt.get("runtime", "N/A"),
        runtime_pct=opt.get("runtime_pct", 0) or 0,
        memory=opt.get("memory", "N/A"),
        memory_pct=opt.get("memory_pct", 0) or 0,
        user_code=opt.get("code", ""),
        solution_section=solution_section,
    )


def _call_claude(prompt: str, config: dict) -> Optional[str]:
    """调用 Claude API。"""
    base_url = config.get("base_url") or "https://api.anthropic.com/v1"
    url = f"{base_url.rstrip('/')}/messages"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": config["api_key"],
        "anthropic-version": "2023-06-01",
    }
    payload = {
        "model": config["model"],
        "max_tokens": 2000,
        "messages": [{"role": "user", "content": prompt}],
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("content", [])
        if content and content[0].get("type") == "text":
            return content[0]["text"]
    except Exception as e:
        print(f"   Claude API 调用失败: {e}")
    return None


def _call_openai(prompt: str, config: dict) -> Optional[str]:
    """调用 OpenAI API。"""
    base_url = config.get("base_url") or "https://api.openai.com/v1"
    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config['api_key']}",
    }
    payload = {
        "model": config["model"],
        "max_tokens": 2000,
        "messages": [{"role": "user", "content": prompt}],
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content")
    except Exception as e:
        print(f"   OpenAI API 调用失败: {e}")
    return None


def call_ai(prompt: str, config: dict) -> Optional[str]:
    """根据 provider 调用对应的 AI API。"""
    provider = config.get("provider", "")
    if provider == "claude":
        return _call_claude(prompt, config)
    elif provider == "openai":
        return _call_openai(prompt, config)
    return None


# ---------------------------------------------------------------------------
# 主入口
# ---------------------------------------------------------------------------


def analyze_code(
    opt: dict,
    session: str,
    csrf: str,
) -> Optional[str]:
    """对一道题的用户代码进行 AI 分析，返回分析文本。

    opt: check_optimization_potential 返回的字典（含 code, title_slug 等）。
    返回 AI 分析的 Markdown 文本，失败返回 None。
    """
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return None

    # 获取官方题解
    title_slug = opt.get("title_slug", "")
    solution_info = {}
    if title_slug:
        solution_info = fetch_official_solution(session, csrf, title_slug)

    prompt = _build_prompt(opt, solution_info)
    return call_ai(prompt, ai_config)


def batch_analyze(
    optimizations: list,
    session: str,
    csrf: str,
) -> list:
    """批量分析多道题的代码，返回带 ai_analysis 字段的列表。"""
    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return optimizations

    for opt in optimizations:
        if opt.get("ai_analysis"):
            continue  # 已有分析，跳过
        title = opt.get("title", "")
        print(f"   AI 分析中：{title}...")
        analysis = analyze_code(opt, session, csrf)
        if analysis:
            opt["ai_analysis"] = analysis
            print(f"   {title} 分析完成")
        else:
            print(f"   {title} 分析失败")
    return optimizations
