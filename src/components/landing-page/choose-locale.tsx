"use client";
import React, { startTransition } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";

export const ChooseLocale = () => {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const items = [
    {
      value: "en",
      label: t("en"),
    },
    {
      value: "cn",
      label: t("cn"),
    },
  ];

  const onChange = (value: string) => {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <Select defaultValue={locale} onValueChange={onChange}>
      <SelectTrigger className="border-none">
        {/* <LanguagesIcon className="h-6 w-6" /> */}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((k) => {
            return (
              <SelectItem key={k.label} value={k.value}>
                {k.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ChooseLocale;
