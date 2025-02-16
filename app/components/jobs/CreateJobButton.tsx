'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import RoomAutocomplete from '@/app/components/jobs/RoomAutocomplete';
import FileUpload from '@/app/components/jobs/FileUpload';
import { jobsApi, roomsApi } from '@/app/lib/api';
import { Room } from '@/app/lib/types';
import { Loader2 } from "lucide-react";

interface FormValues {
  description: string;
  status: string;
  priority: string;
  remarks: string;
  topic: {
    title: string;
    description: string;
  };
  room: Room;
  files: File[];
  is_defective: boolean;
}

const initialValues: FormValues = {
  description: '',
  status: 'pending',
  priority: 'medium',
  remarks: '',
  topic: {
    title: '',
    description: '',
  },
  room: {
    room_id: 0,
    name: '',
    room_type: '',
    is_active: false,
    created_at: '',
    property: 0,
    properties: [],
  },
  files: [],
  is_defective: false,
};

const validationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  remarks: Yup.string().nullable(),
  topic: Yup.object().shape({
    title: Yup.string().required('Topic is required'),
  }),
  room: Yup.object().shape({
    room_id: Yup.number().required('Room must be selected'),
  }),
  files: Yup.array()
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
  is_defective: Yup.boolean().default(false),
});

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (session?.user?.accessToken) {
        try {
          setIsLoadingRooms(true);
          const fetchedRooms = await roomsApi.fetch('', session.user.accessToken);
          setRooms(fetchedRooms);
        } catch (error) {
          console.error('Error fetching rooms:', error);
          setError('Failed to load rooms');
        } finally {
          setIsLoadingRooms(false);
        }
      }
    };

    fetchRooms();
  }, [session?.user?.accessToken]);

  const handleSubmit = async (values: FormValues) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to create a job');
      return;
    }

    try {
      setError(null);
      const formData = new FormData();

      if (values.files && Array.isArray(values.files)) {
        values.files.forEach(file => {
          formData.append('images', file);
        });
      }

      formData.append('topic', JSON.stringify(values.topic));
      formData.append('room', JSON.stringify(values.room));
      formData.append('description', values.description);
      formData.append('status', values.status);
      formData.append('priority', values.priority);
      formData.append('remarks', values.remarks || '');
      formData.append('is_defective', String(values.is_defective));

      await jobsApi.create(formData, session.user.accessToken);
      router.push('/jobs');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    }
  };

  if (isLoadingRooms) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Job</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {/* ... other form fields remain the same ... */}

                <div>
                  <Label>Room</Label>
                  <RoomAutocomplete
                    selectedRoom={{ ...values.room, properties: values.room.properties.map(String) }}
                    rooms={rooms.map(r => ({ ...r, properties: r.properties.map(String) }))}
                    onSelect={(selectedRoom) => setFieldValue('room', selectedRoom)}
                    disabled={isSubmitting}
                  />
                  {touched.room?.room_id && errors.room?.room_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.room.room_id}</p>
                  )}
                </div>

                {/* ... rest of your form fields ... */}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Job'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
