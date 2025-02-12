"use client";

import { useState, useMemo } from "react";
import { useProperty } from "@/app/lib/PropertyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import JobActions from "@/app/components/jobs/JobActions";
import JobList from "@/app/components/jobs/jobList";
import { SortOrder, Job, Property } from "@/app/lib/types";
import {
  Inbox, Clock, PlayCircle, CheckCircle2, XCircle,
  AlertTriangle, Filter, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

interface JobsContentProps {
  jobs: Job[];
  properties: Property[];
}

type TabFilter = "all" | "pending" | "waiting_sparepart" | "completed" | "cancelled" | "defect";

const tabConfig = [
  { value: "all", label: "All Jobs", icon: Inbox },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "waiting_sparepart", label: "waiting_sparepart", icon: PlayCircle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
  { value: "defect", label: "Defect", icon: AlertTriangle },
] as const;

export default function JobsContent({ jobs, properties }: JobsContentProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("Newest first");
  const [currentTab, setCurrentTab] = useState<TabFilter>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { selectedProperty } = useProperty();

  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    let filtered = jobs;
    
    if (selectedProperty) {
      filtered = filtered.filter(job => 
        job.profile_image?.properties?.some(
          prop => String(prop.property_id) === selectedProperty
        )
      );
    }
    
    switch (currentTab) {
      case 'pending':
        return filtered.filter(job => job.status === 'pending');
      case 'waiting_sparepart':
        return filtered.filter(job => job.status === 'waiting_sparepart');
      case 'completed':
        return filtered.filter(job => job.status === 'completed');
      case 'cancelled':
        return filtered.filter(job => job.status === 'cancelled');
      case 'defect':
        return filtered.filter(job => job.is_defective);
      default:
        return filtered;
    }
  }, [jobs, currentTab, selectedProperty]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortOrder === "Newest first") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredJobs, sortOrder]);

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
        <TabsList className="hidden md:flex">
          {tabConfig.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="md:hidden relative">
          {isDropdownOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                {tabConfig.find((tab) => tab.value === currentTab)?.label || "All Jobs"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] z-50 relative bg-zinc-950 border-zinc-800">
              {tabConfig.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleTabChange(value as TabFilter)}
                  className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <JobActions 
          onSort={handleSort} 
          currentSort={sortOrder} 
          jobs={sortedJobs}
          currentTab={currentTab}
          properties={properties}
        />
      </div>

      {tabConfig.map(({ value }) => (
        <TabsContent key={value} value={value}>
          <JobList 
            jobs={sortedJobs}
            filter={value as TabFilter} 
            sortOrder={sortOrder} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}