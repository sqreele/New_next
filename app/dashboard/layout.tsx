'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
  Search,
  Plus
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/app/components/ui/breadcrumb';
import { Button } from '@/app/components/ui/button';
import HeaderPropertyList from '@/app/components/jobs/HeaderPropertyList';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { User } from '@/app/dashboard/user';
import { cn } from '@/app/lib/utils';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/myJobs", label: "My Jobs", icon: ShoppingCart }, //Fixed Space Issue
  { href: "/dashboard/chartdashboad", label: "Chart Dashboard", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: Users2 },
  { href: "/dashboard/createjob", label: "Create Jobs", icon: Plus },  //Fixed Space Issue
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background dark:bg-neutral-950">
      <MobileNav />  {/* MobileNav always present, DesktopNav handled inside. */}
      <DesktopNav /> {/* Desktop Nav */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background dark:bg-neutral-900 px-4"> {/*Reduced header padding mobile*/}
          <div className="flex flex-1 items-center gap-2"> {/* reduced  Header Gap */}
            <DashboardBreadcrumb />
          </div>
          <div className="flex items-center gap-2"> {/* Reduced  Padding */}
            <SearchInput />
            <HeaderPropertyList />
            <User />
          </div>
        </header>
        <main className="flex-1 p-4"> {/* reduced padding for small screens */}
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[240px] flex-col border-r bg-background dark:bg-neutral-900"> {/*Conditinal Renders for LG to Render*/}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Package2 className="h-6 w-6" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"  //Hide for Larger Screen to Display on Mobile Devices (Sheet Display)
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0 border-r bg-white dark:bg-neutral-950"
      >
        {/* Add SheetHeader and SheetTitle components */}
        <div className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </div>
        <div className="p-6 border-b">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Package2 className="h-6 w-6" />
            <span className="font-semibold">Admin Panel</span>
          </Link>
        </div>
        {/* Rest of the component remains the same */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SearchInput() {
  return (
    <div className="w-full lg:w-auto max-w-[300px] relative">  {/* Making search Responsive  (Auto if too big) */}
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-8 w-full"  /* Input Responsive (Occupy Full) */
      />
    </div>
  );
}

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb className="md:flex hidden">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`;
          const isLast = index === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1);

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}