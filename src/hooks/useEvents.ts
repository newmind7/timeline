import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Event, Subtask } from '../types';
import { useAuth } from '../contexts/AuthContext';

// 检查是否为演示模式
const isDemoMode = () => {
  const demoUser = localStorage.getItem('demo_user');
  return !!demoUser;
};

// 本地存储事件（演示模式）
const LOCAL_EVENTS_KEY = 'demo_events';

const getLocalEvents = (): Event[] => {
  const saved = localStorage.getItem(LOCAL_EVENTS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveLocalEvents = (events: Event[]) => {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
};

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    
    // 演示模式：使用本地存储
    if (isDemoMode()) {
      setEvents(getLocalEvents());
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    // 演示模式：使用本地存储
    if (isDemoMode()) {
      const newEvent: Event = {
        ...eventData,
        id: 'demo-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const newEvents = [...events, newEvent];
      setEvents(newEvents);
      saveLocalEvents(newEvents);
      return newEvent;
    }
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...eventData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setEvents([...events, data]);
      return data;
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    // 演示模式：使用本地存储
    if (isDemoMode()) {
      const updatedEvents = events.map(e => 
        e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      );
      setEvents(updatedEvents);
      saveLocalEvents(updatedEvents);
      return updatedEvents.find(e => e.id === id);
    }
    
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEvents(events.map(e => e.id === id ? data : e));
      return data;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    // 演示模式：使用本地存储
    if (isDemoMode()) {
      const filteredEvents = events.filter(e => e.id !== id);
      setEvents(filteredEvents);
      saveLocalEvents(filteredEvents);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  };

  return { events, loading, fetchEvents, addEvent, updateEvent, deleteEvent };
};

export const useSubtasks = (eventId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    fetchSubtasks();
  }, [eventId]);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('event_id', eventId)
        .order('order', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error('Failed to fetch subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubtask = async (title: string) => {
    try {
      const maxOrder = subtasks.length > 0 ? Math.max(...subtasks.map(s => s.order)) : -1;
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{ event_id: eventId, title, completed: false, order: maxOrder + 1 }])
        .select()
        .single();

      if (error) throw error;
      setSubtasks([...subtasks, data]);
      return data;
    } catch (error) {
      console.error('Failed to add subtask:', error);
      throw error;
    }
  };

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSubtasks(subtasks.map(s => s.id === id ? data : s));
      return data;
    } catch (error) {
      console.error('Failed to update subtask:', error);
      throw error;
    }
  };

  const deleteSubtask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubtasks(subtasks.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      throw error;
    }
  };

  return { subtasks, loading, fetchSubtasks, addSubtask, updateSubtask, deleteSubtask };
};
