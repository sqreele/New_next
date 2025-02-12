"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileDown, Filter, SortAsc, SortDesc, Building } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import CreateJobButton from "@/app/components/jobs/CreateJobButton";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import JobsPDFDocument from "@/app/components/ducument/JobsPDFGenerator";
import { useProperty } from "@/app/lib/PropertyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { SortOrder, Job, Property, TabValue } from "@/app/lib/types";

interface JobActionsProps {
  onSort?: (order: SortOrder) => void;
  currentSort?: SortOrder;
  jobs?: Job[];
  onRefresh?: () => void;
  currentTab?: TabValue;
  properties?: Property[];
}

export default function JobActions({
  onSort,
  currentSort = "Newest first",
  jobs = [],
  onRefresh,
  currentTab = "all",
  properties = [] // Add this back

}: JobActionsProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const {  selectedProperty, setSelectedProperty } = useProperty();

  // Debug: Log properties to ensure they're correctly passed
  console.log("Properties passed to JobActions:");

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  const getPropertyName = (propertyId: string | null) => {
    if (!propertyId) return "All Properties";
    const property = properties.find((p) => p.property_id === propertyId);
    return property?.name || "Unknown Property";
  };
  
  const handleGeneratePDF = async () => {
    if (!jobs?.length) {
      alert("No jobs available to generate a PDF.");
      return;
    }
  
    try {
      setIsGenerating(true);
      const propertyName = getPropertyName(selectedProperty);
  
      const blob = await pdf(
        <JobsPDFDocument
          jobs={jobs}
          filter={currentTab || "all"}
          selectedProperty={selectedProperty}
          propertyName={propertyName}
        />
      ).toBlob();
  
      const date = new Date().toISOString().split("T")[0];
      const filename = `jobs-report-${date}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredJobsCount = jobs.filter((job) =>
    !selectedProperty ||
    job.profile_image?.properties?.some(
      (prop) => String(prop.property_id) === selectedProperty
    )
  ).length;

  return (
    <div className="flex items-center gap-2">
      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property: {getPropertyName(selectedProperty)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-zinc-950 border-zinc-800">
            <DropdownMenuItem
              onClick={() => setSelectedProperty(null)}
              className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              All Properties
            </DropdownMenuItem>
            {properties.map((property) => (
              <DropdownMenuItem
                key={property.property_id}
                onClick={() => setSelectedProperty(property.property_id)}
                className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              >
                {property.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Sort: {currentSort}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px] bg-zinc-950 border-zinc-800">
            <DropdownMenuItem
              onClick={() => onSort?.("Newest first")}
              className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              <SortDesc className="h-4 w-4" />
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSort?.("Oldest first")}
              className="flex items-center gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              <SortAsc className="h-4 w-4" />
              Oldest first
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          {isGenerating ? "Generating..." : `Export PDF (${filteredJobsCount} jobs)`}
        </Button>

        <CreateJobButton onJobCreated={handleRefresh} />
      </div>

      
     {/* Mobile Actions */}
     <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-zinc-950 border-zinc-800">
            {/* Properties */}
            <DropdownMenuItem
              onClick={() => setSelectedProperty(null)}
              className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <Building className="h-4 w-4" /> All Properties
            </DropdownMenuItem>
            {properties.map((property) => (
              <DropdownMenuItem
                key={property.property_id}
                onClick={() => setSelectedProperty(property.property_id)}
                className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
              >
                <Building className="h-4 w-4" /> {property.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-zinc-800" />
            
            {/* Sort Options */}
            <DropdownMenuItem
              onClick={() => onSort?.("Newest first")}
              className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <SortDesc className="h-4 w-4" /> Newest first
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSort?.("Oldest first")}
              className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <SortAsc className="h-4 w-4" /> Oldest first
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            
            {/* Export PDF */}
            <DropdownMenuItem
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "Generating..." : `Export PDF (${filteredJobsCount} jobs)`}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            
            {/* Create Job */}
            <DropdownMenuItem
              onClick={handleRefresh}
              className="text-zinc-100 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
  );
}
