"use client";

import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Data Studio", href: "/data-analysis" },
  { label: "Templates", href: "/templates" },
  { label: "Web Intelligence", href: "/web-scraping" },
  { label: "Contact", href: "/contact" },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex flex-col text-left">
          <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">westconex portfolio</span>
          <span className="text-lg font-semibold text-primary">Agentic Data Intelligence Studio</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Button asChild variant="default" className="rounded-full px-5">
            <Link to="/contact">Book a discovery call</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[320px] sm:w-[360px]">
          <SheetHeader className="flex flex-row items-center justify-between pb-6">
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">westconex</p>
              <p className="text-base font-semibold text-primary">Data Intelligence Studio</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          <div className="flex flex-col gap-4 pt-4">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `rounded-xl border px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary hover:bg-primary/5"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Button asChild className="mt-2 w-full rounded-full">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Book a discovery call
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
