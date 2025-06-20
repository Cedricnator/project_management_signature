// composables/useAccountFormValidation.ts
import { ref } from 'vue'
import { AccountRole } from '@/types'

export function useAccountFormValidation() {
    const email = ref('')
    const firstName = ref('')
    const lastName = ref('')
    const role = ref<AccountRole>(AccountRole.user)
    const password = ref('')
    const confirmPassword = ref('')

    const errors = ref({
        email: '' as string | null,
        firstName: '' as string | null,
        lastName: '' as string | null,
        role: '' as string | null,
        password: '' as string | null,
        confirmPassword: '' as string | null,
    })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    function validate(): boolean {
        let ok = true

        errors.value = { email: null, firstName: null, lastName: null, role: null, password: null, confirmPassword: null}

        // email
        const emailTrimmed = email.value.trim()
        if (!emailTrimmed) {
            errors.value.email = 'El correo es obligatorio'
            ok = false
        } else if (emailTrimmed.length > 100) {
            errors.value.email = 'Máximo 100 caracteres'
            ok = false
        } else if (!emailRegex.test(emailTrimmed)) {
            errors.value.email = 'Correo inválido'
            ok = false
        }

        // firstName
        const first = firstName.value.trim()
        if (!first) {
            errors.value.firstName = 'El nombre es obligatorio'
            ok = false
        } else if (first.length < 2) {
            errors.value.firstName = 'Mínimo 2 caracteres'
            ok = false
        } else if (first.length > 20) {
            errors.value.firstName = 'Máximo 20 caracteres'
            ok = false
        }

        // lastName
        const last = lastName.value.trim()
        if (!last) {
            errors.value.lastName = 'El apellido es obligatorio'
            ok = false
        } else if (last.length < 2) {
            errors.value.lastName = 'Mínimo 2 caracteres'
            ok = false
        } else if (last.length > 20) {
            errors.value.lastName = 'Máximo 20 caracteres'
            ok = false
        }

        // password
        const pwd = password.value.trim()
        if (!pwd) {
            errors.value.password = 'La contraseña es obligatoria'
            ok = false
        } else if (pwd.length < 8) {
            errors.value.password = 'Mínimo 8 caracteres'
            ok = false
        }

        // repeatPassword
        const confirm = confirmPassword.value.trim()
        if (!confirm) {
            errors.value.confirmPassword = 'Debe repetir la contraseña'
            ok = false
        } else if (confirm !== pwd) {
            errors.value.confirmPassword = 'Las contraseñas no coinciden'
            ok = false
        }

        // role
        if (!Object.values(AccountRole).includes(role.value)) {
            errors.value.role = 'Rol inválido'
            ok = false
        }

        return ok
    }

    return {
        email,
        firstName,
        lastName,
        role,
        password,
        confirmPassword,
        errors,
        validate,
    }
}
