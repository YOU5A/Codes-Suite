"""Media File Manager."""
import tkinter as tk
from tkinter import filedialog, messagebox, ttk, scrolledtext
import os
import json
import sys
import traceback
from pathlib import Path
from mutagen import File
from mutagen.flac import FLAC, Picture
from mutagen.mp3 import MP3  # P3
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TALB, TDRC  # TDRC
from mutagen.mp4 import MP4, MP4Cover
from mutagen.oggvorbis import OggVorbis
from PIL import Image, ImageTk
import io

# ====================  ====================
SUPPORTED_FORMATS = ['.mp3', '.flac', '.ogg', '.m4a', '.mp4a', '.wav', '.opus']
COVER_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif']
COVER_MAX_SIZE = 800
DEFAULT_COVER_SIZE = (200, 200)

# Config file for persisting settings
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "config.json")

def load_config():
    """Load saved configuration"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except:
        pass
    return {}

def save_config(cfg):
    """Save configuration to file"""
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except:
        pass


# ==================== Language System ====================
TEXTS = {
    "zh": {
        "app_title": "媒体文件管理工具",
        "file_menu": "文件",
        "file_exit": "退出",
        "file_lang": "语言",
        "lang_cn": "中文",
        "lang_en": "English",
        "help_menu": "帮助",
        "help_about": "关于",
        "status_ready": "就绪",
        "tab_tags": "音乐标签编辑器",
        "tab_sorter": "文件批量重命名",
        "folder_ops": "文件夹操作",
        "music_folder": "音乐文件夹",
        "browse": "浏览",
        "formats_label": "支持格式:",
        "scan_folder": "扫描文件夹",
        "tag_editor": "标签编辑",
        "title_label": "标题:",
        "artist_label": "艺术家",
        "album_label": "专辑:",
        "year_label": "年份:",
        "genre_label": "流派:",
        "save_tags": "保存标签",
        "clear_tags": "清除标签",
        "apply_all": "应用到所有",
        "file_rename": "文件重命名",
        "custom_name": "自定义名称",
        "rename_selected": "重命名选中文件",
        "rename_all": "重命名所有文件",
        "cover_ops": "封面操作",
        "select_cover": "选择封面图片",
        "apply_selected": "应用到选中",
        "apply_all_cover": "应用到所有",
        "save_cover": "保存封面",
        "remove_selected_cover": "删除选中封面",
        "remove_all_cover": "删除所有封面",
        "op_log": "操作日志",
        "ready": "就绪",
        "file_list": "文件列表",
        "cover_preview": "封面预览与播放器",
        "warn_no_file": "请先选择一个文件",
        "warn_no_folder": "请先选择文件夹",
        "warn_no_title": "文件没有标题信息，无法重命名",
        "warn_invalid_title": "标题无效，无法重命名",
        "scan_complete": "扫描完成，找到{} 个音频文件",
        "folder_not_exist": "文件夹不存在: {}",
        "rename_success": "重命名成功 {}",
        "rename_failed": "重命名失败 {}",
        "rename_complete": "重命名完成 成功 {}, 失败 {}",
        "no_audio_found": "没有找到可处理的音频文件",
        "now_playing": "正在播放: {}",
        "playback_failed": "播放失败: {}",
        "no_audio_selected": "未选择音频文件",
        "confirm_setting": "确认设置",
        "confirm_set": "确定要将 Win32PrioritySeparation 设置为吗？",
        "about_title": "关于",
        "about_text": "媒体文件管理工具 v2.0\n\n功能特性：\n1. 音乐标签编辑（MP3, FLAC, OGG, M4A, WAV, OPUS）\n2. 批量文件重命名\n3. 封面图片管理\n4. 文件排序和组织\n\n技术支持：Python + Tkinter + Mutagen + Pillow\n\n提示：pip install pygame 可获得更好的音频格式支持",
        "file_sorter_title": "文件批量重命名工具",
        "target_folder": "目标文件夹",
        "folder_path": "文件夹路径",
        "naming_settings": "命名设置",
        "name_format": "命名格式:",
        "name_example": "示例: 文件_001.jpg, 文件_002.jpg",
        "sort_settings": "排序设置",
        "sort_name": "按文件名排序",
        "sort_mod": "按修改时间排序",
        "sort_create": "按创建时间排序",
        "file_filter": "文件过滤",
        "filter_ext": "文件扩展名(逗号分隔):",
        "preview_rename": "预览重命名",
        "execute_rename": "执行重命名",
        "preview_header": "重命名预览",
        "total_files": "共计 {} 个文件",
        "confirm_rename": "确定要对 {} 个文件执行重命名吗？",
        "success_label": "成功:",
        "failed_label": "失败:",
        "op_complete": "操作完成: {} 成功, {} 失败",
        "batch_tags_complete": "批量标签应用: {} 成功, {} 失败",
        "cover_selected": "已选择封面: {}",
        "cover_load_failed": "封面加载失败: {}",
        "delete_success": "删除成功",
        "delete_failed": "删除失败",
        "cover_not_found": "未找到封面",
        "files_found": "已加载{} 个备件",
        "no_backup": "无备份文件",
        "warn_no_format": "请输入命名格式",
        "rename_preview": "重命名预览",
        "gen_name_failed": "生成新文件名失败",
        "success_fmt": "成功",
        "failed_fmt": "失败",
        "tags_confirm_title": "确认",
        "tags_confirm_msg": "确定要将当前标签（除标题外）应用到{} 个文件吗？\n\n注意：将保留每个文件的原始标题，只更新艺术家、专辑、年份和流派。",
        "process_failed": "处理失败",
        "load_failed": "加载备份失败: {}",
        "warn_no_tags": "请至少输入一个标签（标题除外？",
    },

    "en": {
        "app_title": "Media File Manager",
        "file_menu": "File",
        "file_exit": "Exit",
        "file_lang": "Language",
        "lang_cn": "中文",
        "lang_en": "English",
        "help_menu": "Help",
        "help_about": "About",
        "status_ready": "Ready",
        "tab_tags": "Music Tag Editor",
        "tab_sorter": "Batch File Rename",
        "folder_ops": "Folder Operations",
        "music_folder": "Music folder:",
        "browse": "Browse",
        "formats_label": "Formats:",
        "scan_folder": "Scan Folder",
        "tag_editor": "Tag Editor",
        "title_label": "Title:",
        "artist_label": "Artist:",
        "album_label": "Album:",
        "year_label": "Year:",
        "genre_label": "Genre:",
        "save_tags": "Save Tags",
        "clear_tags": "Clear",
        "apply_all": "Apply All",
        "file_rename": "File Rename",
        "custom_name": "Custom name:",
        "rename_selected": "Rename Selected",
        "rename_all": "Rename All",
        "cover_ops": "Cover Operations",
        "select_cover": "Select Cover Image",
        "apply_selected": "Apply to Selected",
        "apply_all_cover": "Apply to All",
        "save_cover": "Save Cover",
        "remove_selected_cover": "Remove Selected Cover",
        "remove_all_cover": "Remove All Covers",
        "op_log": "Operation Log",
        "ready": "Ready",
        "file_list": "File List",
        "cover_preview": "Cover Preview & Player",
        "warn_no_file": "Please select a file first",
        "warn_no_folder": "Please select a folder first",
        "warn_no_title": "File has no title, cannot rename",
        "warn_invalid_title": "Invalid title, cannot rename",
        "scan_complete": "Scan complete, found {} files",
        "folder_not_exist": "Folder does not exist: {}",
        "rename_success": "Renamed: {}",
        "rename_failed": "Rename failed: {}",
        "rename_complete": "Rename complete: {} success, {} failed",
        "no_audio_found": "No audio files found",
        "now_playing": "Now playing: {}",
        "playback_failed": "Playback failed: {}",
        "no_audio_selected": "No audio file selected",
        "confirm_setting": "Confirm Setting",
        "confirm_set": "Are you sure you want to set Win32PrioritySeparation to?",
        "about_title": "About",
        "about_text": "Media File Manager v2.0\n\nFeatures:\n1. Music tag editor (MP3, FLAC, OGG, M4A, WAV, OPUS)\n2. Batch file rename\n3. Cover image management\n4. File sorting & organization\n\nTech: Python + Tkinter + Mutagen + Pillow\n\nTip: pip install pygame for better audio format support",
        "file_sorter_title": "Batch File Rename Tool",
        "target_folder": "Target Folder",
        "folder_path": "Folder path:",
        "naming_settings": "Naming Settings",
        "name_format": "Naming format:",
        "name_example": "Example: file_001.jpg, file_002.jpg",
        "sort_settings": "Sort Settings",
        "sort_name": "Sort by filename",
        "sort_mod": "Sort by modification time",
        "sort_create": "Sort by creation time",
        "file_filter": "File Filter",
        "filter_ext": "File extensions (comma separated):",
        "preview_rename": "Preview Rename",
        "execute_rename": "Execute Rename",
        "preview_header": "Rename Preview",
        "total_files": "Total {} files",
        "confirm_rename": "Rename {} files?",
        "success_label": "Success:",
        "failed_label": "Failed:",
        "op_complete": "Operation complete: {} success, {} failed",
        "batch_tags_complete": "Batch tags applied: {} success, {} failed",
        "cover_selected": "Cover selected: {}",
        "cover_saved": "Cover saved: {}",
        "cover_load_failed": "Failed to load cover: {}",
        "delete_success": "Deleted successfully",
        "delete_failed": "Delete failed",
        "cover_not_found": "Cover not found",
        "files_found": "Loaded {} backups",
        "no_backup": "No backup files",
        "warn_no_format": "Please enter naming format",
        "rename_preview": "Rename preview:",
        "gen_name_failed": "Failed to generate filename",
        "success_fmt": "Success",
        "failed_fmt": "Failed",
        "tags_confirm_title": "Confirm",
        "tags_confirm_msg": "Apply current tags (excluding title) to {} files?\\n\\nNote: Original titles will be preserved.",
        "process_failed": "Processing failed",
        "load_failed": "Failed to load backup: {}",
        "warn_no_tags": "Please enter at least one tag (excluding title)",
    },
}
_current_lang = "zh"

def tr(key, *args):
    """Get translated text for key in current language"""
    text = TEXTS.get(_current_lang, TEXTS["zh"]).get(key, key)
    if args:
        return text.format(*args)
    return text

def set_language(lang, save=True):
    """Set current language"""
    global _current_lang
    if lang in TEXTS:
        _current_lang = lang
        if save:
            cfg = load_config()
            cfg["language"] = lang
            save_config(cfg)
        return True
    return False

def get_language():
    """Get current language code"""
    return _current_lang

# ========================================
class FileUtils:
    """Utils."""
    @staticmethod
    def sanitize_filename(name):
        """Utils."""
        if not name:
            return ""
        
        illegal_chars = r"/\\:*?\"<>|"
        for char in illegal_chars:
            name = name.replace(char, '')
        
        name = ' '.join(name.split())
        return name[:100].strip()
        
    @staticmethod
    def get_files_by_criteria(folder_path, extensions=None, recursive=True):
        """Utils."""
        if not os.path.exists(folder_path):
            return []
        
        if extensions is None:
            extensions = []
        
        files = []
        if recursive:
            for root_dir, _, filenames in os.walk(folder_path):
                for filename in filenames:
                    if any(filename.lower().endswith(ext) for ext in extensions):
                        files.append(os.path.join(root_dir, filename))
        else:
            for entry in os.scandir(folder_path):
                if entry.is_file() and any(entry.name.lower().endswith(ext) for ext in extensions):
                    files.append(entry.path)
        
        return files
        
    @staticmethod
    def sort_files(files, method="modification"):
        """Utils."""
        if method == "modification":
            return sorted(files, key=lambda x: os.path.getmtime(x))
        elif method == "filename":
            return sorted(files, key=lambda x: os.path.basename(x).lower())
        else:
            return files

# ========================================
class AudioFileProcessor:
    """Utils."""
    @staticmethod
    def load_audio_file(file_path):
        """Utils."""
        ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if ext == '.mp3':
                try:
                    audio = MP3(file_path, ID3=ID3)
                except:
                    audio = MP3(file_path)
            elif ext == '.flac':
                audio = FLAC(file_path)
            elif ext in ['.ogg', '.opus']:
                audio = OggVorbis(file_path)
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                audio = MP4(file_path)
            elif ext == '.wav':
                audio = File(file_path)
            else:
                raise ValueError(f": {ext}")
            
            return audio
        except Exception as e:
            raise Exception(f": {str(e)}")
        
    @staticmethod
    def get_metadata(file_path):
        """Utils."""
        try:
            audio = AudioFileProcessor.load_audio_file(file_path)
            ext = os.path.splitext(file_path)[1].lower()
            
            metadata = {"title": "", "artist": "", "album": "", "year": "", "genre": "", "track": "", "cover": None}
            
            if ext == '.mp3':
                # MP3ID3
                if hasattr(audio, 'tags') and audio.tags:
                    if 'TIT2' in audio.tags:
                        metadata["title"] = audio.tags['TIT2'].text[0]
                    if 'TPE1' in audio.tags:
                        metadata["artist"] = audio.tags['TPE1'].text[0]
                    if 'TALB' in audio.tags:
                        metadata["album"] = audio.tags['TALB'].text[0]
                    if 'TDRC' in audio.tags:
                        metadata["year"] = str(audio.tags['TDRC'].text[0])
                    if 'TCON' in audio.tags:
                        metadata["genre"] = audio.tags['TCON'].text[0]
                    if 'TRCK' in audio.tags:
                        metadata["track"] = audio.tags['TRCK'].text[0]
            elif ext == '.flac':
                metadata["title"] = audio.get('title', [''])[0]
                metadata["artist"] = audio.get('artist', [''])[0]
                metadata["album"] = audio.get('album', [''])[0]
                metadata["year"] = audio.get('date', [''])[0]
                metadata["genre"] = audio.get('genre', [''])[0]
                metadata["track"] = audio.get('tracknumber', [''])[0]
            elif ext in ['.ogg', '.opus']:
                metadata["title"] = audio.get('title', [''])[0]
                metadata["artist"] = audio.get('artist', [''])[0]
                metadata["album"] = audio.get('album', [''])[0]
                metadata["year"] = audio.get('date', [''])[0]
                metadata["genre"] = audio.get('genre', [''])[0]
                metadata["track"] = audio.get('tracknumber', [''])[0]
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                metadata["title"] = audio.get('\xa9nam', [''])[0]
                metadata["artist"] = audio.get('\xa9ART', [''])[0]
                metadata["album"] = audio.get('\xa9alb', [''])[0]
                metadata["year"] = audio.get('\xa9day', [''])[0]
                metadata["genre"] = audio.get('\xa9gen', [''])[0]
                metadata["track"] = audio.get('trkn', [(0, 0)])[0][0] if audio.get('trkn') else ''
            elif ext == '.wav':
                if hasattr(audio, 'tags') and audio.tags:
                    metadata["title"] = audio.tags.get('title', [''])[0]
                    metadata["artist"] = audio.tags.get('artist', [''])[0]
                    metadata["album"] = audio.tags.get('album', [''])[0]
                    metadata["year"] = audio.tags.get('year', [''])[0]
                    metadata["genre"] = audio.tags.get('genre', [''])[0]
                    metadata["track"] = audio.tags.get('track', [''])[0]
            
            return metadata
        except Exception as e:
            print(f"?{file_path}: {e}")
            return {"title": "", "artist": "", "album": "", "year": "", "genre": "", "track": "", "cover": None}
        
    @staticmethod
    def extract_cover(file_path):
        """Utils."""
        try:
            audio = AudioFileProcessor.load_audio_file(file_path)
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == '.mp3':
                if hasattr(audio, 'tags') and audio.tags:
                    for key in audio.tags.keys():
                        if key.startswith('APIC'):
                            return audio.tags[key].data
            elif ext == '.flac':
                if hasattr(audio, 'pictures') and audio.pictures:
                    return audio.pictures[0].data
            elif ext in ['.ogg', '.opus']:
                if 'metadata_block_picture' in audio:
                    return audio['metadata_block_picture'][0]
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                if 'covr' in audio:
                    return audio['covr'][0]
            
            return None
        except Exception:
            return None
        
    @staticmethod
    def save_tags(file_path, title="", artist="", album="", year="", genre="", track="", preserve_title=False):
        """Utils."""
        try:
            ext = os.path.splitext(file_path)[1].lower()
            
            if preserve_title:
                # 
                metadata = AudioFileProcessor.get_metadata(file_path)
                title = metadata["title"]
            
            if ext == '.mp3':
                audio = AudioFileProcessor.load_audio_file(file_path)
                
                if not hasattr(audio, 'tags') or audio.tags is None:
                    audio.add_tags()
                
                # Delete existing frames to avoid duplicates
                for key in ['TIT2', 'TPE1', 'TALB', 'TDRC', 'TCON']:
                    if key in audio.tags:
                        del audio.tags[key]
                
                if title:
                    audio.tags.add(TIT2(encoding=3, text=title))
                if artist:
                    audio.tags.add(TPE1(encoding=3, text=artist))
                if album:
                    audio.tags.add(TALB(encoding=3, text=album))
                if year:
                    audio.tags.add(TDRC(encoding=3, text=year))
                if genre:
                    audio.tags.add(TCON(encoding=3, text=genre))
                
                audio.save()
                
            elif ext == '.flac':
                audio = AudioFileProcessor.load_audio_file(file_path)
                if title:
                    audio['title'] = [title]
                if artist:
                    audio['artist'] = [artist]
                if album:
                    audio['album'] = [album]
                if year:
                    audio['date'] = [year]
                if genre:
                    audio['genre'] = [genre]
                if track:
                    audio['tracknumber'] = [track]
                audio.save()
                
            elif ext in ['.ogg', '.opus']:
                audio = AudioFileProcessor.load_audio_file(file_path)
                if title:
                    audio['title'] = [title]
                if artist:
                    audio['artist'] = [artist]
                if album:
                    audio['album'] = [album]
                if year:
                    audio['date'] = [year]
                if genre:
                    audio['genre'] = [genre]
                if track:
                    audio['tracknumber'] = [track]
                audio.save()
                
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                audio = AudioFileProcessor.load_audio_file(file_path)
                if title:
                    audio['\xa9nam'] = [title]
                if artist:
                    audio['\xa9ART'] = [artist]
                if album:
                    audio['\xa9alb'] = [album]
                if year:
                    audio['\xa9day'] = [year]
                if genre:
                    audio['\xa9gen'] = [genre]
                if track:
                    audio['trkn'] = [(int(track), 0)]
                audio.save()
                
            return True
        except Exception as e:
            raise Exception(f": {str(e)}")
        
    @staticmethod
    def apply_cover(file_path, cover_data, mime_type="image/jpeg"):
        """Utils."""
        try:
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == '.mp3':
                audio = AudioFileProcessor.load_audio_file(file_path)
                
                # ?
                if not hasattr(audio, 'tags') or audio.tags is None:
                    audio.add_tags()
                
                # 
                if hasattr(audio, 'tags') and audio.tags:
                    for key in list(audio.tags.keys()):
                        if key.startswith('APIC'):
                            del audio.tags[key]
                
                # ?
                audio.tags.add(APIC(
                    encoding=3,
                    mime=mime_type,
                    type=3,
                    desc='Cover',
                    data=cover_data
                ))
                audio.save()
                
            elif ext == '.flac':
                audio = FLAC(file_path)
                audio.clear_pictures()
                pic = Picture()
                pic.data = cover_data
                pic.type = 3
                pic.mime = mime_type
                pic.desc = 'Cover'
                audio.add_picture(pic)
                audio.save()
                
            elif ext in ['.ogg', '.opus']:
                audio = OggVorbis(file_path)
                pic = Picture()
                pic.data = cover_data
                pic.type = 3
                pic.mime = mime_type
                pic.desc = 'Cover'
                audio['metadata_block_picture'] = [pic.write()]
                audio.save()
                
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                audio = MP4(file_path)
                cover_format = MP4Cover.FORMAT_PNG if mime_type == 'image/png' else MP4Cover.FORMAT_JPEG
                audio['covr'] = [MP4Cover(cover_data, cover_format)]
                audio.save()
                
            return True
        except Exception as e:
            raise Exception(f": {str(e)}")
        
    @staticmethod
    def remove_cover(file_path):
        """Utils."""
        try:
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == '.mp3':
                audio = AudioFileProcessor.load_audio_file(file_path)
                if hasattr(audio, 'tags') and audio.tags:
                    for key in list(audio.tags.keys()):
                        if key.startswith('APIC'):
                            del audio.tags[key]
                    audio.save()
                    
            elif ext == '.flac':
                audio = FLAC(file_path)
                audio.clear_pictures()
                audio.save()
                
            elif ext in ['.ogg', '.opus']:
                audio = OggVorbis(file_path)
                if 'metadata_block_picture' in audio:
                    del audio['metadata_block_picture']
                audio.save()
                
            elif ext in ['.m4a', '.mp4', '.mp4a']:
                audio = MP4(file_path)
                if 'covr' in audio:
                    del audio['covr']
                audio.save()
                
            return True
        except Exception as e:
            raise Exception(f": {str(e)}")

# ==================== UI ====================
# ==================== MCI Audio Player ====================
class AudioPlayer:
    """Cross-format audio player using pygame or MCI fallback"""
    def __init__(self):
        self._use_pygame = False
        self._mci_alias = "media_tools_player"
        self._is_open = False
        self._is_playing = False
        self._is_paused = False
        self._current_file = None
        self._length_ms = 0
        self._volume = 100
        self._format = None
        self._mci_supported = {".mp3", ".wav", ".mp2", ".wma", ".mid", ".midi"}
        self._seek_pos = 0  # base position for absolute tracking
        self._seek_time = 0  # time.time() of last play/seek

        # Try pygame first
        try:
            import pygame
            pygame.mixer.init()
            self._use_pygame = True
        except:
            pass

    def _mci(self, cmd):
        """Send MCI command string"""
        import ctypes
        buf = ctypes.create_unicode_buffer(512)
        ret = ctypes.windll.winmm.mciSendStringW(cmd, buf, 511, 0)
        if ret != 0:
            ctypes.windll.winmm.mciGetErrorStringW(ret, buf, 511)
        return buf.value

    def open(self, filepath):
        """Utils."""
        self.close()
        self._current_file = filepath
        ext = os.path.splitext(filepath)[1].lower()
        self._format = ext

        if self._use_pygame:
            self._open_pygame(filepath)
        else:
            self._open_mci(filepath, ext)

    def _open_pygame(self, filepath):
        """Open with pygame mixer"""
        import pygame
        try:
            pygame.mixer.music.load(filepath)
            self._is_open = True
            try:
                snd = pygame.mixer.Sound(filepath)
                self._length_ms = int(snd.get_length() * 1000)
            except:
                self._length_ms = 180000
        except Exception as e:
            raise Exception(f"Pygame load failed: {e}")

    def _open_mci(self, filepath, ext):
        """Open with Windows MCI"""
        dtype = "waveaudio" if ext == ".wav" else "mpegvideo"
        cmd = f'open "{filepath}" type {dtype} alias {self._mci_alias}'
        err = self._mci(cmd)
        if err:
            raise Exception(f"MCI open failed ({ext}): {err}")
        self._is_open = True
        self._length_ms = self._get_length_mci()

    def _get_length_mci(self):
        """Get audio length via MCI"""
        if not self._is_open:
            return 0
        try:
            self._mci(f"set {self._mci_alias} time format milliseconds")
            result = self._mci(f"status {self._mci_alias} length")
            return int(result) if result.strip().isdigit() else 180000
        except:
            return 180000

    def play(self):
        """Start or resume playback"""
        if not self._is_open:
            return
        if self._use_pygame:
            import pygame, time
            if self._is_paused:
                pygame.mixer.music.unpause()
            else:
                pygame.mixer.music.play()
                self._seek_pos = 0
                self._seek_time = time.time()
        else:
            if self._is_paused:
                self._mci(f"resume {self._mci_alias}")
            else:
                self._mci(f"play {self._mci_alias}")
        self._is_paused = False
        self._is_playing = True

    def pause(self):
        """Utils."""
        if not self._is_open:
            return
        if self._use_pygame:
            import pygame
            pygame.mixer.music.pause()
        else:
            if self._is_playing and not self._is_paused:
                self._mci(f"pause {self._mci_alias}")
        self._is_paused = True
        self._is_playing = False

    def stop(self):
        """Utils."""
        if not self._is_open:
            return
        if self._use_pygame:
            import pygame
            pygame.mixer.music.stop()
        else:
            self._mci(f"stop {self._mci_alias}")
            self._mci(f"seek {self._mci_alias} to start")
        self._is_playing = False
        self._is_paused = False
        self._seek_pos = 0
        self._seek_time = 0

    def close(self):
        """Utils."""
        if self._is_open:
            if self._use_pygame:
                import pygame
                try:
                    pygame.mixer.music.stop()
                    pygame.mixer.music.unload()
                except:
                    pass
            else:
                self._mci(f"close {self._mci_alias}")
            self._is_open = False
            self._is_playing = False
            self._is_paused = False
            self._seek_pos = 0
            self._seek_time = 0
            self._current_file = None
            self._length_ms = 0

    def seek(self, position_ms):
        """Utils."""
        if not self._is_open:
            return
        if self._use_pygame:
            import pygame, time
            try:
                if self._is_playing or self._is_paused:
                    pygame.mixer.music.set_pos(position_ms / 1000.0)
                else:
                    pygame.mixer.music.play(start=position_ms / 1000.0)
                    self._is_playing = True
                    self._is_paused = False
                self._seek_pos = position_ms
                self._seek_time = time.time()
            except:
                pass
        elif self._format in {".mp3", ".wav"}:
            try:
                was_playing = self._is_playing
                was_paused = self._is_paused
                self._mci(f"seek {self._mci_alias} to {int(position_ms)}")
                if was_playing and not was_paused:
                    self._mci(f"play {self._mci_alias}")
            except:
                pass

    def get_position(self):
        """Get current position in milliseconds"""
        if not self._is_open:
            return 0
        if self._use_pygame:
            import pygame, time
            try:
                if self._is_paused:
                    return int(self._seek_pos)
                if pygame.mixer.music.get_busy():
                    return int(self._seek_pos + (time.time() - self._seek_time) * 1000)
                return int(self._seek_pos)
            except:
                return 0
        elif self._format in {".mp3", ".wav"}:
            try:
                self._mci(f"set {self._mci_alias} time format milliseconds")
                result = self._mci(f"status {self._mci_alias} position")
                return int(result) if result.strip().isdigit() else 0
            except:
                return 0
        return 0

    def set_volume(self, volume):
        """Utils."""
        self._volume = max(0, min(100, volume))
        if self._use_pygame:
            import pygame
            pygame.mixer.music.set_volume(self._volume / 100.0)
        else:
            mci_vol = int(self._volume * 10)
            try:
                self._mci(f"setaudio {self._mci_alias} volume to {mci_vol}")
            except:
                pass

    @property
    def is_playing(self):
        if self._use_pygame:
            import pygame
            return pygame.mixer.music.get_busy() and not self._is_paused
        return self._is_playing

    @property
    def is_paused(self):
        return self._is_paused

    @property
    def length_ms(self):
        return self._length_ms

    @property
    def is_open(self):
        return self._is_open

    @property
    def volume(self):
        return self._volume

    @property
    def format_supported(self):
        """Check if current format is well-supported"""
        if self._use_pygame:
            return True
        return self._format in self._mci_supported

class TagEditorTab:
    """Utils."""
    def __init__(self, parent):
        self.parent = parent
        self.current_folder = ""
        self.current_file = None
        self.selected_cover = None

        # Audio player
        self.audio_player = AudioPlayer()
        self._dragging_progress = False
        self._audio_update_id = None
        self._audio_files = []  # Ordered list of audio file paths
        self._audio_index = -1
        
        self.setup_ui()


        
    def setup_ui(self):
        """Utils."""
        main_frame = ttk.Frame(self.parent, padding=5)
        main_frame.pack(fill=tk.BOTH, expand=True)

        left_panel = ttk.Frame(main_frame)
        right_panel = ttk.Frame(main_frame)

        left_panel.grid(row=0, column=0, sticky="ns", padx=(0, 5))
        right_panel.grid(row=0, column=1, sticky="nsew")

        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)

        # -------------------- Left: Controls --------------------
        folder_frame = ttk.LabelFrame(left_panel, text=tr("folder_ops"), padding=8)
        folder_frame.pack(fill=tk.X, pady=(0, 6))

        folder_frame.columnconfigure(1, weight=1)

        ttk.Label(folder_frame, text=tr("music_folder")).grid(row=0, column=0, sticky=tk.W, pady=3)
        self.folder_entry = ttk.Entry(folder_frame)
        self.folder_entry.grid(row=0, column=1, sticky="ew", padx=3, pady=3)
        ttk.Button(folder_frame, text=tr("browse"), command=self.browse_folder, width=7).grid(row=0, column=2, padx=2)

        ttk.Label(folder_frame, text=tr("formats_label")).grid(row=1, column=0, sticky=tk.W, pady=1)
        ttk.Label(folder_frame, text="MP3, FLAC, OGG, M4A, WAV, OPUS", font=('Arial', 8)).grid(row=1, column=1, columnspan=2, sticky=tk.W, pady=1)

        ttk.Button(folder_frame, text=tr("scan_folder"), command=self.scan_folder).grid(row=2, column=0, columnspan=3, pady=(6, 0), sticky="ew")

        # Tag editor
        tag_frame = ttk.LabelFrame(left_panel, text=tr("tag_editor"), padding=8)
        tag_frame.pack(fill=tk.X, pady=(0, 6))

        tag_frame.columnconfigure(1, weight=1)

        ttk.Label(tag_frame, text=tr("title_label")).grid(row=0, column=0, sticky=tk.W, pady=2)
        self.title_entry = ttk.Entry(tag_frame)
        self.title_entry.grid(row=0, column=1, sticky="ew", padx=3, pady=2)

        ttk.Label(tag_frame, text=tr("artist_label")).grid(row=1, column=0, sticky=tk.W, pady=2)
        self.artist_entry = ttk.Entry(tag_frame)
        self.artist_entry.grid(row=1, column=1, sticky="ew", padx=3, pady=2)

        ttk.Label(tag_frame, text=tr("album_label")).grid(row=2, column=0, sticky=tk.W, pady=2)
        self.album_entry = ttk.Entry(tag_frame)
        self.album_entry.grid(row=2, column=1, sticky="ew", padx=3, pady=2)

        ttk.Label(tag_frame, text=tr("year_label")).grid(row=3, column=0, sticky=tk.W, pady=2)
        self.year_entry = ttk.Entry(tag_frame)
        self.year_entry.grid(row=3, column=1, sticky="ew", padx=3, pady=2)

        ttk.Label(tag_frame, text=tr("genre_label")).grid(row=4, column=0, sticky=tk.W, pady=2)
        self.genre_entry = ttk.Entry(tag_frame)
        self.genre_entry.grid(row=4, column=1, sticky="ew", padx=3, pady=2)

        button_frame = ttk.Frame(tag_frame)
        button_frame.grid(row=5, column=0, columnspan=2, pady=(8, 0), sticky="ew")
        ttk.Button(button_frame, text=tr("save_tags"), command=self.save_tags).pack(side=tk.LEFT, padx=2)
        ttk.Button(button_frame, text=tr("clear_tags"), command=self.clear_tags).pack(side=tk.LEFT, padx=2)
        ttk.Button(button_frame, text=tr("apply_all"), command=self.apply_tags_all).pack(side=tk.LEFT, padx=2)

        # File rename
        rename_frame = ttk.LabelFrame(left_panel, text=tr("file_rename"), padding=8)
        rename_frame.pack(fill=tk.X, pady=(0, 6))

        ttk.Label(rename_frame, text=tr("custom_name")).grid(row=0, column=0, sticky=tk.W, pady=3)
        self.rename_entry = ttk.Entry(rename_frame)
        self.rename_entry.grid(row=0, column=1, sticky="ew", padx=3, pady=3)
        rename_frame.columnconfigure(1, weight=1)

        rename_btn_frame = ttk.Frame(rename_frame)
        rename_btn_frame.grid(row=1, column=0, columnspan=2, pady=(3, 0), sticky="ew")
        ttk.Button(rename_btn_frame, text=tr("rename_selected"), command=self.rename_selected).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)
        ttk.Button(rename_btn_frame, text=tr("rename_all"), command=self.rename_all).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        # Cover operations
        cover_frame = ttk.LabelFrame(left_panel, text=tr("cover_ops"), padding=8)
        cover_frame.pack(fill=tk.X, pady=(0, 6))

        ttk.Button(cover_frame, text=tr("select_cover"), command=self.select_cover).pack(fill=tk.X, pady=3)
        ttk.Button(cover_frame, text=tr("save_cover"), command=self.save_cover).pack(fill=tk.X, pady=3)

        cover_button_frame = ttk.Frame(cover_frame)
        cover_button_frame.pack(fill=tk.X, pady=3)
        ttk.Button(cover_button_frame, text=tr("apply_selected"), command=self.apply_cover_selected).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)
        ttk.Button(cover_button_frame, text=tr("apply_all_cover"), command=self.apply_cover_all).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        remove_frame = ttk.Frame(cover_frame)
        remove_frame.pack(fill=tk.X, pady=3)
        ttk.Button(remove_frame, text=tr("remove_selected_cover"), command=self.remove_cover_selected).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)
        ttk.Button(remove_frame, text=tr("remove_all_cover"), command=self.remove_cover_all).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        # Log panel
        status_frame = ttk.LabelFrame(left_panel, text=tr("op_log"), padding=6)
        status_frame.pack(fill=tk.BOTH, expand=True)

        self.status_text = scrolledtext.ScrolledText(status_frame, height=6, wrap=tk.WORD)
        self.status_text.pack(fill=tk.BOTH, expand=True)

        # Configure log tags once
        self.status_text.tag_config("error", foreground="red")
        self.status_text.tag_config("warning", foreground="orange")
        self.status_text.tag_config("success", foreground="green")
        self.status_text.tag_config("info", foreground="#333333")
        self.log_message(tr("ready"))

        # -------------------- Right: File list + Cover preview --------------------
        # File list (shorter height)
        list_frame = ttk.LabelFrame(right_panel, text=tr("file_list"), padding=6)
        list_frame.grid(row=0, column=0, sticky="nsew", pady=(0, 6))
        right_panel.columnconfigure(0, weight=1)
        right_panel.rowconfigure(0, weight=1)

        list_container = ttk.Frame(list_frame)
        list_container.pack(fill=tk.BOTH, expand=True)

        self.file_list = tk.Listbox(list_container, selectmode=tk.SINGLE, exportselection=False, height=8)
        list_scrollbar = ttk.Scrollbar(list_container, command=self.file_list.yview)
        self.file_list.configure(yscrollcommand=list_scrollbar.set)

        self.file_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        list_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.file_list.bind('<<ListboxSelect>>', self.on_file_select)
        self.file_list.bind('<MouseWheel>', self._on_listbox_mousewheel)
        self.file_list.bind('<Button-4>', self._on_listbox_mousewheel)
        self.file_list.bind('<Button-5>', self._on_listbox_mousewheel)

        # Cover preview with audio controls
        preview_frame = ttk.LabelFrame(right_panel, text=tr("cover_preview"), padding=6)
        preview_frame.grid(row=1, column=0, sticky="ew")
        right_panel.rowconfigure(1, weight=0)

        # Cover image
        self.cover_label = ttk.Label(preview_frame)
        self.cover_label.pack(pady=(0, 6))
        self.create_default_cover()

        # Audio controls frame
        audio_frame = ttk.Frame(preview_frame)
        audio_frame.pack(fill=tk.X)

        # Progress bar
        progress_frame = ttk.Frame(audio_frame)
        progress_frame.pack(fill=tk.X, pady=(0, 3))

        self.time_label = ttk.Label(progress_frame, text="00:00 / 00:00", font=('Arial', 8))
        self.time_label.pack(side=tk.RIGHT, padx=(5, 0))

        self.progress_var = tk.DoubleVar(value=0)
        self.progress_scale = ttk.Scale(progress_frame, from_=0, to=100, variable=self.progress_var,
                                        orient=tk.HORIZONTAL, command=self._on_progress_drag)
        self.progress_scale.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.progress_scale.bind('<ButtonPress-1>', lambda e: setattr(self, '_dragging_progress', True))
        self.progress_scale.bind('<ButtonRelease-1>', lambda e: setattr(self, '_dragging_progress', False))

        # Playback buttons
        btn_frame = ttk.Frame(audio_frame)
        btn_frame.pack(fill=tk.X, pady=(3, 0))

        self.prev_btn = ttk.Button(btn_frame, text="|<<", command=self._play_prev, width=3)
        self.prev_btn.pack(side=tk.LEFT, padx=2)

        self.play_btn = ttk.Button(btn_frame, text=">", command=self._play_pause, width=3)
        self.play_btn.pack(side=tk.LEFT, padx=2)

        self.next_btn = ttk.Button(btn_frame, text=">>|", command=self._play_next, width=3)
        self.next_btn.pack(side=tk.LEFT, padx=2)

        # Volume control
        ttk.Label(btn_frame, text="Vol:").pack(side=tk.LEFT, padx=(10, 2))
        self.volume_var = tk.IntVar(value=100)
        self.volume_scale = ttk.Scale(btn_frame, from_=0, to=100, variable=self.volume_var,
                                      orient=tk.HORIZONTAL, length=80, command=self._on_volume_change)
        self.volume_scale.pack(side=tk.LEFT, padx=2)
    def create_default_cover(self):
        """Utils."""
        try:
            image = Image.new('RGB', DEFAULT_COVER_SIZE, color='#f0f0f0')
            photo = ImageTk.PhotoImage(image)
            self.default_cover = photo
            self.cover_label.config(image=photo)
            self.cover_label.image = photo
        except Exception:
            pass
        
    def log_message(self, message, level="info"):
        """Utils."""
        self.status_text.config(state=tk.NORMAL)
        
        if level == "error":
            tag = "error"
        elif level == "warning":
            tag = "warning"
        elif level == "success":
            tag = "success"
        else:
            tag = "info"
        
        self.status_text.insert(tk.END, f"{message}\n", tag)
        self.status_text.see(tk.END)
        self.status_text.config(state=tk.DISABLED)
        
        
    def browse_folder(self):
        """Utils."""
        folder = filedialog.askdirectory()
        if folder:
            self.folder_entry.delete(0, tk.END)
            self.folder_entry.insert(0, folder)
            self.current_folder = folder
        
    def scan_folder(self):
        """Utils."""
        folder = self.folder_entry.get().strip()
        if not folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return
        
        if not os.path.exists(folder):
            self.log_message(tr("folder_not_exist", folder), "error")
            return
        
        self.current_folder = folder

        self.file_list.delete(0, tk.END)
        files = FileUtils.get_files_by_criteria(folder, SUPPORTED_FORMATS, recursive=True)
        
        for file_path in files:
            self.file_list.insert(tk.END, os.path.relpath(file_path, folder))
        
        self.log_message(tr("scan_complete", len(files)))

        # Pre-load playlist for audio playback
        self._load_audio_playlist()
        
    def _on_listbox_mousewheel(self, event):
        """Mouse wheel handler for file list Listbox"""
        if event.num == 4 or (hasattr(event, 'delta') and event.delta > 0):
            self.file_list.yview_scroll(-1, 'units')
        elif event.num == 5 or (hasattr(event, 'delta') and event.delta < 0):
            self.file_list.yview_scroll(1, 'units')
        return 'break'
    

    # ---------- Audio playback ----------
    def _load_audio_playlist(self, file_path=None):
        """Build ordered playlist from scanned files"""
        if not self.current_folder:
            return
        files = FileUtils.get_files_by_criteria(self.current_folder, SUPPORTED_FORMATS, recursive=True)
        self._audio_files = sorted(files, key=lambda x: os.path.basename(x).lower())
        if file_path:
            # Normalize paths for comparison
            norm_target = os.path.normpath(file_path)
            for idx, f in enumerate(self._audio_files):
                if os.path.normpath(f) == norm_target:
                    self._audio_index = idx
                    return
        if self._audio_files:
            self._audio_index = 0

    def _play_pause(self):
        """Utils."""
        target_file = self.current_file

        if not target_file:
            self.log_message(tr("no_audio_selected"), "warning")
            return

        # Check if the currently loaded file matches target
        norm_target = os.path.normpath(target_file)
        current_playing = None
        if self.audio_player.is_open and self.audio_player._current_file:
            current_playing = os.path.normpath(self.audio_player._current_file)

        # If same file, toggle pause/play
        if current_playing == norm_target:
            if self.audio_player.is_playing:
                self.audio_player.pause()
                self.play_btn.config(text=">")
                self._stop_audio_update()
            elif self.audio_player.is_paused:
                self.audio_player.play()
                self.play_btn.config(text="||")
                self._start_audio_update()
            else:
                self.audio_player.play()
                self.play_btn.config(text="||")
                self._start_audio_update()
            return

        # Different file or nothing playing - stop old, start new
        self._stop_audio_update()
        if self.audio_player.is_open:
            self.audio_player.close()

        self._load_audio_playlist(target_file)
        if self._audio_index >= 0:
            self._play_file_at_index()
        else:
            self.log_message(tr("playback_failed", "File not found"), "error")

    def _play_prev(self):
        """Utils."""
        if not self._audio_files:
            self._load_audio_playlist()
        if self._audio_files and self._audio_index > 0:
            self._audio_index -= 1
            self.audio_player.close()
            self._play_file_at_index()

    def _play_next(self):
        """Utils."""
        if not self._audio_files:
            self._load_audio_playlist()
        if self._audio_files and self._audio_index < len(self._audio_files) - 1:
            self._audio_index += 1
            self.audio_player.close()
            self._play_file_at_index()

    def _play_file_at_index(self):
        """Play the file at current index and update UI"""
        if 0 <= self._audio_index < len(self._audio_files):
            filepath = self._audio_files[self._audio_index]
            try:
                self.audio_player.open(filepath)
                self.audio_player.play()
                # Warn if format not well-supported by MCI
                if not self.audio_player._use_pygame and not self.audio_player.format_supported:
                    ext = os.path.splitext(filepath)[1].lower()
                    self.log_message(f"MCI limited support for {ext}. Install pygame for full support.", "warning")
                self.play_btn.config(text="||")
                self.progress_scale.config(to=self.audio_player.length_ms if self.audio_player.length_ms > 0 else 100)
                self._start_audio_update()

                # Update UI to reflect current track
                self.current_file = filepath
                rel_path = os.path.relpath(filepath, self.current_folder) if self.current_folder else os.path.basename(filepath)
                # Select in file list
                for idx in range(self.file_list.size()):
                    if self.file_list.get(idx) == rel_path:
                        self.file_list.selection_clear(0, tk.END)
                        self.file_list.selection_set(idx)
                        self.file_list.see(idx)
                        break
                # Update tag display
                metadata = AudioFileProcessor.get_metadata(filepath)
                self.title_entry.delete(0, tk.END)
                self.artist_entry.delete(0, tk.END)
                self.album_entry.delete(0, tk.END)
                self.year_entry.delete(0, tk.END)
                self.genre_entry.delete(0, tk.END)
                if metadata["title"]:
                    self.title_entry.insert(0, metadata["title"])
                if metadata["artist"]:
                    self.artist_entry.insert(0, metadata["artist"])
                if metadata["album"]:
                    self.album_entry.insert(0, metadata["album"])
                if metadata["year"]:
                    self.year_entry.insert(0, metadata["year"])
                if metadata["genre"]:
                    self.genre_entry.insert(0, metadata["genre"])
                # Update cover
                self.display_cover(filepath)

                self.log_message(tr("now_playing", os.path.basename(filepath)))
            except Exception as e:
                self.log_message(tr("playback_failed", str(e)), "error")

    def _start_audio_update(self):
        """Start periodic progress bar update"""
        if self._audio_update_id is None:
            self._update_progress()

    def _stop_audio_update(self):
        """Stop periodic progress bar update"""
        if self._audio_update_id is not None:
            self.parent.after_cancel(self._audio_update_id)
            self._audio_update_id = None

    def _update_progress(self):
        """Update progress bar from audio position"""
        if not self.audio_player.is_open:
            self._stop_audio_update()
            self.play_btn.config(text=">")
            self.progress_var.set(0)
            self.time_label.config(text="00:00 / 00:00")
            return
        try:
            pos = self.audio_player.get_position()
            length = self.audio_player.length_ms
            if length > 0:
                if not self._dragging_progress:
                    self.progress_var.set(pos)
                pos_sec = pos // 1000
                len_sec = length // 1000
                self.time_label.config(text=f"{pos_sec//60:02d}:{pos_sec%60:02d} / {len_sec//60:02d}:{len_sec%60:02d}")
        except:
            pass
        self._audio_update_id = self.parent.after(200, self._update_progress)

    def _on_progress_drag(self, value):
        """Handle progress bar drag"""
        if self.audio_player.is_open:
            pos = float(value)
            self.audio_player.seek(pos)

    def _on_volume_change(self, value):
        """Handle volume slider change"""
        vol = int(float(value))
        self.audio_player.set_volume(vol)

    def cleanup_audio(self):
        """Clean up audio resources"""
        self._stop_audio_update()
        self.audio_player.close()
    def on_file_select(self, event):
        """Utils."""
        if not self.file_list.curselection():
            return
        
        selection = self.file_list.curselection()[0]
        file_name = self.file_list.get(selection)
        file_path = os.path.join(self.current_folder, file_name)
        self.current_file = file_path
        
        # Stop any currently playing audio when switching to a different file
        if self.audio_player.is_open and self.audio_player.is_playing:
            self._stop_audio_update()
            self.audio_player.close()
            self.play_btn.config(text=">")
            self.progress_var.set(0)
            self.time_label.config(text="00:00 / 00:00")
        
        # 
        metadata = AudioFileProcessor.get_metadata(file_path)
        
        self.title_entry.delete(0, tk.END)
        self.artist_entry.delete(0, tk.END)
        self.album_entry.delete(0, tk.END)
        self.year_entry.delete(0, tk.END)
        self.genre_entry.delete(0, tk.END)
        
        if metadata["title"]:
            self.title_entry.insert(0, metadata["title"])
        if metadata["artist"]:
            self.artist_entry.insert(0, metadata["artist"])
        if metadata["album"]:
            self.album_entry.insert(0, metadata["album"])
        if metadata["year"]:
            self.year_entry.insert(0, metadata["year"])
        if metadata["genre"]:
            self.genre_entry.insert(0, metadata["genre"])
        
        # 
        self.display_cover(file_path)

        # Load playlist for audio playback
        self._load_audio_playlist(file_path)


    def display_cover(self, file_path):
        """Utils."""
        try:
            cover_data = AudioFileProcessor.extract_cover(file_path)
            
            if cover_data:
                image = Image.open(io.BytesIO(cover_data))
                image.thumbnail(DEFAULT_COVER_SIZE)
                photo = ImageTk.PhotoImage(image)
                self.cover_label.config(image=photo)
                self.cover_label.image = photo
            else:
                self.cover_label.config(image=self.default_cover)
                self.cover_label.image = self.default_cover
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
            self.cover_label.config(image=self.default_cover)
            self.cover_label.image = self.default_cover
        
    def save_tags(self):
        """Utils."""
        if not self.current_file:
            messagebox.showwarning(tr("warn_no_file"), tr("warn_no_file"))
            return
        
        title = self.title_entry.get().strip()
        artist = self.artist_entry.get().strip()
        album = self.album_entry.get().strip()
        year = self.year_entry.get().strip()
        genre = self.genre_entry.get().strip()
        
        if not title and not artist and not album and not year and not genre:
            messagebox.showwarning("Warning", "Warning")
            return

        try:
            AudioFileProcessor.save_tags(self.current_file, title, artist, album, year, genre)
            self.log_message(f"Saved: {os.path.basename(self.current_file)}", "success")
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
        
    def clear_tags(self):
        """Utils."""
        if not self.current_file:
            messagebox.showwarning(tr("warn_no_file"), tr("warn_no_file"))
            return
        
        try:
            AudioFileProcessor.save_tags(self.current_file, "", "", "", "", "")
            self.title_entry.delete(0, tk.END)
            self.artist_entry.delete(0, tk.END)
            self.album_entry.delete(0, tk.END)
            self.year_entry.delete(0, tk.END)
            self.genre_entry.delete(0, tk.END)
            self.log_message(f": {os.path.basename(self.current_file)}", "success")
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
        
    def apply_tags_all(self):
        """Utils."""
        if not self.current_folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return
        
        artist = self.artist_entry.get().strip()
        album = self.album_entry.get().strip()
        year = self.year_entry.get().strip()
        genre = self.genre_entry.get().strip()
        
        if not artist and not album and not year and not genre:
            messagebox.showwarning(tr("warn_no_tags"), tr("warn_no_tags"))
            return
        
        files = FileUtils.get_files_by_criteria(self.current_folder, SUPPORTED_FORMATS, recursive=True)
        
        if not files:
            self.log_message(tr("no_audio_found"), "warning")
            return
        
        if not messagebox.askyesno(tr("tags_confirm_title"), tr("tags_confirm_msg", len(files)), icon=messagebox.WARNING):
            return
        
        success_count = 0
        error_count = 0
        
        for file_path in files:
            try:
                # ?
                AudioFileProcessor.save_tags(file_path, "", artist, album, year, genre, preserve_title=True)
                success_count += 1
            except Exception as e:
                error_count += 1
                self.log_message(tr("process_failed") + f" {os.path.basename(file_path)}: {str(e)}", "error")
        
        self.log_message(tr("batch_tags_complete", success_count, error_count), "success")
        
    def rename_selected(self):
        """Rename selected file"""
        if not self.current_file:
            messagebox.showwarning(tr("warn_no_file"), tr("warn_no_file"))
            return

        try:
            metadata = AudioFileProcessor.get_metadata(self.current_file)
            custom_name = self.rename_entry.get().strip()

            if custom_name:
                clean_title = FileUtils.sanitize_filename(custom_name)
            else:
                title = metadata.get("title", "")
                if not title:
                    title = self.title_entry.get().strip()
                    if not title:
                        self.log_message(tr("warn_no_title"), "warning")
                        return
                clean_title = FileUtils.sanitize_filename(title)

            if not clean_title:
                self.log_message(tr("warn_invalid_title"), "warning")
                return

            artist = metadata.get("artist", "")
            if artist and not custom_name:
                clean_artist = FileUtils.sanitize_filename(artist)
                if clean_artist:
                    clean_title = f"{clean_artist} - {clean_title}"

            dir_name = os.path.dirname(self.current_file)
            ext = os.path.splitext(self.current_file)[1]
            new_name = f"{clean_title}{ext}"
            new_path = os.path.join(dir_name, new_name)

            counter = 1
            while os.path.exists(new_path) and new_path != self.current_file:
                new_name = f"{clean_title}_{counter}{ext}"
                new_path = os.path.join(dir_name, new_name)
                counter += 1

            os.rename(self.current_file, new_path)
            self.current_file = new_path
            self.log_message(tr("rename_success", new_name), "success")
            self.scan_folder()
        except Exception as e:
            self.log_message(tr("rename_failed", str(e)), "error")

    def rename_all(self):
        """Utils."""
        if not self.current_folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return

        files = FileUtils.get_files_by_criteria(self.current_folder, SUPPORTED_FORMATS, recursive=True)

        if not files:
            self.log_message(tr("no_audio_found"), "warning")
            return

        custom_name = self.rename_entry.get().strip()
        success_count = 0
        error_count = 0
        counter_offset = 0

        for file_path in files:
            try:
                metadata = AudioFileProcessor.get_metadata(file_path)

                if custom_name:
                    base_name = FileUtils.sanitize_filename(custom_name)
                    if not base_name:
                        error_count += 1
                        continue
                    if len(files) > 1:
                        counter_offset += 1
                        clean_title = f"{base_name}_{counter_offset:03d}"
                    else:
                        clean_title = base_name
                else:
                    title = metadata.get("title", "")
                    if not title:
                        error_count += 1
                        continue
                    clean_title = FileUtils.sanitize_filename(title)
                    if not clean_title:
                        error_count += 1
                        continue
                    artist = metadata.get("artist", "")
                    if artist:
                        clean_artist = FileUtils.sanitize_filename(artist)
                        if clean_artist:
                            clean_title = f"{clean_artist} - {clean_title}"

                dir_name = os.path.dirname(file_path)
                ext = os.path.splitext(file_path)[1]
                new_name = f"{clean_title}{ext}"
                new_path = os.path.join(dir_name, new_name)

                counter = 1
                while os.path.exists(new_path) and new_path != file_path:
                    new_name = f"{clean_title}_{counter}{ext}"
                    new_path = os.path.join(dir_name, new_name)
                    counter += 1

                os.rename(file_path, new_path)
                success_count += 1
            except Exception:
                error_count += 1

        self.log_message(tr("rename_complete", success_count, error_count), "success")
        self.scan_folder()

    def select_cover(self):
        """Utils."""
        file_path = filedialog.askopenfilename(
            title="",
            filetypes=[("", "*.jpg;*.jpeg;*.png;*.bmp;*.gif")]
        )
        
        if file_path:
            self.selected_cover = file_path
            try:
                # 
                image = Image.open(file_path)
                image.thumbnail(DEFAULT_COVER_SIZE)
                photo = ImageTk.PhotoImage(image)
                self.cover_label.config(image=photo)
                self.cover_label.image = photo
                self.log_message(tr("cover_selected", os.path.basename(file_path)))
            except Exception as e:
                self.log_message(tr("cover_load_failed", str(e)), "error")
        

    def save_cover(self):
        """Save cover."""
        if not self.current_file:
            messagebox.showwarning("", tr("warn_no_file"))
            return
        try:
            cd = AudioFileProcessor.extract_cover(self.current_file)
            if not cd:
                self.log_message(tr("cover_not_found"), "warning")
                return
            fp = filedialog.asksaveasfilename(defaultextension=".jpg",
                filetypes=[("JPEG","*.jpg;*.jpeg"),("PNG","*.png"),("BMP","*.bmp")])
            if not fp: return
            open(fp, "wb").write(cd)
            self.log_message(tr("cover_saved", os.path.basename(fp)), "success")
        except Exception as e: self.log_message(tr("cover_save_failed", str(e)), "error")

    def optimize_cover(self, cover_data):
        """Utils."""
        try:
            img = Image.open(io.BytesIO(cover_data))
            
            # 
            if max(img.size) > COVER_MAX_SIZE:
                img.thumbnail((COVER_MAX_SIZE, COVER_MAX_SIZE), Image.LANCZOS)
            
            # PEG?
            output = io.BytesIO()
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=85, optimize=True)
            
            return output.getvalue(), "image/jpeg"
        except Exception:
            return cover_data, "image/jpeg"
        
    def apply_cover_selected(self):
        """Utils."""
        if not self.selected_cover:
            messagebox.showwarning("", "")
            return
        
        if not self.current_file:
            messagebox.showwarning("Warning", "Warning")
            self.log_message(f": {os.path.basename(self.current_file)}", "success")
            
            # 
        try:
            self.display_cover(self.current_file)
            
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
        
    def apply_cover_all(self):
        """Utils."""
        if not self.selected_cover:
            messagebox.showwarning("", "")
            return
        
        if not self.current_folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return
        
        files = FileUtils.get_files_by_criteria(self.current_folder, SUPPORTED_FORMATS, recursive=True)
        
        if not files:
            self.log_message(tr("no_audio_found"), "warning")
            return
        
        try:
            with open(self.selected_cover, 'rb') as f:
                cover_data = f.read()
            
            cover_data, mime_type = self.optimize_cover(cover_data)
            
            success_count = 0
            error_count = 0
            
            for file_path in files:
                try:
                    AudioFileProcessor.apply_cover(file_path, cover_data, mime_type)
                    success_count += 1
                except Exception:
                    error_count += 1
            
            self.log_message(f":  {success_count},  {error_count}", "success")
            
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
        
    def remove_cover_selected(self):
        """Utils."""
        if not self.current_file:
            messagebox.showwarning("Warning", "Warning")
            self.log_message(f": {os.path.basename(self.current_file)}", "success")
            self.display_cover(self.current_file)
        try:
            pass
        except Exception as e:
            self.log_message(f": {str(e)}", "error")
        
    def remove_cover_all(self):
        """Utils."""
        if not self.current_folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return
        
        files = FileUtils.get_files_by_criteria(self.current_folder, SUPPORTED_FORMATS, recursive=True)
        
        if not files:
            self.log_message(tr("no_audio_found"), "warning")
            return
        
        success_count = 0
        error_count = 0
        
        for file_path in files:
            try:
                AudioFileProcessor.remove_cover(file_path)
                success_count += 1
            except Exception:
                error_count += 1
        
        self.log_message(f":  {success_count},  {error_count}", "success")



        """Update all UI text to current language"""
        # Update all widget texts
        pass  # Widgets will be recreated or updated by the parent

class FileSorterTab:
    """Utils."""
    def __init__(self, parent):
        self.parent = parent
        self.setup_ui()
        
    def setup_ui(self):
        """Utils."""
        main_frame = ttk.Frame(self.parent, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(main_frame, text=tr("file_sorter_title")).pack(pady=(0, 20))
        
        folder_frame = ttk.LabelFrame(main_frame, text=tr("target_folder"), padding=15)
        folder_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(folder_frame, text=tr("folder_path")).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.folder_entry = ttk.Entry(folder_frame, width=50)
        self.folder_entry.grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(folder_frame, text=tr("browse"), command=self.browse_folder, width=8).grid(row=0, column=2, padx=2)
        
        naming_frame = ttk.LabelFrame(main_frame, text=tr("naming_settings"), padding=15)
        naming_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(naming_frame, text=tr("name_format")).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.name_format = ttk.Entry(naming_frame, width=50)
        self.name_format.grid(row=0, column=1, padx=5, pady=5)
        self.name_format.insert(0, "_{index:03d}")
        
        ttk.Label(naming_frame, text=tr("name_example")).grid(row=1, column=1, sticky=tk.W, padx=5)
        
        sort_frame = ttk.LabelFrame(main_frame, text=tr("sort_settings"), padding=15)
        sort_frame.pack(fill=tk.X, pady=(0, 15))
        
        self.sort_method = tk.StringVar(value="name")
        
        ttk.Radiobutton(sort_frame, text=tr("sort_name"), variable=self.sort_method, value="name").pack(anchor=tk.W, pady=2)
        ttk.Radiobutton(sort_frame, text=tr("sort_mod"), variable=self.sort_method, value="modification").pack(anchor=tk.W, pady=2)
        ttk.Radiobutton(sort_frame, text=tr("sort_create"), variable=self.sort_method, value="creation").pack(anchor=tk.W, pady=2)
        
        filter_frame = ttk.LabelFrame(main_frame, text=tr("file_filter"), padding=15)
        filter_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(filter_frame, text=tr("filter_ext")).pack(anchor=tk.W, pady=2)
        self.ext_filter = ttk.Entry(filter_frame, width=50)
        self.ext_filter.pack(fill=tk.X, pady=5)
        self.ext_filter.insert(0, "jpg,png,gif,bmp,mp3,mp4,txt,pdf")
        
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(pady=(0, 20))
        
        ttk.Button(button_frame, text=tr("preview_rename"), command=self.preview_rename, width=15).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text=tr("execute_rename"), command=self.execute_rename, width=15).pack(side=tk.LEFT, padx=5)
        
        status_frame = ttk.LabelFrame(main_frame, text=tr("op_log"), padding=15)
        status_frame.pack(fill=tk.BOTH, expand=True)
        
        self.status_text = scrolledtext.ScrolledText(status_frame, height=10, wrap=tk.WORD)
        self.status_text.pack(fill=tk.BOTH, expand=True)
        self.log_message("")
        
    def log_message(self, message, level="info"):
        """Utils."""
        self.status_text.config(state=tk.NORMAL)
        
        if level == "error":
            tag = "error"
        elif level == "warning":
            tag = "warning"
        elif level == "success":
            tag = "success"
        else:
            tag = "info"
        
        self.status_text.insert(tk.END, f"{message}\n", tag)
        self.status_text.see(tk.END)
        self.status_text.config(state=tk.DISABLED)
        
        
    def browse_folder(self):
        """Utils."""
        folder = filedialog.askdirectory()
        if folder:
            self.folder_entry.delete(0, tk.END)
            self.folder_entry.insert(0, folder)
        
    def get_file_list(self):
        """Utils."""
        folder = self.folder_entry.get().strip()
        if not folder:
            messagebox.showwarning(tr("warn_no_folder"), tr("warn_no_folder"))
            return []
        
        if not os.path.exists(folder):
            self.log_message(tr("folder_not_exist", folder), "error")
            return []
        
        ext_text = self.ext_filter.get().strip()
        if ext_text:
            extensions = [ext.strip().lower() for ext in ext_text.split(',')]
            extensions = [ext if ext.startswith('.') else f'.{ext}' for ext in extensions]
        else:
            extensions = []
        
        files = FileUtils.get_files_by_criteria(folder, extensions, recursive=False)
        
        sort_method = self.sort_method.get()
        if sort_method == "modification":
            files.sort(key=lambda x: os.path.getmtime(x))
        elif sort_method == "creation":
            files.sort(key=lambda x: os.path.getctime(x))
        else:
            files.sort(key=lambda x: os.path.basename(x).lower())
        
        return files
        
    def preview_rename(self):
        """Utils."""
        files = self.get_file_list()
        if not files:
            return
        
        name_format = self.name_format.get().strip()
        if not name_format:
            messagebox.showwarning(tr("warn_no_format"), tr("warn_no_format"))
            return
        
        self.log_message("=" * 50)
        self.log_message(tr("rename_preview"))
        self.log_message("=" * 50)
        
        for idx, file_path in enumerate(files, 1):
            old_name = os.path.basename(file_path)
            ext = os.path.splitext(file_path)[1]
            
            try:
                new_name = name_format.format(index=idx) + ext
                self.log_message(f"{old_name}  ->  {new_name}")
            except Exception as e:
                self.log_message(tr("gen_name_failed") + f": {old_name} - {str(e)}", "error")
        
        self.log_message("=" * 50)
        self.log_message(tr("total_files", len(files)))
        
    def execute_rename(self):
        """Utils."""
        files = self.get_file_list()
        if not files:
            return
        
        name_format = self.name_format.get().strip()
        if not name_format:
            messagebox.showwarning(tr("warn_no_format"), tr("warn_no_format"))
            return
        
        if not messagebox.askyesno(tr("confirm_rename"), tr("confirm_rename", len(files))):
            return
        
        success_count = 0
        error_count = 0
        
        for idx, file_path in enumerate(files, 1):
            try:
                dir_name = os.path.dirname(file_path)
                old_name = os.path.basename(file_path)
                ext = os.path.splitext(file_path)[1]
                
                new_name = name_format.format(index=idx) + ext
                new_path = os.path.join(dir_name, new_name)
                
                counter = 1
                while os.path.exists(new_path):
                    new_name = f"{name_format.format(index=idx)}_{counter}{ext}"
                    new_path = os.path.join(dir_name, new_name)
                    counter += 1
                
                os.rename(file_path, new_path)
                success_count += 1
                self.log_message(tr("success_fmt") + f": {old_name} -> {new_name}", "success")
                
            except Exception as e:
                error_count += 1
                self.log_message(f": {old_name} - {str(e)}", "error")
        
        self.log_message("=" * 50)
        self.log_message(tr("op_complete", success_count, error_count), "success" if error_count == 0 else "warning")

# ========================================

        """Update all UI text to current language"""
        pass

class MediaToolsApp:
    """Utils."""
    def __init__(self, root):
        self.root = root
        self.root.title(tr("app_title"))

        # ?
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        w = min(1200, max(900, sw - 80))
        h = min(800, max(650, sh - 80))
        w = min(w, sw)
        h = min(h, sh)
        self.root.geometry(f"{w}x{h}")
        self.root.minsize(min(900, w), min(650, h))

        # ?ttk 
        self.setup_styles()
        self.setup_icon()
        self.setup_notebook()
        self.setup_menu()
        self.setup_statusbar()

    def setup_styles(self):
        """Utils."""
        style = ttk.Style(self.root)

        # 
        names = set(style.theme_names())
        if sys.platform.startswith("win"):
            preferred = ["vista", "xpnative"]
        elif sys.platform == "darwin":
            preferred = ["aqua"]
        else:
            preferred = ["clam", "alt", "default"]

        for theme in preferred:
            if theme in names:
                try:
                    style.theme_use(theme)
                except Exception:
                    pass
                break

    def setup_icon(self):
        """Utils."""
        try:
            # 
            icon_path = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "icon.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
        except Exception:
            pass
        
    def setup_notebook(self):
        """Utils."""
        # Remove existing notebook if present
        if hasattr(self, "notebook") and self.notebook:
            self.notebook.destroy()

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.tag_editor_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.tag_editor_tab, text=tr("tab_tags"))
        self.tag_editor = TagEditorTab(self.tag_editor_tab)

        self.file_sorter_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.file_sorter_tab, text=tr("tab_sorter"))
        self.file_sorter = FileSorterTab(self.file_sorter_tab)

    def setup_menu(self):
        """Utils."""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label=tr("file_menu"), menu=file_menu)

        # Language submenu
        lang_menu = tk.Menu(file_menu, tearoff=0)
        lang_menu.add_command(label=tr("lang_cn"), command=lambda: self._do_switch_language("zh"))
        lang_menu.add_command(label=tr("lang_en"), command=lambda: self._do_switch_language("en"))
        file_menu.add_cascade(label=tr("file_lang"), menu=lang_menu)
        file_menu.add_separator()
        file_menu.add_command(label=tr("file_exit"), command=self.root.quit)

        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label=tr("help_menu"), menu=help_menu)
        help_menu.add_command(label=tr("help_about"), command=self.show_about)

    def _do_switch_language(self, lang):
        """Switch UI language by rebuilding tabs"""
        if not set_language(lang):
            return
        self.root.title(tr("app_title"))
        self.statusbar.config(text=tr("status_ready"))
        # Rebuild notebook tabs
        self.setup_notebook()
        # Rebuild menu
        self.setup_menu()
    def setup_statusbar(self):
        """Utils."""
        self.statusbar = ttk.Label(self.root, text="", relief=tk.SUNKEN, anchor=tk.W)
        self.statusbar.pack(side=tk.BOTTOM, fill=tk.X)

    def show_about(self):
        """Utils."""
        about_text = tr("about_text")

        messagebox.showinfo("", about_text)

# ====================  ====================
def check_dependencies():
    """Utils."""
    try:
        import mutagen
        from PIL import Image
        return True
    except ImportError as e:
        print(": ")
        print("?")
        print("pip install mutagen pillow")
        return False

def main():
    """Utils."""
    if not check_dependencies():
        return
        
    root = tk.Tk()
        
    
    # Load saved language preference
    config = load_config()
    saved_lang = config.get("language", "zh")
    set_language(saved_lang, save=False)
    app = MediaToolsApp(root)
        
        # 
    root.update_idletasks()
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    window_width = root.winfo_width()
    window_height = root.winfo_height()
    x = max(0, (screen_width - window_width) // 2)
    y = max(0, (screen_height - window_height) // 2)
    root.geometry(f"+{x}+{y}")
        
    # Clean up audio on close
    def on_close():
        app.tag_editor.cleanup_audio()
        root.destroy()
    root.protocol('WM_DELETE_WINDOW', on_close)
    
    root.mainloop()

if __name__ == "__main__":
    main()
