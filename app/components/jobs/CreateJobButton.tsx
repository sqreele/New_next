'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import RoomAutocomplete from '@/app/components/jobs/RoomAutocomplete';
import FileUpload from '@/app/components/jobs/FileUpload';
import { fetchRooms, createJob } from '@/app/lib/data';
import { Loader2 } from "lucide-react";

interface Room {
  room_id: number;
  name: string;
  room_type: string;
  is_active: boolean;
  created_at: string;
  property: number;
  properties: (string | number)[];
}

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
    created_at: new Date().toISOString(),
    property: 0,
    properties: [],
  },
  files: [],
  is_defective: false,
};

const validationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  remarks: Yup.string().nullable(),
  topic: Yup.object().shape({
    title: Yup.string().required('Topic title is required'),
    description: Yup.string(),
  }),
  room: Yup.object().shape({
    room_id: Yup.number().required('Room must be selected').min(1, 'Please select a valid room'),
  }),
  files: Yup.array().min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
  is_defective: Yup.boolean(),
});

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {  // Renamed function to avoid conflict
      console.log('Current session:', session);

      if (!session?.user?.accessToken) {
        console.warn('No access token available');
        setError('Authentication required');
        setIsLoadingRooms(false);
        return;
      }

      try {
        setIsLoadingRooms(true);
        const token = session.user.accessToken;

        // Use the imported fetchRooms function
        const fetchedRooms = await fetchRooms('', token); // Ensure correct arguments
        console.log('Fetched rooms:', fetchedRooms);

        if (Array.isArray(fetchedRooms)) {
          setRooms(fetchedRooms);
        } else {
          console.error('Invalid rooms data format');
          setRooms([]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again.');
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadRooms(); // Call the renamed function
  }, [session?.user?.accessToken]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to create a job');
      return;
    }

    try {
      setError(null);
      const formData = new FormData();

      values.files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      formData.append('topic', JSON.stringify(values.topic));
      formData.append('room', JSON.stringify(values.room));
      formData.append('description', values.description);
      formData.append('status', values.status);
      formData.append('priority', values.priority);
      formData.append('remarks', values.remarks || '');
      formData.append('is_defective', String(values.is_defective));

      await createJob(formData, session.user.accessToken);
      router.push('/jobs');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Field as={Textarea} id="description" name="description" className="w-full" disabled={isSubmitting} />
                  {touched.description && errors.description && <p className="text-red-500 text-sm mt-1">{String(errors.description)}</p>}
                </div>

                <div>
                  <Label>Room</Label>
                  <RoomAutocomplete selectedRoom={values.room} rooms={rooms} onSelect={(room) => setFieldValue('room', room)} disabled={isSubmitting} />
                  {touched.room?.room_id && errors.room?.room_id && <p className="text-red-500 text-sm mt-1">{String(errors.room.room_id)}</p>}
                </div>

                <div>
                  <Label>Images</Label>
                  <FileUpload onChange={(files) => setFieldValue('files', files)} maxFiles={5} accept="image/*" disabled={isSubmitting} />
                  {touched.files && errors.files && <p className="text-red-500 text-sm mt-1">{String(errors.files)}</p>}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Job'}</Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
