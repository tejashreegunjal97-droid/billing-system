import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  const [editClientId, setEditClientId] = useState(null);
  const [editedClient, setEditedClient] = useState({});

  const [editServiceId, setEditServiceId] = useState(null);
  const [editedService, setEditedService] = useState({});

  const [newClient, setNewClient] = useState({ name: "", address: "", contact: "" });
  const [newService, setNewService] = useState({ name: "", default_rate: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: clientData } = await supabase.from("clients").select("*");
    const { data: serviceData } = await supabase.from("services").select("*");

    setClients(clientData || []);
    setServices(serviceData || []);
  };

  // === CLIENTS ===
  const addClient = async () => {
    const { error } = await supabase.from("clients").insert([newClient]);
    if (error) return alert("Error adding client: " + error.message);
    setNewClient({ name: "", address: "", contact: "" });
    fetchData();
  };

  const startEditClient = (client) => {
    setEditClientId(client.id);
    setEditedClient({ ...client });
  };

  const saveClient = async () => {
    await supabase.from("clients").update(editedClient).eq("id", editedClient.id);
    setEditClientId(null);
    fetchData();
  };

  const deleteClient = async (id) => {
    if (window.confirm("Delete this client?")) {
      await supabase.from("clients").delete().eq("id", id);
      fetchData();
    }
  };

  // === SERVICES ===
  const addService = async () => {
    const { error } = await supabase.from("services").insert([{
      name: newService.name.trim(),
      default_rate: parseFloat(newService.default_rate),
    }]);
    if (error) return alert("Error adding service: " + error.message);
    setNewService({ name: "", default_rate: "" });
    fetchData();
  };

  const startEditService = (service) => {
    setEditServiceId(service.id);
    setEditedService({ ...service });
  };

  const saveService = async () => {
    await supabase.from("services").update(editedService).eq("id", editedService.id);
    setEditServiceId(null);
    fetchData();
  };

  const deleteService = async (id) => {
    if (window.confirm("Delete this service?")) {
      await supabase.from("services").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Dashboard</h2>

      {/* CLIENTS */}
      <section style={{ marginBottom: 40 }}>
        <h3>Clients</h3>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Name"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Address"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Contact"
            value={newClient.contact}
            onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
            style={inputStyle}
          />
          <button onClick={addClient}>Add Client</button>
        </div>
        <table style={tableStyle} border="1" cellPadding="8">
          <thead><tr><th>Name</th><th>Address</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                {editClientId === c.id ? (
                  <>
                    <td><input value={editedClient.name} onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })} /></td>
                    <td><input value={editedClient.address} onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })} /></td>
                    <td><input value={editedClient.contact} onChange={(e) => setEditedClient({ ...editedClient, contact: e.target.value })} /></td>
                    <td>
                      <button onClick={saveClient}>Save</button>
                      <button onClick={() => setEditClientId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{c.name}</td>
                    <td>{c.address}</td>
                    <td>{c.contact}</td>
                    <td>
                      <button onClick={() => startEditClient(c)}>Edit</button>
                      <button onClick={() => deleteClient(c.id)} style={{ color: "red" }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SERVICES */}
      <section style={{ marginBottom: 40 }}>
        <h3>Services</h3>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Service Name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Default Rate"
            type="number"
            value={newService.default_rate}
            onChange={(e) => setNewService({ ...newService, default_rate: e.target.value })}
            style={inputStyle}
          />
          <button onClick={addService}>Add Service</button>
        </div>
        <table style={tableStyle} border="1" cellPadding="8">
          <thead><tr><th>Name</th><th>Rate</th><th>Actions</th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                {editServiceId === s.id ? (
                  <>
                    <td><input value={editedService.name} onChange={(e) => setEditedService({ ...editedService, name: e.target.value })} /></td>
                    <td><input type="number" value={editedService.default_rate} onChange={(e) => setEditedService({ ...editedService, default_rate: e.target.value })} /></td>
                    <td>
                      <button onClick={saveService}>Save</button>
                      <button onClick={() => setEditServiceId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{s.name}</td>
                    <td>{s.default_rate}</td>
                    <td>
                      <button onClick={() => startEditService(s)}>Edit</button>
                      <button onClick={() => deleteService(s.id)} style={{ color: "red" }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const inputStyle = {
  marginRight: 10,
  padding: 8,
  marginBottom: 10,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default Dashboard;
