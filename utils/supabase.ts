import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@env'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })