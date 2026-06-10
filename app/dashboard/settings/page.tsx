"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { api, apiUrl } from "@/lib/api";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "../dict";

interface SettingRecord {
  key: string;
  value: string | null;
  type: string;
  section: string | null;
  label: string | null;
}
interface SettingsData {
  sections: Record<string, SettingRecord[]>;
  map: Record<string, string | null>;
}

// Tab order + titles (sections come from the DB; this controls display order).
const SECTION_ORDER = [
  "general",
  "navbar",
  "hero",
  "announcements",
  "footer",
  "seo",
];
const SECTION_TITLE: Record<string, string> = {
  general: "General",
  navbar: "Navbar",
  hero: "Hero Section",
  announcements: "Announcements Bar",
  footer: "Footer",
  seo: "SEO",
};

const inputCls =
  "w-full bg-white border border-obsidian/15 px-3 py-2.5 text-sm font-body text-obsidian focus:outline-none focus:border-crimson transition-colors";
const labelCls = "eyebrow text-[9px] text-obsidian/50 mb-2 block";

const isLongText = (key: string) =>
  /description|subheadline|headline|copyright|message/i.test(key);

export default function SettingsPage() {
  const { lang } = useLang();
  const d = dict[lang];

  const [data, setData] = useState<SettingsData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(SECTION_ORDER[0]);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    const res = await api.get<{ success: boolean; data: SettingsData }>(
      "/api/site-settings"
    );
    if (res.success && res.data) {
      setData(res.data);
      const init: Record<string, string> = {};
      Object.values(res.data.sections).forEach((recs) =>
        recs.forEach((r) => {
          init[r.key] = r.value ?? "";
        })
      );
      setValues(init);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) showToast("Could not load settings", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, showToast]);

  const setValue = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function uploadImage(key: string, file: File) {
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("orith_token")
          : null;
      const res = await fetch(apiUrl("/api/site-settings/upload"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        setValue(key, json.data.url);
        showToast("Image uploaded", "success");
      } else {
        showToast(json.message || json.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingKey(null);
    }
  }

  async function saveSection(section: string) {
    const recs = data?.sections[section] ?? [];
    // Validate JSON fields before sending.
    for (const r of recs) {
      if (r.type === "json" && values[r.key]?.trim()) {
        try {
          JSON.parse(values[r.key]);
        } catch {
          showToast(`Invalid JSON in "${r.label ?? r.key}"`, "error");
          return;
        }
      }
    }
    setSavingSection(section);
    try {
      const settings = recs.map((r) => ({ key: r.key, value: values[r.key] ?? "" }));
      await api.patch<{ success: boolean }>("/api/site-settings", { settings });
      showToast("Settings saved", "success");
      await load();
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">{d.loading}</p>
      </div>
    );
  }

  const sections = data?.sections ?? {};
  const tabs = [
    ...SECTION_ORDER.filter((s) => sections[s]),
    ...Object.keys(sections).filter((s) => !SECTION_ORDER.includes(s)),
  ];
  const activeRecords = sections[activeTab] ?? [];

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="border-b border-obsidian/12 pb-8 mb-10">
        <p className="eyebrow text-crimson mb-4">{d.administration}</p>
        <h1
          className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
          style={{ fontWeight: 600 }}
        >
          {d.nav.settings}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-obsidian/10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`eyebrow text-[10px] px-4 py-3 border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-crimson text-crimson"
                : "border-transparent text-obsidian/50 hover:text-obsidian"
            }`}
          >
            {SECTION_TITLE[tab] ?? tab}
          </button>
        ))}
      </div>

      {/* Active section */}
      <div className="max-w-3xl">
        <div className="grid gap-7">
          {activeRecords.map((rec) => (
            <Field
              key={rec.key}
              rec={rec}
              value={values[rec.key] ?? ""}
              onChange={(v) => setValue(rec.key, v)}
              onUpload={(file) => uploadImage(rec.key, file)}
              uploading={uploadingKey === rec.key}
            />
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-obsidian/10">
          <button
            onClick={() => saveSection(activeTab)}
            disabled={savingSection === activeTab}
            className="btn-crimson text-[10px] disabled:opacity-50"
          >
            {savingSection === activeTab
              ? d.orders.saving
              : `Save ${SECTION_TITLE[activeTab] ?? activeTab}`}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 end-6 z-[80] px-5 py-3 text-sm font-body shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-crimson/5 border-crimson/40 text-crimson"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Field({
  rec,
  value,
  onChange,
  onUpload,
  uploading,
}: {
  rec: SettingRecord;
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const label = rec.label ?? rec.key;

  if (rec.type === "boolean") {
    const on = value === "true";
    return (
      <div className="flex items-center justify-between">
        <span className={labelCls + " mb-0"}>{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange(on ? "false" : "true")}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            on ? "bg-crimson" : "bg-obsidian/20"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
              on ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  if (rec.type === "color") {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 border border-obsidian/15 bg-white cursor-pointer p-1"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls + " max-w-[160px]"}
            placeholder="#8E1B26"
          />
        </div>
      </div>
    );
  }

  if (rec.type === "image") {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 border border-obsidian/15 bg-ivory flex items-center justify-center overflow-hidden shrink-0">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt={label} className="w-full h-full object-contain" />
            ) : (
              <span className="eyebrow text-[8px] text-obsidian/30">No image</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="inline-flex items-center gap-2 cursor-pointer btn-ghost text-obsidian text-[10px] py-2 px-4">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Image URL"
              className={inputCls + " mt-2"}
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="eyebrow text-[9px] text-crimson mt-2 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (rec.type === "json") {
    return (
      <div>
        <label className={labelCls}>{label} (JSON)</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          spellCheck={false}
          className={inputCls + " font-mono text-xs leading-relaxed"}
        />
      </div>
    );
  }

  // text / url
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {isLongText(rec.key) ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputCls}
        />
      ) : (
        <input
          type={rec.type === "url" ? "url" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}
