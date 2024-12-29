"use client"
import React from 'react'
import { useState, useEffect } from 'react'
import TaskCard from './TaskCard'

export default function ListTask() {
  const [tasks, setTasks] = useState([])

  const loadTasks = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`)
    const data = await res.json()
    setTasks(data)
  }

  useEffect(() => {
    // Carga inicial
    loadTasks()

    // Escuchar el evento personalizado
    window.addEventListener('taskCreated', loadTasks)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('taskCreated', loadTasks)
    }
  }, [])

  return (
    <div
    className='bg-slate-700 p-4 w-full'
    >
      <h1 className='text-white font-bold'>Listado de tareas</h1>
      {tasks.map((task) => (
        <TaskCard task={task} key={task.id}/>
      ))}
      

          
       
    
    </div>
  )
}

