import React, { useState } from 'react'
import { NextPage } from 'next';
import FormInput from '../components/ui/forms/form_input';
import { RegisterRequests } from '@gateways/utils/http_client_web/models/register_object';
import Swal from 'sweetalert2'
import { Requests } from '../components/ui/forms/formRequests';

const Register = ({ formRequest, setFormRequest }) => {
    const [dataForm, setDataForm] = useState(formRequest)

    const handleChangeInput = (event: any) => {
        const { value, name, type, checked } = event.target;
        let updatedValue = type === 'checkbox' ? checked : value

        const change = {
            [name]: updatedValue
        }

        let updatedData: Requests

        setDataForm((prev) => {
            updatedData = new Requests({ ...prev, ...change })
            return updatedData
        })

    }
    
    const handleSubmit = (e) => {
        e.preventDefault()

        Swal.fire({
            title: 'Please confirm!',
            html: `
                Registration  Data <br>
                Name: ${formRequest.name} <br>
                Email: ${formRequest.email} <br>

                Are you sure your data is correct?
            `,
            showCancelButton: true,
            confirmButtonText: 'Yes'
        })
    }

    console.log(dataForm)
  return (
    <div className='bg-slate-600 min-h-screen overflow-auto pb-10'>
        <h2 className='text-white text-center py-10'>Register</h2>
        <div className="container">
            <form onSubmit={(e) => handleSubmit(e)} aria-label='form register' data-testid='form-register'>
                <div className="mb-3">
                    <div className="row">
                        <div className="col-md-6 py-1">
                            <FormInput 
                                name='name'
                                placeholder='Full name'
                                label='Name'
                                type='text'
                                value={dataForm?.name}
                                extraLabelClass='text-white'
                                change={handleChangeInput}
                                required={true}
                                aria="input name"
                                testid="name"
                            />
                        </div>
                        <div className="col-md-6 py-1">
                            <FormInput 
                                name='email'
                                placeholder='Email'
                                label='Email'
                                type='email'
                                value={dataForm?.email}
                                extraLabelClass='text-white'
                                change={handleChangeInput}
                                required={true}
                                aria="input email"
                                testid="email"
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <FormInput 
                        name='phone'
                        placeholder='Phone'
                        label='Phone'
                        type='text'
                        value={dataForm?.phone}
                        extraLabelClass='text-white'
                        change={handleChangeInput}
                        required={true}
                        aria="input phone"
                        testid="phone"
                    />
                </div>
                <div className="mb-3">
                    <FormInput 
                        name='password'
                        placeholder='Password'
                        label='Password'
                        type='password'
                        value={dataForm?.password}
                        extraLabelClass='text-white'
                        change={handleChangeInput}
                        required={true}
                        aria="input password"
                        testid="password"
                    />
                </div>
                <div className="mb-3">
                    <FormInput 
                        name='country'
                        placeholder='Country'
                        label='Country'
                        type='text'
                        value={dataForm?.country}
                        extraLabelClass='text-white'
                        change={handleChangeInput}
                        // required={true}
                        aria="input country"
                    />
                </div>
                <div className="mb-3">
                    <FormInput 
                        name='role'
                        placeholder='Role'
                        label='Role'
                        type='text'
                        value={dataForm?.role}
                        extraLabelClass='text-white'
                        change={handleChangeInput}
                        // required={true}
                        aria="input role"
                    />
                </div>

                <div className="flex gap-1 justify-end">
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='btn btn-danger'>Back</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Register