import React from 'react'

export default function TaskCard( {task} ) {

    

  return (
   
        <div className='bg-slate-500 px-4 py-3 mb-2 rounded-md text-slate-200 flex justify-between items-center overflow-y-auto'>
          
          <div> 
            <h2 className='text-gray-900 font-bold'>{task.title}</h2>
            <p className='text-white'>{task.description}</p>
          </div>
           
          <div className='flex justify-between gap-x-2'>
            <button className='bg-red-500 text-white rounded-md p-2 px-4 block w-full'>Eliminar</button>
            <button className='bg-indigo-500 text-white rounded-md p-2 px-4 block w-full'>Actualizar</button>
          </div>

          
        </div>
     
    
  )
}
