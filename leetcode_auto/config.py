import json
import os
import shutil
from pathlib import Path

from dotenv import load_dotenv

DATA_DIR = Path(os.getenv("LEETCODE_AUTO_DIR", os.path.expanduser("~/.leetcode_auto")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(DATA_DIR / ".env")

LEETCODE_API_URL = "https://leetcode.cn/graphql/"
COOKIES_FILE = DATA_DIR / "cookies.json"

# 数据文件统一存放在 DATA_DIR/data 下，不再在桌面创建文件
_OLD_PLAN_DIR = Path(os.path.expanduser("~/Desktop/刷题计划"))
PLAN_DIR = Path(os.getenv("PLAN_DIR", str(DATA_DIR / "data")))
PROGRESS_FILE = PLAN_DIR / "01_Hot100_进度表.md"
CHECKIN_FILE = PLAN_DIR / "02_每日打卡.md"
DASHBOARD_FILE = PLAN_DIR / "03_进度看板.md"
OPTIMIZE_FILE = PLAN_DIR / "04_优化建议.md"


# AI 分析配置（支持 claude / openai）
AI_PROVIDER = os.getenv("AI_PROVIDER", "").lower()         # "claude" or "openai"
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "")                       # 留空则使用默认模型
AI_BASE_URL = os.getenv("AI_BASE_URL", "")                 # 自定义 API 地址（可选）


def get_ai_config() -> dict:
    """返回 AI 配置，含默认模型。"""
    provider = AI_PROVIDER
    model = AI_MODEL
    if not model:
        if provider == "claude":
            model = "claude-sonnet-4-20250514"
        elif provider == "openai":
            model = "gpt-4o"
    return {
        "provider": provider,
        "api_key": AI_API_KEY,
        "model": model,
        "base_url": AI_BASE_URL,
        "enabled": bool(provider and AI_API_KEY),
    }


def migrate_from_desktop():
    """如果旧桌面目录有数据而新目录没有，自动迁移。"""
    if not _OLD_PLAN_DIR.exists():
        return
    if PLAN_DIR.exists() and any(PLAN_DIR.iterdir()):
        return
    PLAN_DIR.mkdir(parents=True, exist_ok=True)
    migrated = []
    for f in _OLD_PLAN_DIR.iterdir():
        if f.is_file():
            shutil.copy2(f, PLAN_DIR / f.name)
            migrated.append(f.name)
    if migrated:
        print(f"已从桌面迁移刷题数据：{', '.join(migrated)}")
        print(f"新数据目录：{PLAN_DIR}")
        print(f"桌面旧文件可手动删除：{_OLD_PLAN_DIR}\n")


def load_credentials() -> dict:
    """加载凭证，优先从 cookies.json 读取，回退到 .env。"""
    if COOKIES_FILE.exists():
        try:
            data = json.loads(COOKIES_FILE.read_text(encoding="utf-8"))
            if data.get("LEETCODE_SESSION"):
                return {
                    "username": data.get("username", ""),
                    "session": data["LEETCODE_SESSION"],
                    "csrf": data.get("csrftoken", ""),
                }
        except (json.JSONDecodeError, KeyError):
            pass

    return {
        "username": os.getenv("LEETCODE_USERNAME", ""),
        "session": os.getenv("LEETCODE_SESSION", ""),
        "csrf": os.getenv("CSRF_TOKEN", ""),
    }
