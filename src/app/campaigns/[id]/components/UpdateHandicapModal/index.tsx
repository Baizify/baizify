'use client'

import { 
    Button, 
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input
} from "@heroui/react";
import { useState } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaEdit } from "react-icons/fa";

interface HandicapFormValues {
    value: number;
}

interface UpdateHandicapModalProps {
    campaignId: string;
    playerId: string;
    playerName: string;
    currentHandicap: number;
    onHandicapUpdated?: () => void;
    trigger?: React.ReactNode;
    buttonProps?: {
        size?: "sm" | "md" | "lg";
        variant?: "solid" | "flat" | "bordered" | "light" | "faded" | "shadow" | "ghost";
        color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
        className?: string;
    };
}

const UpdateHandicapModal = ({
    campaignId,
    playerId,
    playerName,
    currentHandicap,
    onHandicapUpdated,
    trigger,
    buttonProps = {}
}: UpdateHandicapModalProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitForm = async (values: HandicapFormValues, { resetForm }: FormikHelpers<HandicapFormValues>) => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/campaigns/${campaignId}/players/${playerId}/handicap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: values.value })
            });

            if (response.ok) {
                resetForm();
                onClose();
                onHandicapUpdated?.();
            } else {
                console.error('Failed to update handicap:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating handicap:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationSchema = Yup.object().shape({
        value: Yup.number()
            .required('Handicap value is required')
            .min(0, 'Handicap must be at least 0')
            .max(50, 'Handicap cannot exceed 50')
            .integer('Handicap must be a whole number')
    });

    const defaultTrigger = (
        <Button 
            size="sm"
            variant="light"
            startContent={<FaEdit />}
            onPress={onOpen}
            {...buttonProps}
        >
            Update
        </Button>
    );

    return (
        <>
            {trigger ? (
                <div onClick={onOpen}>
                    {trigger}
                </div>
            ) : (
                defaultTrigger
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalContent>
                    <Formik
                        initialValues={{
                            value: currentHandicap,
                        }}
                        validationSchema={validationSchema}
                        validateOnBlur
                        onSubmit={handleSubmitForm}
                    >
                        {props => (
                            <Form>
                                <ModalHeader>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold">Update Handicap</h3>
                                        <p className="text-sm text-gray-500 font-normal">
                                            Update handicap for {playerName}
                                        </p>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Current Handicap:</strong> {currentHandicap}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            This will create a new handicap record with the updated value.
                                        </p>
                                    </div>

                                    <Input
                                        name="value"
                                        label="New Handicap Value"
                                        placeholder="Enter new handicap value"
                                        type="number"
                                        variant="bordered"
                                        value={props.values.value?.toString() || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                props.setFieldValue('value', '');
                                            } else {
                                                const numValue = parseInt(value, 10);
                                                if (!isNaN(numValue)) {
                                                    props.setFieldValue('value', numValue);
                                                }
                                            }
                                        }}
                                        onBlur={props.handleBlur}
                                        errorMessage={props.touched.value && props.errors.value ? props.errors.value : ''}
                                        isInvalid={Boolean(props.touched.value && props.errors.value)}
                                        description="Enter a value between 0 and 50"
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button 
                                        variant="light" 
                                        onPress={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        color="primary" 
                                        variant="solid"
                                        isLoading={isSubmitting}
                                        disabled={!props.isValid || !props.dirty}
                                    >
                                        Update Handicap
                                    </Button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateHandicapModal;