import { useState } from 'react'

import Account from 'src/models/Account'
import createAccount from 'lib/createAccount'

import getUpdatedAccount from './getUpdatedAccount'

const initialAccountValue = createAccount()

const useAccount = (): [Account, () => Promise<void>] => {
  const [account, setAccount] = useState<Account>(initialAccountValue)
  const refreshAccount = async () =>
  await getUpdatedAccount(account)
    .then((account: Account) => {
      setAccount(account);
    })
    .catch(err => console.error('refresh failed because of some error'))

  return [account, refreshAccount]
}

export default useAccount
