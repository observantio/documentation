import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Container,
  Code2,
  FileText,
  FolderGit2,
  Github,
  Lock,
  Monitor,
  Terminal,
  Copy,
  Moon,
} from "lucide-react";

import { slidesJson } from "./data/slideData";
import type { Path, SlideData } from "./data/slideTypes";
import sunIcon from "./assets/sun.png";
import { BUILD_TIMESTAMP } from "./buildInfo";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** Firefox-inspired accent spectrum (orange · gold · purple · magenta) */
const PURPLE = "#9059ff";
const ORANGE = "#ff7139";

const motionSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.85,
};
const motionGentle = {
  type: "spring" as const,
  stiffness: 280,
  damping: 26,
};

const WATCHDOG_README_URL =
  "https://github.com/observantio/watchdog/blob/main/README.md";
const WATCHDOG_CHART_README_URL =
  "https://github.com/observantio/watchdog/blob/main/charts/observantio/README.md";
const WATCHDOG_INSTALLER_URL =
  "https://raw.githubusercontent.com/observantio/watchdog/main/install.py";
const WATCHDOG_CHART_INSTALLER_URL =
  "https://github.com/observantio/watchdog/blob/main/charts/observantio/installer.sh";
const OJO_README_URL = "https://github.com/observantio/ojo/blob/main/README.md";
const DOC_LINKS = [
  {
    label: "Full User Guide",
    href: "https://github.com/observantio/watchdog/blob/main/USER%20GUIDE.md",
  },
  {
    label: "Architecture README",
    href: WATCHDOG_README_URL,
  },
];
const WATCHDOG_DEPLOYMENT_GUIDE_URL =
  "https://github.com/observantio/watchdog/blob/main/DEPLOYMENT.md";
const WATCHDOG_RELEASES_URL = "https://github.com/observantio/watchdog/releases";
const OJO_DEPLOYMENT_GUIDE_URL =
  "https://github.com/observantio/ojo/blob/main/DEPLOYMENT.md";
const DEFAULT_STACK_RELEASE_TAG = "v0.0.3";
const DEFAULT_OJO_RELEASE_TAG = "v0.0.3";
type InstallerTab = "stack" | "helm" | "installer" | "linux" | "windows";
const INSTALL_TABS: Array<{ key: InstallerTab; label: string }> = [
  { key: "stack", label: "Stack" },
  { key: "helm", label: "Helm Release" },
  { key: "installer", label: "Quick Development" },
  { key: "linux", label: "Ojo Linux" },
  { key: "windows", label: "Ojo Windows" },
];
function fetchLatestGitHubReleaseTag(
  owner: string,
  repo: string,
  fallback: string,
): Promise<string> {
  return fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`)
    .then((res) => {
      if (!res.ok) return fallback;
      return res.json();
    })
    .then((data) => {
      if (!data || typeof data.tag_name !== "string") return fallback;
      return data.tag_name;
    })
    .catch(() => fallback);
}
function getInstallCommand(
  tab: InstallerTab,
  stackReleaseTag: string,
  ojoReleaseTag: string,
) {
  const commands: Record<InstallerTab, string> = {
    stack: `curl -fsSL https://raw.githubusercontent.com/observantio/watchdog/main/download.sh -o download.sh

# Optional explicit release + architecture:
# bash download.sh ${stackReleaseTag} arm64 
# bash download.sh ${stackReleaseTag} amd64
# Supported arch values: amd64 | arm64 | multi

bash download.sh ${stackReleaseTag}`,
  helm: `curl -L https://github.com/observantio/watchdog/releases/download/${stackReleaseTag}/observantio-${stackReleaseTag}-helm-charts.tar.gz -o observantio-${stackReleaseTag}-helm-charts.tar.gz

tar -xzf observantio-${stackReleaseTag}-helm-charts.tar.gz

# Enter the extracted chart root
cd observantio-${stackReleaseTag}-helm-charts

# Run installer.sh from the extracted chart root
bash installer.sh --profile production --foreground`,
  installer: `curl -fsSL https://raw.githubusercontent.com/observantio/watchdog/main/install.py -o install.py && python3 install.py`,
    linux: `curl -L https://github.com/observantio/ojo/releases/download/${ojoReleaseTag}/ojo-${ojoReleaseTag}-linux-x86_64 -o ojo
chmod +x ojo
sudo mv ojo /usr/local/bin/ojo
ojo --config linux.yaml`,
    windows: `Invoke-WebRequest https://github.com/observantio/ojo/releases/download/${ojoReleaseTag}/ojo-${ojoReleaseTag}-windows-x86_64.exe -OutFile .\\ojo.exe
.\\ojo.exe --config windows.yaml`,
  };
  return commands[tab];
}
function getReleaseUrl(
  isStackTab: boolean,
  stackReleaseTag: string,
  ojoReleaseTag: string,
) {
  return isStackTab
    ? `https://github.com/observantio/watchdog/releases/tag/${stackReleaseTag}`
    : `https://github.com/observantio/ojo/releases/tag/${ojoReleaseTag}`;
}

function LinuxPenguinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5c-2.6 0-4.7 2.1-4.7 4.7v2.1c0 1.5-1 2.8-2.4 3.1 0 0 1.4 2.8 1.4 4.7 0 1.5 1.3 2.7 2.8 2.7h4.9c1.5 0 2.8-1.2 2.8-2.7 0-1.9 1.4-4.7 1.4-4.7-1.4-.3-2.4-1.6-2.4-3.1V7.2C16.7 4.6 14.6 2.5 12 2.5Z" />
      <path d="M9.5 9.5c.3.6.6 1.3.6 2.2 0 1.7-1 2.9-1 2.9s.6 1.8 1.3 2.4" />
      <path d="M14.5 9.5c-.3.6-.6 1.3-.6 2.2 0 1.7 1 2.9 1 2.9s-.6 1.8-1.3 2.4" />
      <path d="M10.7 14.7c.8 1.2 2.6 1.2 3.4 0" />
      <path d="M11.6 9.3a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z" />
    </svg>
  );
}

function KubernetesIcon() {
  return (
    <img
      src={withBaseUrl("/kubernetes.png")}
      alt=""
      className="h-4 w-4 object-contain"
      aria-hidden="true"
    />
  );
}

function installerTabIcon(tab: InstallerTab) {
  if (tab === "windows") return <Monitor className="h-4 w-4" />;
  if (tab === "linux") return <LinuxPenguinIcon />;
  if (tab === "installer") return <Code2 className="h-4 w-4" />;
  if (tab === "helm") return <KubernetesIcon />;
  return <Container className="h-4 w-4" />;
}

function withBaseUrl(src: string) {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  if (!src.startsWith("/")) return src;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

function findHorizontalScrollContainer(
  node: EventTarget | null,
): HTMLElement | null {
  if (!(node instanceof HTMLElement)) return null;
  let current: HTMLElement | null = node;
  while (current) {
    if (current.scrollWidth > current.clientWidth) {
      const overflowX = window.getComputedStyle(current).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return current;
    }
    current = current.parentElement;
  }
  return null;
}

function pathAccent(path: Path) {
  if (path === "understand") return PURPLE;
  if (path === "use") return ORANGE;
  return "#ffbd4f";
}

type ThemeMode = "dark" | "light";

function ThemeToggleButton({
  theme,
  onToggle,
}: {
  theme: ThemeMode;
  onToggle: () => void;
}) {
  const goingToLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${goingToLight ? "light" : "dark"} mode`}
      title={`Switch to ${goingToLight ? "light" : "dark"} mode`}
      className="showcase-focus-ring fixed top-5 right-4 z-[80] inline-flex items-center gap-2 rounded-2xl border-[3px] border-[#2d1b48] px-3 py-2 text-xs font-mono transition-colors duration-200 min-h-10"
      style={{
        borderColor: "#2d1b48",
        backgroundColor: goingToLight ? "#a090e8" : "#ffffff",
        color: goingToLight ? "#2d1b48" : "#241030",
      }}
    >
      {goingToLight ? (
        <img src={sunIcon} alt="" className="h-4 w-4 object-contain" />
      ) : (
        <Moon className={`h-4 w-4 ${goingToLight ? "text-[#ffbd4f]" : "text-[#9059ff]"}`} />
      )}
      <span>{goingToLight ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

function ShowcaseBgFx({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="showcase-bg-fx pointer-events-none fixed z-0"
      aria-hidden
    />
  );
}

function renderCommandLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return <span className="showcase-terminal-muted"> </span>;

  if (trimmed.startsWith("#")) {
    return <span className="showcase-terminal-comment">{line}</span>;
  }

  const assignMatch = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (assignMatch) {
    const [, key, value] = assignMatch;
    return (
      <>
        <span className="text-sky-300">{key}</span>
        <span className="showcase-terminal-muted">=</span>
        <span className="text-amber-300">{value}</span>
      </>
    );
  }

  const commandMatch = line.match(/^(\s*)([a-zA-Z0-9_.-]+)(.*)$/);
  if (!commandMatch) return <span className="showcase-terminal-text">{line}</span>;

  const [, indent, cmd, rest] = commandMatch;
  return (
    <>
      <span className="showcase-terminal-gutter">{indent}</span>
      <span className="text-emerald-300">{cmd}</span>
      <span className="showcase-terminal-text">{rest}</span>
    </>
  );
}

function IdeCodeBlock({
  code,
  headerExtra,
}: {
  code: string;
  headerExtra?: React.ReactNode;
}) {
  const lines = code.split("\n");
  return (
    <div className="showcase-code-shell relative w-full text-left">
      <div className="showcase-code-window rounded-3xl border-[3px] border-[#2d1b48] overflow-hidden">
        <div className="showcase-code-header flex min-h-[44px] items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 border-b-[3px] border-[#2d1b48]">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5a6e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd4f]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#3fe489]" />
            </div>
            <span className="showcase-terminal-label truncate text-[11px] font-mono font-semibold uppercase tracking-wider">
              terminal
            </span>
          </div>
          {headerExtra ?? null}
        </div>
        <pre className="showcase-code px-3 sm:px-4 py-3 text-left font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
          <code>
            {lines.map((line, idx) => (
              <div
                key={`${idx}-${line}`}
                className="grid grid-cols-[2.4rem_1fr] sm:grid-cols-[2.9rem_1fr] gap-3"
              >
                <span className="showcase-terminal-gutter select-none pr-1 text-right tabular-nums">
                  {idx + 1}
                </span>
                <span>{renderCommandLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function CodeBlockSection({
  block,
  accent,
}: {
  block: { label?: string; code: string };
  accent: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        {block.label ? (
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-retro-dim">
            {block.label}
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-mono text-retro-dim transition hover:border-current hover:text-retro-text"
          style={{ borderColor: accent + "35" }}
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div
        className="showcase-code-panel rounded-2xl border overflow-auto"
        style={{ borderColor: accent + "35" }}
      >
        <div
          className="flex items-center gap-1.5 px-4 py-3 border-b"
          style={{ borderColor: accent + "25" }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="showcase-code px-5 py-4 text-xs sm:text-sm font-mono leading-relaxed text-zinc-300 max-h-[400px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700/50 hover:scrollbar-thumb-zinc-600/60">
          <code className="whitespace-pre">
            {block.code.split("\n").map((line, lineIndex) => (
              <div key={`${lineIndex}-${line}`}>
                {renderCommandLine(line)}
              </div>
            ))}
          </code>
        </div>
      </div>
    </div>
  );
}

function Tag({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      className="showcase-tag"
      style={{ borderLeftColor: accent }}
    >
      {label}
    </span>
  );
}

function BoolCell({ val, accent }: { val: boolean | string; accent: string }) {
  if (val === true)
    return (
      <span style={{ color: accent }} className="text-lg">
        ✓
      </span>
    );
  if (val === false) return <span className="text-retro-dim text-lg">✗</span>;
  return <span className="text-xs showcase-body-copy">{val}</span>;
}

function GenericTable({ slide, accent }: { slide: SlideData; accent: string }) {
  const t = slide.table;
  if (!t) return null;

  return (
    <div
      className="showcase-generic-table-wrap mt-6 overflow-x-auto rounded-2xl border"
      style={{ borderColor: accent + "35" }}
    >
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr
            style={{
              backgroundColor: accent + "12",
              borderBottom: `1px solid ${accent}35`,
            }}
          >
            {t.columns.map((c, i) => (
              <th
                key={i}
                className="py-3 px-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                borderBottom:
                  ri < t.rows.length - 1 ? `1px solid ${accent}18` : "none",
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`showcase-body-copy py-3 px-4 align-top text-xs leading-relaxed sm:text-sm ${
                    ci === 0 ? "font-semibold" : "font-normal"
                  }`}
                >
                  {typeof cell === "boolean" ? (
                    <BoolCell val={cell} accent={accent} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SlideImage({ slide, accent }: { slide: SlideData; accent: string }) {
  if (!slide.image) return null;
  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border"
      style={{ borderColor: accent + "35" }}
    >
      <div className="bg-black/40">
        <img
          src={withBaseUrl(slide.image.src)}
          alt={slide.image.alt ?? "slide image"}
          className="w-full max-h-[420px] object-contain"
        />
      </div>
    </div>
  );
}

function SlideGallery({ slide, accent }: { slide: SlideData; accent: string }) {
  if (!slide.gallery?.length) return null;
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {slide.gallery.map((g, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border bg-black/30"
          style={{ borderColor: accent + "35" }}
        >
          <img
            src={withBaseUrl(g.src)}
            alt={g.alt ?? `gallery ${i + 1}`}
            className="w-full h-[180px] sm:h-[200px] object-cover"
          />
          {g.alt && (
            <div
              className="showcase-slide-caption px-3 py-2 text-xs font-mono border-t"
              style={{ borderColor: accent + "20" }}
            >
              {g.alt}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SlideLinks({ slide, accent }: { slide: SlideData; accent: string }) {
  if (!slide.links?.length) return null;
  const linkIcon = (label: string, href: string) => {
    const lowerLabel = label.toLowerCase();
    const lowerHref = href.toLowerCase();
    if (lowerLabel.includes("repository") && lowerHref.includes("github.com")) {
      return lowerLabel.includes("project") ? (
        <Github className="h-4 w-4" />
      ) : (
        <FolderGit2 className="h-4 w-4" />
      );
    }
    if (lowerLabel.includes("guide")) return <BookOpen className="h-4 w-4" />;
    if (lowerLabel.includes("readme")) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {slide.links.map((item) => (
        <a
          key={`${item.label}-${item.href}`}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="showcase-inset-card rounded-2xl border p-4 transition-colors"
          style={{ borderColor: accent + "35" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border"
                style={{
                  color: accent,
                  borderColor: accent + "35",
                  backgroundColor: accent + "12",
                }}
              >
                {linkIcon(item.label, item.href)}
              </span>
              <div className="text-sm font-semibold text-retro-text">
                {item.label}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-retro-dim" />
          </div>
          {item.description && (
            <div className="mt-2 text-xs showcase-slide-secondary leading-relaxed">
              {item.description}
            </div>
          )}
          <div className="mt-2 text-[11px] font-mono text-retro-dim break-all">
            {item.href}
          </div>
        </a>
      ))}
    </div>
  );
}

function renderContent(slide: SlideData, accent: string) {
  switch (slide.type) {
    case "bullets":
      return slide.bullets ? (
        <ul className="mt-6 space-y-3">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="showcase-body-copy flex gap-3 text-base sm:text-lg leading-relaxed"
            >
              <span
                className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full border-2 border-[#2d1b48]"
                style={{
                  backgroundColor: accent,
                }}
              />
              {b}
            </li>
          ))}
        </ul>
      ) : null;

    case "metrics":
      return (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slide.metrics?.map((m, i) => (
            <div
              key={i}
              className="showcase-inset-card rounded-2xl border p-5"
              style={{ borderColor: accent + "35" }}
            >
              <div
                className="text-3xl sm:text-4xl font-bold font-mono"
                style={{ color: accent }}
              >
                {m.value}
              </div>
              <div className="mt-1 text-sm font-semibold tracking-tight text-retro-text">
                {m.label}
              </div>
              {m.sub && (
                <div className="showcase-metric-sub">{m.sub}</div>
              )}
            </div>
          ))}
        </div>
      );

    case "services":
      return (
        <div className="mt-6 space-y-5">
          {slide.services?.map((svc, i) => (
            <section
              key={i}
              className="showcase-service-block overflow-hidden py-4"
            >
              {svc.image && (
                <div className="showcase-image-frame overflow-hidden">
                  <img
                    src={withBaseUrl(svc.image.src)}
                    alt={svc.image.alt ?? svc.name}
                    className="w-full object-contain my-3 block"
                  />
                </div>
              )}
              <div className="mb-4 mt-4 flex items-center gap-3">
                <div>
                  <div className="my-3 text-xl font-semibold">{svc.name}</div>
                  <div className="text-sm text-retro-dim">{svc.tagline}</div>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {svc.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="showcase-body-copy flex gap-2.5 text-sm leading-relaxed"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full border-2 border-[#2d1b48]"
                      style={{ backgroundColor: accent }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {svc.tags.map((t) => (
                  <Tag key={t} label={t} accent={accent} />
                ))}
              </div>
            </section>
          ))}
        </div>
      );

    case "comparison":
      return (
        <div
          className="showcase-generic-table-wrap mt-6 overflow-x-auto rounded-2xl border"
          style={{ borderColor: accent + "35" }}
        >
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${accent}35`,
                  backgroundColor: accent + "12",
                }}
              >
                <th className="py-3 px-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Feature
                </th>
                <th className="py-3 px-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Watchdog
                </th>
                <th className="py-3 px-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Datadog
                </th>
                <th className="py-3 px-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Grafana
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.comparison?.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < (slide.comparison?.length ?? 0) - 1
                        ? `1px solid ${accent}18`
                        : "none",
                  }}
                >
                  <td className="showcase-body-copy py-3 px-4 align-top text-xs font-semibold leading-relaxed sm:text-sm">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center align-top">
                    <BoolCell val={row.us} accent={accent} />
                  </td>
                  <td className="py-3 px-4 text-center align-top">
                    <BoolCell val={row.datadog} accent={accent} />
                  </td>
                  <td className="py-3 px-4 text-center align-top">
                    <BoolCell val={row.grafana} accent={accent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "arch":
      return (
        <div className="mt-8 space-y-3">
          {slide.archLayers?.map((layer, li) => (
            <div key={li} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 pt-2.5 text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-retro-dim">
                  {layer.label}
                </span>
              </div>
              <div className="flex-shrink-0 pt-3">
                <div
                  className="h-3 w-3 rounded-full border-2"
                  style={{
                    borderColor: accent,
                    backgroundColor: accent + "30",
                  }}
                />
                {li < (slide.archLayers?.length ?? 0) - 1 && (
                  <div
                    className="ml-[5px] mt-1 h-8 w-px"
                    style={{ backgroundColor: accent + "40" }}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 pb-2">
                {layer.nodes.map((node) => (
                  <div
                    key={node}
                    className="showcase-slide-arch-chip rounded-xl border px-3 py-1.5 text-xs font-mono"
                    style={{
                      borderColor: accent + "40",
                      backgroundColor: accent + "0D",
                    }}
                  >
                    {node}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "code": {
      const codeBlocks = Array.isArray(slide.code)
        ? slide.code
        : slide.code
          ? [{ code: slide.code }]
          : [];

      return (
        <div className="mt-6 space-y-4">
          {slide.codeLabel && (
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-retro-dim" />
              <span className="text-xs font-mono text-retro-dim">
                {slide.codeLabel}
              </span>
            </div>
          )}
          {codeBlocks.map((block, index) => (
            <div key={index} className={index > 0 ? "mt-4" : ""}>
              <CodeBlockSection block={block} accent={accent} />
            </div>
          ))}
        </div>
      );
    }

    case "workflow":
      return (
        <div className="mt-6 space-y-3">
          {slide.workflowSteps?.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold"
                  style={{
                    backgroundColor: accent + "20",
                    border: `1.5px solid ${accent}`,
                    color: accent,
                  }}
                >
                  {i + 1}
                </div>
                {i < (slide.workflowSteps?.length ?? 0) - 1 && (
                  <div
                    className="mt-1 h-full w-px"
                    style={{ backgroundColor: accent + "30" }}
                  />
                )}
              </div>
              <div className="pb-4">
                <div className="text-sm font-semibold text-retro-text">
                  {step.label}
                </div>
                <div className="showcase-body-copy mt-1 text-sm leading-relaxed">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "savings":
      return (
        <div
          className="showcase-generic-table-wrap mt-6 overflow-x-auto rounded-2xl border"
          style={{ borderColor: accent + "35" }}
        >
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: accent + "12",
                  borderBottom: `1px solid ${accent}35`,
                }}
              >
                <th className="py-3 px-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Metric
                </th>
                <th className="py-3 px-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  Before
                </th>
                <th className="py-3 px-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-retro-text sm:text-xs">
                  After / Saved
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.savings?.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < (slide.savings?.length ?? 0) - 1
                        ? `1px solid ${accent}18`
                        : "none",
                  }}
                >
                  <td className="showcase-body-copy py-3 px-4 align-top text-xs font-semibold sm:text-sm">
                    {row.metric}
                  </td>
                  <td className="showcase-body-copy py-3 px-4 text-center align-top text-xs font-mono leading-relaxed sm:text-sm">
                    {row.before}
                  </td>
                  <td
                    className="py-3 px-4 text-center align-top text-xs font-mono font-semibold leading-relaxed sm:text-sm"
                    style={{ color: accent }}
                  >
                    {row.unit ? row.unit : row.after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "license":
      return (
        <div
          className="mt-6 rounded-2xl border p-6"
          style={{ borderColor: accent + "35", backgroundColor: accent + "08" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4" style={{ color: accent }} />
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: accent }}
            >
              License
            </span>
          </div>
          <pre className="showcase-slide-secondary text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {slide.licenseText}
          </pre>
        </div>
      );

    case "table":
      return <GenericTable slide={slide} accent={accent} />;

    case "image":
      return <SlideImage slide={slide} accent={accent} />;

    case "gallery":
      return <SlideGallery slide={slide} accent={accent} />;

    default:
      return null;
  }
}

function PillChoice({
  onChoose,
  theme,
}: {
  onChoose: (p: Exclude<Path, null>) => void;
  theme: ThemeMode;
}) {
  const [hovered, setHovered] = useState<Path>(null);
  const [activeInstallTab, setActiveInstallTab] =
    useState<InstallerTab>("stack");
  const [stackReleaseTag, setStackReleaseTag] =
    useState<string>(DEFAULT_STACK_RELEASE_TAG);
  const [ojoReleaseTag, setOjoReleaseTag] = useState<string>(
    DEFAULT_OJO_RELEASE_TAG,
  );
  const [copied, setCopied] = useState(false);
  const activeInstallCommand = getInstallCommand(
    activeInstallTab,
    stackReleaseTag,
    ojoReleaseTag,
  );
  const isWatchdogInstallTab =
    activeInstallTab === "stack" || activeInstallTab === "installer";
  const stackHelmArchiveName = `observantio-${stackReleaseTag}-helm-charts.tar.gz`;
  const helmReleaseTarballUrl = `https://github.com/observantio/watchdog/releases/download/${stackReleaseTag}/${stackHelmArchiveName}`;
  const deploymentGuideUrl = isWatchdogInstallTab
    ? WATCHDOG_DEPLOYMENT_GUIDE_URL
    : OJO_DEPLOYMENT_GUIDE_URL;
  const releaseUrl =
    activeInstallTab === "helm"
      ? WATCHDOG_RELEASES_URL
      : getReleaseUrl(isWatchdogInstallTab, stackReleaseTag, ojoReleaseTag);

  const docsLinkItems =
    activeInstallTab === "helm"
      ? [{ label: "README", href: WATCHDOG_CHART_README_URL }]
      : isWatchdogInstallTab
        ? DOC_LINKS
        : [{ label: "README", href: OJO_README_URL }];

  const installHint =
    activeInstallTab === "stack" ? (
      <span>
        Stack install is intended for Linux hosts, preferably Ubuntu or Amazon
        Linux. Kubernetes Helm: use{" "}
        <a
          href={WATCHDOG_CHART_INSTALLER_URL}
          target="_blank"
          rel="noreferrer"
          className="showcase-link-inline inline-flex items-center gap-1.5 transition underline decoration-dotted decoration-current underline-offset-2"
        >
          charts/observantio/installer.sh
        </a>
        , which wraps the Helm chart and its profile-driven values files, or
        download the latest Helm release tarball{" "}
        <a
          href={helmReleaseTarballUrl}
          target="_blank"
          rel="noreferrer"
          className="showcase-link-inline inline-flex items-center gap-1.5 transition underline decoration-dotted decoration-current underline-offset-2"
        >
          {stackHelmArchiveName}
        </a>
        , untar it with <code>tar -xzf {stackHelmArchiveName}</code>,
        <code>cd</code> into the extracted directory, and run
        <code>installer.sh</code> from the extracted chart root.
      </span>
    ) : activeInstallTab === "helm" ? (
      <span>
        Helm release: download the latest chart tarball for your release tag,
        untar it, and run <code>installer.sh</code> from the extracted chart
        root. The links below point to the deployment guide, release page, and
        chart README.
      </span>
    ) : activeInstallTab === "installer" ? (
      <span>
        Local development: fetch{" "}
        <a
          href={WATCHDOG_INSTALLER_URL}
          target="_blank"
          rel="noreferrer"
          className="showcase-link-inline inline-flex items-center gap-1.5  mr-1.5transition underline decoration-dotted decoration-current underline-offset-2"
        >
          install.py
        </a>{" "}
        from the main branch to create a working <code>.env</code>, clone
        companion repos if needed, and start the compose stack.
      </span>
    ) : (
      <span>
        Use the latest Ojo {ojoReleaseTag} binary for your host.
      </span>
    );

  useEffect(() => {
    let active = true;

    async function loadLatest() {
      const [watchdogTag, ojoTag] = await Promise.all([
        fetchLatestGitHubReleaseTag(
          "observantio",
          "watchdog",
          DEFAULT_STACK_RELEASE_TAG,
        ),
        fetchLatestGitHubReleaseTag(
          "observantio",
          "ojo",
          DEFAULT_OJO_RELEASE_TAG,
        ),
      ]);

      if (!active) return;
      setStackReleaseTag(watchdogTag);
      setOjoReleaseTag(ojoTag);
    }

    loadLatest();
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeInstallCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="showcase-page min-h-screen text-retro-text font-sans flex flex-col items-center justify-start relative z-10 overflow-hidden px-5 sm:px-10 pt-12 sm:pt-16">

      <div className="showcase-subtle-grid opacity-[0.025]" aria-hidden />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.08, delayChildren: 0.04 },
          },
        }}
        className="relative z-10 flex w-full max-w-6xl flex-col text-left"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: motionSpring },
          }}
          className="mb-4"
        >
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.32em] text-retro-dim">
            Observantio&apos;s LGTM
          </span>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: motionSpring },
          }}
          className="mb-6 space-y-4"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: motionSpring },
            }}
            className="showcase-hero-title max-w-5xl text-2xl font-semibold tracking-tight leading-[1.12] sm:text-4xl sm:leading-[1.08]"
          >
            LGTM stack management for self-hosted teams, made possible for free
          </motion.h1>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: motionGentle },
            }}
            className="max-w-3xl text-sm leading-relaxed text-retro-dim sm:text-base sm:text-lg"
          >
            Our vision is to make the LGTM stack secure, usable, and affordable
            for self-hosted teams by putting access control, guided operations,
            and day-to-day workflows in one place.
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: motionGentle },
            }}
            className="text-sm text-retro-text"
          >
            <a
              href="https://www.linkedin.com/in/stefan-kumarasinghe"
              target="_blank"
              rel="noreferrer"
              className={
                theme === "dark"
                  ? "text-sky-300 hover:text-sky-200 transition-colors"
                  : "text-blue-800 hover:text-blue-700 transition-colors"
              }
            >
              Stefan Kumarasinghe on LinkedIn
            </a>
            <span className="ml-3 text-xs text-zinc-400">
              updated at {BUILD_TIMESTAMP}
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: motionGentle },
          }}
          className="order-1"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold tracking-wide text-retro-text">
                Quick start
              </div>
              <div className="mt-0.5 text-xs font-mono text-retro-dim">
                Choose an install target and copy the command.
              </div>
            </div>
            <motion.a
              href={DOC_LINKS[0].href}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.03, transition: motionSpring }}
              whileTap={{ scale: 0.97 }}
              className="showcase-focus-ring inline-flex min-h-10 items-center gap-2 rounded-2xl border-[3px] border-[#2d1b48] bg-[#9059ff] px-4 py-2 text-xs font-mono font-semibold text-white transition-colors hover:bg-[#7c4dff]"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              Product docs
            </motion.a>
          </div>

          <div className="showcase-home-tabs mb-4 grid w-full grid-cols-1 gap-2 rounded-2xl p-1.5 sm:grid-cols-2 lg:grid-cols-5">
            {INSTALL_TABS.map((tab) => {
              const active = activeInstallTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveInstallTab(tab.key);
                    setCopied(false);
                  }}
                  className={`showcase-home-tab-${tab.key} w-full rounded-lg px-3 py-2 text-xs transition min-h-10 ${
                    active
                      ? "showcase-home-tab showcase-home-tab-active"
                      : "showcase-home-tab"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="showcase-home-tab-icon">
                      {installerTabIcon(tab.key)}
                    </span>
                    <span>
                      {tab.label}
                      {tab.key === "stack"
                        ? ` ${stackReleaseTag}`
                        : tab.key === "linux" || tab.key === "windows"
                        ? ` ${ojoReleaseTag}`
                        : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full">
            <IdeCodeBlock
              code={activeInstallCommand}
              headerExtra={
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  whileHover={{ scale: 1.04, transition: motionSpring }}
                  whileTap={{ scale: 0.96 }}
                  className="showcase-focus-ring inline-flex max-w-full items-center gap-1 rounded-lg border-[3px] border-[#2d1b48] bg-[#ffecb8] px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#2d1b48] sm:px-3 sm:text-[11px]"
                  title="Copy command"
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-nowrap">Copied</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-nowrap">Copy</span>
                    </span>
                  )}
                </motion.button>
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-retro-dim">
            {installHint}
            <a
              href={deploymentGuideUrl}
              target="_blank"
              rel="noreferrer"
              className="showcase-link-inline inline-flex items-center gap-1.5 transition underline decoration-dotted decoration-current underline-offset-2"
            >
              <FileText className="h-3.5 w-3.5" />
              Deployment guide
            </a>
            <a
              href={releaseUrl}
              target="_blank"
              rel="noreferrer"
              className="showcase-link-inline inline-flex items-center gap-1.5 transition underline decoration-dotted decoration-current underline-offset-2"
            >
              <FileText className="h-3.5 w-3.5" />
              Release
            </a>
            {docsLinkItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="showcase-link-inline inline-flex items-center gap-1.5 transition underline decoration-dotted decoration-current underline-offset-2"
              >
                <FileText className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 22 },
            show: { opacity: 1, y: 0, transition: motionSpring },
          }}
          className="order-2 mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
        >
          <motion.button
            type="button"
            onHoverStart={() => setHovered("understand")}
            onHoverEnd={() => setHovered(null)}
            onClick={() => onChoose("understand")}
            whileHover={{ y: -6, transition: motionSpring }}
            whileTap={{ scale: 0.985 }}
            className="showcase-focus-ring showcase-path showcase-path-understand group relative overflow-hidden rounded-2xl border-[3px] p-6 sm:p-7 text-left min-h-[220px] flex flex-col"
            style={{
              borderColor: hovered === "understand" ? PURPLE : undefined,
            }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#2d1b48] bg-[#9059ff] text-2xl">
                🧠
              </div>
              <div>
                <div className="font-bold text-xl text-[#2d1b48]">
                  Platform Understanding
                </div>
                <div className="mt-0.5 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#2d1b48]/75">
                  Architecture and concepts
                </div>
              </div>
            </div>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-[#2d1b48]/90">
              Read the system flow, understand the services, and learn how the
              product fits around the LGTM stack.
            </p>
            <div className="mt-auto inline-flex w-fit max-w-full items-center gap-2 rounded-xl border-[3px] border-[#2d1b48] bg-[#fff9e8] px-3 py-2 text-sm font-bold font-mono text-[#2d1b48]">
              Open the guided architecture path
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </motion.button>

          <motion.button
            type="button"
            onHoverStart={() => setHovered("use")}
            onHoverEnd={() => setHovered(null)}
            onClick={() => onChoose("use")}
            whileHover={{ y: -6, transition: motionSpring }}
            whileTap={{ scale: 0.985 }}
            className="showcase-focus-ring showcase-path showcase-path-use group relative overflow-hidden rounded-2xl border-[3px] p-6 sm:p-7 text-left min-h-[220px] flex flex-col"
            style={{
              borderColor: hovered === "use" ? ORANGE : undefined,
            }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#2d1b48] bg-[#ff7139] text-2xl text-[#2d1b48]">
                🚀
              </div>
              <div>
                <div className="font-bold text-xl text-[#2d1b48]">
                  Deployment Fast Track
                </div>
                <div className="mt-0.5 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#2d1b48]/75">
                  Install and operate
                </div>
              </div>
            </div>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-[#2d1b48]/90">
              Follow the shortest route to install, send telemetry, validate
              data, and start using the stack quickly.
            </p>
            <div className="mt-auto inline-flex w-fit max-w-full items-center gap-2 rounded-xl border-[3px] border-[#2d1b48] bg-[#fff9e8] px-3 py-2 text-sm font-bold font-mono text-[#2d1b48]">
              Open the install and usage path
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}

const NOTICE_TEXT = `COPYRIGHT AND OWNERSHIP

Copyright © 2026 Stefan Kumarasinghe.

ORIGIN

This product includes software developed by Stefan Kumarasinghe and contributors.

PROJECT LICENSE

This project is released under the Apache License, Version 2.0 (the "License").
The complete legal text is shown on the next step of this flow.

Official copy of the license:

http://www.apache.org/licenses/LICENSE-2.0

THIRD PARTY SOFTWARE

Watchdog incorporates third-party open-source components for observability,
routing, storage, and application tooling. Names below appear for attribution
only; this project is not affiliated with, endorsed by, or sponsored by those
projects or their owners.

Observability and tracing — OpenTelemetry (OTel), Grafana, Loki, Tempo,
Mimir, Alertmanager.

Infrastructure and data — Envoy, PostgreSQL, Redis, NGINX.

Application stacks — FastAPI and the Python ecosystem; React and the
JavaScript ecosystem.

FULL ATTRIBUTION

Each dependency stays under its own license. See requirements.txt,
package.json, lockfiles, and upstream repositories for complete notices and
license text for bundled components.`;

const LICENSE_TEXT = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   "License" shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   "Licensor" shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   "Legal Entity" shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity.

   "You" (or "Your") shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   "Source" form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   "Object" form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   "Work" shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work.

   "Derivative Works" shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship.

   "Contribution" shall mean any work of authorship, including the
   original version of the Work and any modifications or additions to
   that Work or Derivative Works thereof, that is intentionally submitted
   to the Licensor for inclusion in the Work.

2. Grant of Copyright License.

   Subject to the terms and conditions of this License, each Contributor
   hereby grants to You a perpetual, worldwide, non-exclusive, no-charge,
   royalty-free, irrevocable copyright license to reproduce, prepare
   Derivative Works of, publicly display, publicly perform, sublicense,
   and distribute the Work and such Derivative Works in Source or Object
   form.

3. Grant of Patent License.

   Subject to the terms and conditions of this License, each Contributor
   hereby grants to You a perpetual, worldwide, non-exclusive, no-charge,
   royalty-free, irrevocable patent license to make, have made, use,
   offer to sell, sell, import, and otherwise transfer the Work.

4. Redistribution.

   You may reproduce and distribute copies of the Work or Derivative Works
   thereof in any medium, with or without modifications, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or Derivative Works
       a copy of this License; and

   (b) You must cause any modified files to carry prominent notices stating
       that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works, all
       copyright, patent, trademark, and attribution notices from the Source
       form of the Work.

5. Submission of Contributions.

   Unless You explicitly state otherwise, any Contribution intentionally
   submitted for inclusion in the Work shall be under the terms of this
   License.

6. Trademarks.

   This License does not grant permission to use the trade names, trademarks,
   service marks, or product names of the Licensor.

7. Disclaimer of Warranty.

   Unless required by applicable law or agreed to in writing, Licensor
   provides the Work "AS IS", WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied.

8. Limitation of Liability.

   In no event and under no legal theory shall any Contributor be liable for
   any damages arising as a result of this License or the use of the Work.

9. Accepting Warranty or Additional Liability.

   While redistributing the Work, You may choose to offer support or warranty
   obligations, but only on Your own behalf.

END OF TERMS AND CONDITIONS`;

type LegalStep = "notice" | "license";

function normalizeLegalText(docText: string) {
  const blocks: Array<{ type: "blank" | "divider" | "heading" | "paragraph"; text: string }> = [];
  let paragraph = "";

  const flushParagraph = () => {
    if (!paragraph) return;
    blocks.push({ type: "paragraph", text: paragraph });
    paragraph = "";
  };

  for (const rawLine of docText.split("\n")) {
    const trimmed = rawLine.trim();
    const isDivider = /^─{6,}$/.test(trimmed);
    const isSectionHeading =
      /^[A-Z][A-Z0-9 &(),./-]+$/.test(trimmed) &&
      trimmed.length > 4 &&
      !trimmed.startsWith("HTTP://");
    const isClauseHeading = /^\d+\.\s+[A-Z]/.test(trimmed);

    if (!trimmed) {
      flushParagraph();
      blocks.push({ type: "blank", text: "" });
      continue;
    }

    if (isDivider) {
      flushParagraph();
      blocks.push({ type: "divider", text: trimmed });
      continue;
    }

    if (isSectionHeading || isClauseHeading) {
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed });
      continue;
    }

    paragraph = paragraph ? `${paragraph} ${trimmed}` : trimmed;
  }

  flushParagraph();
  return blocks;
}

function isLegalClauseHeading(text: string) {
  return /^\d+\.\s+[A-Z]/.test(text.trim());
}

function LegalDocBlocks({
  blocks,
}: {
  blocks: ReturnType<typeof normalizeLegalText>;
}) {
  return (
    <>
      {blocks.map((block, idx) => {
        if (block.type === "blank")
          return <div key={idx} className="h-2 shrink-0" aria-hidden />;
        if (block.type === "divider")
          return <hr key={idx} className="legal-doc-rule" />;
        if (block.type === "heading") {
          const clause = isLegalClauseHeading(block.text);
          return clause ? (
            <h3 key={idx} className="legal-doc-clause-title">
              {block.text}
            </h3>
          ) : (
            <h3 key={idx} className="legal-doc-section-title">
              {block.text}
            </h3>
          );
        }
        return (
          <p key={idx} className="legal-doc-p">
            {block.text}
          </p>
        );
      })}
    </>
  );
}

function LegalGate({
  path,
  onAccept,
  onBack,
}: {
  path: Exclude<Path, null>;
  onAccept: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<LegalStep>("notice");
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const accent = pathAccent(path);
  const isNotice = step === "notice";
  const btnLabel = isNotice
    ? "Continue to License →"
    : "I Accept — Begin Journey";

  const noticeBlocks = useMemo(() => normalizeLegalText(NOTICE_TEXT), []);
  const licenseBlocks = useMemo(() => normalizeLegalText(LICENSE_TEXT), []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8)
      setScrolledToBottom(true);
  };

  useEffect(() => {
    setScrolledToBottom(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight + 8) setScrolledToBottom(true);
    }
  }, [step]);

  const handlePrimary = () => {
    if (isNotice) setStep("license");
    else onAccept();
  };

  return (
    <main className="showcase-page min-h-screen text-retro-text font-sans flex flex-col items-center justify-start relative z-10 overflow-hidden px-5 sm:px-8 pt-12 pb-8">
      <div className="showcase-subtle-grid opacity-[0.02]" aria-hidden />

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={motionGentle}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="showcase-legal-toolbar">
          <div className="showcase-legal-chip">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Legal review
          </div>
          <span className="showcase-legal-step-pill">
            {isNotice ? "1 / 2" : "2 / 2"}
          </span>
        </div>

        <article className="showcase-legal-sheet">
          <header
            className="showcase-legal-masthead border-l-[6px] border-solid"
            style={{ borderLeftColor: accent }}
          >
            <div>
              <p className="showcase-legal-masthead-meta">
                Observantio · Watchdog
              </p>
              <h1 className="showcase-legal-masthead-title">
                {isNotice ? "Notice" : "License"}
              </h1>
              <p className="showcase-legal-masthead-subtitle mt-1 font-mono text-[0.8125rem]">
                {isNotice
                  ? "Third-party attribution and licensing notice"
                  : "Apache License, Version 2.0"}
              </p>
            </div>
            <FileText
              className="showcase-legal-masthead-icon hidden h-10 w-10 shrink-0 sm:block"
              aria-hidden
            />
          </header>

          <div ref={scrollRef} onScroll={handleScroll} className="legal-page">
            <div className="legal-doc">
              <LegalDocBlocks blocks={isNotice ? noticeBlocks : licenseBlocks} />
            </div>
          </div>

          <footer className="showcase-legal-actions">
            <button
              type="button"
              onClick={isNotice ? onBack : () => setStep("notice")}
              className="showcase-focus-ring showcase-legal-btn-secondary inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border-[3px] border-solid px-3 py-2 text-sm font-mono font-semibold transition"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {isNotice ? "Back to paths" : "Back to Notice"}
            </button>

            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              {!scrolledToBottom && (
                <span className="showcase-legal-scroll-hint text-center text-[11px] font-mono animate-pulse sm:text-left sm:text-xs">
                  Scroll to the bottom to continue
                </span>
              )}
              <motion.button
                type="button"
                animate={{ opacity: scrolledToBottom ? 1 : 0.45 }}
                onClick={scrolledToBottom ? handlePrimary : undefined}
                aria-disabled={!scrolledToBottom}
                className={`showcase-focus-ring showcase-legal-btn-primary inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-[3px] border-solid px-4 py-2 text-sm font-mono font-semibold transition ${
                  scrolledToBottom
                    ? "showcase-legal-btn-primary--active cursor-pointer"
                    : "showcase-legal-btn-primary--idle cursor-not-allowed"
                }`}
              >
                {btnLabel}
                {!isNotice && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </motion.button>
            </div>
          </footer>
        </article>

        <p className="showcase-legal-disclaimer mt-6 mb-12 text-center text-xs font-mono leading-relaxed">
          {isNotice
            ? "By continuing, you acknowledge the notice above."
            : "By accepting, you agree to the license terms above."}
        </p>
      </motion.div>
    </main>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("showcase-theme");
    if (saved === "dark" || saved === "light") return saved;
    return "dark";
  });
  const [path, setPath] = useState<Path>(null);
  const [legalDone, setLegalDone] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    window.localStorage.setItem("showcase-theme", theme);
  }, [theme]);

  const slides = useMemo(() => {
    if (path === "understand") return slidesJson.understand;
    if (path === "use") return slidesJson.use;
    return [];
  }, [path]);

  const sectionEntries = useMemo(() => {
    const starts = new Map<string, number>();

    slides.forEach((slide, index) => {
      const section = slide.section ?? "Pitch";
      if (!starts.has(section)) starts.set(section, index);
    });

    return Array.from(starts.entries()).map(([label, index]) => ({
      label,
      index,
    }));
  }, [slides]);

  const total = slides.length;
  const s = slides[slideIndex];
  const currentSection = s?.section ?? "Pitch";
  const currentSectionIndex = Math.max(
    0,
    sectionEntries.findIndex((e) => e.label === currentSection),
  );

  const accent = pathAccent(path);

  const canPrev = slideIndex > 0;
  const canNext = slideIndex < total - 1;
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const swipeLockedToScroll = React.useRef(false);
  const slideFrameRef = React.useRef<HTMLDivElement>(null);

  const go = useCallback(
    (n: number) => {
      if (total <= 0) return;
      setSlideIndex(clamp(n, 0, total - 1));
    },
    [total],
  );

  const choosePath = (p: Exclude<Path, null>) => {
    setPath(p);
    setLegalDone(false);
    setSlideIndex(0);
  };

  useEffect(() => {
    slideFrameRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [path, legalDone, slideIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) go(slideIndex - 1);
      if (e.key === "ArrowRight" && canNext) go(slideIndex + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canPrev, canNext, go, slideIndex]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    swipeLockedToScroll.current =
      findHorizontalScrollContainer(e.target) !== null;
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
    touchStartY.current = e.changedTouches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    if (swipeLockedToScroll.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      swipeLockedToScroll.current = false;
      return;
    }
    const endX = e.changedTouches[0]?.clientX;
    const endY = e.changedTouches[0]?.clientY;
    if (
      typeof endX !== "number" ||
      typeof endY !== "number" ||
      touchStartY.current === null
    )
      return;
    const delta = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;
    if (Math.abs(delta) > Math.abs(deltaY)) {
      if (delta <= -60 && canNext) go(slideIndex + 1);
      if (delta >= 60 && canPrev) go(slideIndex - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    swipeLockedToScroll.current = false;
  };

  useEffect(() => {
    const brand = "Observantio Watchdog";
    if (!path) {
      document.title = `${brand} — LGTM stack showcase`;
      return;
    }
    if (!legalDone) {
      document.title = `Notice & license — ${brand}`;
      return;
    }
    const segment =
      path === "understand" ? "Platform tour" : "Install & deploy";
    document.title = `${segment} — ${brand}`;
  }, [path, legalDone]);

  const showSlides = path !== null && legalDone;
  const progressPct =
    showSlides && total > 0
      ? Math.round(((slideIndex + 1) / total) * 100)
      : 0;
  const pathLabel =
    path === "understand"
      ? "Platform Understanding — The Why"
      : path === "use"
        ? "Deployment Fast Track — Install & Use"
        : "";

  return (
    <>
      <ShowcaseBgFx visible={theme === "dark"} />
      <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
      {!path ? (
        <PillChoice onChoose={choosePath} theme={theme} />
      ) : !legalDone ? (
        <LegalGate
          path={path}
          onAccept={() => setLegalDone(true)}
          onBack={() => setPath(null)}
        />
      ) : (
        <div className="showcase-page min-h-screen text-retro-text font-sans selection:bg-retro-glow/20 relative z-10 pb-6">
          <div className="showcase-fixed-grid" aria-hidden />

          <div className="pointer-events-none fixed inset-0 z-[1]">
            <div
              className="absolute top-[12%] left-[8%] h-[420px] w-[420px] rounded-full opacity-[0.14] blur-[100px]"
              style={{ backgroundColor: accent }}
            />
            <div
              className="absolute bottom-[5%] right-[5%] h-[380px] w-[380px] rounded-full opacity-[0.1] blur-[90px]"
              style={{
                backgroundColor:
                  path === "understand" ? "#9059ff" : "#ff7139",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-14 w-full">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-retro-dim">
              Watchdog
            </div>
            <div className="text-sm font-semibold text-retro-text">
              {pathLabel}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
            <button
              onClick={() => {
                setPath(null);
                setLegalDone(false);
              }}
              className="showcase-focus-ring showcase-header-link-btn text-xs font-mono transition rounded-lg px-3 py-2 min-h-10 border"
            >
              ⇄ switch path
            </button>
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-retro-dim">
                {slideIndex + 1} / {total}
              </div>
              <div className="w-24 sm:w-36 h-1.5 rounded-full bg-retro-panel border border-retro-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: accent }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </header>

        {sectionEntries.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sectionEntries.map((entry, index) => {
              const isActive = entry.label === currentSection;

              return (
                <button
                  key={entry.label}
                  onClick={() => go(entry.index)}
                  className={
                    isActive
                      ? "showcase-section-tab showcase-section-tab-active inline-flex min-h-10 items-center gap-2 rounded-xl border-solid px-3 py-2 text-xs font-mono transition"
                      : "showcase-section-tab inline-flex min-h-10 items-center gap-2 rounded-xl border-solid px-3 py-2 text-xs font-mono transition"
                  }
                >
                  <span className="text-[10px] uppercase tracking-[0.16em] opacity-70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {entry.label}
                </button>
              );
            })}
          </div>
        )}

        <main className="mt-8">
          <div className="overflow-hidden showcase-slide-shell px-4 sm:px-8 py-5 sm:py-8">
            <div
              ref={slideFrameRef}
              className="px-0 py-3 sm:py-5 relative min-h-[440px] sm:min-h-[520px]"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${path}-${slideIndex}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={motionSpring}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-retro-dim">
                    <span>
                      Section {currentSectionIndex + 1} /{" "}
                      {sectionEntries.length || 1}
                    </span>
                    <span className="select-none opacity-45" aria-hidden>
                      |
                    </span>
                    <span className="font-semibold text-retro-text">
                      {currentSection}
                    </span>
                  </div>

                  {s?.kicker && (
                    <div
                      className="border-l-[4px] pl-3 text-sm font-mono font-bold uppercase tracking-[0.18em] text-retro-text"
                      style={{ borderLeftColor: accent }}
                    >
                      {s.kicker}
                    </div>
                  )}

                  <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight max-w-3xl">
                    {s?.title}
                  </h1>

                  {s?.subtitle && (
                    <p className="showcase-slide-subtitle mt-4 max-w-3xl text-sm leading-relaxed sm:text-lg">
                      {s.subtitle}
                    </p>
                  )}

                  {s ? (
                    <>
                      {renderContent(s, accent)}
                      <SlideLinks slide={s} accent={accent} />
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              className="px-0 py-4 flex items-center justify-between gap-2 sm:gap-3"
              style={{
                borderColor: accent + "25",
              }}
            >
              <button
                type="button"
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl border-[3px] border-solid px-3 py-2 text-xs font-mono font-semibold transition sm:text-sm ${
                  canPrev
                    ? "border-[#2d1b48] bg-[#fff9e8] text-[#2d1b48] hover:bg-[#ffecb8]"
                    : "border-transparent text-retro-dim opacity-35"
                }`}
                onClick={() => canPrev && go(slideIndex - 1)}
                disabled={!canPrev}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Prev
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto px-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className="h-2 w-2 rounded-full transition-all border"
                    style={{
                      backgroundColor:
                        i === slideIndex ? accent : "transparent",
                      borderColor: i === slideIndex ? accent : accent + "40",
                      width: i === slideIndex ? "24px" : "8px",
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl border-[3px] border-solid px-3 py-2 text-xs font-mono font-semibold transition sm:text-sm ${
                  canNext
                    ? "border-[#2d1b48] bg-[#fff9e8] text-[#2d1b48] hover:bg-[#ffecb8]"
                    : "border-transparent text-retro-dim opacity-35"
                }`}
                onClick={() => canNext && go(slideIndex + 1)}
                disabled={!canNext}
              >
                Next
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-4 sm:pb-8">
            <div className="text-xs font-mono text-retro-dim">
              ← → keys · swipe to navigate
            </div>
            <div className="showcase-slide-progress-meta text-xs font-mono">
              {slideIndex + 1} of {total} · {progressPct}% complete
            </div>
          </div>
        </main>
          </div>
        </div>
      )}
    </>
  );
}
