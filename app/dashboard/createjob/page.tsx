'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Formik, Form } from 'formik';
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
import { jobsApi } from '@/app/lib/api';

interface FormValues {
  description: string;
  status: string;
  priority: string;
  remarks: string;
  topic: {
    title: string;
    description: string;
  };
  room: {
    room_id: number;
    name: string;
    room_type: string;
    properties: string[];
  };
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

  const handleSubmit = async (values: FormValues) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to create a job');
      return;
    }

    try {
      setError(null);
      const formData = new FormData();

      // Handling file uploads
      if (values.files && Array.isArray(values.files)) {
        values.files.forEach(file => {
          formData.append('images', file);
        });
      }

      // Handling objects (topic and room)
      formData.append('topic', JSON.stringify(values.topic));
      formData.append('room', JSON.stringify(values.room));

      // Handling primitive values
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
                {/* Description Field */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    className={touched.description && errors.description ? 'border-red-500' : ''}
                  />
                  {touched.description && errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Status and Priority Select Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={values.status}
                      onValueChange={(value) => setFieldValue('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="waiting_sparepart">Waiting Sparepart</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={values.priority}
                      onValueChange={(value) => setFieldValue('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Room Field */}
                <div>
                  <Label>Room</Label>
                  <RoomAutocomplete
                    selectedRoom={values.room}
                    onSelect={(room) => setFieldValue('room', room)}
                  />
                  {touched.room?.room_id && errors.room?.room_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.room.room_id}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <Label>Images</Label>
                  <FileUpload
                    files={values.files}
                    onFileChange={(files) => setFieldValue('files', files)}
                    error={errors.files as string}
                    touched={!!touched.files} // Convert to boolean
                  />
                </div>

                {/* Defective Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_defective"
                    checked={values.is_defective}
                    onCheckedChange={(checked) => setFieldValue('is_defective', checked)}
                  />
                  <Label htmlFor="is_defective">Mark as defective</Label>
                </div>

                {/* Buttons */}
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
