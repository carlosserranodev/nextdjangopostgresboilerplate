import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  RiDashboardLine, 
  RiPieChartLine, 
  RiWalletLine,
  RiUserSettingsLine,
  RiShieldLine,
  RiQuestionLine,
  RiLogoutBoxLine,
  RiUserLine
} from 'react-icons/ri'

const Sidebar = () => {
  const pathname = usePathname()

  const menuItems = [
    { icon: RiDashboardLine, label: 'Dashboard', path: '/dashboard' },
    { icon: RiPieChartLine, label: 'Analytics', path: '/(protected)/analytics' },
    { icon: RiWalletLine, label: 'My Wallet', path: '/(protected)/wallet' },
    { icon: RiUserLine, label: 'Accounts', path: '/accounts' },
    { icon: RiUserSettingsLine, label: 'Settings', path: '/(protected)/settings' },
    { icon: RiShieldLine, label: 'Security', path: '/(protected)/security' },
    { icon: RiQuestionLine, label: 'Help Centre', path: '/(protected)/help' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-teal-900 text-white p-4">
      {/* Logo o imagen de perfil */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
      </div>

      {/* Menú principal */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isActive 
                  ? 'bg-white/10' 
                  : 'hover:bg-white/5'
                }
              `}
            >
              <Icon className="text-xl" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Botón de logout */}
      <button 
        className="
          flex items-center space-x-3 px-4 py-3 rounded-lg
          hover:bg-white/5 w-full mt-auto
          absolute bottom-4 left-0 mx-4
        "
      >
        <RiLogoutBoxLine className="text-xl" />
        <span>Logout</span>
      </button>
    </div>
  )
}

export default Sidebar