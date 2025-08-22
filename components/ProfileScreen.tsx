import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Account from './Account'

export default function ProfileScreen() {
  const { session } = useAuth()

  if (!session) {
    return null
  }

  return <Account session={session} />
}