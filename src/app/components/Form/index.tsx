import styles from './index.module.css'

type EmployeeDetails = {
  name: string
  email: string
  role: string
}

type EmployeeFormProps = {
  initialValue?: EmployeeDetails | null
  isEditing?: boolean
  isSubmitting?: boolean
  onSubmit: (employee: EmployeeDetails) => Promise<void>
  onCancel: () => void
}

function EmployeeForm({ initialValue, isEditing = false, isSubmitting = false, onSubmit, onCancel }: EmployeeFormProps) {
  return (
    <div className={styles.backdrop}>
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          await onSubmit({
            name: String(formData.get('name')).trim(),
            email: String(formData.get('email')).trim(),
            role: String(formData.get('role')).trim(),
          })
        }}
        aria-labelledby="employee-form-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.formHeader}>
          <div>
            <p className={styles.eyebrow}>EMPLOYEE DETAILS</p>
            <h2 id="employee-form-title">{isEditing ? 'Edit employee' : 'Add an employee'}</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={onCancel} aria-label="Close form">
            &times;
          </button>
        </div>

        <label className={styles.field}>
          <span>Full name</span>
          <input name="name" type="text" placeholder="e.g. Alex Morgan" autoComplete="name" defaultValue={initialValue?.name} maxLength={120} required />
        </label>

        <label className={styles.field}>
          <span>Work email</span>
          <input name="email" type="email" placeholder="alex@company.com" autoComplete="email" defaultValue={initialValue?.email} maxLength={254} required />
        </label>

        <label className={styles.field}>
          <span>Role</span>
          <input name="role" type="text" placeholder="e.g. Software Engineer" defaultValue={initialValue?.role} maxLength={120} required />
        </label>

        <div className={styles.actions}>
          <button className={styles.cancelButton} type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save employee'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm