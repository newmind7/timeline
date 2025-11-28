import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  icon: string;
  // 使用在线音频URL或生成音频
  frequency?: number;
}

const SOUNDS: Sound[] = [
  { id: 'rain', name: '雨声', icon: '🌧️' },
  { id: 'forest', name: '森林', icon: '🌲' },
  { id: 'ocean', name: '海浪', icon: '🌊' },
  { id: 'fire', name: '篝火', icon: '🔥' },
  { id: 'wind', name: '风声', icon: '💨' },
  { id: 'coffee', name: '咖啡厅', icon: '☕' },
  { id: 'thunder', name: '雷雨', icon: '⛈️' },
  { id: 'birds', name: '鸟鸣', icon: '🐦' },
];

// 简单的音频生成器（用于演示）
class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying = false;

  async start(type: string, volume: number) {
    if (this.isPlaying) this.stop();
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    // 创建白噪音
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // 不同类型的噪音特征
      switch (type) {
        case 'rain':
        case 'ocean':
          output[i] = (Math.random() * 2 - 1) * 0.3;
          break;
        case 'wind':
          output[i] = (Math.random() * 2 - 1) * 0.2 * Math.sin(i * 0.0001);
          break;
        default:
          output[i] = (Math.random() * 2 - 1) * 0.25;
      }
    }

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (this.noiseNode) {
      this.noiseNode.stop();
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }
}

export default function AmbientSounds() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const generatorRef = useRef<NoiseGenerator>(new NoiseGenerator());

  useEffect(() => {
    return () => {
      generatorRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (activeSound && !isMuted) {
      generatorRef.current.start(activeSound, volume);
    } else {
      generatorRef.current.stop();
    }
  }, [activeSound, isMuted]);

  useEffect(() => {
    if (!isMuted) {
      generatorRef.current.setVolume(volume);
    }
  }, [volume, isMuted]);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      setActiveSound(null);
    } else {
      setActiveSound(soundId);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-500" />
          专注音效
          {activeSound && (
            <span className="px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full">
              {SOUNDS.find(s => s.id === activeSound)?.icon} 播放中
            </span>
          )}
        </h3>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* 音效选择 */}
          <div className="grid grid-cols-4 gap-2">
            {SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  activeSound === sound.id
                    ? 'bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-400'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{sound.icon}</span>
                <span className="text-[10px] text-slate-500">{sound.name}</span>
              </button>
            ))}
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg ${
                isMuted 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              disabled={isMuted}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-slate-500 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* 提示 */}
          <p className="text-xs text-slate-400 text-center">
            💡 白噪音可以帮助集中注意力
          </p>
        </div>
      )}
    </div>
  );
}
