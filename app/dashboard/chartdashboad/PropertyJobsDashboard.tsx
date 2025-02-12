'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import _ from 'lodash';
import { Job } from '@/app/lib/types';
import { useProperty } from '@/app/lib/PropertyContext';

interface PropertyJobsDashboardProps {
  jobs: Job[];
}

const COLORS = {
  completed: '#22c55e',
  pending: '#eab308',
  waiting: '#3b82f6',
  cancelled: '#ef4444'
};

const PropertyJobsDashboard = ({ jobs }: PropertyJobsDashboardProps) => {
  const { selectedProperty } = useProperty();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);

  useEffect(() => {
    console.log('Filtering:', { 
      selectedProperty, 
      totalJobs: jobs.length,
      sampleJob: jobs[0],
      sampleRooms: jobs[0]?.rooms
    });

    if (!selectedProperty) {
      setFilteredJobs(jobs);
      return;
    }

    // Check if job has rooms and properties
    const filtered = jobs.filter(job => {
      // Check if profile_image and properties exist
      if (!job.profile_image?.properties) return false;
      return job.profile_image.properties.some(prop => 
        String(prop.property_id) === selectedProperty
      );
    });
    
    console.log('Filtered jobs:', filtered.length);
    setFilteredJobs(filtered);
  }, [selectedProperty, jobs]);

  const jobStats = useMemo(() => {
    const total = filteredJobs.length;
    const completed = filteredJobs.filter(job => job.status === 'completed').length;
    const pending = filteredJobs.filter(job => job.status === 'pending').length;
    const waiting = filteredJobs.filter(job => job.status === 'waiting_sparepart').length;
    const cancelled = filteredJobs.filter(job => job.status === 'cancelled').length;

    return [
      { name: 'Completed', value: completed, color: COLORS.completed },
      { name: 'Pending', value: pending, color: COLORS.pending },
      { name: 'Waiting', value: waiting, color: COLORS.waiting },
      { name: 'Cancelled', value: cancelled, color: COLORS.cancelled }
    ];
  }, [filteredJobs]);

  const jobsByUser = useMemo(() => {
    const grouped = _.groupBy(filteredJobs, 'user');
    return Object.entries(grouped).map(([user, userJobs]) => ({
      user,
      completed: userJobs.filter(job => job.status === 'completed').length,
      pending: userJobs.filter(job => job.status === 'pending').length,
      waiting: userJobs.filter(job => job.status === 'waiting_sparepart').length,
      cancelled: userJobs.filter(job => job.status === 'cancelled').length
    }));
  }, [filteredJobs]);

  if (!jobs.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-600">No jobs available.</p>
      </div>
    );
  }

  if (selectedProperty && !filteredJobs.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-600">No jobs found for selected property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jobStats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsByUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill={COLORS.completed} />
                  <Bar dataKey="pending" stackId="a" fill={COLORS.pending} />
                  <Bar dataKey="waiting" stackId="a" fill={COLORS.waiting} />
                  <Bar dataKey="cancelled" stackId="a" fill={COLORS.cancelled} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {jobStats.map((stat, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyJobsDashboard;