import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Job, Property } from '@/app/lib/types';

interface JobsPDFDocumentProps {
  jobs: Job[];
  filter: string;
  selectedProperty?: string | null;
  propertyName: string | undefined;  // Make it match the possible undefined string
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  jobRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 10,
    minHeight: 150,
  },
  imageColumn: {
    width: '30%',
    marginRight: 15
  },
  infoColumn: {
    width: '35%',
    paddingRight: 10
  },
  dateColumn: {
    width: '35%'
  },
  jobImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover'
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2
  },
  value: {
    fontSize: 10,
    marginBottom: 8
  },
  statusBadge: {
    fontSize: 10,
    color: '#1a56db',
    marginBottom: 8
  },
  dateText: {
    fontSize: 10,
    marginBottom: 4
  }
});

const JobsPDFDocument: React.FC<JobsPDFDocumentProps> = ({ jobs, filter, selectedProperty, propertyName }) => {
  const filteredJobs = jobs.filter((job) => {
    if (!selectedProperty) return true;
    return job.profile_image?.properties?.some(
      (prop) => String(prop.property_id) === selectedProperty
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{propertyName}</Text>
          <Text style={styles.label}>Total Jobs: {filteredJobs.length}</Text>
        </View>

        {filteredJobs.map((job) => (
          <View key={job.job_id} style={styles.jobRow}>
            <View style={styles.imageColumn}>
              {job.images?.[0] && (
                <Image
                  src={job.images[0].image_url}
                  style={styles.jobImage}
                />
              )}
            </View>
            
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Location: {job.rooms[0].name}</Text>
              {job.rooms && job.rooms.length > 0 && (
                <Text style={styles.label}>Room type: {job.rooms[0].room_type}</Text>
              )}
              <Text style={styles.label}>Topics: {job.topics.map(topic => topic.title || 'N/A').join(', ')}</Text>
              <Text style={styles.statusBadge}>Status: {job.status}</Text>
            </View>
            
            <View style={styles.dateColumn}>
              {job.description && (
                <>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{job.description}</Text>
                </>
              )}
              <Text style={styles.dateText}>Create Date: {formatDate(job.created_at)}</Text>
              <Text style={styles.dateText}>Updated At: {formatDate(job.updated_at)}</Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default JobsPDFDocument;