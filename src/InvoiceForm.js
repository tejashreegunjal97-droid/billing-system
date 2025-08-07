import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function InvoiceForm() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [invoice, setInvoice] = useState({
    clientName: "",
    clientAddress: "",
    clientContact: "",
    services: [
      {
        name: "",
        rate: "",
        quantity: "",
        fy: "",
        total: 0,
      },
    ],
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientData } = await supabase.from("clients").select("*");
      setClients(clientData || []);

      const { data: serviceData } = await supabase.from("services").select("*");
      setServices(serviceData || []);

      const { data: invoices } = await supabase.from("invoices").select("id", { count: "exact" });
      const next = (invoices?.length || 0) + 1;
      setInvoiceNumber(`INV-${String(next).padStart(5, "0")}`);
    };

    fetchData();
  }, []);

  const handleClientInput = (e) => {
    const name = e.target.value;
    const matched = clients.filter((c) => c.name.toLowerCase().startsWith(name.toLowerCase()));
    setFilteredClients(matched);
    setInvoice((prev) => ({ ...prev, clientName: name }));
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setFilteredClients([]);
    setInvoice((prev) => ({
      ...prev,
      clientName: client.name,
      clientAddress: client.address,
      clientContact: client.contact,
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...invoice.services];
    newServices[index][field] = value;

    if (field === "name") {
      const matchedService = services.find((s) => s.name.toLowerCase() === value.toLowerCase());
      if (matchedService) {
        newServices[index].rate = matchedService.default_rate;
      }
    }

    const rate = parseFloat(newServices[index].rate) || 0;
    const qty = parseFloat(newServices[index].quantity) || 0;
    newServices[index].total = rate * qty;

    const totalAmount = newServices.reduce((sum, s) => sum + s.total, 0);

    setInvoice((prev) => ({
      ...prev,
      services: newServices,
      total: totalAmount,
    }));
  };

  const addService = () => {
    setInvoice((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", rate: "", quantity: "", fy: "", total: 0 }],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const existingClient = clients.find((c) => c.name.toLowerCase() === invoice.clientName.toLowerCase());
  let clientId = existingClient?.id;

  if (!existingClient) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert([
        {
          name: invoice.clientName,
          address: invoice.clientAddress,
          contact: invoice.clientContact,
        },
      ])
      .select()
      .single();

    if (clientError) {
      alert("Error saving client: " + clientError.message);
      return;
    }
    clientId = newClient.id;
  }

  // Save new services if they don't exist
  for (const s of invoice.services) {
    const existing = services.find((sv) => sv.name.toLowerCase() === s.name.toLowerCase());
    if (!existing) {
      const { error: serviceError } = await supabase.from("services").insert([
        {
          name: s.name.trim(),
          default_rate: parseFloat(s.rate),
        },
      ]);
      if (serviceError) {
        alert("Error saving service: " + serviceError.message);
        return;
      }
    }
  }

  // Save invoice
  const { error } = await supabase.from("invoices").insert([
    {
      invoice_number: invoiceNumber,
      client_id: clientId,
      client_name: invoice.clientName,
      client_address: invoice.clientAddress,
      client_contact: invoice.clientContact,
      services: invoice.services,
      total: invoice.total,
      created_at: new Date(),
      status: "Unpaid", // ✅ Add status
    },
  ]);

  if (error) {
    alert("Error saving invoice: " + error.message);
  } else {
    alert("Invoice saved!");
    window.location.reload();
  }
};


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Create Invoice</h2>
      <div>Invoice No: <strong>{invoiceNumber}</strong></div>

      <input
        type="text"
        name="clientName"
        placeholder="Client Name"
        value={invoice.clientName}
        onChange={handleClientInput}
        autoComplete="off"
        required
      />
      {filteredClients.length > 0 && (
        <ul style={{ border: "1px solid #ccc", padding: 5 }}>
          {filteredClients.map((client) => (
            <li
              key={client.id}
              onClick={() => selectClient(client)}
              style={{ cursor: "pointer" }}
            >
              {client.name}
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        name="clientAddress"
        placeholder="Client Address"
        value={invoice.clientAddress}
        onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })}
        required
      />

      <input
        type="text"
        name="clientContact"
        placeholder="Client Contact"
        value={invoice.clientContact}
        onChange={(e) => setInvoice({ ...invoice, clientContact: e.target.value })}
        required
      />

      <hr />
      <h3>Services</h3>

      {invoice.services.map((s, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <input
            list="service-options"
            type="text"
            placeholder="Service Name"
            value={s.name}
            onChange={(e) => handleServiceChange(index, "name", e.target.value)}
            required
          />
          <datalist id="service-options">
            {services.map((srv, idx) => (
              <option key={idx} value={srv.name}>{srv.name} - ₹{srv.default_rate}</option>
            ))}
          </datalist>

          <input
            type="number"
            placeholder="Rate"
            value={s.rate}
            onChange={(e) => handleServiceChange(index, "rate", e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Quantity"
            value={s.quantity}
            onChange={(e) => handleServiceChange(index, "quantity", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Financial Year (e.g., 2024-25)"
            value={s.fy}
            onChange={(e) => handleServiceChange(index, "fy", e.target.value)}
            required
          />

          <div>Subtotal: ₹ {s.total}</div>
        </div>
      ))}

      <button type="button" onClick={addService}>+ Add Another Service</button>

      <h3>Total: ₹ {invoice.total}</h3>

      <button type="submit">Save Invoice</button>
    </form>
  );
}

export default InvoiceForm;
