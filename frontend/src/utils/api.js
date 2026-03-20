const BASE = '/api'

export async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  login:          (body)        => apiFetch('/login', { method: 'POST', body }),
  getNurses:      ()            => apiFetch('/nurses'),
  getPatients:    (nurseId)     => apiFetch(`/patients?assignedTo=${nurseId}`),
  toggleDiet:     (pid,did,done)=> apiFetch(`/patients/${pid}/diet/${did}`,     { method:'PATCH', body:{done} }),
  toggleMedicine: (pid,mid,done)=> apiFetch(`/patients/${pid}/medicines/${mid}`,{ method:'PATCH', body:{done} }),
  addNote:        (pid,body)    => apiFetch(`/patients/${pid}/notes`, { method:'POST', body }),
  getWardTasks:   ()            => apiFetch('/ward-tasks'),
  toggleWardTask: (tid,done)    => apiFetch(`/ward-tasks/${tid}`, { method:'PATCH', body:{done} }),
  getDoctorNotes: ()            => apiFetch('/doctor-notes'),
  getNotifications:()           => apiFetch('/notifications'),
  addNotification:(body)        => apiFetch('/notifications', { method:'POST', body }),
  getWards:       ()            => apiFetch('/wards'),
  transferTasks:  (body)        => apiFetch('/transfer', { method:'POST', body }),
  getReceived:    (nurseId)     => apiFetch(`/transfer/received?to=${nurseId}`),
}
