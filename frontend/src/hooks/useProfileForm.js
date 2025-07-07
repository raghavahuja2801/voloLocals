import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function useProfileForm(currentUser) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    address: '',
    businessName: '',
    serviceCategories: '',
    serviceAreas: '',
    licenseNumber: '',
    availabilityDays: [],
    availabilityHours: '',
  })

  useEffect(() => {
    if (!currentUser) return
    setForm({
      displayName: currentUser.displayName || '',
      phone: currentUser.phone || '',
      address: currentUser.address?.street || '',
      businessName: currentUser.businessName || '',
      serviceCategories: (currentUser.serviceCategories || []).join(', '),
      serviceAreas: (currentUser.serviceAreas || []).join(', '),
      licenseNumber: currentUser.licenseNumber || '',
      availabilityDays: currentUser.availability?.days || [],
      availabilityHours: currentUser.availability?.hours || '',
    })
  }, [currentUser])

  const handleEdit = () => {
    setEditMode(true)
    setSuccess(null)
    setError(null)
  }

  const handleCancel = () => {
    setEditMode(false)
    setSuccess(null)
    setError(null)
    // Reset form to currentUser
    setForm({
      displayName: currentUser.displayName || '',
      phone: currentUser.phone || '',
      address: currentUser.address?.street || '',
      businessName: currentUser.businessName || '',
      serviceCategories: (currentUser.serviceCategories || []).join(', '),
      serviceAreas: (currentUser.serviceAreas || []).join(', '),
      licenseNumber: currentUser.licenseNumber || '',
      availabilityDays: currentUser.availability?.days || [],
      availabilityHours: currentUser.availability?.hours || '',
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckbox = (day) => {
    setForm((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const isContractor = currentUser.role === 'contractor'
      let payload = {}
      
      if (isContractor) {
        payload = {
          displayName: form.displayName,
          phone: form.phone,
          businessName: form.businessName,
          serviceCategories: form.serviceCategories.split(',').map(s => s.trim()).filter(Boolean),
          serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
          licenseNumber: form.licenseNumber,
          availability: {
            days: form.availabilityDays,
            hours: form.availabilityHours,
          },
        }
        if (form.address) payload.address = { street: form.address }
        
        await fetch(`${API_BASE_URL}/api/contractor/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        payload = {
          displayName: form.displayName,
          phone: form.phone,
          address: { street: form.address },
        }
        console.log('Updating user profile:', payload)
        
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', [...response.headers.entries()])
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('Success response:', result)
      }
      
      setSuccess('Profile updated!')
      setEditMode(false)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return {
    editMode,
    saving,
    error,
    success,
    form,
    handleEdit,
    handleCancel,
    handleChange,
    handleCheckbox,
    handleSave,
  }
}
