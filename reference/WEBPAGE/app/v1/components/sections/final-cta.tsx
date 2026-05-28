import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-gradient-to-r from-clawix-accent to-clawix-cta py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/80">{t("description")}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-white text-clawix-cta hover:bg-white/90"
            >
              <Link href="/docs">
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <a
                href="https://github.com/ClawixAI/clawix/discussions"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("ctaCommunity")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/learn">{t("ctaWorkshop")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
