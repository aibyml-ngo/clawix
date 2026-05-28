import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EnterpriseSection() {
  const t = useTranslations("enterprise");
  const highlights = t.raw("highlights") as string[];

  return (
    <section className="bg-clawix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("description")}
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <CheckCircle className="h-4 w-4 text-clawix-success" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="bg-clawix-primary hover:bg-clawix-primary/90"
            >
              <Link href="/enterprise">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
