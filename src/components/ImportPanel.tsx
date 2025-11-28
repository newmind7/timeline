import { useState, useRef } from 'react';
import { X, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { Event } from '../types';

interface ImportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (events: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
}

export default function ImportPanel({ isOpen, onClose, onImport }: ImportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 验证数据格式
      if (!data.events || !Array.isArray(data.events)) {
        setResult({ success: false, message: '无效的数据格式，请选择正确的导出文件' });
        return;
      }

      // 预览数据
      setPreview(data.events.slice(0, 5)); // 只显示前5个
      setResult({
        success: true,
        message: `找到 ${data.events.length} 个事件，准备导入`,
      });
    } catch (error) {
      setResult({ success: false, message: '文件解析失败，请确保是有效的JSON文件' });
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    try {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) return;

      const text = await fileInput.files[0].text();
      const data = JSON.parse(text);

      // 转换为导入格式
      const eventsToImport = data.events.map((e: Event) => ({
        title: e.title,
        description: e.description,
        date: e.date,
        color: e.color,
        progress: e.progress || 0,
        category: e.category,
        tags: e.tags,
      }));

      await onImport(eventsToImport);
      setResult({ success: true, message: `成功导入 ${eventsToImport.length} 个事件！` });
      
      // 2秒后关闭
      setTimeout(() => {
        onClose();
        setPreview(null);
        setResult(null);
      }, 2000);
    } catch (error) {
      setResult({ success: false, message: '导入失败，请重试' });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">导入数据</h2>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 文件选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              选择导出的JSON文件
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
            >
              <FileJson className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                点击选择文件或拖拽到此处
              </p>
              <p className="text-xs text-slate-400 mt-1">
                支持 .json 格式的导出文件
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 结果提示 */}
          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          {/* 预览 */}
          {preview && preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                预览（前5个事件）
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {preview.map((event, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-800 dark:text-slate-200 truncate flex-1">{event.title}</span>
                    <span className="text-slate-400 text-xs">{event.date?.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!preview || importing}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  确认导入
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
