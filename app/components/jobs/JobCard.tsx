'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { UpdateStatusModal } from "./UpdateStatusModal";
import { Job, JobStatus } from "@/app/lib/types";
import { LazyImage } from "@/app/components/jobs/LazyImage";
import { 
  Clock, 
  Calendar,
  User,
  MapPin,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  StickyNote,
  Building2,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface JobCardProps {
  job: Job;
  propertyName?: string;
}

export default function JobCard({ job, propertyName }: JobCardProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);

  const getStatusConfig = (status: JobStatus) => {
    const configs = {
      completed: {
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'bg-green-100 text-green-800 hover:bg-green-200',
        label: 'Completed'
      },
      in_progress: {
        icon: <Clock className="w-4 h-4" />,
        color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        label: 'In Progress'
      },
      pending: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        label: 'Pending'
      },
      cancelled: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'bg-red-100 text-red-800 hover:bg-red-200',
        label: 'Cancelled'
      },
      waiting_sparepart: {
        icon: <ClipboardList className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        label: 'Waiting Sparepart'
      }
    };

    return configs[status] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base font-semibold text-gray-700">
              {job.topics[0]?.title || 'No Topic'}
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span className="font-medium">Room {job.rooms[0]?.name}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant="secondary"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors",
              statusConfig.color
            )}
          >
            {statusConfig.icon}
            <span className="capitalize font-medium">{statusConfig.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {job.images.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              <LazyImage
                src={job.images[selectedImage].image_url}
                alt={`Job Image ${job.images[selectedImage].id}`}
                className="rounded-lg object-cover w-full h-full transition-opacity duration-200"
                priority={selectedImage === 0}
              />
            </div>
            
            {job.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {job.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden",
                      "ring-2 transition-all duration-200",
                      selectedImage === index 
                        ? "ring-blue-500" 
                        : "ring-gray-200 hover:ring-blue-300",
                    )}
                  >
                    <LazyImage
                      src={img.image_url}
                      alt={`Thumbnail ${img.id}`}
                      className="object-cover w-full h-full"
                      isThumb={true}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
          <MessageSquare className="w-5 h-5 mt-0.5 text-gray-400" />
          <p className="text-sm leading-relaxed text-gray-700">{job.description}</p>
        </div>

        {/* Remarks Toggle Section */}
        {job.remarks && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowRemarks(!showRemarks)}
            >
              <span className="text-sm font-medium text-gray-600">Remarks</span>
              {showRemarks ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            
            {showRemarks && (
              <div className={cn(
                "flex items-start gap-3 mt-2 p-3 bg-gray-50 rounded-lg",
                "transform transition-all duration-200 ease-in-out"
              )}>
                <StickyNote className="w-5 h-5 mt-0.5 text-gray-400" />
                <p className="text-sm leading-relaxed text-gray-600">{job.remarks}</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Toggle Section */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="text-sm font-medium text-gray-600">Staff Details</span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          
          {showDetails && (
            <div className={cn(
              "flex items-center gap-4 p-3 mt-2 bg-gray-50 rounded-lg",
              "transform transition-all duration-200 ease-in-out"
            )}>
              <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-100">
                {job.profile_image ? (
                  <LazyImage
                    src={job.profile_image.profile_image}
                    alt={job.user}
                    className="rounded-full object-cover"
                    isThumb={true}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-700">{job.user}</p>
                <p className="text-sm text-gray-500">
                  {job.profile_image?.positions || 'Staff'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps Toggle Section */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setShowTimestamps(!showTimestamps)}
          >
            <span className="text-sm font-medium text-gray-600">Timestamps</span>
            {showTimestamps ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          
          {showTimestamps && (
            <div className={cn(
              "grid grid-cols-1 gap-2 mt-2 p-3 bg-gray-50 rounded-lg",
              "transform transition-all duration-200 ease-in-out"
            )}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="font-medium">Created:</span>
                  <span className="ml-1">{formatDate(job.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="font-medium">Updated:</span>
                  <span className="ml-1">{formatDate(job.updated_at)}</span>
                </div>
              </div>
              {job.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <div className="text-sm">
                    <span className="font-medium">Completed:</span>
                    <span className="ml-1">{formatDate(job.completed_at)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <UpdateStatusModal 
          job={job}
          onComplete={() => window.location.reload()}
        />
      </CardContent>
    </Card>
  );
}
