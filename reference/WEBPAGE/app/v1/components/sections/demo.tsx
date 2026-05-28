import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoSection() {
  const t = useTranslations("demo");

  return (
    <section id="demo" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="mt-12">
          <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-clawix-primary to-clawix-accent shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-white/90 text-clawix-cta hover:bg-white"
              >
                <Play className="h-8 w-8" />
                <span className="sr-only">{t("cta")}</span>
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/80">
              Demo video coming soon
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <a
                href="https://github.com/ClawixAI/clawix"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("cta")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
