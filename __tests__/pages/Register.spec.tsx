import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../../src/pages/register'
import { RegisterRequests } from '../../src/gateways/utils/http_client_web/models/register_object';
import { Props, Requests } from '../../src/components/ui/forms/formRequests'

describe("<Register />", () => {
    let register
    let updatedData
    let handleCancel
    let updateRegister
    let nameTextBox
    let emailTextBox
    let phoneTextBox
    let passwordTextBox

    const setup = () => {
        render(
            <Register formRequest={register} setFormRequest={updateRegister}/>
        )

        nameTextBox = screen.getByRole('textbox', {
            name: /input name/i,
        })
        emailTextBox = screen.getByRole('textbox', {
            name: /input email/i
        })
        phoneTextBox = screen.getByRole('textbox', {
            name: /input phone/i
        })
        passwordTextBox = screen.getByLabelText('input password')
    }

    // function renderRegisterForm(props: Partial<Props> = {}){
    //     const defaultProps: Props = {
    //         onFormChange() {
    //             return;
    //         }
    //     }

    //     return render(<Register {...defaultProps} {...props} />)
    // }

    beforeEach(async() => {
        register = await new (Requests as any)({
            name: 'Data',
            email: 'newmail@mail.com',
            country: 'Indo',
            password: 'Qwerty12',
            phone: '838683746834',
            role: 'Super'
        })
        updatedData = new (Requests as any)({
            name: 'Bei test',
            email: 'beitest-mail@mail.com'
        })
        handleCancel = jest.fn()
    })

    test('should load project into form', async () => {
        setup();
        expect(
            screen.getByRole('form', {
                name: /form register/i
            })
        ).toHaveFormValues({
            name: register.name,
            email: register.email,
            phone: register.phone,
            password: register.password,
            country: register.country,
            role: register.role
        })
    })

    test('should accept input', async() => {
        setup();
        const user = userEvent.setup();
        await user.clear(nameTextBox)
        await user.type(nameTextBox, updatedData.name)
        expect(nameTextBox).toHaveValue(updatedData.name)
    })

//     test("should display a blank login form, with remember me checked by default", async() => {
//         const { findByTestId } = renderRegisterForm()

//         const registerForm = await findByTestId('form-register')

//         expect(registerForm).toHaveFormValues({
//             name: '',
//             email: '',
//             country: '',
//             password: '',
//             phone: '',
//             role: ''
//         })
//     })
})
