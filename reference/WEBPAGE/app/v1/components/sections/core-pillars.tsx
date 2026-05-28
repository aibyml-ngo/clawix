import { useTranslations } from "next-intl";
import { Shield, Cog, Server } from "lucide-react";

const pillars = [
  {
    key: "control",
    icon: Shield,
    accentColor: "bg-clawix-primary",
    iconColor: "text-clawix-primary",
  },
  {
    key: "execution",
    icon: Cog,
    accentColor: "bg-clawix-accent",
    iconColor: "text-clawix-accent",
  },
  {
    key: "ownership",
    icon: Server,
    accentColor: "bg-clawix-success",
    iconColor: "text-clawix-success",
  },
] as const;

export function CorePillarsSection() {
  const t = useTranslations("pillars");

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="relative rounded-2xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`absolute left-0 top-0 h-1 w-full rounded-t-2xl ${pillar.accentColor}`}
                />
                <div
                  className={`inline-flex rounded-lg bg-muted p-3 ${pillar.iconColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {t(`${pillar.key}.title`)}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t(`${pillar.key}.description`)}
                </p>
                <ul className="mt-4 space-y-2">
                  {(t.raw(`${pillar.key}.features`) as string[]).map(
                    (feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${pillar.accentColor}`}
                        />
                        {feature}
                      </li>
                    )
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
