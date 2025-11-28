import { useState, useEffect } from 'react';
import { DailyReview } from '../types';
import { useAuth } from '../contexts/AuthContext';

// 临时使用 localStorage 存储复盘数据
// 后续可以迁移到 Supabase
const STORAGE_KEY = 'daily_reviews';

export const useReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchReviews();
  }, [user]);

  const fetchReviews = () => {
    if (!user) return;
    setLoading(true);
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored) as DailyReview[];
        // 按日期降序排列
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (data: DailyReview[]) => {
    if (!user) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(data));
  };

  const addReview = async (reviewData: Omit<DailyReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    const newReview: DailyReview = {
      ...reviewData,
      id: crypto.randomUUID(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newReviews = [...reviews, newReview];
    newReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReviews(newReviews);
    saveToStorage(newReviews);
    return newReview;
  };

  const updateReview = async (id: string, updates: Partial<DailyReview>) => {
    const updatedReviews = reviews.map(r => 
      r.id === id 
        ? { ...r, ...updates, updated_at: new Date().toISOString() } 
        : r
    );
    updatedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReviews(updatedReviews);
    saveToStorage(updatedReviews);
    return updatedReviews.find(r => r.id === id);
  };

  const deleteReview = async (id: string) => {
    const filteredReviews = reviews.filter(r => r.id !== id);
    setReviews(filteredReviews);
    saveToStorage(filteredReviews);
  };

  const getReviewByDate = (date: string) => {
    const targetDate = new Date(date).toISOString().split('T')[0];
    return reviews.find(r => r.date.split('T')[0] === targetDate);
  };

  // 获取统计数据
  const getStats = () => {
    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    const totalSuccesses = reviews.reduce((sum, r) => sum + r.successes.length, 0);
    const totalFailures = reviews.reduce((sum, r) => sum + r.failures.length, 0);
    
    // 本周复盘数
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekReviews = reviews.filter(r => new Date(r.date) >= weekStart);

    return {
      totalReviews: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      totalSuccesses,
      totalFailures,
      weekReviews: weekReviews.length,
    };
  };

  return { 
    reviews, 
    loading, 
    fetchReviews, 
    addReview, 
    updateReview, 
    deleteReview,
    getReviewByDate,
    getStats,
  };
};
