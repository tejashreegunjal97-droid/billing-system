import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedFY, setSelectedFY] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
      } else {
        setInvoices(data);
        setFilteredInvoices(data);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = [...invoices];

    if (selectedClient) {
      filtered = filtered.filter((inv) => inv.client_name === selectedClient);
    }

    if (selectedFY) {
      filtered = filtered.filter((inv) =>
        inv.services?.some((s) => s.fy === selectedFY)
      );
    }

    setFilteredInvoices(filtered);
  }, [selectedClient, selectedFY, invoices]);

 const togglePaidStatus = async (invoice) => {
  if (invoice.paid) {
    alert("This invoice is already marked as paid and cannot be changed.");
    return;
  }

  const { error } = await supabase
    .from("invoices")
    .update({ paid: true })
    .eq("id", invoice.id);

  if (error) {
    alert("Error updating status: " + error.message);
  } else {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id ? { ...inv, paid: true } : inv
      )
    );
  }
};



  const handleDownloadPDF = (invoiceId) => {
    const element = document.getElementById(`invoice-${invoiceId}`);
    const buttons = element.querySelectorAll(".pdf-button");
    buttons.forEach((btn) => (btn.style.display = "none"));

    const opt = {
      margin: 0.3,
      filename: `invoice-${invoiceId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        buttons.forEach((btn) => (btn.style.display = "inline-block"));
      });
  };

  const toggleView = (id) => {
    setActiveInvoiceId((prevId) => (prevId === id ? null : id));
  };

  const exportToExcel = () => {
    const exportData = filteredInvoices.map((inv) => ({
      Invoice_No: inv.invoice_number,
      Client: inv.client_name,
      Date: new Date(inv.created_at).toLocaleDateString(),
      Amount: inv.total,
      Paid: inv.paid ? "Paid" : "Unpaid",
      Services: inv.services
        ?.map((s) => `${s.name} (₹${s.rate} × ${s.quantity}) FY:${s.fy}`)
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "Invoices.xlsx");
  };

  const clearFilters = () => {
    setSelectedClient("");
    setSelectedFY("");
  };

  const uniqueClients = [...new Set(invoices.map((inv) => inv.client_name))];
  const uniqueFYs = [
    ...new Set(
      invoices.flatMap((inv) =>
        inv.services?.map((s) => s.fy)
      )
    ),
  ];

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Invoices</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} style={inputStyle}>
            <option value="">Filter by Client</option>
            {uniqueClients.map((client, idx) => (
              <option key={idx} value={client}>{client}</option>
            ))}
          </select>

          <select value={selectedFY} onChange={(e) => setSelectedFY(e.target.value)} style={inputStyle}>
            <option value="">Filter by FY</option>
            {uniqueFYs.map((fy, idx) => (
              <option key={idx} value={fy}>{fy}</option>
            ))}
          </select>

          <button onClick={clearFilters} style={{ ...actionBtn, backgroundColor: "#6c757d" }}>
            Clear Filters
          </button>
        </div>

        <button
          onClick={exportToExcel}
          style={{ ...actionBtn, backgroundColor: "#28a745" }}
        >
          Export to Excel
        </button>
      </div>

      {/* INVOICE TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={tableHead}>Invoice No</th>
            <th style={tableHead}>Client</th>
            <th style={tableHead}>Date</th>
            <th style={tableHead}>Amount</th>
            <th style={tableHead}>Actions</th>
            <th style={tableHead}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td style={tableCell}>{invoice.invoice_number}</td>
              <td style={tableCell}>{invoice.client_name}</td>
              <td style={tableCell}>{new Date(invoice.created_at).toLocaleDateString()}</td>
              <td style={tableCell}>₹{invoice.total}</td>
              <td style={tableCell}>
                <button onClick={() => toggleView(invoice.id)} style={actionBtn}>
                  {activeInvoiceId === invoice.id ? "Hide" : "View"}
                </button>{" "}
                <button onClick={() => handleDownloadPDF(invoice.id)} style={actionBtn}>
                  Download PDF
                </button>
              </td>
              <td style={tableCell}>
  <div className="pdf-button">
    <button
      onClick={() => togglePaidStatus(invoice)}
      disabled={invoice.paid}
      style={{
        ...actionBtn,
        backgroundColor: invoice.paid ? "#28a745" : "#dc3545",
        minWidth: "90px",
        cursor: invoice.paid ? "not-allowed" : "pointer",
        opacity: invoice.paid ? 0.7 : 1,
      }}
    >
      {invoice.paid ? "Paid" : "Mark as Paid"}
    </button>
  </div>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* INVOICE DETAILS */}
      {filteredInvoices.map((invoice) =>
        invoice.id === activeInvoiceId ? (
          <div
            id={`invoice-${invoice.id}`}
            key={`details-${invoice.id}`}
            style={{
              border: "1px solid #000",
              padding: "40px",
              marginBottom: "60px",
              backgroundColor: "#fff",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2>Invoice</h2>
                <p><strong>Invoice No:</strong> {invoice.invoice_number}</p>
                <p><strong>Invoice Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h3>Lohit Taneja & Company</h3>
                <p>Office No. 14, 2nd Floor, Above Ratna Hotel,</p>
                <p>PCMC Metro Station Road, Pune - 411018</p>
                <p>Phone: +91 82085 88950</p>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p><strong>Billed To:</strong></p>
              <p>{invoice.client_name}</p>
              <p>{invoice.client_address}</p>
              <p>{invoice.client_contact}</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th style={cellHeader}>Item</th>
                  <th style={cellHeader}>Quantity</th>
                  <th style={cellHeader}>Rate (₹)</th>
                  <th style={cellHeader}>FY</th>
                  <th style={cellHeader}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services?.map((s, idx) => (
                  <tr key={idx}>
                    <td style={cell}>{s.name}</td>
                    <td style={cell}>{s.quantity}</td>
                    <td style={cell}>{s.rate}</td>
                    <td style={cell}>{s.fy}</td>
                    <td style={cell}>{s.rate * s.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "right", fontSize: "16px", marginBottom: "30px" }}>
              <strong>Total (INR): ₹{invoice.total}</strong>
            </div>

            <div>
              <p><strong>Bank Details</strong></p>
              <p>Account Name: Lohit Santosh Taneja</p>
              <p>Account Number: 8045585339</p>
              <p>IFSC: KKBK0002049</p>
              <p>Bank: Kotak Mahindra Bank</p>
              <p>UPI: tanejalohit01-1@oksbi</p>
            </div>

            <div className="pdf-button" style={{ textAlign: "right", marginTop: "20px" }}>
              <button onClick={() => handleDownloadPDF(invoice.id)} style={actionBtn}>
                Download PDF
              </button>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

// === Styles ===
const tableHead = {
  padding: "10px",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
  fontWeight: "bold",
};

const tableCell = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const actionBtn = {
  padding: "6px 10px",
  minWidth: "90px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "13px",
  cursor: "pointer",
  marginRight: "5px",
};

const inputStyle = {
  padding: "8px",
  marginRight: "10px",
};

const cellHeader = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "left",
  fontWeight: "bold",
};

const cell = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "left",
};

export default InvoiceList;
