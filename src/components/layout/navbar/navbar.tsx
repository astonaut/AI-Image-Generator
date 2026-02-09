"use client";

import type { NavbarProps } from "@nextui-org/react";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  cn,
} from "@nextui-org/react";
import Locales from "../../locales";
import { useLocale, useTranslations } from "next-intl";
import LoginButton from "@/components/button/login-button";
import UserButton from "../../button/user-button";
import { useAppContext } from "@/contexts/app";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const BasicNavbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ classNames = {}, ...props }, ref) => {
    const { data: session } = useSession();
    const locale = useLocale();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, setUser } = useAppContext();
    const [activeTag, setActiveTag] = useState("home");
    const pathname = usePathname();
    const t = useTranslations("Nav");

    useEffect(() => {
      if (session?.user) {
        setUser(session.user);
      }
      if (pathname.endsWith("/")) {
        setActiveTag("home");
      } else if (pathname.includes("text-to-image")) {
        setActiveTag("text-to-image");
      } else if (pathname.includes("pricing")) {
        setActiveTag("pricing");
      }
    }, [pathname, session, setUser]);

    const items = [
      { tag: "features", href: `/${locale}/#features`, label: t("features") },
      {
        tag: "text-to-image",
        href: `/${locale}/text-to-image`,
        label: t("text-to-image"),
      },
      { tag: "pricing", href: `/${locale}/pricing`, label: t("pricing") },
    ];

    return (
      <Navbar
        ref={ref}
        {...props}
        classNames={{
          base: cn("bg-transparent py-2"),
          wrapper:
            "w-full max-w-7xl lg:px-0 h-[74px] rounded-2xl glass border border-white/60 shadow-lg",
          item: "md:flex",
          ...classNames,
        }}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        isBordered={false}
      >
        <NavbarBrand>
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/80 bg-white/80 shadow-md transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.jpeg"
                alt="logo"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="hidden md:block">
              <p className="font-display text-xl font-bold text-slate-900">
                AI Image Studio
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                cinematic generator
              </p>
            </div>
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden md:flex gap-2" justify="center">
          {items.map((item) => (
            <NavbarItem key={item.tag} onClick={() => setActiveTag(item.tag)}>
              <Link
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  activeTag === item.tag
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-white/70"
                )}
                href={item.href}
                size="md"
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent className="hidden md:flex items-center" justify="end">
          <Locales />
          {user ? (
            <div className="ml-3 flex items-center gap-3">
              <a
                href={`/${locale}/dashboard`}
                className="rounded-full border border-slate-300/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
              >
                My creations
              </a>
              <UserButton />
            </div>
          ) : (
            <LoginButton />
          )}
        </NavbarContent>

        <NavbarMenuToggle className="text-slate-900 md:hidden" />

        <NavbarMenu className="top-[84px] mx-2 rounded-2xl border border-white/60 bg-white/90 px-4 pb-6 pt-4 shadow-xl backdrop-blur-xl">
          {items.map((item) => (
            <NavbarMenuItem
              key={item.tag}
              className="w-full"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveTag(item.tag);
              }}
            >
              <Link
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-base font-semibold",
                  activeTag === item.tag
                    ? "bg-slate-900 text-white"
                    : "text-slate-900 hover:bg-slate-100"
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="mt-2">
            <a
              href={`/${locale}/dashboard`}
              className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-900"
            >
              My creations
            </a>
          </NavbarMenuItem>
          <div className="mt-3">{user ? <UserButton /> : <LoginButton />}</div>
        </NavbarMenu>
      </Navbar>
    );
  }
);

BasicNavbar.displayName = "BasicNavbar";

export default BasicNavbar;
