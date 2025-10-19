import { supabase } from "@/integrations/supabase/client";

// Run this in browser console to setup your subscription
(window as any).setupUserSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription');
    
    if (error) {
      console.error('Error setting up subscription:', error);
      return { success: false, error };
    }
    
    // Also check what was created
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .single();
      
    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('*')
      .single();
    
    return { success: true, subscription: subData, usage: usageData };
  } catch (error) {
    console.error('Failed to setup subscription:', error);
    return { success: false, error };
  }
};