// supabaseClient.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
'https://obqmgqzjtvdzmcfvteyn.supabase.co',
'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);

export { supabase };