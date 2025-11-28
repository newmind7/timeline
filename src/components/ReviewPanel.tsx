import { useState } from 'react';
import { X, Plus, FileText, TrendingUp, Star, CheckCircle, XCircle } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import { DailyReview } from '../types';
import ReviewCard from './ReviewCard';
import DailyReviewModal from './DailyReviewModal';

interface ReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewPanel({ isOpen, onClose }: ReviewPanelProps) {
  const { reviews, addReview, updateReview, deleteReview, getStats } = useReviews();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<DailyReview | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const stats = getStats();

  const handleAddReview = () => {
    setEditingReview(undefined);
    setIsModalOpen(true);
  };

  const handleEditReview = (review: DailyReview) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleSaveReview = async (reviewData: Omit<DailyReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, reviewData);
      } else {
        await addReview(reviewData);
      }
      setIsModalOpen(false);
      setEditingReview(undefined);
    } catch (error) {
      console.error('Failed to save review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('确定要删除这条复盘记录吗？')) return;
    try {
      await deleteReview(id);
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slideIn">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3 text-white">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">每日复盘</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-800">{stats.totalReviews}</div>
                <div className="text-xs text-slate-500">总复盘</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-800">{stats.avgRating}</div>
                <div className="text-xs text-slate-500">平均分</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-800">{stats.totalSuccesses}</div>
                <div className="text-xs text-slate-500">成功点</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-800">{stats.totalFailures}</div>
                <div className="text-xs text-slate-500">失败点</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-slate-600">
              本周已复盘 <span className="font-semibold text-blue-600">{stats.weekReviews}</span> 天
            </div>
          </div>
        )}

        {/* 添加按钮 */}
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={handleAddReview}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            写今日复盘
          </button>
        </div>

        {/* 复盘列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">还没有复盘记录</p>
              <p className="text-sm text-slate-400">开始记录你的每日得失吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DailyReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReview(undefined);
        }}
        onSave={handleSaveReview}
        initialReview={editingReview}
        isLoading={isLoading}
      />

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
