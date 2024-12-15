"use client"

import React from 'react'

import { useState } from 'react'

import { useRouter } from 'next/navigation'



export default function FormTask() {

  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()


  const handleSubmit = async(e) => {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title, description})
    })
    const data = await res.json()
    
    // Disparar evento personalizado
    window.dispatchEvent(new Event('taskCreated'))
    
    // Limpiar formulario
    setTitle('')
    setDescription('')
  }

  return (
    <div className='bg-slate-200 p-7 h-fit'>
      
      <form onSubmit={handleSubmit}>
        <h1 className='text-black font-bold'>Añadir tarea</h1>
        <label htmlFor="title" className='text-xs text-black'>Title:</label>
        <input type="text" name="title" placeholder="Title" 
         className="bg-slate-400 text-white rounded-md p-2 mb-2 block w-full text-slate-900"
         onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="description" className='text-xs text-black'>Description:</label>
        <textarea name="description" placeholder="Description" className="bg-slate-400 
        rounded-md p-2 mb-2 block w-full text-slate-900"
        onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button
          className="bg-indigo-500 text-white rounded-md p-2 block w-full"
           type="submit"
        >Save</button>
      </form>
    </div>
  )
}
