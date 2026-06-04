import os
import sys
import ctypes
import winreg
from datetime import datetime
import re
import json
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import webbrowser
import traceback

# ==================== Config / Language System ====================
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "config.json")

def load_config():
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except:
        pass
    return {}

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except:
        pass

TEXTS = {
    "zh": {
        "app_title": "Win32 PrioritySeparation 工具",
        "title_main": "Win32 PrioritySeparation 工具",
        "file_menu": "文件",
        "file_lang": "语言",
        "lang_cn": "中文",
        "lang_en": "English",
        "file_exit": "退出",
        "btn_refresh": "刷新",
        "btn_about": "关于",
        "btn_refresh_value": "刷新当前值",
        "btn_apply": "应用",
        "btn_create_backup": "创建备份",
        "btn_open_dir": "打开目录",
        "btn_restore": "恢复选中备份",
        "btn_delete_backup": "删除选中备份",
        "lbl_current_value": "当前值",
        "lbl_decimal": "十进制:",
        "lbl_hex": "十六进制:",
        "lbl_binary": "二进制:",
        "lbl_quick_set": "快速设置",
        "lbl_custom_set": "自定义设置",
        "lbl_input_value": "输入新值:",
        "lbl_input_hint": "(十进制或十六进制，如: 26 或 0x1A)",
        "lbl_backup_mgmt": "备份管理",
        "col_date": "日期",
        "col_time": "时间",
        "col_value_dec": "十进制",
        "col_value_hex": "十六进制",
        "col_filename": "文件名",
        "status_ready": "就绪",
        "status_reading": "读取中...",
        "status_read_fail": "读取注册表失败",
        "status_refresh_fail": "刷新失败: {}",
        "status_error": "错误",
        "status_current": "当前值: {} ({})",
        "status_loaded": "已加载 {} 个备份",
        "status_no_backup": "无备份文件",
        "status_load_backup_fail": "加载备份失败: {}",
        "status_backup_created": "备份创建成功: {}",
        "status_dir_opened": "已打开备份目录",
        "preset_gaming": "游戏模式 (26)",
        "preset_balanced": "平衡模式 (24)",
        "preset_service": "后台服务 (2)",
        "preset_foreground": "前台优化 (38)",
        "preset_standard": "标准模式 (0)",
        "preset_tip_gaming": "前台程序获得更多CPU时间",
        "preset_tip_balanced": "Windows推荐值",
        "preset_tip_service": "优化后台服务性能",
        "preset_tip_foreground": "最大化前台响应",
        "preset_tip_standard": "Windows默认设置",
        "confirm_set_title": "确认设置",
        "confirm_set_msg": "确定要将 Win32PrioritySeparation 设置为:\n\n预设: {}\n十进制: {}\n十六进制: {}\n\n此操作需要管理员权限，更改将在重启后生效。",
        "set_success_title": "设置成功",
        "set_success_msg": "已成功将 Win32PrioritySeparation 设置为:\n\n预设: {}\n十进制: {}\n十六进制: {}\n\n更改将在系统重启后生效。",
        "set_fail_title": "设置失败",
        "set_fail_msg": "无法修改注册表值",
        "backup_fail_title": "备份失败",
        "backup_fail_read": "无法读取当前注册表值",
        "backup_fail_write": "无法创建备份文件",
        "backup_success_title": "备份成功",
        "backup_success_msg": "已创建备份文件:\n{}\n\n当前值: {} ({})",
        "confirm_restore_title": "确认恢复",
        "confirm_restore_msg": "确定要恢复备份吗？\n\n备份文件: {}\n值: {} ({})",
        "restore_success_title": "恢复成功",
        "restore_success_msg": "已成功恢复备份\n{}",
        "restore_fail_title": "恢复失败",
        "restore_fail_msg": "无法修改注册表值",
        "confirm_delete_title": "确认删除",
        "confirm_delete_msg": "确定要删除备份文件吗？\n\n{}",
        "delete_success_title": "删除成功",
        "delete_success_msg": "已删除备份文件\n{}",
        "delete_fail_title": "删除失败",
        "delete_fail_msg": "无法删除文件:\n{}",
        "dir_error_title": "错误",
        "dir_error_msg": "无法打开目录:\n{}",
        "about_title": "关于",
        "about_text": "Win32 PrioritySeparation 工具\n\n版本: 2.2\n作者: Y0USA\n\n功能:\n\u2022 读取和修改 Win32PrioritySeparation 注册表值\n\u2022 预设值快速设置\n\u2022 自定义值设置\n\u2022 备份和恢复管理\n\u2022 中英文语言切换\n\n联系方式:\nB站: https://space.bilibili.com/353017137\nGitHub: https://github.com/YOU5A\n邮箱: pfmaxlnx@gmail.com\n\n\u00a9 2019-2026 保留所有权利",
        "about_btn_bilibili": "访问B站",
        "about_btn_github": "访问GitHub",
        "about_btn_close": "关闭",
        "msgbox_ok": "确定",
        "msgbox_yes": "是",
        "msgbox_no": "否",
        "startup_error": "程序启动失败:\n\n{}\n\n{}",
        "startup_error_title": "启动错误",
        "admin_required": "需要管理员权限运行此程序",
        "no_backup": "无备份",
        "count_backups": "共 {} 个备份",
        "reg_read_fail": "读取注册表失败: {}",
        "reg_write_fail": "写入注册表失败: {}",
        "backup_create_fail": "备份失败: {}",
        "restart_fail": "重新启动失败: {}",
    },
    "en": {
        "app_title": "Win32 PrioritySeparation Tool",
        "title_main": "Win32 PrioritySeparation Tool",
        "file_menu": "File",
        "file_lang": "Language",
        "lang_cn": "中文",
        "lang_en": "English",
        "file_exit": "Exit",
        "btn_refresh": "Refresh",
        "btn_about": "About",
        "btn_refresh_value": "Refresh Value",
        "btn_apply": "Apply",
        "btn_create_backup": "Create Backup",
        "btn_open_dir": "Open Folder",
        "btn_restore": "Restore Selected",
        "btn_delete_backup": "Delete Selected",
        "lbl_current_value": "Current Value",
        "lbl_decimal": "Decimal:",
        "lbl_hex": "Hexadecimal:",
        "lbl_binary": "Binary:",
        "lbl_quick_set": "Quick Settings",
        "lbl_custom_set": "Custom Settings",
        "lbl_input_value": "Enter new value:",
        "lbl_input_hint": "(Decimal or hex, e.g.: 26 or 0x1A)",
        "lbl_backup_mgmt": "Backup Management",
        "col_date": "Date",
        "col_time": "Time",
        "col_value_dec": "Decimal",
        "col_value_hex": "Hexadecimal",
        "col_filename": "Filename",
        "status_ready": "Ready",
        "status_reading": "Reading...",
        "status_read_fail": "Failed to read registry",
        "status_refresh_fail": "Refresh failed: {}",
        "status_error": "Error",
        "status_current": "Current value: {} ({})",
        "status_loaded": "Loaded {} backups",
        "status_no_backup": "No backup files",
        "status_load_backup_fail": "Failed to load backups: {}",
        "status_backup_created": "Backup created: {}",
        "status_dir_opened": "Backup directory opened",
        "preset_gaming": "Gaming Mode (26)",
        "preset_balanced": "Balanced Mode (24)",
        "preset_service": "Background Services (2)",
        "preset_foreground": "Foreground Optimized (38)",
        "preset_standard": "Standard Mode (0)",
        "preset_tip_gaming": "Foreground programs get more CPU time",
        "preset_tip_balanced": "Windows recommended value",
        "preset_tip_service": "Optimize for background services",
        "preset_tip_foreground": "Maximize foreground responsiveness",
        "preset_tip_standard": "Windows default settings",
        "confirm_set_title": "Confirm Setting",
        "confirm_set_msg": "Set Win32PrioritySeparation to:\n\nPreset: {}\nDecimal: {}\nHexadecimal: {}\n\nThis requires admin privileges and takes effect after reboot.",
        "set_success_title": "Setting Applied",
        "set_success_msg": "Successfully set Win32PrioritySeparation to:\n\nPreset: {}\nDecimal: {}\nHexadecimal: {}\n\nChanges will take effect after system restart.",
        "set_fail_title": "Setting Failed",
        "set_fail_msg": "Unable to modify registry value",
        "backup_fail_title": "Backup Failed",
        "backup_fail_read": "Unable to read current registry value",
        "backup_fail_write": "Unable to create backup file",
        "backup_success_title": "Backup Successful",
        "backup_success_msg": "Backup file created:\n{}\n\nCurrent value: {} ({})",
        "confirm_restore_title": "Confirm Restore",
        "confirm_restore_msg": "Restore this backup?\n\nBackup file: {}\nValue: {} ({})",
        "restore_success_title": "Restore Successful",
        "restore_success_msg": "Successfully restored backup\n{}",
        "restore_fail_title": "Restore Failed",
        "restore_fail_msg": "Unable to modify registry value",
        "confirm_delete_title": "Confirm Delete",
        "confirm_delete_msg": "Delete this backup file?\n\n{}",
        "delete_success_title": "Delete Successful",
        "delete_success_msg": "Deleted backup file\n{}",
        "delete_fail_title": "Delete Failed",
        "delete_fail_msg": "Unable to delete file:\n{}",
        "dir_error_title": "Error",
        "dir_error_msg": "Unable to open directory:\n{}",
        "about_title": "About",
        "about_text": "Win32 PrioritySeparation Tool\n\nVersion: 2.2\nAuthor: Y0USA\n\nFeatures:\n\u2022 Read and modify Win32PrioritySeparation registry value\n\u2022 Quick preset settings\n\u2022 Custom value settings\n\u2022 Backup and restore management\n\u2022 Chinese/English language switching\n\nContact:\nBilibili: https://space.bilibili.com/353017137\nGitHub: https://github.com/YOU5A\nEmail: pfmaxlnx@gmail.com\n\n\u00a9 2019-2026 All rights reserved",
        "about_btn_bilibili": "Visit Bilibili",
        "about_btn_github": "Visit GitHub",
        "about_btn_close": "Close",
        "msgbox_ok": "OK",
        "msgbox_yes": "Yes",
        "msgbox_no": "No",
        "startup_error": "Application startup failed:\n\n{}\n\n{}",
        "startup_error_title": "Startup Error",
        "admin_required": "Administrator privileges required",
        "no_backup": "No backups",
        "count_backups": "{} backup(s)",
        "reg_read_fail": "Failed to read registry: {}",
        "reg_write_fail": "Failed to write registry: {}",
        "backup_create_fail": "Backup failed: {}",
        "restart_fail": "Restart failed: {}",
    }
}

CURRENT_LANG = "zh"

def tr(key):
    return TEXTS.get(CURRENT_LANG, TEXTS["zh"]).get(key, key)

def set_language(lang, save=True):
    global CURRENT_LANG
    if lang not in TEXTS:
        return False
    CURRENT_LANG = lang
    if save:
        config = load_config()
        config["language"] = lang
        save_config(config)
    return True

class RegistryManager:
    """注册表管理类"""
    @staticmethod
    def read_value():
        try:
            key_path = r"SYSTEM\CurrentControlSet\Control\PriorityControl"
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path)
            value, _ = winreg.QueryValueEx(key, "Win32PrioritySeparation")
            winreg.CloseKey(key)
            return value
        except Exception as e:
            print(tr("reg_read_fail").format(e))
            return None

    @staticmethod
    def write_value(value):
        try:
            key_path = r"SYSTEM\CurrentControlSet\Control\PriorityControl"
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, winreg.KEY_WRITE)
            winreg.SetValueEx(key, "Win32PrioritySeparation", 0, winreg.REG_DWORD, value)
            winreg.CloseKey(key)
            return True
        except Exception as e:
            print(tr("reg_write_fail").format(e))
            return False

    @staticmethod
    def backup_value(value, backup_dir):
        try:
            os.makedirs(backup_dir, exist_ok=True)
            now = datetime.now()
            timestamp = now.strftime("%Y%m%d_%H%M%S")
            hex_str = f"{value:08X}"
            filename = f"{timestamp}_{value}_0x{hex_str}.reg"
            filepath = os.path.join(backup_dir, filename)

            reg_content = f"""Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl]
"Win32PrioritySeparation"=dword:{hex_str}
"""

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(reg_content)

            return filename, filepath
        except Exception as e:
            print(tr("backup_create_fail").format(e))
            return None, None

class AdminChecker:
    @staticmethod
    def is_admin():
        try:
            return ctypes.windll.shell32.IsUserAnAdmin()
        except:
            return False

    @staticmethod
    def restart_as_admin():
        try:
            ctypes.windll.shell32.ShellExecuteW(
                None, "runas", sys.executable, " ".join(sys.argv), None, 1
            )
            return True
        except Exception as e:
            print(tr("restart_fail").format(e))
            return False

class BackupManager:
    def __init__(self, backup_dir):
        self.backup_dir = backup_dir
        self.pattern = re.compile(r"(\d{8}_\d{6})_(\d+)_0x([0-9A-F]{8})\.reg")

    def list_backups(self):
        if not os.path.exists(self.backup_dir):
            return []

        backups = []
        try:
            for filename in os.listdir(self.backup_dir):
                if filename.lower().endswith(".reg"):
                    filepath = os.path.join(self.backup_dir, filename)
                    match = self.pattern.match(filename)
                    if match:
                        timestamp_str, decimal_str, hex_str = match.groups()
                        try:
                            decimal = int(decimal_str)
                            year = int(timestamp_str[0:4])
                            month = int(timestamp_str[4:6])
                            day = int(timestamp_str[6:8])
                            hour = int(timestamp_str[9:11])
                            minute = int(timestamp_str[11:13])
                            second = int(timestamp_str[13:15])
                            date_str = f"{year:04d}-{month:02d}-{day:02d}"
                            time_str = f"{hour:02d}:{minute:02d}:{second:02d}"
                            mtime = os.path.getmtime(filepath)
                            backups.append({
                                "filename": filename,
                                "filepath": filepath,
                                "date": date_str,
                                "time": time_str,
                                "decimal": decimal,
                                "hex": f"0x{hex_str}",
                                "mtime": mtime
                            })
                        except ValueError:
                            self._add_backup_using_mtime(backups, filename, filepath)
                    else:
                        self._add_backup_using_mtime(backups, filename, filepath)

            backups.sort(key=lambda x: x["mtime"], reverse=True)
            return backups
        except Exception as e:
            print(f"list backups error: {e}")
            traceback.print_exc()
            return []

    def _add_backup_using_mtime(self, backups, filename, filepath):
        try:
            mtime = os.path.getmtime(filepath)
            dt = datetime.fromtimestamp(mtime)
            date_str = dt.strftime("%Y-%m-%d")
            time_str = dt.strftime("%H:%M:%S")
            decimal = 0
            hex_str = "00000000"
            for part in filename.split("_"):
                if part.isdigit():
                    decimal = int(part)
                    break
            backups.append({
                "filename": filename,
                "filepath": filepath,
                "date": date_str,
                "time": time_str,
                "decimal": decimal,
                "hex": f"0x{hex_str:>08}",
                "mtime": mtime
            })
        except Exception as e:
            print(f"add backup error {filename}: {e}")

    def clean_old_backups(self, keep=20):
        backups = self.list_backups()
        if len(backups) <= keep:
            return
        for backup in backups[keep:]:
            try:
                os.remove(backup["filepath"])
            except Exception as e:
                print(f"delete backup error {backup['filename']}: {e}")

class ValueFormatter:
    @staticmethod
    def format_value(value):
        if value is None:
            return {
                "decimal": "N/A",
                "hex": "0x00000000",
                "binary": "00000000 00000000 00000000 00000000"
            }
        return {
            "decimal": str(value),
            "hex": f"0x{value:08X}",
            "binary": " ".join([f"{value:032b}"[i:i+8] for i in range(0, 32, 8)])
        }

    @staticmethod
    def parse_input(input_str):
        if not input_str:
            return None
        input_str = input_str.strip().lower()
        if input_str.startswith("0x"):
            input_str = input_str[2:]
        if input_str.endswith("h"):
            input_str = input_str[:-1]
        try:
            return int(input_str)
        except ValueError:
            try:
                return int(input_str, 16)
            except ValueError:
                return None

class SimpleMessageBox:
    @staticmethod
    def show(parent, title, message, type="info"):
        dialog = tk.Toplevel(parent)
        dialog.title(title)
        dialog.transient(parent)
        dialog.grab_set()

        dialog.geometry("400x200")
        dialog.update_idletasks()

        x = parent.winfo_x() + (parent.winfo_width() // 2) - (400 // 2)
        y = parent.winfo_y() + (parent.winfo_height() // 2) - (200 // 2)
        dialog.geometry(f"400x200+{x}+{y}")

        icons = {
            "info": ("ℹ️", "#3498db"),
            "warning": ("⚠️", "#f39c12"),
            "error": ("❌", "#e74c3c"),
            "success": ("✅", "#2ecc71")
        }
        icon, color = icons.get(type, ("ℹ️", "#3498db"))

        frame = ttk.Frame(dialog, padding=20)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text=icon, font=("Arial", 24),
                 foreground=color).pack(pady=(0, 10))

        ttk.Label(frame, text=message, wraplength=350,
                 justify="center").pack(pady=(0, 20), fill="x")

        ttk.Button(frame, text=tr("msgbox_ok"), command=dialog.destroy,
                  width=15).pack()

        return dialog

    @staticmethod
    def ask_yes_no(parent, title, message):
        dialog = tk.Toplevel(parent)
        dialog.title(title)
        dialog.transient(parent)
        dialog.grab_set()

        dialog.geometry("450x200")
        dialog.update_idletasks()

        x = parent.winfo_x() + (parent.winfo_width() // 2) - (450 // 2)
        y = parent.winfo_y() + (parent.winfo_height() // 2) - (200 // 2)
        dialog.geometry(f"450x200+{x}+{y}")

        result = {"value": False}

        def set_result(value):
            result["value"] = value
            dialog.destroy()

        frame = ttk.Frame(dialog, padding=20)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text=message, wraplength=400,
                 justify="center").pack(pady=(0, 20), fill="x")

        btn_frame = ttk.Frame(frame)
        btn_frame.pack()

        ttk.Button(btn_frame, text=tr("msgbox_yes"), command=lambda: set_result(True),
                  width=10).pack(side="left", padx=10)
        ttk.Button(btn_frame, text=tr("msgbox_no"), command=lambda: set_result(False),
                  width=10).pack(side="left", padx=10)

        dialog.wait_window()
        return result["value"]

class PrioritySeparationTool:
    def __init__(self, root):
        self.root = root
        self.root.title(tr("app_title"))

        self.root.geometry("900x650")
        self.root.minsize(800, 550)

        self.backup_dir = os.path.join(os.getcwd(), "backups")
        self.registry_manager = RegistryManager()
        self.backup_manager = BackupManager(self.backup_dir)
        self.value_formatter = ValueFormatter()

        self.selected_backup = None

        self.setup_menu()
        self.create_widgets()
        self.refresh_data()
        self.center_window()
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

    def center_window(self):
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")

    def setup_menu(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label=tr("file_menu"), menu=file_menu)

        lang_menu = tk.Menu(file_menu, tearoff=0)
        lang_menu.add_command(label=tr("lang_cn"), command=lambda: self._do_switch_language("zh"))
        lang_menu.add_command(label=tr("lang_en"), command=lambda: self._do_switch_language("en"))
        file_menu.add_cascade(label=tr("file_lang"), menu=lang_menu)
        file_menu.add_separator()
        file_menu.add_command(label=tr("file_exit"), command=self.root.quit)

    def _do_switch_language(self, lang):
        if not set_language(lang):
            return
        self.root.title(tr("app_title"))
        for widget in self.root.winfo_children():
            if isinstance(widget, tk.Menu):
                continue
            widget.destroy()
        self.setup_menu()
        self.create_widgets()
        self.refresh_data()

    def create_widgets(self):
        main_container = ttk.Frame(self.root)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)

        title_frame = ttk.Frame(main_container)
        title_frame.pack(fill="x", pady=(0, 15))

        ttk.Label(title_frame, text=tr("title_main"),
                 font=("Arial", 16, "bold")).pack(side="left")

        ttk.Button(title_frame, text=tr("btn_refresh"), command=self.refresh_data,
                  width=8).pack(side="right", padx=(0, 5))

        ttk.Button(title_frame, text=tr("btn_about"), command=self.show_about,
                  width=8).pack(side="right")

        paned_window = ttk.PanedWindow(main_container, orient="horizontal")
        paned_window.pack(fill="both", expand=True, pady=10)

        left_frame = ttk.Frame(paned_window, width=350)
        paned_window.add(left_frame, weight=1)

        self.create_left_panel(left_frame)

        right_frame = ttk.Frame(paned_window)
        paned_window.add(right_frame, weight=2)

        self.create_right_panel(right_frame)

        self.status_var = tk.StringVar(value=tr("status_ready"))
        status_bar = ttk.Label(main_container, textvariable=self.status_var,
                              relief="sunken", anchor="w", padding=(5, 2))
        status_bar.pack(side="bottom", fill="x")

    def create_left_panel(self, parent):
        current_frame = ttk.LabelFrame(parent, text=tr("lbl_current_value"), padding=15)
        current_frame.pack(fill="x", pady=(0, 15))

        dec_frame = ttk.Frame(current_frame)
        dec_frame.pack(fill="x", pady=5)
        ttk.Label(dec_frame, text=tr("lbl_decimal"), width=10).pack(side="left")
        self.dec_var = tk.StringVar(value=tr("status_reading"))
        ttk.Label(dec_frame, textvariable=self.dec_var, font=("Consolas", 10)).pack(side="left")

        hex_frame = ttk.Frame(current_frame)
        hex_frame.pack(fill="x", pady=5)
        ttk.Label(hex_frame, text=tr("lbl_hex"), width=10).pack(side="left")
        self.hex_var = tk.StringVar(value="0x00000000")
        ttk.Label(hex_frame, textvariable=self.hex_var, font=("Consolas", 10)).pack(side="left")

        bin_frame = ttk.Frame(current_frame)
        bin_frame.pack(fill="x", pady=5)
        ttk.Label(bin_frame, text=tr("lbl_binary"), width=10).pack(side="left")
        self.bin_var = tk.StringVar(value="00000000 00000000 00000000 00000000")
        bin_label = ttk.Label(bin_frame, textvariable=self.bin_var, font=("Consolas", 9))
        bin_label.pack(side="left")

        ttk.Button(current_frame, text=tr("btn_refresh_value"), command=self.refresh_current_value,
                  width=15).pack(pady=(10, 0))

        preset_frame = ttk.LabelFrame(parent, text=tr("lbl_quick_set"), padding=15)
        preset_frame.pack(fill="x", pady=(0, 15))

        presets = [
            (tr("preset_gaming"), 26, tr("preset_tip_gaming")),
            (tr("preset_balanced"), 24, tr("preset_tip_balanced")),
            (tr("preset_service"), 2, tr("preset_tip_service")),
            (tr("preset_foreground"), 38, tr("preset_tip_foreground")),
            (tr("preset_standard"), 0, tr("preset_tip_standard"))
        ]

        for i, (name, value, tip) in enumerate(presets):
            btn = ttk.Button(preset_frame, text=name,
                           command=lambda v=value, n=name: self.apply_preset(v, n),
                           width=20)
            btn.pack(pady=3)

        custom_frame = ttk.LabelFrame(parent, text=tr("lbl_custom_set"), padding=15)
        custom_frame.pack(fill="x")

        ttk.Label(custom_frame, text=tr("lbl_input_value")).pack(anchor="w", pady=(0, 5))

        input_frame = ttk.Frame(custom_frame)
        input_frame.pack(fill="x", pady=5)

        self.custom_entry = ttk.Entry(input_frame)
        self.custom_entry.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.custom_entry.bind("<Return>", lambda e: self.apply_custom_value())

        ttk.Button(input_frame, text=tr("btn_apply"), command=self.apply_custom_value,
                  width=8).pack(side="right")

        ttk.Label(custom_frame, text=tr("lbl_input_hint"),
                 font=("Arial", 8), foreground="gray").pack(anchor="w", pady=(5, 0))

    def create_right_panel(self, parent):
        backup_title = ttk.Frame(parent)
        backup_title.pack(fill="x", pady=(0, 10))

        ttk.Label(backup_title, text=tr("lbl_backup_mgmt"),
                 font=("Arial", 12, "bold")).pack(side="left")

        btn_frame = ttk.Frame(backup_title)
        btn_frame.pack(side="right")

        ttk.Button(btn_frame, text=tr("btn_create_backup"), command=self.create_backup,
                  width=10).pack(side="left", padx=2)

        ttk.Button(btn_frame, text=tr("btn_open_dir"), command=self.open_backup_dir,
                  width=10).pack(side="left", padx=2)

        list_frame = ttk.Frame(parent)
        list_frame.pack(fill="both", expand=True)

        columns = ("date", "time", "value_dec", "value_hex", "filename")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="headings", selectmode="browse")

        self.tree.heading("date", text=tr("col_date"))
        self.tree.heading("time", text=tr("col_time"))
        self.tree.heading("value_dec", text=tr("col_value_dec"))
        self.tree.heading("value_hex", text=tr("col_value_hex"))
        self.tree.heading("filename", text=tr("col_filename"))

        self.tree.column("date", width=100)
        self.tree.column("time", width=80)
        self.tree.column("value_dec", width=80, anchor="center")
        self.tree.column("value_hex", width=90, anchor="center")
        self.tree.column("filename", width=200)

        vsb = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        hsb = ttk.Scrollbar(list_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")

        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)

        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        self.tree.bind("<MouseWheel>", self._on_mousewheel)

        action_frame = ttk.Frame(parent)
        action_frame.pack(fill="x", pady=(10, 0))

        self.restore_btn = ttk.Button(action_frame, text=tr("btn_restore"),
                                     command=self.restore_backup,
                                     state="disabled", width=15)
        self.restore_btn.pack(side="left", padx=(0, 10))

        self.delete_btn = ttk.Button(action_frame, text=tr("btn_delete_backup"),
                                    command=self.delete_backup,
                                    state="disabled", width=15)
        self.delete_btn.pack(side="left")

        self.count_var = tk.StringVar(value=tr("no_backup"))
        ttk.Label(action_frame, textvariable=self.count_var,
                 font=("Arial", 9)).pack(side="right")

    def refresh_data(self):
        self.refresh_current_value()
        self.refresh_backup_list()

    def refresh_current_value(self):
        try:
            value = self.registry_manager.read_value()
            if value is not None:
                formatted = self.value_formatter.format_value(value)
                self.dec_var.set(formatted["decimal"])
                self.hex_var.set(formatted["hex"])
                self.bin_var.set(formatted["binary"])
                self.status_var.set(tr("status_current").format(formatted["decimal"], formatted["hex"]))
            else:
                self.dec_var.set(tr("status_read_fail"))
                self.hex_var.set("0x00000000")
                self.bin_var.set("00000000 00000000 00000000 00000000")
                self.status_var.set(tr("status_read_fail"))
        except Exception as e:
            self.dec_var.set(tr("status_error"))
            self.hex_var.set("0x00000000")
            self.status_var.set(tr("status_refresh_fail").format(str(e)))

    def refresh_backup_list(self):
        try:
            for item in self.tree.get_children():
                self.tree.delete(item)

            backups = self.backup_manager.list_backups()

            for backup in backups:
                self.tree.insert("", "end", values=(
                    backup["date"],
                    backup["time"],
                    backup["decimal"],
                    backup["hex"],
                    backup["filename"]
                ))

            count = len(backups)
            self.count_var.set(tr("count_backups").format(count))

            if count > 0:
                self.status_var.set(tr("status_loaded").format(count))
            else:
                self.status_var.set(tr("status_no_backup"))

        except Exception as e:
            self.status_var.set(tr("status_load_backup_fail").format(str(e)))
            traceback.print_exc()

    def on_tree_select(self, event):
        selection = self.tree.selection()
        if selection:
            self.selected_backup = selection[0]
            self.restore_btn.config(state="normal")
            self.delete_btn.config(state="normal")
        else:
            self.selected_backup = None
            self.restore_btn.config(state="disabled")
            self.delete_btn.config(state="disabled")

    def apply_preset(self, value, name):
        formatted = self.value_formatter.format_value(value)

        confirm = SimpleMessageBox.ask_yes_no(
            self.root,
            tr("confirm_set_title"),
            tr("confirm_set_msg").format(name, formatted["decimal"], formatted["hex"])
        )

        if confirm:
            current = self.registry_manager.read_value()
            if current is not None:
                self.create_backup_silent(current)

            if self.registry_manager.write_value(value):
                self.refresh_current_value()
                SimpleMessageBox.show(
                    self.root,
                    tr("set_success_title"),
                    tr("set_success_msg").format(name, formatted["decimal"], formatted["hex"]),
                    "success"
                )
            else:
                SimpleMessageBox.show(
                    self.root,
                    tr("set_fail_title"),
                    tr("set_fail_msg"),
                    "error"
                )

    def apply_custom_value(self):
        input_str = self.custom_entry.get()
        value = self.value_formatter.parse_input(input_str)

        if value is None:
            SimpleMessageBox.show(
                self.root,
                tr("set_fail_title"),
                "请输入有效的十进制或十六进制数值",
                "warning"
            )
            return

        formatted = self.value_formatter.format_value(value)

        confirm = SimpleMessageBox.ask_yes_no(
            self.root,
            tr("confirm_set_title"),
            tr("confirm_set_msg").format(tr("lbl_custom_set"), formatted["decimal"], formatted["hex"])
        )

        if confirm:
            current = self.registry_manager.read_value()
            if current is not None:
                self.create_backup_silent(current)

            if self.registry_manager.write_value(value):
                self.refresh_current_value()
                self.custom_entry.delete(0, tk.END)
                SimpleMessageBox.show(
                    self.root,
                    tr("set_success_title"),
                    tr("set_success_msg").format(tr("lbl_custom_set"), formatted["decimal"], formatted["hex"]),
                    "success"
                )
            else:
                SimpleMessageBox.show(
                    self.root,
                    tr("set_fail_title"),
                    tr("set_fail_msg"),
                    "error"
                )

    def create_backup(self):
        current = self.registry_manager.read_value()
        if current is None:
            SimpleMessageBox.show(
                self.root,
                tr("backup_fail_title"),
                tr("backup_fail_read"),
                "error"
            )
            return

        filename, filepath = self.registry_manager.backup_value(current, self.backup_dir)

        if filename:
            self.refresh_backup_list()
            self.backup_manager.clean_old_backups(20)

            formatted = self.value_formatter.format_value(current)
            SimpleMessageBox.show(
                self.root,
                tr("backup_success_title"),
                tr("backup_success_msg").format(filename, formatted["decimal"], formatted["hex"]),
                "success"
            )
            self.status_var.set(tr("status_backup_created").format(filename))
        else:
            SimpleMessageBox.show(
                self.root,
                tr("backup_fail_title"),
                tr("backup_fail_write"),
                "error"
            )

    def create_backup_silent(self, value):
        try:
            filename, _ = self.registry_manager.backup_value(value, self.backup_dir)
            if filename:
                self.refresh_backup_list()
                self.backup_manager.clean_old_backups(20)
                return True
        except:
            pass
        return False

    def restore_backup(self):
        if not self.selected_backup:
            return

        item = self.tree.item(self.selected_backup)
        values = item["values"]

        decimal_value = values[2]
        hex_value = values[3]
        filename = values[4]

        confirm = SimpleMessageBox.ask_yes_no(
            self.root,
            tr("confirm_restore_title"),
            tr("confirm_restore_msg").format(filename, decimal_value, hex_value)
        )

        if confirm:
            current = self.registry_manager.read_value()
            if current is not None:
                self.create_backup_silent(current)

            if self.registry_manager.write_value(decimal_value):
                self.refresh_current_value()
                SimpleMessageBox.show(
                    self.root,
                    tr("restore_success_title"),
                    tr("restore_success_msg").format(filename),
                    "success"
                )
            else:
                SimpleMessageBox.show(
                    self.root,
                    tr("restore_fail_title"),
                    tr("restore_fail_msg"),
                    "error"
                )

    def delete_backup(self):
        if not self.selected_backup:
            return

        item = self.tree.item(self.selected_backup)
        values = item["values"]
        filename = values[4]

        confirm = SimpleMessageBox.ask_yes_no(
            self.root,
            tr("confirm_delete_title"),
            tr("confirm_delete_msg").format(filename)
        )

        if confirm:
            try:
                filepath = os.path.join(self.backup_dir, filename)
                os.remove(filepath)
                self.refresh_backup_list()
                SimpleMessageBox.show(
                    self.root,
                    tr("delete_success_title"),
                    tr("delete_success_msg").format(filename),
                    "success"
                )
            except Exception as e:
                SimpleMessageBox.show(
                    self.root,
                    tr("delete_fail_title"),
                    tr("delete_fail_msg").format(str(e)),
                    "error"
                )

    def open_backup_dir(self):
        try:
            if not os.path.exists(self.backup_dir):
                os.makedirs(self.backup_dir)

            os.startfile(self.backup_dir)
            self.status_var.set(tr("status_dir_opened"))
        except Exception as e:
            SimpleMessageBox.show(
                self.root,
                tr("dir_error_title"),
                tr("dir_error_msg").format(str(e)),
                "error"
            )

    def show_about(self):
        about_text = tr("about_text")

        dialog = tk.Toplevel(self.root)
        dialog.title(tr("about_title"))
        dialog.transient(self.root)
        dialog.resizable(False, False)

        dialog.geometry("450x400")
        dialog.update_idletasks()

        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (450 // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (400 // 2)
        dialog.geometry(f"450x400+{x}+{y}")

        frame = ttk.Frame(dialog, padding=20)
        frame.pack(fill="both", expand=True)

        ttk.Label(frame, text=tr("title_main"),
                 font=("Arial", 14, "bold")).pack(pady=(0, 10))

        text = scrolledtext.ScrolledText(frame, wrap="word",
                                        width=50, height=15,
                                        font=("Arial", 10))
        text.pack(fill="both", expand=True, pady=(0, 15))
        text.insert("1.0", about_text)
        text.config(state="disabled")

        btn_frame = ttk.Frame(frame)
        btn_frame.pack()

        def open_url(url):
            try:
                webbrowser.open(url)
            except:
                pass

        ttk.Button(btn_frame, text=tr("about_btn_bilibili"),
                  command=lambda: open_url("https://space.bilibili.com/353017137"),
                  width=12).pack(side="left", padx=5)

        ttk.Button(btn_frame, text=tr("about_btn_github"),
                  command=lambda: open_url("https://github.com/YOU5A"),
                  width=12).pack(side="left", padx=5)

        ttk.Button(btn_frame, text=tr("about_btn_close"),
                  command=dialog.destroy,
                  width=12).pack(side="left", padx=5)

    def _on_mousewheel(self, event):
        self.tree.yview_scroll(-1 * (event.delta // 120), "units")

    def on_closing(self):
        self.root.destroy()

def run_application():
    try:
        if not AdminChecker.is_admin():
            print("需要管理员权限，正在重新启动...")
            if AdminChecker.restart_as_admin():
                sys.exit()
            else:
                messagebox.showerror(tr("startup_error_title"), tr("admin_required"))
                return

        root = tk.Tk()

        # Set window icon
        try:
            icon_path = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "icon.ico")
            if os.path.exists(icon_path):
                root.iconbitmap(icon_path)
        except Exception:
            pass

        try:
            from ctypes import windll
            windll.shcore.SetProcessDpiAwareness(1)
        except:
            pass

        config = load_config()
        saved_lang = config.get("language", "zh")
        set_language(saved_lang, save=False)

        app = PrioritySeparationTool(root)
        root.mainloop()

    except Exception as e:
        error_msg = tr("startup_error").format(str(e), traceback.format_exc())
        messagebox.showerror(tr("startup_error_title"), error_msg)

if __name__ == "__main__":
    run_application()