import React, { useEffect } from "react";
import { supabase } from "./supabaseClient";

function TestSupabase() {
  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase.from('clients').select();
      console.log("Clients:", data);
      if (error) console.error("Error:", error);
    }

    fetchClients();
  }, []);

  return <div>Check console for clients data</div>;
}

export default TestSupabase;
