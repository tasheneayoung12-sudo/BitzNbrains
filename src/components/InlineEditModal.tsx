import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import type { SiteContent } from '../types/site';

export function InlineEditModal() {
  const { siteContent, editingSection, closeInlineEdit, refreshSiteContent } = useSite();
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (siteContent && editingSection) {
      setDraft(JSON.parse(JSON.stringify(siteContent)) as SiteContent);
      setPreviewMode(false);
      setStatusMsg('');
    }
  }, [siteContent, editingSection]);

  if (!editingSection || !draft) return null;

  const key = editingSection.pageKey;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: key,
          note: `Inline edit: ${editingSection?.label}`,
          content: draft,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setStatusMsg(d.error || 'Could not save changes.');
        return;
      }
      await refreshSiteContent();
      closeInlineEdit();
    } catch {
      setStatusMsg('Could not reach server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1033]/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inline-edit-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_8px_0_#0E1033]">
        <div className="flex items-center justify-between gap-4 border-b border-[#D8DDF5] pb-4">
          <h2 id="inline-edit-title" className="font-display text-2xl font-bold text-[#0E1033]">
            Edit: {editingSection.label}
          </h2>
          <button
            type="button"
            onClick={closeInlineEdit}
            aria-label="Close editor"
            className="rounded-xl border-2 border-[#0E1033] p-2 text-[#0E1033] hover:bg-[#F7F8FF]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {key === 'home' && (
            <>
              <div>
                <label htmlFor="ie-home-top" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Top Brand Name
                </label>
                <input
                  id="ie-home-top"
                  type="text"
                  value={draft.home.topName}
                  onChange={(e) => setDraft({ ...draft, home: { ...draft.home, topName: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-home-prompt" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Line Under the Brain
                </label>
                <input
                  id="ie-home-prompt"
                  type="text"
                  value={draft.home.promptLine}
                  onChange={(e) => setDraft({ ...draft, home: { ...draft.home, promptLine: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {key === 'channel' && (
            <>
              <div>
                <label htmlFor="ie-ch-hero" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Channel Hero Title
                </label>
                <input
                  id="ie-ch-hero"
                  type="text"
                  value={draft.channel.heroTitle}
                  onChange={(e) => setDraft({ ...draft, channel: { ...draft.channel, heroTitle: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ch-sub" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Channel Hero Subtitle
                </label>
                <textarea
                  id="ie-ch-sub"
                  rows={3}
                  value={draft.channel.heroSubtitle}
                  onChange={(e) => setDraft({ ...draft, channel: { ...draft.channel, heroSubtitle: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ch-embed" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  YouTube Embed URL (optional)
                </label>
                <input
                  id="ie-ch-embed"
                  type="url"
                  value={draft.channel.videoEmbedUrl}
                  onChange={(e) => setDraft({ ...draft, channel: { ...draft.channel, videoEmbedUrl: e.target.value } })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ch-mission" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Mission Text
                </label>
                <textarea
                  id="ie-ch-mission"
                  rows={2}
                  value={draft.channel.missionText}
                  onChange={(e) => setDraft({ ...draft, channel: { ...draft.channel, missionText: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {key === 'about' && (
            <>
              <div>
                <label htmlFor="ie-ab-title" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Page Title
                </label>
                <input
                  id="ie-ab-title"
                  type="text"
                  value={draft.about.heroTitle}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, heroTitle: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ab-bio" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Bio
                </label>
                <textarea
                  id="ie-ab-bio"
                  rows={3}
                  value={draft.about.bioText}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, bioText: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ab-story" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Story
                </label>
                <textarea
                  id="ie-ab-story"
                  rows={3}
                  value={draft.about.storyText}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, storyText: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-ab-cred" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Credentials
                </label>
                <textarea
                  id="ie-ab-cred"
                  rows={3}
                  value={draft.about.credentialsText}
                  onChange={(e) => setDraft({ ...draft, about: { ...draft.about, credentialsText: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {key === 'ourCode' && (
            <>
              <div>
                <label htmlFor="ie-oc-heading" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Heading
                </label>
                <input
                  id="ie-oc-heading"
                  type="text"
                  value={draft.ourCode.heading}
                  onChange={(e) => setDraft({ ...draft, ourCode: { ...draft.ourCode, heading: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-oc-intro" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Intro Paragraph
                </label>
                <textarea
                  id="ie-oc-intro"
                  rows={3}
                  value={draft.ourCode.intro}
                  onChange={(e) => setDraft({ ...draft, ourCode: { ...draft.ourCode, intro: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {key === 'bookABrain' && (
            <>
              <div>
                <label htmlFor="ie-bb-heading" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Heading
                </label>
                <input
                  id="ie-bb-heading"
                  type="text"
                  value={draft.bookABrain.heading}
                  onChange={(e) => setDraft({ ...draft, bookABrain: { ...draft.bookABrain, heading: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-bb-intro" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Intro Paragraph
                </label>
                <textarea
                  id="ie-bb-intro"
                  rows={2}
                  value={draft.bookABrain.intro}
                  onChange={(e) => setDraft({ ...draft, bookABrain: { ...draft.bookABrain, intro: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-bb-note" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Price Note
                </label>
                <input
                  id="ie-bb-note"
                  type="text"
                  value={draft.bookABrain.priceNote}
                  onChange={(e) => setDraft({ ...draft, bookABrain: { ...draft.bookABrain, priceNote: e.target.value } })}
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {(key === 'resources' || key === 'community' || key === 'events' || key === 'bootcamps') && (
            <>
              <div>
                <label htmlFor="ie-gen-heading" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Page Heading
                </label>
                <input
                  id="ie-gen-heading"
                  type="text"
                  value={draft[key].heading}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]: { ...draft[key], heading: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ie-gen-intro" className="block text-sm font-semibold text-[#0E1033] mb-1">
                  Intro Paragraph
                </label>
                <textarea
                  id="ie-gen-intro"
                  rows={3}
                  value={draft[key].intro}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]: { ...draft[key], intro: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-[#0E1033] px-3 py-2"
                />
              </div>
            </>
          )}

          {previewMode && (
            <div className="rounded-xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1F4BFF]">
                Preview Before Saving
              </p>
              <p className="mt-1 font-display text-xl font-bold text-[#0E1033]">
                {key === 'home'
                  ? draft.home.topName
                  : key === 'channel'
                  ? draft.channel.heroTitle
                  : key === 'about'
                  ? draft.about.heroTitle
                  : draft[key as 'ourCode' | 'bookABrain' | 'resources' | 'community' | 'events' | 'bootcamps']?.heading}
              </p>
              <p className="mt-1 text-sm text-[#0E1033]/80">
                {key === 'home'
                  ? draft.home.promptLine
                  : key === 'channel'
                  ? draft.channel.heroSubtitle
                  : key === 'about'
                  ? draft.about.bioText
                  : draft[key as 'ourCode' | 'bookABrain' | 'resources' | 'community' | 'events' | 'bootcamps']?.intro}
              </p>
            </div>
          )}

          {statusMsg && (
            <p className="text-sm font-semibold text-[#D1006F]" role="alert">
              {statusMsg}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPreviewMode((p) => !p)}
              className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-4 py-2 font-semibold text-[#0E1033] hover:bg-white"
            >
              {previewMode ? 'Hide Preview' : 'Preview'}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeInlineEdit}
                className="rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 font-semibold text-[#0E1033]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-2 font-display font-semibold text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
