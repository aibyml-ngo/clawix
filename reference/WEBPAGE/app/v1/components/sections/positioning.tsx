import { useTranslations } from "next-intl";

export function PositioningSection() {
  const t = useTranslations("positioning");

  return (
    <section className="bg-clawix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
    </section>
  );
}
