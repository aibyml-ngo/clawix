"use client";

import React from "react";
import { useTranslations } from "next-intl";
import kimiLogo from "@/public/kimi.png";

function AnthropicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 176" className={className} fill="currentColor">
      <path d="M147.487 0l60.693 175.456h-42.121l-60.694-175.456h42.122zm-81.097 0l-60.693 175.456h42.121l60.694-175.456h-42.122zm40.549 68.4l30.346 87.728h-60.694l30.348-87.728z" />
    </svg>
  );
}

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function OllamaImage({ className }: { className?: string }) {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <img
      src="https://ollama.com/public/ollama.png"
      alt="Ollama"
      width={28}
      height={28}
      className={className}
      style={isDark ? { filter: "invert(1)" } : undefined}
    />
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function KimiImage({ className }: { className?: string }) {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <img
      src={kimiLogo.src}
      alt="Kimi"
      width={28}
      height={28}
      className={className}
      style={isDark ? { filter: "invert(1)" } : undefined}
    />
  );
}

function ZAIIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 4h16v3H9.5L20 18v2H4v-3h10.5L4 6V4z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function WebIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

type IconComponent = React.ComponentType<{ className?: string }>;

const providers: { name: string; icon: IconComponent; isImage?: boolean }[] = [
  { name: "Anthropic", icon: AnthropicIcon },
  { name: "OpenAI", icon: OpenAIIcon },
  { name: "Ollama", icon: OllamaImage, isImage: true },
  { name: "Google Gemini", icon: GoogleIcon },
  { name: "Kimi", icon: KimiImage, isImage: true },
  { name: "zAI", icon: ZAIIcon },
];

const channels: { name: string; icon: IconComponent }[] = [
  { name: "Telegram", icon: TelegramIcon },
  { name: "WhatsApp", icon: WhatsAppIcon },
  { name: "Web", icon: WebIcon },
];

function CarouselCard({ name, icon: Icon, isImage }: { name: string; icon: IconComponent; isImage?: boolean }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2" style={{ width: "96px" }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors duration-150 hover:border-[var(--color-brand)]/50 hover:text-[var(--color-brand)]">
        <Icon className={isImage ? "h-7 w-7 rounded" : "h-7 w-7"} />
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">{name}</span>
    </div>
  );
}

function InfiniteCarousel<T extends { name: string }>({
  items,
  renderItem,
  speed = 30,
  reverse = false,
  itemWidth = 96,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  speed?: number;
  reverse?: boolean;
  itemWidth?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const baseSetWidth = items.length * itemWidth;
  const repeats = Math.max(Math.ceil(containerWidth / baseSetWidth) + 1, 2);
  const setWidth = repeats * baseSetWidth;
  const duration = setWidth / speed;
  const animName = reverse ? "carousel-reverse" : "carousel";

  const renderSet = (offset: number) => (
    <div className="flex shrink-0">
      {Array.from({ length: repeats }, (_, r) =>
        items.map((item, i) => renderItem(item, offset + r * items.length + i))
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
      <div
        className="flex hover:[animation-play-state:paused]"
        style={containerWidth ? {
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
        } : undefined}
      >
        {renderSet(0)}
        {renderSet(repeats * items.length)}
      </div>
    </div>
  );
}

export function ProvidersSection() {
  const t = useTranslations();

  return (
    <>
    <section id="providers" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("providers.title")}
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            {t("providers.description")}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <InfiniteCarousel
          items={providers}
          speed={30}
          renderItem={(p, i) => (
            <CarouselCard key={`${p.name}-${i}`} name={p.name} icon={p.icon} isImage={p.isImage} />
          )}
        />
      </div>

    </section>

    <section id="channels" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("channels.title")}
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            {t("channels.description")}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <InfiniteCarousel
          items={channels}
          speed={24}
          reverse
          renderItem={(c, i) => (
            <CarouselCard key={`${c.name}-${i}`} name={c.name} icon={c.icon} />
          )}
        />
      </div>
    </section>
    </>
  );
}
