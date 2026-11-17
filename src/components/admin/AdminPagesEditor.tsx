import React, { useEffect, useState } from 'react';
import { History, Plus, Trash2, Upload } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { SiteContent, SiteVersionRecord } from '../../types/site';

type PageTab =
  | 'branding'
  | 'home'
  | 'channel'
  | 'about'
  | 'ourCode'
  | 'bookABrain'
  | 'resources'
  | 'community'
  | 'events'
  | 'bootcamps';

const PAGE_LABELS: { key: PageTab; label: string; seoKey?: string }[] = [
  { key: 'branding', label: 'Logo & Visibility' },
  { key: 'home', label: 'Home Page', seoKey: 'home' },
  { key: 'channel', label: 'The Channel', seoKey: 'channel' },
  { key: 'about', label: 'About Me', seoKey: 'about' },
  { key: 'ourCode', label: 'Our Code', seoKey: 'ourCode' },
  { key: 'bookABrain', label: 'Book a Brain', seoKey: 'bookABrain' },
  { key: 'resources', label: 'Resources', seoKey: 'resources' },
  { key: 'community', label: 'Community', seoKey: 'community' },
  { key: 'events', label: 'Tech Events', seoKey: 'events' },
  { key: 'bootcamps', label: 'Bootcamps', seoKey: 'bootcamps' },
];

export function ImageUploadField({
  label,
  currentUrl,
  currentAlt,
  onUploaded,
}: {
  label: string;
  currentUrl: string;
  currentAlt: string;
  onUploaded: (url: string, alt: string) => void;
}) {
  const [altText, setAltText] = useState(currentAlt || '');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAltText(currentAlt || '');
  }, [currentAlt]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!altText.trim()) {
      setError('Please write alt text first so people using screen readers know what this picture shows.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Please choose an image smaller than 2 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            dataUrl: reader.result,
            altText,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Upload failed.');
          return;
        }
        onUploaded(data.url, data.altText);
      } catch {
        setError('Upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4 space-y-3">
      <p className="text-sm font-bold text-[#0E1033]">{label}</p>
      {currentUrl && (
        <img
          src={currentUrl}
          alt={currentAlt || label}
          className="h-20 w-20 rounded-xl border-2 border-[#0E1033] object-contain bg-white"
        />
      )}
      <div>
        <label className="block text-xs font-bold text-[#0E1033] mb-1">
          Alt text (required for accessibility)
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe what is in the picture"
          className="w-full rounded-xl border-2 border-[#0E1033] bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 text-sm font-bold hover:bg-[#F7F8FF]">
          <Upload className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" />
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
        </label>
        {currentUrl && (
          <button
            type="button"
            onClick={() => onUploaded('', altText)}
            className="text-xs font-bold text-[#D1006F] underline"
          >
            Remove image
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs font-bold text-[#D1006F]">
          {error}
        </p>
      )}
    </div>
  );
}

export function AdminPagesEditor() {
  const { siteContent, refreshSiteContent } = useSite();
  const [selectedTab, setSelectedTab] = useState<PageTab>('home');
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [versions, setVersions] = useState<SiteVersionRecord[]>([]);

  useEffect(() => {
    if (siteContent) {
      setDraft(JSON.parse(JSON.stringify(siteContent)) as SiteContent);
    }
  }, [siteContent]);

  async function loadVersions(pageKey: string) {
    const res = await fetch(`/api/admin/versions?pageKey=${encodeURIComponent(pageKey)}`);
    if (res.ok) {
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    }
  }

  useEffect(() => {
    void loadVersions(selectedTab);
  }, [selectedTab]);

  if (!draft) return <p>Loading page editor...</p>;

  const tabMeta = PAGE_LABELS.find((t) => t.key === selectedTab)!;

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setFeedback('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: selectedTab,
          note: `Updated ${tabMeta.label}`,
          content: draft,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setFeedback(d.error || 'Could not save changes.');
        return;
      }
      await refreshSiteContent();
      await loadVersions(selectedTab);
      setFeedback('Saved! Your changes are live on the website right now.');
    } catch {
      setFeedback('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore(versionId: string) {
    setFeedback('');
    const res = await fetch(`/api/admin/versions/${versionId}/restore`, { method: 'POST' });
    if (res.ok) {
      await refreshSiteContent();
      await loadVersions(selectedTab);
      setFeedback('Restored earlier version!');
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a page to edit">
        {PAGE_LABELS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.key}
            onClick={() => {
              setSelectedTab(tab.key);
              setFeedback('');
              setShowPreview(false);
            }}
            className={`rounded-xl border-2 border-[#0E1033] px-3.5 py-2 text-sm font-bold whitespace-nowrap ${
              selectedTab === tab.key
                ? 'bg-[#1F4BFF] text-white'
                : 'bg-white text-[#0E1033] hover:bg-[#F7F8FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DDF5] pb-4">
          <h2 className="font-display text-2xl font-bold text-[#0E1033]">
            Editing: {tabMeta.label}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-4 py-2 text-sm font-bold"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-2 font-display text-sm font-bold text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {feedback && (
            <p className="rounded-xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-3 text-sm font-bold text-[#1F4BFF]">
              {feedback}
            </p>
          )}
        </div>

        {/* SEO Title & Description per page */}
        {tabMeta.seoKey && (
          <div className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4 space-y-3">
            <p className="font-display text-base font-bold text-[#0E1033]">
              Google & Social Preview (SEO)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold mb-1">Page Title</label>
                <input
                  type="text"
                  value={draft.seo[tabMeta.seoKey]?.title || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      seo: {
                        ...draft.seo,
                        [tabMeta.seoKey!]: {
                          ...draft.seo[tabMeta.seoKey!],
                          title: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Meta Description</label>
                <input
                  type="text"
                  value={draft.seo[tabMeta.seoKey]?.description || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      seo: {
                        ...draft.seo,
                        [tabMeta.seoKey!]: {
                          ...draft.seo[tabMeta.seoKey!],
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* BRANDING & PAGE SWITCHES */}
        {selectedTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1">Site Name</label>
                <input
                  type="text"
                  value={draft.branding.siteName}
                  onChange={(e) =>
                    setDraft({ ...draft, branding: { ...draft.branding, siteName: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Social Handle</label>
                <input
                  type="text"
                  value={draft.branding.handle}
                  onChange={(e) =>
                    setDraft({ ...draft, branding: { ...draft.branding, handle: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={draft.branding.youtubeUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, branding: { ...draft.branding, youtubeUrl: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Footer Privacy Note</label>
                <input
                  type="text"
                  value={draft.branding.footerPrivacyNote}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      branding: { ...draft.branding, footerPrivacyNote: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
            </div>

            <ImageUploadField
              label="Site Brain Logo (replaces default vector logo)"
              currentUrl={draft.branding.logoUrl}
              currentAlt={draft.branding.logoAlt}
              onUploaded={(url, alt) =>
                setDraft({ ...draft, branding: { ...draft.branding, logoUrl: url, logoAlt: alt } })
              }
            />

            <div>
              <h3 className="font-display text-lg font-bold text-[#0E1033] mb-2">
                Turn Pages On or Off
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(Object.keys(draft.pagesEnabled) as (keyof SiteContent['pagesEnabled'])[]).map(
                  (pk) => (
                    <label
                      key={pk}
                      className="flex items-center gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={draft.pagesEnabled[pk]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            pagesEnabled: { ...draft.pagesEnabled, [pk]: e.target.checked },
                          })
                        }
                        className="h-4 w-4 accent-[#1F4BFF]"
                      />
                      <span className="text-sm font-semibold capitalize">{pk}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* HOME PAGE */}
        {selectedTab === 'home' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1">Top Name</label>
                <input
                  type="text"
                  value={draft.home.topName}
                  onChange={(e) =>
                    setDraft({ ...draft, home: { ...draft.home, topName: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Line Under Brain</label>
                <input
                  type="text"
                  value={draft.home.promptLine}
                  onChange={(e) =>
                    setDraft({ ...draft, home: { ...draft.home, promptLine: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold">4 Floating Bubbles</h3>
              {draft.home.bubbles.map((b, idx) => (
                <div
                  key={b.id}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4 sm:grid-cols-4"
                >
                  <div>
                    <label className="block text-xs font-bold mb-1">Bubble Title</label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => {
                        const next = [...draft.home.bubbles];
                        next[idx] = { ...b, title: e.target.value };
                        setDraft({ ...draft, home: { ...draft.home, bubbles: next } });
                      }}
                      className="w-full rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={b.subtitle}
                      onChange={(e) => {
                        const next = [...draft.home.bubbles];
                        next[idx] = { ...b, subtitle: e.target.value };
                        setDraft({ ...draft, home: { ...draft.home, bubbles: next } });
                      }}
                      className="w-full rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Link To</label>
                    <input
                      type="text"
                      value={b.to}
                      onChange={(e) => {
                        const next = [...draft.home.bubbles];
                        next[idx] = { ...b, to: e.target.value };
                        setDraft({ ...draft, home: { ...draft.home, bubbles: next } });
                      }}
                      className="w-full rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANNEL PAGE */}
        {selectedTab === 'channel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1">Hero Title</label>
                <input
                  type="text"
                  value={draft.channel.heroTitle}
                  onChange={(e) =>
                    setDraft({ ...draft, channel: { ...draft.channel, heroTitle: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">YouTube Embed URL</label>
                <input
                  type="url"
                  value={draft.channel.videoEmbedUrl}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      channel: { ...draft.channel, videoEmbedUrl: e.target.value },
                    })
                  }
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={draft.channel.heroSubtitle}
                onChange={(e) =>
                  setDraft({ ...draft, channel: { ...draft.channel, heroSubtitle: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Mission Text</label>
              <textarea
                rows={2}
                value={draft.channel.missionText}
                onChange={(e) =>
                  setDraft({ ...draft, channel: { ...draft.channel, missionText: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>

            {/* Section Switches */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(draft.channel.sectionsEnabled).map(([sk, enabled]) => (
                <label
                  key={sk}
                  className="flex items-center gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] px-3 py-2 text-sm font-semibold cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        channel: {
                          ...draft.channel,
                          sectionsEnabled: {
                            ...draft.channel.sectionsEnabled,
                            [sk]: e.target.checked,
                          },
                        },
                      })
                    }
                    className="h-4 w-4 accent-[#1F4BFF]"
                  />
                  Show {sk}
                </label>
              ))}
            </div>

            {/* Collective Characters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Meet the Collective Characters</h3>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      channel: {
                        ...draft.channel,
                        collectiveMembers: [
                          ...draft.channel.collectiveMembers,
                          {
                            id: `char-${Date.now()}`,
                            name: 'New Character',
                            role: 'Guide',
                            inspiration: 'Inspired by...',
                            description: 'Short description.',
                            accent: 'blue',
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add Character
                </button>
              </div>
              {draft.channel.collectiveMembers.map((m, idx) => (
                <div key={m.id} className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={m.name}
                      aria-label="Character name"
                      onChange={(e) => {
                        const next = [...draft.channel.collectiveMembers];
                        next[idx] = { ...m, name: e.target.value };
                        setDraft({ ...draft, channel: { ...draft.channel, collectiveMembers: next } });
                      }}
                      className="rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm font-bold"
                    />
                    <input
                      type="text"
                      value={m.role}
                      aria-label="Character role"
                      onChange={(e) => {
                        const next = [...draft.channel.collectiveMembers];
                        next[idx] = { ...m, role: e.target.value };
                        setDraft({ ...draft, channel: { ...draft.channel, collectiveMembers: next } });
                      }}
                      className="rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={m.inspiration}
                      aria-label="Character inspiration"
                      onChange={(e) => {
                        const next = [...draft.channel.collectiveMembers];
                        next[idx] = { ...m, inspiration: e.target.value };
                        setDraft({ ...draft, channel: { ...draft.channel, collectiveMembers: next } });
                      }}
                      className="rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={m.description}
                    aria-label="Character description"
                    onChange={(e) => {
                      const next = [...draft.channel.collectiveMembers];
                      next[idx] = { ...m, description: e.target.value };
                      setDraft({ ...draft, channel: { ...draft.channel, collectiveMembers: next } });
                    }}
                    className="w-full rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                  />
                  <ImageUploadField
                    label={`Character Art for ${m.name}`}
                    currentUrl={m.imageUrl || ''}
                    currentAlt={m.imageAlt || ''}
                    onUploaded={(url, alt) => {
                      const next = [...draft.channel.collectiveMembers];
                      next[idx] = { ...m, imageUrl: url, imageAlt: alt };
                      setDraft({ ...draft, channel: { ...draft.channel, collectiveMembers: next } });
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Season 1 Episodes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Season 1 Episodes</h3>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      channel: {
                        ...draft.channel,
                        episodes: [
                          ...draft.channel.episodes,
                          {
                            id: `ep-${Date.now()}`,
                            number: draft.channel.episodes.length + 1,
                            title: 'New Episode',
                            summary: 'Short episode summary.',
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add Episode
                </button>
              </div>
              {draft.channel.episodes.map((ep, idx) => (
                <div key={ep.id} className="grid grid-cols-1 gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 sm:grid-cols-12">
                  <input
                    type="number"
                    value={ep.number}
                    aria-label="Episode number"
                    onChange={(e) => {
                      const next = [...draft.channel.episodes];
                      next[idx] = { ...ep, number: Number(e.target.value) };
                      setDraft({ ...draft, channel: { ...draft.channel, episodes: next } });
                    }}
                    className="sm:col-span-2 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={ep.title}
                    aria-label="Episode title"
                    onChange={(e) => {
                      const next = [...draft.channel.episodes];
                      next[idx] = { ...ep, title: e.target.value };
                      setDraft({ ...draft, channel: { ...draft.channel, episodes: next } });
                    }}
                    className="sm:col-span-4 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={ep.summary}
                    aria-label="Episode summary"
                    onChange={(e) => {
                      const next = [...draft.channel.episodes];
                      next[idx] = { ...ep, summary: e.target.value };
                      setDraft({ ...draft, channel: { ...draft.channel, episodes: next } });
                    }}
                    className="sm:col-span-5 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Delete episode ${ep.title}`}
                    onClick={() => {
                      const next = draft.channel.episodes.filter((_, i) => i !== idx);
                      setDraft({ ...draft, channel: { ...draft.channel, episodes: next } });
                    }}
                    className="sm:col-span-1 flex items-center justify-center rounded-lg border border-[#0E1033] bg-white p-1.5 text-[#D1006F]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT ME PAGE */}
        {selectedTab === 'about' && (
          <div className="space-y-5">
            <ImageUploadField
              label="Creator Photo (About Me)"
              currentUrl={draft.about.photoUrl}
              currentAlt={draft.about.photoAlt}
              onUploaded={(url, alt) =>
                setDraft({ ...draft, about: { ...draft.about, photoUrl: url, photoAlt: alt } })
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1">Hero Title</label>
                <input
                  type="text"
                  value={draft.about.heroTitle}
                  onChange={(e) =>
                    setDraft({ ...draft, about: { ...draft.about, heroTitle: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={draft.about.heroSubtitle}
                  onChange={(e) =>
                    setDraft({ ...draft, about: { ...draft.about, heroSubtitle: e.target.value } })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Bio</label>
              <textarea
                rows={3}
                value={draft.about.bioText}
                onChange={(e) =>
                  setDraft({ ...draft, about: { ...draft.about, bioText: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Story</label>
              <textarea
                rows={3}
                value={draft.about.storyText}
                onChange={(e) =>
                  setDraft({ ...draft, about: { ...draft.about, storyText: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Credentials</label>
              <textarea
                rows={3}
                value={draft.about.credentialsText}
                onChange={(e) =>
                  setDraft({ ...draft, about: { ...draft.about, credentialsText: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">What I Believe Cards</h3>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      about: {
                        ...draft.about,
                        beliefs: [
                          ...draft.about.beliefs,
                          { id: `b-${Date.now()}`, title: 'New Belief', description: 'Short explanation.' },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-4 w-4" /> Add Belief
                </button>
              </div>
              {draft.about.beliefs.map((b, idx) => (
                <div key={b.id} className="grid grid-cols-1 gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 sm:grid-cols-12">
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => {
                      const next = [...draft.about.beliefs];
                      next[idx] = { ...b, title: e.target.value };
                      setDraft({ ...draft, about: { ...draft.about, beliefs: next } });
                    }}
                    className="sm:col-span-4 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={b.description}
                    onChange={(e) => {
                      const next = [...draft.about.beliefs];
                      next[idx] = { ...b, description: e.target.value };
                      setDraft({ ...draft, about: { ...draft.about, beliefs: next } });
                    }}
                    className="sm:col-span-7 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${b.title}`}
                    onClick={() => {
                      const next = draft.about.beliefs.filter((_, i) => i !== idx);
                      setDraft({ ...draft, about: { ...draft.about, beliefs: next } });
                    }}
                    className="sm:col-span-1 flex items-center justify-center rounded-lg border border-[#0E1033] bg-white p-1.5 text-[#D1006F]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OUR CODE PAGE */}
        {selectedTab === 'ourCode' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1">Heading</label>
              <input
                type="text"
                value={draft.ourCode.heading}
                onChange={(e) =>
                  setDraft({ ...draft, ourCode: { ...draft.ourCode, heading: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Intro</label>
              <textarea
                rows={2}
                value={draft.ourCode.intro}
                onChange={(e) =>
                  setDraft({ ...draft, ourCode: { ...draft.ourCode, intro: e.target.value } })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Our Code Principles</h3>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      ourCode: {
                        ...draft.ourCode,
                        principles: [
                          ...draft.ourCode.principles,
                          {
                            id: `p-${Date.now()}`,
                            icon: 'HeartHandshake',
                            title: 'New Principle',
                            description: 'One-sentence explanation.',
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-4 w-4" /> Add Principle
                </button>
              </div>
              {draft.ourCode.principles.map((p, idx) => (
                <div key={p.id} className="grid grid-cols-1 gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 sm:grid-cols-12">
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const next = [...draft.ourCode.principles];
                      next[idx] = { ...p, title: e.target.value };
                      setDraft({ ...draft, ourCode: { ...draft.ourCode, principles: next } });
                    }}
                    className="sm:col-span-4 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) => {
                      const next = [...draft.ourCode.principles];
                      next[idx] = { ...p, description: e.target.value };
                      setDraft({ ...draft, ourCode: { ...draft.ourCode, principles: next } });
                    }}
                    className="sm:col-span-7 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${p.title}`}
                    onClick={() => {
                      const next = draft.ourCode.principles.filter((_, i) => i !== idx);
                      setDraft({ ...draft, ourCode: { ...draft.ourCode, principles: next } });
                    }}
                    className="sm:col-span-1 flex items-center justify-center rounded-lg border border-[#0E1033] bg-white p-1.5 text-[#D1006F]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOK A BRAIN PAGE */}
        {selectedTab === 'bookABrain' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-bold mb-1">Heading</label>
                <input
                  type="text"
                  value={draft.bookABrain.heading}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      bookABrain: { ...draft.bookABrain, heading: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Community Discount %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.bookABrain.communityDiscountPercent}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      bookABrain: {
                        ...draft.bookABrain,
                        communityDiscountPercent: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Price Note</label>
                <input
                  type="text"
                  value={draft.bookABrain.priceNote}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      bookABrain: { ...draft.bookABrain, priceNote: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Services & Pricing</h3>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      bookABrain: {
                        ...draft.bookABrain,
                        services: [
                          {
                            id: `srv-${Date.now()}`,
                            category: 'Tech Help & Teaching',
                            name: 'New Service',
                            description: 'What this helps with.',
                            included: 'What is included.',
                            priceLabel: '$40/hour',
                            basePrice: 40,
                            priceUnit: 'hour',
                          },
                          ...draft.bookABrain.services,
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>
              {draft.bookABrain.services.map((srv, idx) => (
                <div
                  key={srv.id}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 sm:grid-cols-12"
                >
                  <input
                    type="text"
                    value={srv.category}
                    aria-label="Category"
                    onChange={(e) => {
                      const next = [...draft.bookABrain.services];
                      next[idx] = { ...srv, category: e.target.value };
                      setDraft({ ...draft, bookABrain: { ...draft.bookABrain, services: next } });
                    }}
                    className="sm:col-span-3 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={srv.name}
                    aria-label="Service name"
                    onChange={(e) => {
                      const next = [...draft.bookABrain.services];
                      next[idx] = { ...srv, name: e.target.value };
                      setDraft({ ...draft, bookABrain: { ...draft.bookABrain, services: next } });
                    }}
                    className="sm:col-span-3 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={srv.priceLabel}
                    aria-label="Price text"
                    onChange={(e) => {
                      const next = [...draft.bookABrain.services];
                      next[idx] = { ...srv, priceLabel: e.target.value };
                      setDraft({ ...draft, bookABrain: { ...draft.bookABrain, services: next } });
                    }}
                    className="sm:col-span-3 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={srv.basePrice}
                    aria-label="Base price number"
                    onChange={(e) => {
                      const next = [...draft.bookABrain.services];
                      next[idx] = { ...srv, basePrice: Number(e.target.value) };
                      setDraft({ ...draft, bookABrain: { ...draft.bookABrain, services: next } });
                    }}
                    className="sm:col-span-2 rounded-lg border border-[#0E1033] bg-white px-2.5 py-1.5 text-sm tabular-nums"
                  />
                  <button
                    type="button"
                    aria-label={`Delete ${srv.name}`}
                    onClick={() => {
                      const next = draft.bookABrain.services.filter((_, i) => i !== idx);
                      setDraft({ ...draft, bookABrain: { ...draft.bookABrain, services: next } });
                    }}
                    className="sm:col-span-1 flex items-center justify-center rounded-lg border border-[#0E1033] bg-white p-1.5 text-[#D1006F]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES / COMMUNITY / EVENTS / BOOTCAMPS */}
        {(selectedTab === 'resources' ||
          selectedTab === 'community' ||
          selectedTab === 'events' ||
          selectedTab === 'bootcamps') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Page Heading</label>
              <input
                type="text"
                value={draft[selectedTab].heading}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [selectedTab]: { ...draft[selectedTab], heading: e.target.value },
                  })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Intro Paragraph</label>
              <textarea
                rows={3}
                value={draft[selectedTab].intro}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [selectedTab]: { ...draft[selectedTab], intro: e.target.value },
                  })
                }
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2"
              />
            </div>
          </div>
        )}

        {showPreview && (
          <div className="rounded-xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-5">
            <p className="text-xs font-bold uppercase text-[#1F4BFF]">Preview Before Saving</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#0E1033]">
              {tabMeta.seoKey ? draft.seo[tabMeta.seoKey]?.title : draft.branding.siteName}
            </p>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              {tabMeta.seoKey ? draft.seo[tabMeta.seoKey]?.description : draft.branding.footerPrivacyNote}
            </p>
          </div>
        )}
      </div>

      {/* Undo / Version History (last 10 saved versions) */}
      <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#1F4BFF]" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-[#0E1033]">
            Undo History (Last 10 Saved Versions)
          </h3>
        </div>
        {versions.length === 0 ? (
          <p className="mt-2 text-sm text-[#0E1033]/75">
            No saved edits yet for this tab. Once you save changes, older versions appear here so you can undo anytime.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {versions.map((v) => (
              <li
                key={v._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] px-4 py-2.5 text-sm"
              >
                <div>
                  <span className="font-bold">{v.note}</span>
                  <span className="text-[#0E1033]/70">
                    {' '}
                    · {new Date(v.savedAt).toLocaleString()} · by {v.savedBy}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(v._id)}
                  className="rounded-lg border-2 border-[#0E1033] bg-white px-3 py-1 text-xs font-bold hover:bg-[#1F4BFF] hover:text-white"
                >
                  Restore This Version
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
