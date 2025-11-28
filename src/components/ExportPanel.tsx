import { useState } from 'react';
import { X, Download, FileJson, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { Event } from '../types';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

type ExportFormat = 'json' | 'csv' | 'ics';

export default function ExportPanel({ isOpen, onClose, events }: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [exported, setExported] = useState(false);

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalEvents: events.length,
      events: events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `timeline_export_${formatDate()}.json`);
  };

  const exportToCSV = () => {
    const headers = ['标题', '描述', '日期', '颜色', '进度', '创建时间', '更新时间'];
    const rows = events.map(e => [
      `"${e.title}"`,
      `"${e.description || ''}"`,
      e.date.split('T')[0],
      e.color,
      `${e.progress}%`,
      e.created_at.split('T')[0],
      e.updated_at.split('T')[0],
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    // 添加BOM以支持中文
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    downloadFile(blob, `timeline_export_${formatDate()}.csv`);
  };

  const exportToICS = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Timeline App//CN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach(event => {
      const date = new Date(event.date);
      const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@timeline-app`,
        `DTSTAMP:${dateStr}`,
        `DTSTART:${dateStr.split('T')[0]}`,
        `DTEND:${endDateStr.split('T')[0]}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''} [进度: ${event.progress}%]`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    const ics = lines.join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    downloadFile(blob, `timeline_export_${formatDate()}.ics`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const formatDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleExport = () => {
    switch (selectedFormat) {
      case 'json': exportToJSON(); break;
      case 'csv': exportToCSV(); break;
      case 'ics': exportToICS(); break;
    }
  };

  if (!isOpen) return null;

  const formats: { value: ExportFormat; label: string; icon: typeof FileJson; desc: string }[] = [
    { value: 'json', label: 'JSON', icon: FileJson, desc: '完整数据备份，可导入恢复' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: '可用Excel打开编辑' },
    { value: 'ics', label: 'ICS日历', icon: FileText, desc: '可导入其他日历应用' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">导出数据</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            共 <span className="font-bold">{events.length}</span> 个事件将被导出
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">选择导出格式</label>
            <div className="space-y-2">
              {formats.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedFormat(value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${selectedFormat === value ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-left flex-1">
                    <div className="font-medium text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  {selectedFormat === value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={events.length === 0}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                exported
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-400'
              }`}
            >
              {exported ? (
                <>
                  <Check className="w-4 h-4" />
                  已导出
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  导出
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
