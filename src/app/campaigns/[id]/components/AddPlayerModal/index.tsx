'use client'

import { User } from "@/generator/prisma";
import { 
    Button, 
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Autocomplete,
    AutocompleteItem,
    Checkbox,
    Avatar
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FaPlus } from "react-icons/fa";

interface PlayerFormValues {
    userId: string;
    isTeamCaptain: boolean;
}

interface AddPlayerModalProps {
    campaignId: string;
    onPlayerAdded?: () => void;
    trigger?: React.ReactNode;
    buttonProps?: {
        size?: "sm" | "md" | "lg";
        variant?: "solid" | "flat" | "bordered" | "light" | "faded" | "shadow" | "ghost";
        color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
        className?: string;
    };
}

const AddPlayerModal = ({
    campaignId,
    onPlayerAdded,
    trigger,
    buttonProps = {}
}: AddPlayerModalProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingPlayerIds, setExistingPlayerIds] = useState<string[]>([]);

    const fetchUsers = async (search?: string) => {
        setSearchingUsers(true);
        try {
            const url = search ? `/api/users?search=${encodeURIComponent(search)}` : '/api/users';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setSearchingUsers(false);
        }
    };

    const fetchExistingPlayers = async () => {
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/players`);
            if (response.ok) {
                const data = await response.json();
                setExistingPlayerIds(data.map((player: any) => player.userId));
            }
        } catch (error) {
            console.error('Error fetching existing players:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            fetchExistingPlayers();
        }
    }, [isOpen, campaignId]);

    const handleSubmitForm = async (values: PlayerFormValues, { resetForm }: FormikHelpers<PlayerFormValues>) => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/campaigns/${campaignId}/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                resetForm();
                onClose();
                onPlayerAdded?.();
            }
        } catch (error) {
            console.error('Error adding player:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationSchema = Yup.object().shape({
        userId: Yup.string().required('Player is required'),
        isTeamCaptain: Yup.boolean()
    });

    // Filter out users who are already in the campaign
    const availableUsers = users.filter(user => 
        !existingPlayerIds.includes(user.id)
    );

    const defaultTrigger = (
        <Button 
            startContent={<FaPlus />}
            onPress={onOpen}
            {...buttonProps}
        >
            Add Player
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

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalContent>
                    <Formik
                        initialValues={{
                            userId: '',
                            isTeamCaptain: false,
                        }}
                        validationSchema={validationSchema}
                        validateOnBlur
                        onSubmit={handleSubmitForm}
                    >
                        {props => (
                            <Form>
                                <ModalHeader>Add Player to Campaign</ModalHeader>
                                <ModalBody className="space-y-4">
                                    <Autocomplete 
                                        name="userId"
                                        label="Select Player"
                                        placeholder="Search for a user..."
                                        variant="bordered"
                                        isLoading={searchingUsers}
                                        errorMessage={props.errors.userId}
                                        isInvalid={Boolean(props.errors.userId)}
                                        onInputChange={(value) => {
                                            if (value.length > 0) {
                                                fetchUsers(value);
                                            }
                                        }}
                                        onSelectionChange={(key) => {
                                            if (key) {
                                                props.setFieldValue('userId', key);
                                            }
                                        }}
                                    >
                                        {availableUsers.map((user) => (
                                            <AutocompleteItem 
                                                key={user.id}
                                                startContent={
                                                    <Avatar
                                                        src={user.image || undefined}
                                                        name={user.name || user.email}
                                                        size="sm"
                                                    />
                                                }
                                            >
                                                <div>
                                                    <div className="font-medium">{user.name || user.email}</div>
                                                    <div className="text-small text-gray-500">{user.email}</div>
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>

                                    <Checkbox 
                                        isSelected={props.values.isTeamCaptain}
                                        onValueChange={(checked) => {
                                            props.setFieldValue('isTeamCaptain', checked);
                                        }}
                                    >
                                        Make this player a team captain
                                    </Checkbox>
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
                                    >
                                        Add Player
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

export default AddPlayerModal;