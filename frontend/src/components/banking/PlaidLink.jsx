'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import Button from '../../components/ui/Button'
import plaidService from '../../services/plaidService'
import { useAccountStore } from '../../store'

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState(null)
  const { addAccount } = useAccountStore()

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        // En un caso real, obtendríamos el userId del contexto de autenticación
        const token = await plaidService.createLinkToken('test-user')
        setLinkToken(token)
      } catch (error) {
        console.error('Error getting link token:', error)
      }
    }
    getLinkToken()
  }, [])

  const onSuccess = useCallback(async (publicToken, metadata) => {
    try {
      // Intercambiar el token público por un token de acceso
      const exchangeResponse = await plaidService.exchangePublicToken(publicToken)
      const accessToken = exchangeResponse.access_token
      
      // Obtener las cuentas
      const accounts = await plaidService.getAccounts(accessToken)
      
      // Guardar las cuentas en el store
      accounts.forEach(account => {
        addAccount({
          id: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          balance: account.balances.current,
          mask: account.mask,
          accessToken,
        })
      })
    } catch (error) {
      console.error('Error in onSuccess:', error)
    }
  }, [addAccount])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  })

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      className="w-full"
    >
      Conectar cuenta bancaria
    </Button>
  )
}