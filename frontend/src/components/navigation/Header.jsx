import { RiNotification3Line, RiSearchLine } from 'react-icons/ri'

const Header = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b">
      {/* Buscador */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Notificaciones y perfil */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <RiNotification3Line className="text-xl text-gray-600" />
        </button>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </header>
  )
}

export default Header