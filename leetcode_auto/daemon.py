"""后台守护：注册/卸载系统级定时任务，关终端也不影响。

macOS  → LaunchAgent (~/Library/LaunchAgents/)
Linux  → systemd user timer (~/.config/systemd/user/)
Windows → schtasks
"""

import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

from .config import DATA_DIR

SERVICE_ID = "com.leetforge.sync"
LOG_FILE = DATA_DIR / "sync.log"


def _find_leetcode_bin() -> str:
    """找到 leetcode 可执行文件的绝对路径。"""
    which = shutil.which("leetcode")
    if which:
        return str(Path(which).resolve())
    return f"{sys.executable} -m leetcode_auto.sync"


# ---------------------------------------------------------------------------
# macOS: LaunchAgent
# ---------------------------------------------------------------------------

_PLIST_DIR = Path.home() / "Library" / "LaunchAgents"
_PLIST_FILE = _PLIST_DIR / f"{SERVICE_ID}.plist"


def _plist_content(hour: int, minute: int) -> str:
    lc_bin = _find_leetcode_bin()
    if " " in lc_bin:
        parts = lc_bin.split()
        program_args = "\n".join(f"        <string>{p}</string>" for p in parts)
    else:
        program_args = f"        <string>{lc_bin}</string>"

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{SERVICE_ID}</string>

    <key>ProgramArguments</key>
    <array>
{program_args}
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>{hour}</integer>
        <key>Minute</key>
        <integer>{minute}</integer>
    </dict>

    <key>StandardOutPath</key>
    <string>{LOG_FILE}</string>
    <key>StandardErrorPath</key>
    <string>{LOG_FILE}</string>

    <key>RunAtLoad</key>
    <false/>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>{os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin")}</string>
    </dict>
</dict>
</plist>"""


def _install_macos(hour: int, minute: int):
    _PLIST_DIR.mkdir(parents=True, exist_ok=True)
    _unload_macos(quiet=True)
    _PLIST_FILE.write_text(_plist_content(hour, minute), encoding="utf-8")
    subprocess.run(["launchctl", "load", str(_PLIST_FILE)], check=True)
    print(f"已注册 macOS LaunchAgent，每天 {hour:02d}:{minute:02d} 自动同步。")
    print(f"日志文件：{LOG_FILE}")
    print(f"配置文件：{_PLIST_FILE}")


def _unload_macos(quiet: bool = False):
    if _PLIST_FILE.exists():
        subprocess.run(["launchctl", "unload", str(_PLIST_FILE)],
                       capture_output=True)
        _PLIST_FILE.unlink()
        if not quiet:
            print("已卸载 macOS LaunchAgent，后台同步已停止。")
    elif not quiet:
        print("未找到已注册的定时任务。")


def _status_macos():
    result = subprocess.run(
        ["launchctl", "list"],
        capture_output=True, text=True,
    )
    for line in result.stdout.splitlines():
        if SERVICE_ID in line:
            parts = line.split()
            pid = parts[0] if parts[0] != "-" else "待触发"
            print(f"状态：已注册")
            print(f"进程：{pid}")
            print(f"配置：{_PLIST_FILE}")
            print(f"日志：{LOG_FILE}")
            _print_last_log()
            return
    print("状态：未注册（运行 leetcode --daemon HH:MM 来启用）")


# ---------------------------------------------------------------------------
# Linux: systemd user timer
# ---------------------------------------------------------------------------

_SYSTEMD_DIR = Path.home() / ".config" / "systemd" / "user"
_SERVICE_FILE = _SYSTEMD_DIR / "leetforge-sync.service"
_TIMER_FILE = _SYSTEMD_DIR / "leetforge-sync.timer"


def _install_linux(hour: int, minute: int):
    lc_bin = _find_leetcode_bin()
    _SYSTEMD_DIR.mkdir(parents=True, exist_ok=True)

    _SERVICE_FILE.write_text(
        f"[Unit]\n"
        f"Description=LeetForge daily sync\n"
        f"\n"
        f"[Service]\n"
        f"Type=oneshot\n"
        f"ExecStart={lc_bin}\n"
        f"StandardOutput=append:{LOG_FILE}\n"
        f"StandardError=append:{LOG_FILE}\n"
        f"Environment=PATH={os.environ.get('PATH', '/usr/local/bin:/usr/bin:/bin')}\n",
        encoding="utf-8",
    )
    _TIMER_FILE.write_text(
        f"[Unit]\n"
        f"Description=LeetForge daily sync timer\n"
        f"\n"
        f"[Timer]\n"
        f"OnCalendar=*-*-* {hour:02d}:{minute:02d}:00\n"
        f"Persistent=true\n"
        f"\n"
        f"[Install]\n"
        f"WantedBy=timers.target\n",
        encoding="utf-8",
    )
    subprocess.run(["systemctl", "--user", "daemon-reload"], check=True)
    subprocess.run(["systemctl", "--user", "enable", "--now",
                    "leetforge-sync.timer"], check=True)
    print(f"已注册 systemd 定时器，每天 {hour:02d}:{minute:02d} 自动同步。")
    print(f"日志文件：{LOG_FILE}")
    print(f"查看状态：systemctl --user status leetforge-sync.timer")


def _unload_linux(quiet: bool = False):
    subprocess.run(["systemctl", "--user", "disable", "--now",
                    "leetforge-sync.timer"], capture_output=True)
    for f in (_SERVICE_FILE, _TIMER_FILE):
        if f.exists():
            f.unlink()
    subprocess.run(["systemctl", "--user", "daemon-reload"], capture_output=True)
    if not quiet:
        print("已卸载 systemd 定时器，后台同步已停止。")


def _status_linux():
    result = subprocess.run(
        ["systemctl", "--user", "is-active", "leetforge-sync.timer"],
        capture_output=True, text=True,
    )
    active = result.stdout.strip() == "active"
    if active:
        print("状态：运行中")
        info = subprocess.run(
            ["systemctl", "--user", "status", "leetforge-sync.timer"],
            capture_output=True, text=True,
        )
        for line in info.stdout.splitlines():
            if "Trigger:" in line or "trigger:" in line.lower():
                print(f"下次触发：{line.strip()}")
    else:
        print("状态：未注册（运行 leetcode --daemon HH:MM 来启用）")
    print(f"日志：{LOG_FILE}")
    _print_last_log()


# ---------------------------------------------------------------------------
# Windows: schtasks
# ---------------------------------------------------------------------------

_TASK_NAME = "LeetForge-Sync"


def _install_windows(hour: int, minute: int):
    lc_bin = _find_leetcode_bin()
    time_str = f"{hour:02d}:{minute:02d}"
    subprocess.run([
        "schtasks", "/create", "/tn", _TASK_NAME,
        "/tr", lc_bin, "/sc", "daily", "/st", time_str, "/f",
    ], check=True)
    print(f"已注册 Windows 计划任务，每天 {time_str} 自动同步。")
    print(f"日志文件：{LOG_FILE}")
    print(f"查看状态：schtasks /query /tn {_TASK_NAME}")


def _unload_windows(quiet: bool = False):
    subprocess.run(["schtasks", "/delete", "/tn", _TASK_NAME, "/f"],
                   capture_output=True)
    if not quiet:
        print("已卸载 Windows 计划任务，后台同步已停止。")


def _status_windows():
    result = subprocess.run(
        ["schtasks", "/query", "/tn", _TASK_NAME],
        capture_output=True, text=True,
    )
    if result.returncode == 0:
        print("状态：已注册")
        for line in result.stdout.splitlines():
            if line.strip():
                print(f"  {line.strip()}")
    else:
        print("状态：未注册（运行 leetcode --daemon HH:MM 来启用）")
    print(f"日志：{LOG_FILE}")
    _print_last_log()


# ---------------------------------------------------------------------------
# 共用
# ---------------------------------------------------------------------------


def _print_last_log():
    """显示最近几行日志。"""
    if not LOG_FILE.exists():
        return
    lines = LOG_FILE.read_text(encoding="utf-8", errors="replace").splitlines()
    recent = lines[-8:] if len(lines) > 8 else lines
    if recent:
        print(f"\n最近日志（{LOG_FILE.name}）：")
        for line in recent:
            print(f"  {line}")


def _parse_time(time_str: str) -> tuple[int, int]:
    parts = time_str.split(":")
    if len(parts) != 2:
        raise ValueError
    h, m = int(parts[0]), int(parts[1])
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise ValueError
    return h, m


def install_daemon(time_str: str):
    """注册系统级每日定时任务。"""
    try:
        hour, minute = _parse_time(time_str)
    except ValueError:
        print("错误：时间格式应为 HH:MM（例如 23:00）")
        sys.exit(1)

    system = platform.system()
    if system == "Darwin":
        _install_macos(hour, minute)
    elif system == "Linux":
        _install_linux(hour, minute)
    elif system == "Windows":
        _install_windows(hour, minute)
    else:
        print(f"不支持的系统：{system}，请使用 --cron 前台模式。")
        sys.exit(1)

    print("\n关闭终端后仍会在后台自动运行。")
    print("卸载：leetcode --daemon stop")
    print("查看：leetcode --daemon status")


def uninstall_daemon():
    """卸载系统级定时任务。"""
    system = platform.system()
    if system == "Darwin":
        _unload_macos()
    elif system == "Linux":
        _unload_linux()
    elif system == "Windows":
        _unload_windows()
    else:
        print(f"不支持的系统：{system}")


def daemon_status():
    """查看后台定时任务状态。"""
    system = platform.system()
    print(f"系统：{system}\n")
    if system == "Darwin":
        _status_macos()
    elif system == "Linux":
        _status_linux()
    elif system == "Windows":
        _status_windows()
    else:
        print(f"不支持的系统：{system}")
