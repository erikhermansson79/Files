//import { useState, useRef } from 'react';
//import { Form, Field } from 'react-final-form';
//import Overlay from 'react-bootstrap/Overlay';
//import Popover from 'react-bootstrap/Popover';
//import { useProfileInformationQuery, useUpdateSettingsMutation } from 'services/profile';
//import { LoadingIndicator } from './LoadingIndicator';

//export function Settings() {
//    const [showSettings, setShowSettings] = useState(false);
//    const target = useRef(null);

//    const { data: profile } = useProfileInformationQuery();
//    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

//    async function onSubmit(values) {
//        updateSettings(values);
//        setShowSettings(false);
//    }

//    if (!profile) {
//        return null;
//    }

//    return (
//        <>
//            <i ref={target} className="fa-solid fa-gear" onClick={() => setShowSettings(!showSettings)}></i>
//            <Overlay show={showSettings} target={target.current} placement="left">
//                <Popover>
//                    <Popover.Header as="h3">Inställningar</Popover.Header>
//                    <Popover.Body>
//                        {isUpdating &&
//                            <LoadingIndicator />
//                        }
//                        {!isUpdating &&
//                            <Form
//                                onSubmit={onSubmit}
//                                initialValues={profile.settings}
//                                render={({ handleSubmit, values }) => {
//                                    return (
//                                        <form onSubmit={handleSubmit} id="detailsForm">
//                                            <div className="row">
//                                                <div className="col">
//                                                    <div className="form-check">
//                                                        <Field name="disablePagingInFiles" id="disablePagingInFiles" component="input" type="checkbox" className="form-check-input" />
//                                                        <label className="form-check-label" htmlFor="disablePagingInFiles">
//                                                            Visa alla på en sida
//                                                        </label>
//                                                    </div>
//                                                </div>
//                                            </div>
//                                            <div className="d-flex mt-2">
//                                                <button type="submit" className="btn btn-primary">Spara</button>
//                                                <button type="button" className="btn btn-secondary ms-1" onClick={() => setShowSettings(false)}>Avbryt</button>
//                                            </div>
//                                        </form>);
//                                }}
//                            />
//                        }
//                    </Popover.Body>
//                </Popover>
//            </Overlay>
//        </>
//    );
//}