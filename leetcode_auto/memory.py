"""跨对话共享记忆 + 历史压缩。

所有对话（刷题助手、简历优化、模拟面试）共享一份记忆文件，
记录用户画像、薄弱点、关键结论等持久化信息。

对话历史过长时，自动将旧消息压缩为摘要。
"""

import json
from typing import Optional

from .config import DATA_DIR, get_ai_config

MEMORY_FILE = DATA_DIR / "shared_memory.json"

# 压缩阈值：超过此消息数时触发压缩（约 40 轮对话）
_COMPRESS_THRESHOLD = 80
# 压缩后保留的最近消息数（约 15 轮完整对话）
_KEEP_RECENT = 30


# ---------------------------------------------------------------------------
# 共享记忆
# ---------------------------------------------------------------------------

def load_memory() -> dict:
    """加载共享记忆。"""
    if not MEMORY_FILE.exists():
        return {"entries": []}
    try:
        data = json.loads(MEMORY_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "entries" in data:
            return data
        return {"entries": []}
    except (json.JSONDecodeError, IOError):
        return {"entries": []}


def save_memory(memory: dict):
    """保存共享记忆，最多保留 30 条。"""
    entries = memory.get("entries", [])
    memory["entries"] = entries[-30:]
    MEMORY_FILE.write_text(
        json.dumps(memory, ensure_ascii=False, indent=2), encoding="utf-8")


def add_memory(text: str, source: str = ""):
    """添加一条记忆。"""
    memory = load_memory()
    memory["entries"].append({
        "text": text,
        "source": source,
    })
    save_memory(memory)


def clear_memory():
    """清空共享记忆。"""
    if MEMORY_FILE.exists():
        MEMORY_FILE.unlink()


def format_memory_for_prompt() -> str:
    """将记忆格式化为可注入 system prompt 的文本。"""
    memory = load_memory()
    entries = memory.get("entries", [])
    if not entries:
        return ""
    lines = []
    for e in entries:
        src = f"[{e['source']}] " if e.get("source") else ""
        lines.append(f"- {src}{e['text']}")
    return (
        "\n## 用户历史记忆（跨对话共享）\n"
        "以下是从之前的对话中积累的关键信息，请参考：\n"
        + "\n".join(lines)
    )


# ---------------------------------------------------------------------------
# 记忆提取：从 AI 回复中提取值得记住的信息
# ---------------------------------------------------------------------------

_EXTRACT_PROMPT = """从以下对话中提取值得长期记住的关键信息（如用户的薄弱点、学习目标、技术偏好、简历关键信息、面试表现等）。

每条信息一行，简洁明了（10-20字）。如果没有值得记住的新信息，输出"无"。
只输出信息列表，不要其他内容。

对话内容：
用户：{user_msg}
助手：{ai_reply}"""


def extract_and_save_memory(
    user_msg: str, ai_reply: str, source: str = "",
):
    """从一轮对话中提取记忆并保存。异步友好，失败静默。"""
    from .ai_analyzer import call_ai_messages

    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        return

    prompt = _EXTRACT_PROMPT.format(user_msg=user_msg[:500], ai_reply=ai_reply[:500])
    try:
        result = call_ai_messages(
            [{"role": "user", "content": prompt}],
            ai_config,
        )
        if not result or "无" in result.strip():
            return
        for line in result.strip().split("\n"):
            line = line.strip().lstrip("- ·•").strip()
            if line and len(line) > 2:
                add_memory(line, source)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# 历史压缩
# ---------------------------------------------------------------------------

_COMPRESS_PROMPT = """请将以下对话历史压缩为一段简洁的摘要（200字以内）。
保留关键信息：讨论了什么话题、得出了什么结论、用户的需求和偏好。

对话历史：
{conversation}"""


def compress_history(history: list) -> list:
    """如果历史超过阈值，压缩旧消息为摘要 + 保留最近消息。

    返回压缩后的历史列表。
    """
    if len(history) <= _COMPRESS_THRESHOLD:
        return history

    from .ai_analyzer import call_ai_messages

    ai_config = get_ai_config()
    if not ai_config["enabled"]:
        # AI 不可用，直接截断
        return history[-_KEEP_RECENT * 2:]

    # 分割：旧消息 | 保留消息
    old_messages = history[:-_KEEP_RECENT * 2]
    recent_messages = history[-_KEEP_RECENT * 2:]

    # 构建旧对话文本
    conv_text = ""
    for msg in old_messages:
        role = "用户" if msg["role"] == "user" else "助手"
        conv_text += f"{role}：{msg['content'][:200]}\n"

    try:
        summary = call_ai_messages(
            [{"role": "user", "content": _COMPRESS_PROMPT.format(conversation=conv_text[:3000])}],
            ai_config,
        )
    except Exception:
        summary = None

    if summary:
        compressed = [
            {"role": "assistant", "content": f"[历史摘要] {summary}"},
        ]
        return compressed + recent_messages
    else:
        return recent_messages
