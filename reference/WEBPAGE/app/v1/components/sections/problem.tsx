import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Chaos side */}
          <div className="relative rounded-2xl border border-border bg-muted/50 p-8">
            <div className="absolute -top-4 left-6 rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700">
              {t("chaosLabel")}
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span>Unpredictable outputs</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span>No visibility into agent actions</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span>Vendor lock-in</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span>Security concerns</span>
              </div>
            </div>
          </div>

          {/* Structured side */}
          <div className="relative rounded-2xl border-2 border-clawix-success bg-clawix-bg p-8">
            <div className="absolute -top-4 left-6 rounded-full bg-clawix-success px-4 py-1 text-sm font-medium text-white">
              {t("structuredLabel")}
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 text-foreground">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-clawix-success" />
                <span>Deterministic workflows</span>
              </div>
              <div className="flex items-start gap-3 text-foreground">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-clawix-success" />
                <span>Full audit trail</span>
              </div>
              <div className="flex items-start gap-3 text-foreground">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-clawix-success" />
                <span>Multi-provider support</span>
              </div>
              <div className="flex items-start gap-3 text-foreground">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-clawix-success" />
                <span>Container isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
