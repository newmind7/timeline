import { useState, useEffect } from 'react';
import { Quote, RefreshCw, Heart, HeartOff, Copy, Check } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  category: string;
}

const QUOTES: QuoteData[] = [
  { text: "千里之行，始于足下。", author: "老子", category: "经典" },
  { text: "成功不是终点，失败也非末日，最重要的是继续前行的勇气。", author: "丘吉尔", category: "成功" },
  { text: "今天的努力是明天的幸运。", author: "佚名", category: "励志" },
  { text: "不积跬步，无以至千里。", author: "荀子", category: "经典" },
  { text: "时间会证明一切，但你必须先开始行动。", author: "佚名", category: "时间" },
  { text: "人生没有彩排，每天都是现场直播。", author: "佚名", category: "人生" },
  { text: "你的时间有限，不要浪费在别人的生活里。", author: "乔布斯", category: "时间" },
  { text: "最好的投资就是投资自己。", author: "巴菲特", category: "成功" },
  { text: "行动是治愈恐惧的良药。", author: "佚名", category: "励志" },
  { text: "把每一天当作生命的最后一天来过。", author: "乔布斯", category: "人生" },
  { text: "努力不一定成功，但放弃一定失败。", author: "佚名", category: "励志" },
  { text: "机会总是留给有准备的人。", author: "巴斯德", category: "成功" },
  { text: "真正的勇气是知道害怕却依然前行。", author: "佚名", category: "勇气" },
  { text: "人生最大的敌人是自己。", author: "佚名", category: "人生" },
  { text: "越努力，越幸运。", author: "佚名", category: "励志" },
  { text: "今天不想跑，所以才去跑。", author: "村上春树", category: "励志" },
  { text: "把握现在，就是创造未来。", author: "佚名", category: "时间" },
  { text: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "佚名", category: "人生" },
  { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采", category: "人生" },
  { text: "种一棵树最好的时间是十年前，其次是现在。", author: "谚语", category: "时间" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [favorites, setFavorites] = useState<QuoteData[]>(() => {
    const saved = localStorage.getItem('favoriteQuotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取今日名言
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quoteDate');
    const savedQuote = localStorage.getItem('dailyQuote');

    if (savedDate === today && savedQuote) {
      setQuote(JSON.parse(savedQuote));
    } else {
      refreshQuote();
    }
  }, []);

  // 保存收藏
  useEffect(() => {
    localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
  }, [favorites]);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * QUOTES.length);
      const newQuote = QUOTES[randomIndex];
      setQuote(newQuote);
      localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
      localStorage.setItem('quoteDate', new Date().toDateString());
      setIsRefreshing(false);
    }, 300);
  };

  const toggleFavorite = () => {
    if (!quote) return;
    const isFav = favorites.some(f => f.text === quote.text);
    if (isFav) {
      setFavorites(favorites.filter(f => f.text !== quote.text));
    } else {
      setFavorites([...favorites, quote]);
    }
  };

  const copyToClipboard = () => {
    if (!quote) return;
    navigator.clipboard.writeText(`"${quote.text}" —— ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFavorite = quote && favorites.some(f => f.text === quote.text);

  if (!quote) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">每日一言</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="复制"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFavorite}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={isFavorite ? "取消收藏" : "收藏"}
          >
            {isFavorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshQuote}
            className={`p-1.5 hover:bg-white/20 rounded transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            title="换一条"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <blockquote className="text-lg font-medium leading-relaxed mb-2">
        "{quote.text}"
      </blockquote>
      
      <div className="flex items-center justify-between">
        <cite className="text-sm opacity-80 not-italic">—— {quote.author}</cite>
        <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">{quote.category}</span>
      </div>
    </div>
  );
}
