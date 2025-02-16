// CreateJobPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { fetchRooms, createJob } from '@/app/lib/data';
import { Loader2 } from "lucide-react";
import { AnyObject, ObjectSchema } from 'yup';

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
    remarks?: string | null; // Explicitly make `remarks` optional (or nullable)
    topic: {
        title: string;
        description: string;
    };
    room: Room | null;
    files: File[];
    is_defective: boolean;
}

const initialValues: FormValues = {
    description: '',
    status: 'pending',
    priority: 'medium',
    remarks: '', // Can also use null as an initial value now
    topic: {
        title: '',
        description: '',
    },
    room: null,
    files: [],
    is_defective: false,
};

const validationSchema: ObjectSchema<FormValues> = Yup.object().shape({
    description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    status: Yup.string().required('Status is required'),
    priority: Yup.string().required('Priority is required'),
    remarks: Yup.string().nullable().optional(),  // Ensure .nullable() is present if `remarks` can be null
    topic: Yup.object().shape({
        title: Yup.string().required('Topic title is required'),
        description: Yup.string(),
    }),
    room: Yup.object().nullable().shape({ // Allow null, but still validate shape if not null
        room_id: Yup.number().required('Room must be selected').min(1, 'Please select a valid room'),
    }),
    files: Yup.array().min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
    is_defective: Yup.boolean(),
}) as ObjectSchema<FormValues>; //Explicitly ascribing the return of `Yup.object().shape(...)` to ObjectSchema<FormValues>

export default function CreateJobPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    const loadRooms = useCallback(async () => {
        if (!session?.user?.accessToken) {
            console.warn('No access token available');
            setError('Authentication required');
            setIsLoadingRooms(false);
            return;
        }

        try {
            setIsLoadingRooms(true);
            const fetchedRooms = await fetchRooms();

            if (Array.isArray(fetchedRooms)) {
                setRooms(fetchedRooms);
            } else {
                console.error('Invalid rooms data format');
                setRooms([]);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Failed to load rooms. Please try again.');
        } finally {
            setIsLoadingRooms(false);
        }
    }, [session?.user?.accessToken]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        if (!session?.user?.accessToken) {
            setError('You must be logged in to create a job');
            return;
        }

        try {
            setError(null);
            setSubmitting(true);
            const formData = new FormData();

            values.files.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            formData.append('topic', JSON.stringify(values.topic));
            if (values.room) {
                formData.append('room', JSON.stringify(values.room));
            }
            formData.append('description', values.description);
            formData.append('status', values.status);
            formData.append('priority', values.priority);
            formData.append('remarks', values.remarks || ''); //Use default remarks as fallback if undefined
            formData.append('is_defective', String(values.is_defective));

            await createJob(formData);
            router.push('/jobs');
            router.refresh();
        } catch (err) {
            let errorMessage = 'Failed to create job';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
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

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                            <Form className="space-y-6">
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                      id="description"
                                      name="description"
                                      className="w-full"
                                      disabled={isSubmitting}
                                      value={values.description}
                                      onChange={(e) => setFieldValue("description", e.target.value)}
                                     />
                                    {touched.description && errors.description && <p className="text-red-500 text-sm mt-1">{String(errors.description)}</p>}
                                </div>

                                <div>
                                    <Label>Room</Label>
                                    <RoomAutocomplete
                                        selectedRoom={values.room}
                                        rooms={rooms}
                                        onSelect={(room) => setFieldValue('room', room)}
                                        disabled={isSubmitting}
                                    />
                                    {touched.room && errors.room && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {(errors.room as { room_id?: string }).room_id}
                                        </p>
                                    )}
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