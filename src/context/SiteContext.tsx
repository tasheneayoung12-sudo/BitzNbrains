import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminRole, SiteContent } from '../types/site';

export interface AuthState {
  loaded: boolean;
  hasAdmin: boolean;
  authenticated: boolean;
  user: { email: string; role: AdminRole } | null;
}

interface SiteContextValue {
  siteContent: SiteContent | null;
  loading: boolean;
  auth: AuthState;
  viewMode: 'admin' | 'visitor';
  setViewMode: (mode: 'admin' | 'visitor') => void;
  refreshSiteContent: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  editingSection: { pageKey: string; label: string } | null;
  openInlineEdit: (pageKey: string, label: string) => void;
  closeInlineEdit: () => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({
    loaded: false,
    hasAdmin: true,
    authenticated: false,
    user: null,
  });
  const [viewMode, setViewModeState] = useState<'admin' | 'visitor'>(() => {
    try {
      const saved = sessionStorage.getItem('bnb_view_mode');
      return saved === 'admin' ? 'admin' : 'visitor';
    } catch {
      return 'visitor';
    }
  });

  const setViewMode = useCallback((mode: 'admin' | 'visitor') => {
    setViewModeState(mode);
    try {
      sessionStorage.setItem('bnb_view_mode', mode);
    } catch {
      // ignore storage errors
    }
  }, []);
  const [editingSection, setEditingSection] = useState<{ pageKey: string; label: string } | null>(
    null
  );

  const refreshSiteContent = useCallback(async () => {
    try {
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = (await res.json()) as SiteContent;
        setSiteContent(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setAuth({
          loaded: true,
          hasAdmin: Boolean(data.hasAdmin),
          authenticated: Boolean(data.authenticated),
          user: data.user || null,
        });
        if (!data.authenticated) {
          setViewMode('visitor');
        }
      }
    } catch {
      setAuth((prev) => ({ ...prev, loaded: true }));
    }
  }, [setViewMode]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setViewMode('visitor');
    await refreshAuth();
  }, [refreshAuth, setViewMode]);

  useEffect(() => {
    void refreshSiteContent();
    void refreshAuth();
  }, [refreshSiteContent, refreshAuth]);

  const openInlineEdit = useCallback((pageKey: string, label: string) => {
    setEditingSection({ pageKey, label });
  }, []);

  const closeInlineEdit = useCallback(() => {
    setEditingSection(null);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        siteContent,
        loading,
        auth,
        viewMode: auth.authenticated && auth.user?.role === 'owner' ? viewMode : 'visitor',
        setViewMode,
        refreshSiteContent,
        refreshAuth,
        logout,
        editingSection,
        openInlineEdit,
        closeInlineEdit,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
