import { Button, Flex, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, postApi } from 'services/api';

const AddMeeting = (props) => {
    const { onClose, isOpen, setAction, from, fetchData, view } = props;
    const [leaddata, setLeadData] = useState([]);
    const [contactdata, setContactData] = useState([]);
    const [isLoding, setIsLoding] = useState(false);
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const todayTime = new Date().toISOString().split('.')[0];
    const leadData = useSelector((state) => state?.leadData?.data);
    const user = JSON.parse(localStorage.getItem('user'));
    const contactList = useSelector((state) => state?.contactData?.data);

    const initialValues = {
        agenda: '',
        attendes: props.leadContect === 'contactView' && props.id ? [props.id] : [],
        attendesLead: props.leadContect === 'leadView' && props.id ? [props.id] : [],
        location: '',
        related: props.leadContect === 'contactView' ? 'Contact' : props.leadContect === 'leadView' ? 'Lead' : 'None',
        dateTime: '',
        notes: '',
        createBy: user?._id,
    };

    const AddData = async () => {
        setIsLoding(true);

        const meetingData = {
            agenda: values.agenda,
            attendes: values.attendes,
            attendesLead: values.attendesLead,
            location: values.location,
            related: values.related,
            dateTime: values.dateTime,
            notes: values.notes,
            createBy: user?._id,
        };

        try {
            const response = await postApi('api/meeting/', meetingData);
            if (response?.status === 201) {
                toast.success('Meeting added successfully!');
                formik.resetForm();
                onClose();
                fetchData();
            } else {
                toast.error(response?.message || 'Failed to add meeting');
            }
        } catch (error) {
            toast.error('Error adding meeting. Please try again.');
            console.error('Add Meeting Error:', error);
        } finally {
            setIsLoding(false);
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: MeetingSchema,
        onSubmit: async (values, { resetForm }) => {
            AddData();
        },
    });

    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue } = formik;

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoding(true);
            try {
                const [contactRes, leadRes] = await Promise.all([
                    getApi('api/contact/'),
                    getApi('api/lead/')
                ]);
                if (contactRes?.status === 200) {
                    setContactData(contactRes?.data.map(item => ({ value: item._id, label: item.fullName })));
                    console.log(contactRes?.data.map(item => ({ value: item._id, label: item.fullName })))
                }
                if (leadRes?.status === 200) {
                    setLeadData(leadRes?.data.map(item => ({ value: item._id, label: item.leadName })));
                    console.log(leadRes?.data.map(item => ({ value: item._id, label: item.leadName })))
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoding(false);
            }
        };
        fetchAllData();
    }, [props.id, values.related]);

    const handleCreateItem = (item) => {
        if (item) {
            setFieldValue('attendes', [...values.attendes, item._id]);
            setContactModel(false);
        }
    }

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={'580px'}>
                <ModalHeader>Add Meeting </ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY={'auto'} height={'400px'}>
                    <MultiContactModel data={contactdata} isOpen={contactModelOpen} onClose={setContactModel} fieldName='attendes' setFieldValue={setFieldValue} />
                    <MultiLeadModel data={leaddata} isOpen={leadModelOpen} onClose={setLeadModel} fieldName='attendesLead' setFieldValue={setFieldValue} />
                    <Grid templateColumns='repeat(12, 1fr)' gap={3}>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display={'flex'}>Agenda<Text color={'red'}>*</Text></FormLabel>
                            <Input name='agenda' onChange={handleChange} onBlur={handleBlur} value={values.agenda} placeholder='Agenda' borderColor={errors.agenda && touched.agenda ? 'red.300' : null} />
                            <Text color={'red'}>{errors.agenda && touched.agenda && errors.agenda}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display={'flex'}>Related To<Text color={'red'}>*</Text></FormLabel>
                            <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                <Stack direction='row'>
                                    <Radio value='Contact'>Contact</Radio>
                                    <Radio value='Lead'>Lead</Radio>
                                </Stack>
                            </RadioGroup>
                            <Text color={'red'}>{errors.related && touched.related && errors.related}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            {/* <FormLabel display={'flex'}>Attendes<Text color={'red'}>*</Text></FormLabel> */}
                            {/* <Input name='attendes' onChange={handleChange} onBlur={handleBlur} value={values.attendes} placeholder='Attendees' borderColor={errors.attendes && touched.attendes ? 'red.300' : null} /> */}
                            <CUIAutoComplete
                                label="Attendes"
                                name="attendes"
                                placeholder="Type a Country"
                                onCreateItem={handleCreateItem}
                                items={values.related === "Contact" ? contactdata : leaddata}
                                selectedItems={
                                    values.related === "Contact"
                                        ? values?.attendes.map((val) => contactdata.find((c) => c.value === val) || { value: val, label: val })
                                        : values?.attendesLead.map((val) => leaddata.find((l) => l.value === val) || { value: val, label: val })
                                }
                                onSelectedItemsChange={(changes) => {
                                    console.log("Selected items:", changes.selectedItems); // Debugging step
                                    const selectedValues = changes.selectedItems.map((item) => item.value);
                                    setFieldValue(values.related === "Contact" ? "attendes" : "attendesLead", selectedValues);
                                }}
                            />


                            <Text color={'red'}>{errors.attendes && touched.attendes && errors.attendes}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display={'flex'}>Location</FormLabel>
                            <Input name='location' onChange={handleChange} onBlur={handleBlur} value={values.location} placeholder='Location' borderColor={errors.location && touched.location ? 'red.300' : null} />
                            <Text color={'red'}>{errors.location && touched.location && errors.location}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display={'flex'}>Date Time<Text color={'red'}>*</Text></FormLabel>
                            <Input type='datetime-local' name='dateTime' onChange={handleChange} onBlur={handleBlur} min={dayjs(todayTime).format('YYYY-MM-DD HH:mm')} value={values.dateTime} placeholder='Date Time' borderColor={errors.dateTime && touched.dateTime ? 'red.300' : null} />
                            <Text color={'red'}>{errors.dateTime && touched.dateTime && errors.dateTime}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display={'flex'}>Notes</FormLabel>
                            <Textarea name='notes' onChange={handleChange} onBlur={handleBlur} value={values.notes} placeholder='Notes' />
                        </GridItem>
                    </Grid>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleSubmit} isLoading={isLoding} colorScheme='blue'>Submit</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddMeeting;
