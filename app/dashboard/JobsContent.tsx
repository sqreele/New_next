"use client";

import { useState, useMemo } from "react";
import { useProperty } from "@/app/lib/PropertyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import JobActions from "@/app/components/jobs/JobActions";
import JobList from "@/app/components/jobs/jobList";
import { Job, Property, SortOrder } from "@/app/lib/types";
import {
  Inbox, Clock, PlayCircle, CheckCircle2, XCircle,
  AlertTriangle, Filter, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { Session } from 'next-auth';

// Type Definitions
interface JobsContentProps {
  jobs: Job[];
  properties: Property[];
  session: Session;
}

type TabFilter = "all" | "pending" | "waiting_sparepart" | "completed" | "cancelled" | "defect";

type TabConfig = {
  value: TabFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Constants
const TAB_CONFIG: readonly TabConfig[] = [
  { value: "all", label: "All Jobs", icon: Inbox },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "waiting_sparepart", label: "Waiting Sparepart", icon: PlayCircle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
  { value: "defect", label: "Defect", icon: AlertTriangle },
] as const;

// Utility functions
const filterJobsByProperty = (jobs: Job[], propertyId: string | null): Job[] => {
  if (!propertyId) return jobs;
  return jobs.filter(job => 
    job.profile_image?.properties?.some(
      prop => String(prop.property_id) === propertyId
    )
  );
};

const filterJobsByStatus = (jobs: Job[], status: TabFilter): Job[] => {
  switch (status) {
    case 'pending':
    case 'waiting_sparepart':
    case 'completed':
    case 'cancelled':
      return jobs.filter(job => job.status === status);
    case 'defect':
      return jobs.filter(job => job.is_defective);
    default:
      return jobs;
  }
};

const sortJobs = (jobs: Job[], sortOrder: SortOrder): Job[] => {
  return [...jobs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "Newest first" 
      ? dateB - dateA 
      : dateA - dateB;
  });
};

export default function JobsContent({ jobs, properties, session }: JobsContentProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("Newest first");
  const [currentTab, setCurrentTab] = useState<TabFilter>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { selectedProperty } = useProperty();

  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    const filteredByProperty = filterJobsByProperty(jobs, selectedProperty);
    return filterJobsByStatus(filteredByProperty, currentTab);
  }, [jobs, currentTab, selectedProperty]);

  const sortedJobs = useMemo(() => 
    sortJobs(filteredJobs, sortOrder), 
    [filteredJobs, sortOrder]
  );

  const handleSort = (order: SortOrder) => {
    setSortOrder(order);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as TabFilter);
    setIsDropdownOpen(false);
  };

  return (
    <Tabs
      defaultValue="all"
      className="w-full"
      value={currentTab}
      onValueChange={handleTabChange}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Desktop Tabs */}
        <TabsList className="hidden md:flex">
          {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
            <TabsTrigger 
              key={value} 
              value={value} 
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Mobile Dropdown */}
        <div className="md:hidden relative">
          {isDropdownOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {TAB_CONFIG.find(tab => tab.value === currentTab)?.label || "All Jobs"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-[200px] z-50 relative bg-zinc-950 border-zinc-800"
            >
              {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleTabChange(value)}
                  className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions */}
        <JobActions 
          onSort={handleSort} 
          currentSort={sortOrder} 
          jobs={sortedJobs}
          currentTab={currentTab}
          properties={properties}
        />
      </div>

      {/* Tab Content */}
      {TAB_CONFIG.map(({ value }) => (
        <TabsContent key={value} value={value}>
          <JobList 
            jobs={sortedJobs}
            filter={value} 
            sortOrder={sortOrder} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}