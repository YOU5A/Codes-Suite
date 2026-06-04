import sys
import os
import winreg
import ctypes
import json
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, simpledialog
from tkinter import font as tkfont
import threading

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
        "app_title": "AppCpuPriorityTools - 应用程序优先级管理工具",
        "title_main": "应用程序 CPU/I/O 优先级设置工具",
        "subtitle": "通过Windows注册表永久设置应用程序优先级",
        "file_menu": "文件",
        "file_lang": "语言",
        "lang_cn": "中文",
        "lang_en": "English",
        "file_exit": "退出",
        "btn_add": "添加新应用",
        "btn_edit": "编辑选中项",
        "btn_remove": "删除选中项",
        "btn_refresh": "刷新列表",
        "btn_export": "导出配置",
        "btn_import": "导入配置",
        "list_frame": "已配置的应用程序",
        "detail_frame": "应用详情",
        "col_name": "应用名称",
        "col_cpu": "CPU优先级",
        "col_io": "I/O优先级",
        "cpu_idle": "空闲",
        "cpu_normal": "正常",
        "cpu_high": "高",
        "cpu_realtime": "实时",
        "cpu_below_normal": "低于正常",
        "cpu_above_normal": "高于正常",
        "unknown": "未知",
        "io_very_low": "非常低",
        "io_low": "低",
        "io_normal": "正常",
        "io_high": "高",
        "io_not_set": "未设置",
        "status_ready": "就绪",
        "status_loading": "正在加载应用列表...",
        "status_load_fail": "加载失败",
        "status_loaded": "成功加载 {} 个应用",
        "status_added": "成功为 {} 添加优先级设置",
        "status_updated": "成功更新 {} 的优先级设置",
        "status_deleted": "已删除 {} 的优先级设置",
        "status_exported": "配置已导出到: {}",
        "status_imported": "成功导入 {}/{} 个配置",
        "detail_title": "应用详细信息",
        "detail_name": "应用名称",
        "detail_cpu": "CPU优先级",
        "detail_io": "I/O优先级",
        "detail_reg_value": "注册表值",
        "dlg_edit_title": "修改优先级设置",
        "dlg_add_title": "添加新应用优先级",
        "dlg_name_label": "应用名称 (exe):",
        "dlg_auto_exe": "自动添加.exe扩展名",
        "dlg_cpu_label": "CPU 优先级:",
        "dlg_io_label": "I/O 优先级:",
        "dlg_io_enable": "启用 I/O 优先级设置",
        "dlg_ok": "确定",
        "dlg_cancel": "取消",
        "cpu_opt_idle": "空闲 (1) - 最低优先级",
        "cpu_opt_normal": "正常 (2) - 默认优先级",
        "cpu_opt_high": "高 (3) - 推荐用于游戏",
        "cpu_opt_realtime": "实时 (4) - 谨慎使用",
        "cpu_opt_below": "低于正常 (5)",
        "cpu_opt_above": "高于正常 (6)",
        "io_opt_very_low": "非常低 (0) - 后台任务",
        "io_opt_low": "低 (1)",
        "io_opt_normal": "正常 (2) - 默认",
        "io_opt_high": "高 (3) - 推荐用于游戏",
        "warn_name_empty": "应用名称不能为空!",
        "confirm_no_exe": "应用名称没有包含.exe扩展名，确认继续吗?",
        "confirm_no_exe_tip": "建议添加.exe扩展名以确保正确识别。",
        "confirm_delete": "确定要删除 {} 的所有优先级设置吗?",
        "confirm_delete_tip": "此操作将从注册表中删除相关设置，但不会删除应用程序本身。",
        "confirm_import": "将导入 {} 个应用程序配置。",
        "confirm_import_override": "这将覆盖现有的同名配置，是否继续?",
        "msg_no_config": "没有可导出的配置",
        "msg_export_success": "配置导出成功!",
        "msg_import_done": "导入完成",
        "msg_import_result": "成功导入 {} 个配置，失败: {} 个",
        "error_title": "错误",
        "error_add": "添加失败: {}",
        "error_update": "更新失败: {}",
        "error_delete": "删除失败: {}",
        "error_export": "导出失败: {}",
        "error_import": "导入失败: {}",
        "error_load": "加载失败: {}",
        "warn_title": "警告",
        "confirm_title": "确认",
        "confirm_delete_title": "确认删除",
        "confirm_import_title": "确认导入",
        "info_title": "提示",
        "success_title": "成功",
    },
    "en": {
        "app_title": "AppCpuPriorityTools - Application Priority Manager",
        "title_main": "Application CPU / I/O Priority Settings Tool",
        "subtitle": "Permanently set application priority via Windows Registry",
        "file_menu": "File",
        "file_lang": "Language",
        "lang_cn": "中文",
        "lang_en": "English",
        "file_exit": "Exit",
        "btn_add": "Add Application",
        "btn_edit": "Edit Selected",
        "btn_remove": "Remove Selected",
        "btn_refresh": "Refresh List",
        "btn_export": "Export Config",
        "btn_import": "Import Config",
        "list_frame": "Configured Applications",
        "detail_frame": "Application Details",
        "col_name": "Application Name",
        "col_cpu": "CPU Priority",
        "col_io": "I/O Priority",
        "cpu_idle": "Idle",
        "cpu_normal": "Normal",
        "cpu_high": "High",
        "cpu_realtime": "Realtime",
        "cpu_below_normal": "Below Normal",
        "cpu_above_normal": "Above Normal",
        "unknown": "Unknown",
        "io_very_low": "Very Low",
        "io_low": "Low",
        "io_normal": "Normal",
        "io_high": "High",
        "io_not_set": "Not Set",
        "status_ready": "Ready",
        "status_loading": "Loading application list...",
        "status_load_fail": "Load failed",
        "status_loaded": "Successfully loaded {} applications",
        "status_added": "Successfully added priority settings for {}",
        "status_updated": "Successfully updated priority settings for {}",
        "status_deleted": "Deleted priority settings for {}",
        "status_exported": "Configuration exported to: {}",
        "status_imported": "Successfully imported {}/{} configurations",
        "detail_title": "Application Details",
        "detail_name": "Application Name",
        "detail_cpu": "CPU Priority",
        "detail_io": "I/O Priority",
        "detail_reg_value": "Registry Value",
        "dlg_edit_title": "Edit Priority Settings",
        "dlg_add_title": "Add Application Priority",
        "dlg_name_label": "Application Name (exe):",
        "dlg_auto_exe": "Auto append .exe extension",
        "dlg_cpu_label": "CPU Priority:",
        "dlg_io_label": "I/O Priority:",
        "dlg_io_enable": "Enable I/O Priority Setting",
        "dlg_ok": "OK",
        "dlg_cancel": "Cancel",
        "cpu_opt_idle": "Idle (1) - Lowest Priority",
        "cpu_opt_normal": "Normal (2) - Default Priority",
        "cpu_opt_high": "High (3) - Recommended for Gaming",
        "cpu_opt_realtime": "Realtime (4) - Use with Caution",
        "cpu_opt_below": "Below Normal (5)",
        "cpu_opt_above": "Above Normal (6)",
        "io_opt_very_low": "Very Low (0) - Background Tasks",
        "io_opt_low": "Low (1)",
        "io_opt_normal": "Normal (2) - Default",
        "io_opt_high": "High (3) - Recommended for Gaming",
        "warn_name_empty": "Application name cannot be empty!",
        "confirm_no_exe": "Application name does not contain .exe extension. Continue?",
        "confirm_no_exe_tip": "It is recommended to add .exe extension for proper identification.",
        "confirm_delete": "Are you sure you want to delete all priority settings for {}?",
        "confirm_delete_tip": "This will remove related settings from the registry, but will not delete the application itself.",
        "confirm_import": "Will import {} application configurations.",
        "confirm_import_override": "This will overwrite existing configurations with the same name. Continue?",
        "msg_no_config": "No configurations to export",
        "msg_export_success": "Configuration exported successfully!",
        "msg_import_done": "Import Complete",
        "msg_import_result": "Successfully imported {} configurations, Failed: {}",
        "error_title": "Error",
        "error_add": "Failed to add: {}",
        "error_update": "Failed to update: {}",
        "error_delete": "Failed to delete: {}",
        "error_export": "Failed to export: {}",
        "error_import": "Failed to import: {}",
        "error_load": "Failed to load: {}",
        "warn_title": "Warning",
        "confirm_title": "Confirm",
        "confirm_delete_title": "Confirm Delete",
        "confirm_import_title": "Confirm Import",
        "info_title": "Info",
        "success_title": "Success",
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

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def run_as_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)

class AppCpuPriorityToolsTkinter:
    def __init__(self, root):
        self.root = root
        self.root.title(tr("app_title"))
        self.root.geometry("1000x750")

        self.applications = []

        try:
            self.root.iconbitmap(default="icon.ico")
        except:
            pass

        self.center_window(1000, 750)
        self.root.minsize(900, 600)

        self.setup_menu()
        self.setup_ui()
        self.load_applications()

    def center_window(self, width, height):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
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
        self.setup_ui()
        self.load_applications()

    def setup_ui(self):
        main_paned = tk.PanedWindow(self.root, orient=tk.VERTICAL, sashrelief=tk.RAISED, sashwidth=5)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        title_frame = tk.Frame(main_paned, bg="#f0f0f0")
        title_frame.pack(fill=tk.X, padx=10, pady=(10, 5))

        title_label = tk.Label(title_frame, text=tr("title_main"),
                               font=("微软雅黑", 16, "bold"), bg="#f0f0f0")
        title_label.pack(pady=(5, 0))

        subtitle_label = tk.Label(title_frame, text=tr("subtitle"),
                                  font=("微软雅黑", 10), bg="#f0f0f0")
        subtitle_label.pack(pady=(0, 5))

        control_frame = tk.Frame(main_paned, bg="#f0f0f0")
        control_frame.pack(fill=tk.X, padx=10, pady=5)

        button_style = ttk.Style()
        button_style.configure("Accent.TButton", font=("微软雅黑", 10))

        self.add_button = ttk.Button(control_frame, text=tr("btn_add"),
                                    command=self.add_application, width=15, style="Accent.TButton")
        self.add_button.grid(row=0, column=0, padx=2, pady=5)

        self.edit_button = ttk.Button(control_frame, text=tr("btn_edit"),
                                     command=self.edit_application, width=15, state=tk.DISABLED)
        self.edit_button.grid(row=0, column=1, padx=2, pady=5)

        self.remove_button = ttk.Button(control_frame, text=tr("btn_remove"),
                                       command=self.remove_application, width=15, state=tk.DISABLED)
        self.remove_button.grid(row=0, column=2, padx=2, pady=5)

        self.refresh_button = ttk.Button(control_frame, text=tr("btn_refresh"),
                                        command=self.load_applications, width=15)
        self.refresh_button.grid(row=0, column=3, padx=2, pady=5)

        tk.Frame(control_frame, width=20).grid(row=0, column=4)

        self.export_button = ttk.Button(control_frame, text=tr("btn_export"),
                                       command=self.export_configuration, width=15)
        self.export_button.grid(row=0, column=5, padx=2, pady=5)

        self.import_button = ttk.Button(control_frame, text=tr("btn_import"),
                                       command=self.import_configuration, width=15)
        self.import_button.grid(row=0, column=6, padx=2, pady=5)

        content_paned = tk.PanedWindow(main_paned, orient=tk.VERTICAL, sashrelief=tk.RAISED, sashwidth=5)

        list_frame = tk.LabelFrame(content_paned, text=tr("list_frame"),
                                  font=("微软雅黑", 10, "bold"), padx=10, pady=5)
        list_frame.pack(fill=tk.BOTH, expand=True)

        style = ttk.Style()
        style.configure("Treeview", font=("微软雅黑", 10), rowheight=25)
        style.configure("Treeview.Heading", font=("微软雅黑", 10, "bold"))

        columns = (tr("col_name"), tr("col_cpu"), tr("col_io"))
        self.tree = ttk.Treeview(list_frame, columns=columns, show="headings", height=15)

        self.tree.heading(tr("col_name"), text=tr("col_name"), anchor=tk.W)
        self.tree.heading(tr("col_cpu"), text=tr("col_cpu"), anchor=tk.CENTER)
        self.tree.heading(tr("col_io"), text=tr("col_io"), anchor=tk.CENTER)

        self.tree.column(tr("col_name"), width=400, minwidth=200, anchor=tk.W)
        self.tree.column(tr("col_cpu"), width=200, minwidth=150, anchor=tk.CENTER)
        self.tree.column(tr("col_io"), width=200, minwidth=150, anchor=tk.CENTER)

        self.tree.tag_configure("oddrow", background="#f9f9f9")
        self.tree.tag_configure("evenrow", background="#ffffff")

        scrollbar_y = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar_x = ttk.Scrollbar(list_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        self.tree.configure(yscrollcommand=scrollbar_y.set, xscrollcommand=scrollbar_x.set)

        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar_y.grid(row=0, column=1, sticky=(tk.N, tk.S))
        scrollbar_x.grid(row=1, column=0, sticky=(tk.W, tk.E))

        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)

        detail_frame = tk.LabelFrame(content_paned, text=tr("detail_frame"),
                                    font=("微软雅黑", 10, "bold"), padx=10, pady=5)
        detail_frame.pack(fill=tk.BOTH, expand=False, pady=(10, 0))

        detail_container = tk.Frame(detail_frame)
        detail_container.pack(fill=tk.BOTH, expand=True)

        self.detail_text = tk.Text(detail_container, height=6, width=80,
                                  font=("微软雅黑", 10), wrap=tk.WORD,
                                  relief=tk.FLAT, bg="#f9f9f9")

        detail_scrollbar = ttk.Scrollbar(detail_container, command=self.detail_text.yview)
        self.detail_text.configure(yscrollcommand=detail_scrollbar.set)

        self.detail_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        detail_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))

        detail_container.grid_rowconfigure(0, weight=1)
        detail_container.grid_columnconfigure(0, weight=1)

        self.detail_text.config(state=tk.DISABLED)

        content_paned.add(list_frame, height=400)
        content_paned.add(detail_frame, height=150)

        main_paned.add(title_frame)
        main_paned.add(control_frame)
        main_paned.add(content_paned)

        self.tree.bind("<<TreeviewSelect>>", self.on_item_select)
        self.tree.bind("<Double-1>", self.on_item_double_click)

        self.status_var = tk.StringVar(value=tr("status_ready"))
        status_bar = tk.Label(self.root, textvariable=self.status_var,
                             bd=1, relief=tk.SUNKEN, anchor=tk.W,
                             font=("微软雅黑", 9), bg="#f0f0f0")
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)

        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

    def on_item_select(self, event):
        selected = self.tree.selection()
        if selected:
            self.edit_button.config(state=tk.NORMAL)
            self.remove_button.config(state=tk.NORMAL)
            self.update_detail_panel()
        else:
            self.edit_button.config(state=tk.DISABLED)
            self.remove_button.config(state=tk.DISABLED)

    def on_item_double_click(self, event):
        self.edit_application()

    def update_detail_panel(self):
        selected = self.tree.selection()
        if not selected:
            return

        item = self.tree.item(selected[0])
        app_info = item["values"]

        cpu_mapping_text = {
            "1": tr("cpu_idle"),
            "2": tr("cpu_normal"),
            "3": tr("cpu_high"),
            "4": tr("cpu_realtime"),
            "5": tr("cpu_below_normal"),
            "6": tr("cpu_above_normal")
        }

        io_mapping_text = {
            "0": tr("io_very_low"),
            "1": tr("io_low"),
            "2": tr("io_normal"),
            "3": tr("io_high")
        }

        details = tr("detail_title") + "\n\n"
        details += tr("detail_name") + ": " + str(app_info[0]) + "\n\n"
        details += tr("detail_cpu") + ": " + cpu_mapping_text.get(app_info[1], tr("unknown")) + " (" + tr("detail_reg_value") + ": " + str(app_info[1]) + ")\n\n"
        details += tr("detail_io") + ": " + io_mapping_text.get(app_info[2], tr("io_not_set")) + " "
        if app_info[2] != tr("io_not_set"):
            details += "(" + tr("detail_reg_value") + ": " + str(app_info[2]) + ")"
        details += "\n"

        self.detail_text.config(state=tk.NORMAL)
        self.detail_text.delete(1.0, tk.END)
        self.detail_text.insert(1.0, details)
        self.detail_text.config(state=tk.DISABLED)

    def load_applications(self):
        self.status_var.set(tr("status_loading"))
        thread = threading.Thread(target=self._load_applications_thread)
        thread.daemon = True
        thread.start()

    def _load_applications_thread(self):
        try:
            apps = []
            base_path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, base_path) as key:
                count = 0
                while True:
                    try:
                        subkey_name = winreg.EnumKey(key, count)
                        count += 1

                        try:
                            with winreg.OpenKey(key, f"{subkey_name}\\PerfOptions") as _:
                                try:
                                    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                                                       f"{base_path}\\{subkey_name}\\PerfOptions") as perf_key:
                                        try:
                                            cpu_val, _ = winreg.QueryValueEx(perf_key, "CpuPriorityClass")
                                            has_io = True
                                            try:
                                                io_val, _ = winreg.QueryValueEx(perf_key, "IoPriority")
                                            except FileNotFoundError:
                                                has_io = False
                                                io_val = None
                                        except FileNotFoundError:
                                            cpu_val = None
                                            has_io = False
                                            io_val = None
                                except:
                                    cpu_val = None
                                    has_io = False
                                    io_val = None

                                apps.append({
                                    "name": subkey_name,
                                    "cpu_value": cpu_val,
                                    "has_io": has_io,
                                    "io_value": io_val if has_io else None
                                })
                        except FileNotFoundError:
                            continue
                    except OSError:
                        break

            self.root.after(0, self._update_app_list, apps)

        except Exception as e:
            self.root.after(0, self._load_error, str(e))

    def _update_app_list(self, apps):
        self.applications = apps

        for item in self.tree.get_children():
            self.tree.delete(item)

        cpu_mapping = {
            1: tr("cpu_idle"),
            2: tr("cpu_normal"),
            3: tr("cpu_high"),
            4: tr("cpu_realtime"),
            5: tr("cpu_below_normal"),
            6: tr("cpu_above_normal")
        }

        io_mapping = {
            0: tr("io_very_low"),
            1: tr("io_low"),
            2: tr("io_normal"),
            3: tr("io_high")
        }

        for i, app in enumerate(apps):
            cpu_text = cpu_mapping.get(app.get("cpu_value", 2), tr("unknown"))
            io_text = tr("io_not_set")
            if app.get("has_io"):
                io_text = io_mapping.get(app.get("io_value", 2), tr("unknown"))

            tag = "evenrow" if i % 2 == 0 else "oddrow"

            self.tree.insert("", tk.END, values=(
                app["name"],
                cpu_text,
                io_text
            ), tags=(tag,))

        self.status_var.set(tr("status_loaded").format(len(apps)))

    def _load_error(self, error_msg):
        self.status_var.set(tr("status_load_fail"))
        messagebox.showerror(tr("error_title"), tr("error_load").format(error_msg))

    def add_application(self):
        dialog = AddPriorityDialogTkinter(self.root)
        self.root.wait_window(dialog.top)

        if dialog.result:
            app_name, cpu_value, io_value = dialog.result

            try:
                base_path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"

                app_key = winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{app_name}")
                winreg.CloseKey(app_key)

                perf_key = winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{app_name}\\PerfOptions")

                winreg.SetValueEx(perf_key, "CpuPriorityClass", 0, winreg.REG_DWORD, cpu_value)

                if io_value is not None:
                    winreg.SetValueEx(perf_key, "IoPriority", 0, winreg.REG_DWORD, io_value)

                winreg.CloseKey(perf_key)

                self.status_var.set(tr("status_added").format(app_name))
                self.load_applications()

            except Exception as e:
                messagebox.showerror(tr("error_title"), tr("error_add").format(str(e)))

    def edit_application(self):
        selected = self.tree.selection()
        if not selected:
            return

        item = self.tree.item(selected[0])
        app_name = item["values"][0]

        app_info = None
        for app in self.applications:
            if app["name"] == app_name:
                app_info = app
                break

        if not app_info:
            return

        dialog = AddPriorityDialogTkinter(self.root, app_name, app_info)
        self.root.wait_window(dialog.top)

        if dialog.result:
            _, cpu_value, io_value = dialog.result

            try:
                base_path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
                with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                                  f"{base_path}\\{app_name}\\PerfOptions",
                                  0, winreg.KEY_WRITE) as perf_key:

                    winreg.SetValueEx(perf_key, "CpuPriorityClass", 0, winreg.REG_DWORD, cpu_value)

                    if io_value is not None:
                        winreg.SetValueEx(perf_key, "IoPriority", 0, winreg.REG_DWORD, io_value)
                    else:
                        try:
                            winreg.DeleteValue(perf_key, "IoPriority")
                        except FileNotFoundError:
                            pass

                self.status_var.set(tr("status_updated").format(app_name))
                self.load_applications()

            except Exception as e:
                messagebox.showerror(tr("error_title"), tr("error_update").format(str(e)))

    def remove_application(self):
        selected = self.tree.selection()
        if not selected:
            return

        item = self.tree.item(selected[0])
        app_name = item["values"][0]

        result = messagebox.askyesno(tr("confirm_delete_title"),
                                   tr("confirm_delete").format(app_name) + "\n\n" +
                                   tr("confirm_delete_tip"))

        if result:
            try:
                base_path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
                winreg.DeleteKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{app_name}\\PerfOptions")
                winreg.DeleteKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{app_name}")

                self.status_var.set(tr("status_deleted").format(app_name))
                self.load_applications()

            except Exception as e:
                messagebox.showerror(tr("error_title"), tr("error_delete").format(str(e)))

    def export_configuration(self):
        if not self.applications:
            messagebox.showinfo(tr("info_title"), tr("msg_no_config"))
            return

        filename = filedialog.asksaveasfilename(
            title=tr("btn_export"),
            defaultextension=".json",
            filetypes=[("JSON文件", "*.json"), ("所有文件", "*.*")]
        )

        if filename:
            try:
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(self.applications, f, indent=2, ensure_ascii=False)

                self.status_var.set(tr("status_exported").format(filename))
                messagebox.showinfo(tr("success_title"), tr("msg_export_success"))

            except Exception as e:
                messagebox.showerror(tr("error_title"), tr("error_export").format(str(e)))

    def import_configuration(self):
        filename = filedialog.askopenfilename(
            title=tr("btn_import"),
            filetypes=[("JSON文件", "*.json"), ("所有文件", "*.*")]
        )

        if filename:
            try:
                with open(filename, "r", encoding="utf-8") as f:
                    configs = json.load(f)

                result = messagebox.askyesno(tr("confirm_import_title"),
                                           tr("confirm_import").format(len(configs)) + "\n" +
                                           tr("confirm_import_override"))

                if result:
                    success_count = 0
                    for config in configs:
                        try:
                            app_name = config.get("name")
                            cpu_value = config.get("cpu_value", 2)
                            io_value = config.get("io_value") if config.get("has_io") else None

                            if app_name:
                                base_path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
                                perf_key = winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{app_name}\\PerfOptions")
                                winreg.SetValueEx(perf_key, "CpuPriorityClass", 0, winreg.REG_DWORD, cpu_value)
                                if io_value is not None:
                                    winreg.SetValueEx(perf_key, "IoPriority", 0, winreg.REG_DWORD, io_value)
                                winreg.CloseKey(perf_key)
                                success_count += 1
                        except:
                            continue

                    self.status_var.set(tr("status_imported").format(success_count, len(configs)))
                    self.load_applications()

                    messagebox.showinfo(tr("msg_import_done"),
                                      tr("msg_import_result").format(success_count, len(configs) - success_count))

            except Exception as e:
                messagebox.showerror(tr("error_title"), tr("error_import").format(str(e)))

class AddPriorityDialogTkinter:
    def __init__(self, parent, app_name=None, app_info=None):
        self.top = tk.Toplevel(parent)
        self.top.title(tr("dlg_edit_title") if app_name else tr("dlg_add_title"))
        self.top.geometry("500x450")
        self.top.transient(parent)
        self.top.grab_set()

        self.center_dialog(parent, 500, 450)

        self.result = None
        self.app_name = app_name
        self.app_info = app_info

        default_font = ("微软雅黑", 10)

        main_frame = tk.Frame(self.top, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        tk.Label(main_frame, text=tr("dlg_name_label"), font=default_font).grid(
            row=0, column=0, padx=5, pady=10, sticky=tk.W)

        self.app_name_var = tk.StringVar(value=app_name if app_name else "")
        app_entry = tk.Entry(main_frame, textvariable=self.app_name_var, width=40, font=default_font)
        app_entry.grid(row=0, column=1, padx=5, pady=10, sticky=tk.W)

        if app_name:
            app_entry.config(state=tk.DISABLED)

        self.auto_exe_var = tk.BooleanVar(value=True)
        tk.Checkbutton(main_frame, text=tr("dlg_auto_exe"), variable=self.auto_exe_var,
                      font=default_font).grid(row=1, column=1, padx=5, pady=5, sticky=tk.W)

        ttk.Separator(main_frame, orient=tk.HORIZONTAL).grid(
            row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)

        tk.Label(main_frame, text=tr("dlg_cpu_label"), font=default_font).grid(
            row=3, column=0, padx=5, pady=10, sticky=tk.W)

        self.cpu_var = tk.StringVar()
        cpu_combo = ttk.Combobox(main_frame, textvariable=self.cpu_var, state="readonly", width=30, font=default_font)
        cpu_combo.grid(row=3, column=1, padx=5, pady=10, sticky=tk.W)

        cpu_options = [
            (tr("cpu_opt_idle"), 1),
            (tr("cpu_opt_normal"), 2),
            (tr("cpu_opt_high"), 3),
            (tr("cpu_opt_realtime"), 4),
            (tr("cpu_opt_below"), 5),
            (tr("cpu_opt_above"), 6)
        ]

        cpu_combo["values"] = [opt[0] for opt in cpu_options]
        self.cpu_values = {opt[0]: opt[1] for opt in cpu_options}
        cpu_combo.current(1)

        ttk.Separator(main_frame, orient=tk.HORIZONTAL).grid(
            row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)

        self.io_enabled_var = tk.BooleanVar(value=False)
        io_check = tk.Checkbutton(main_frame, text=tr("dlg_io_enable"),
                                 variable=self.io_enabled_var, font=default_font)
        io_check.grid(row=5, column=0, columnspan=2, padx=5, pady=5, sticky=tk.W)

        tk.Label(main_frame, text=tr("dlg_io_label"), font=default_font).grid(
            row=6, column=0, padx=5, pady=10, sticky=tk.W)

        self.io_var = tk.StringVar()
        io_combo = ttk.Combobox(main_frame, textvariable=self.io_var, state="readonly", width=30, font=default_font)
        io_combo.grid(row=6, column=1, padx=5, pady=10, sticky=tk.W)

        io_options = [
            (tr("io_opt_very_low"), 0),
            (tr("io_opt_low"), 1),
            (tr("io_opt_normal"), 2),
            (tr("io_opt_high"), 3)
        ]

        io_combo["values"] = [opt[0] for opt in io_options]
        self.io_values = {opt[0]: opt[1] for opt in io_options}
        io_combo.current(2)
        io_combo.config(state=tk.DISABLED)

        def toggle_io_state():
            io_combo.config(state=tk.NORMAL if self.io_enabled_var.get() else tk.DISABLED)

        self.io_enabled_var.trace("w", lambda *args: toggle_io_state())

        if app_name and app_info:
            self.load_existing_values(app_info)

        button_frame = tk.Frame(main_frame)
        button_frame.grid(row=7, column=0, columnspan=2, pady=30)

        tk.Button(button_frame, text=tr("dlg_ok"), width=10, font=default_font,
                 command=self.on_ok, bg="#4CAF50", fg="white").pack(side=tk.LEFT, padx=10)
        tk.Button(button_frame, text=tr("dlg_cancel"), width=10, font=default_font,
                 command=self.on_cancel, bg="#f44336", fg="white").pack(side=tk.LEFT, padx=10)

    def center_dialog(self, parent, width, height):
        parent_x = parent.winfo_rootx()
        parent_y = parent.winfo_rooty()
        parent_width = parent.winfo_width()
        parent_height = parent.winfo_height()

        x = parent_x + (parent_width - width) // 2
        y = parent_y + (parent_height - height) // 2

        self.top.geometry(f"{width}x{height}+{x}+{y}")

    def load_existing_values(self, app_info):
        cpu_value = app_info.get("cpu_value", 2)
        has_io = app_info.get("has_io", False)
        io_value = app_info.get("io_value", 2)

        for text, value in self.cpu_values.items():
            if value == cpu_value:
                self.cpu_var.set(text)
                break

        if has_io:
            self.io_enabled_var.set(True)
            for text, value in self.io_values.items():
                if value == io_value:
                    self.io_var.set(text)
                    break

    def on_ok(self):
        app_name = self.app_name_var.get().strip()

        if not app_name:
            messagebox.showwarning(tr("warn_title"), tr("warn_name_empty"))
            return

        if self.auto_exe_var.get() and not app_name.lower().endswith(".exe"):
            app_name += ".exe"

        if not app_name.lower().endswith(".exe"):
            result = messagebox.askyesno(tr("confirm_title"),
                                       tr("confirm_no_exe") + "\n" +
                                       tr("confirm_no_exe_tip"))
            if not result:
                return

        cpu_text = self.cpu_var.get()
        cpu_value = self.cpu_values.get(cpu_text, 2)

        io_value = None
        if self.io_enabled_var.get():
            io_text = self.io_var.get()
            io_value = self.io_values.get(io_text, 2)

        self.result = (app_name, cpu_value, io_value)
        self.top.destroy()

    def on_cancel(self):
        self.top.destroy()

if __name__ == "__main__":
    if not is_admin():
        run_as_admin()
        sys.exit(0)

    root = tk.Tk()

    config = load_config()
    saved_lang = config.get("language", "zh")
    set_language(saved_lang, save=False)

    app = AppCpuPriorityToolsTkinter(root)
    root.mainloop()