import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Loader2, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function VoiceInput({ onResult, onClose, isOpen }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器支持
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风');
          break;
        case 'no-speech':
          setError('没有检测到语音，请重试');
          break;
        case 'network':
          setError('网络错误，请检查网络连接');
          break;
        default:
          setError(`语音识别错误: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && isSupported) {
      startListening();
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen, isSupported]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onResult(transcript.trim());
      setTranscript('');
      onClose();
    }
  };

  const handleCancel = () => {
    stopListening();
    setTranscript('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-500" />
            语音输入
          </h2>
          <button onClick={handleCancel} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">您的浏览器不支持语音识别</p>
              <p className="text-sm text-slate-500">请使用 Chrome 或 Edge 浏览器</p>
            </div>
          ) : (
            <>
              {/* 麦克风动画 */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative p-6 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Mic className="w-8 h-8 text-white animate-pulse" />
                      {/* 声波动画 */}
                      <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
                      <span className="absolute -inset-2 rounded-full animate-pulse bg-red-300 opacity-20" />
                    </>
                  ) : (
                    <MicOff className="w-8 h-8 text-slate-500" />
                  )}
                </button>
              </div>

              {/* 状态提示 */}
              <div className="text-center mb-4">
                {isListening ? (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在聆听...</span>
                  </div>
                ) : (
                  <p className="text-slate-500">点击麦克风开始语音输入</p>
                )}
              </div>

              {/* 识别结果 */}
              <div className="mb-4">
                <div className="min-h-[80px] p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                  {transcript ? (
                    <p className="text-slate-900 dark:text-white">{transcript}</p>
                  ) : (
                    <p className="text-slate-400 text-sm">说出事件标题，例如："明天下午三点开会"</p>
                  )}
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!transcript.trim()}
                  className="flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  确认使用
                </button>
              </div>

              {/* 提示 */}
              <p className="mt-4 text-center text-xs text-slate-400">
                💡 语音识别后可以手动编辑事件详情
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
