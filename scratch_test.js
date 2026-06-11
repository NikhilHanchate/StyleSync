import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rjowzokmeuvjozpfpdvl.supabase.co";
const supabaseAnonKey = "sb_publishable_WRxK4zhxSicFhrAv4H7d1w_bNFHpNk6";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log("Testing insert service...");
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .insert([{
        id: "test_srv_" + Date.now(),
        salonId: "salon_1780395857711",
        name: "Test Haircut",
        description: "Test description",
        price: 25,
        duration: 30,
        category: "Haircut"
      }])
      .select()
      .single();
    
    if (serviceError) {
      console.error("Insert service error:", serviceError);
    } else {
      console.log("Insert service success:", serviceData);
      
      console.log("Testing delete service...");
      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceData.id);
      
      if (deleteError) {
        console.error("Delete service error:", deleteError);
      } else {
        console.log("Delete service success!");
      }
    }

    console.log("Testing insert staff...");
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .insert([{
        id: "test_stf_" + Date.now(),
        salonId: "salon_1780395857711",
        name: "Test Barber",
        role: "Master Barber",
        rating: 4.8,
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
      }])
      .select()
      .single();

    if (staffError) {
      console.error("Insert staff error:", staffError);
    } else {
      console.log("Insert staff success:", staffData);

      console.log("Testing delete staff...");
      const { error: deleteStaffError } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffData.id);

      if (deleteStaffError) {
        console.error("Delete staff error:", deleteStaffError);
      } else {
        console.log("Delete staff success!");
      }
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
