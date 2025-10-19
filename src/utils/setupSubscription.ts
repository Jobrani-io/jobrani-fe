import { supabase } from "@/integrations/supabase/client";

export const setupUserSubscription = async () => {
  try {
    console.log("Setting up user subscription...");
    
    // Call the check-subscription function which will:
    // 1. Check if user has Stripe customer
    // 2. Create free plan if no customer exists
    // 3. Update subscription in database
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      method: 'POST'
    });

    if (error) {
      console.error('Error setting up subscription:', error);
      throw error;
    }

    console.log('Subscription setup result:', data);
    return data;
  } catch (error) {
    console.error('Failed to setup subscription:', error);
    throw error;
  }
};