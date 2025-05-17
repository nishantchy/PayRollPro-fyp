import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarClock,
  FileText,
  BarChart3,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";

export type SidebarLink = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const sidebarLinks: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Organizations",
    href: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    title: "Payroll Management",
    href: "/dashboard/payroll",
    icon: CalendarClock,
  },
  {
    title: "Payslips",
    href: "/dashboard/payslips",
    icon: FileText,
  },
  {
    title: "Reports & Analytics",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Account Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Email & Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
  },
];

export const bottomLinks: SidebarLink[] = [
  {
    title: "Logout",
    href: "#",
    icon: LogOut,
  },
];
