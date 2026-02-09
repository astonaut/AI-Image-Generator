import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import type { Selection } from "@nextui-org/react";
import React from "react";
import { localesName } from "@/i18n/routing";
import { Icon } from "@iconify/react";

export default function Locales() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set(["en"]));
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLanguage = (selectedLocale: string) => {
    if (selectedLocale !== locale) {
      let newPathName = pathname.replace(`/${locale}`, "");
      if (!newPathName.startsWith("/")) {
        newPathName = "/" + newPathName;
      }
      router.push(newPathName, { locale: selectedLocale as any });
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          className="capitalize rounded-full border border-slate-200 bg-white/70 text-slate-700"
          startContent={<Icon icon="solar:global-line-duotone" width={18} />}
        >
          {locale.toUpperCase()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="faded"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {Object.keys(localesName).map((item) => (
          <DropdownItem key={item} onClick={() => changeLanguage(item)}>
            {localesName[item as keyof typeof localesName]}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
