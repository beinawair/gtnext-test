export class Requests {
    id: number | undefined
    name: string  = ''
    email: string = ''
    phone: string = ''
    password: string = ''
    country: string = ''
    role: string = ''
    createdAt: Date = new Date()
    get isNew(): boolean {
        return this.id === undefined
    }

    constructor(initializer?: any) {
        if (!initializer) return;
        if (initializer.id) this.id = initializer.id;
        if (initializer.name) this.name = initializer.name;
        if (initializer.email) this.email = initializer.email;
        if (initializer.phone) this.phone = initializer.phone;
        if (initializer.password) this.password = initializer.password;
        if (initializer.country) this.country = initializer.country;
        if (initializer.role) this.role = initializer.role;
    }
}

export interface Props {
    onFormChange: (request: Requests) => void;
}