"use client";

import { useAuthStore } from "@/api/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Users,
  CreditCard,
  CalendarClock,
  Bell,
  TrendingUp,
  UserPlus,
  FileText,
  Settings,
  ArrowRight,
  ClipboardList,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as React from "react";

export default function Dashboard() {
  const { user } = useAuthStore();

  // Mock data - in a real app, this would come from an API
  const organizationData = {
    name: "Acme Corporation",
    employees: 24,
    nextPayrollDate: "2023-08-15",
    lastPayrollAmount: "NPR 42,500.00",
    pendingTasks: 3,
  };

  // Mock chart data for UI display
  const totalBudget = "NPR 1.125M";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening with your
            payroll.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            <span>Notifications</span>
          </Button>
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Run Payroll</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {organizationData.employees}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +2 since last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {organizationData.lastPayrollAmount}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Processed on Jul 30, 2023
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">Aug 15, 2023</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              12 days remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {organizationData.pendingTasks}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              2 require immediate attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Expenses</CardTitle>
            <CardDescription>
              Monthly payroll expense trend for the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <div className="mb-4">
              <BarChartIcon className="h-16 w-16 text-primary/40" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Payroll trend visualization</p>
              <p className="text-sm text-muted-foreground">
                Install recharts to view actual chart data
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2023
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Department Expenses Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Department Expenses</CardTitle>
            <CardDescription>Breakdown by department</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex flex-col items-center justify-center h-[300px]">
            <div className="mb-4">
              <PieChartIcon className="h-16 w-16 text-primary/40" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalBudget}</p>
              <p className="text-sm text-muted-foreground">
                Total budget across departments
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 8.7% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Based on the current fiscal year
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Add Employees</CardTitle>
            <CardDescription>Onboard new team members</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-2 bg-primary/10 rounded-full w-fit">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link
              href="/dashboard/employees/new"
              className="text-sm text-primary flex items-center"
            >
              Add Employee <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Payroll Reports</CardTitle>
            <CardDescription>Generate and download reports</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-2 bg-primary/10 rounded-full w-fit">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link
              href="/dashboard/reports"
              className="text-sm text-primary flex items-center"
            >
              View Reports <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Performance</CardTitle>
            <CardDescription>Track employee performance</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-2 bg-primary/10 rounded-full w-fit">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link
              href="/dashboard/performance"
              className="text-sm text-primary flex items-center"
            >
              View Metrics <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure company settings</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-2 bg-primary/10 rounded-full w-fit">
              <Settings className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link
              href="/dashboard/settings"
              className="text-sm text-primary flex items-center"
            >
              Manage Settings <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions and updates in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="p-2 bg-primary/10 rounded-full">
                  {index === 0 ? (
                    <UserPlus className="h-4 w-4 text-primary" />
                  ) : index === 1 ? (
                    <CreditCard className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {index === 0
                      ? "New employee added"
                      : index === 1
                        ? "Payroll processed"
                        : "Payslip generated"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {index === 0
                      ? "John Doe was added to the Engineering department"
                      : index === 1
                        ? "July 2023 payroll of NPR 42,500 was processed"
                        : "Payslip for Sarah Johnson was generated"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {index === 0
                      ? "2 hours ago"
                      : index === 1
                        ? "Yesterday"
                        : "3 days ago"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
