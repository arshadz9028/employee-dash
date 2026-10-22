'use client'
import React, { useEffect, useState } from 'react'
import { ConfigProvider, Table, type TableColumnsType } from 'antd'
import styles from './index.module.css'
import EmployeeForm from '../Form'
import { MdDelete, MdEdit } from 'react-icons/md'

type Employee = {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
}

function Home() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')


    useEffect(() => {
        let isActive = true

        async function loadEmployees() {
            try {
                const response = await fetch('/api/employees')
                const result = await response.json() as { employees?: Employee[]; error?: string }
                if (!response.ok) throw new Error(result.error ?? 'Could not load employees.')
                if (isActive) setEmployees(result.employees ?? [])
            } catch (loadError) {
                if (isActive) setError(loadError instanceof Error ? loadError.message : 'Could not load employees.')
            } finally {
                if (isActive) setIsLoading(false)
            }
        }

        void loadEmployees()
        return () => { isActive = false }
    }, [])

    const saveEmployee = async (employee: { name: string; email: string; role: string }) => {
        setIsSubmitting(true)
        setError('')
        try {
            const response = await fetch(editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees', {
                method: editingEmployee ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee),
            })
            const result = await response.json() as { employee?: Employee; error?: string }
            if (!response.ok || !result.employee) throw new Error(result.error ?? 'Could not save employee.')

            if (editingEmployee) {
                setEmployees((current) => current.map((item) => item.id === result.employee?.id ? result.employee! : item))
            } else {
                setEmployees((current) => [result.employee!, ...current])
            }
            setIsFormOpen(false)
            setEditingEmployee(null)
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Could not save employee.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteEmployee = async (employee: Employee) => {
        if (!window.confirm(`Delete ${employee.name}?`)) return

        setError('')
        try {
            const response = await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
            const result = await response.json() as { error?: string }
            if (!response.ok) throw new Error(result.error ?? 'Could not delete employee.')
            setEmployees((current) => current.filter((item) => item.id !== employee.id))
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Could not delete employee.')
        }
    }

    const columns: TableColumnsType<Employee> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, employee) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.iconButton} type="button" title={`Edit ${employee.name}`} aria-label={`Edit ${employee.name}`} onClick={() => {
                        setError('')
                        setEditingEmployee(employee)
                        setIsFormOpen(true)
                    }}>
                        <MdEdit />
                    </button>
                    <button className={`${styles.iconButton} ${styles.deleteButton}`} type="button" title={`Delete ${employee.name}`} aria-label={`Delete ${employee.name}`} onClick={() => void deleteEmployee(employee)}>
                        <MdDelete />
                    </button>
                </div>
            ),
        },
    ]
    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase()) ||
        employee.role.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <ConfigProvider theme={{
            token: {
                fontFamily: 'var(--font-geist-sans), sans-serif',
                colorPrimary: '#426b5a',
                colorText: '#202b26',
                colorTextSecondary: '#607069',
                colorBorder: '#dce4df',
                colorBgContainer: '#ffffff',
                borderRadius: 5,
            }
        }}>
            <>
                <div className={styles.container}>
                    <div className={styles.header}>

                        <h3>Employee Dashboard</h3>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button className={styles.btn} onClick={() => {
                            setError('')
                            setEditingEmployee(null)
                            setIsFormOpen(true)
                        }}>Add Employee</button>

                    </div>
                    {error && !isFormOpen && <p className={styles.error} role="alert">{error}</p>}
                    <Table className={styles.table} rowKey="id" loading={isLoading} dataSource={filteredEmployees} columns={columns} locale={{ emptyText: 'No employees yet' }} />
                </div>
                {isFormOpen && <EmployeeForm
                    initialValue={editingEmployee}
                    isEditing={Boolean(editingEmployee)}
                    isSubmitting={isSubmitting}
                    onSubmit={saveEmployee}
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingEmployee(null)
                        setError('')
                    }}
                />}
                {isFormOpen && error && <p className={styles.modalError} role="alert">{error}</p>}
            </>
        </ConfigProvider>
    )
}

export default Home