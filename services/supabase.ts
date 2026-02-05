
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mokeejmmieqmmfdzrkeq.supabase.co';
const supabaseKey = 'sb_publishable_RlLstMaKWuD7LExEGRxXiA_JpOf25nF';

/**
 * Cliente Supabase purista. 
 * Não emulamos mais o banco no localStorage para evitar que dados 
 * dessincronizados sobrescrevam o banco de dados real.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
