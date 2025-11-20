"use client";

import { useState, useEffect } from "react";

interface Link {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code }),
    });

    if (res.ok) {
      setUrl("");
      setCode("");
      fetchLinks();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
  const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
  if (res.ok) fetchLinks(); // refresh UI after delete
};


  return (
    <div className="dashboard-container">
  <h1>TinyLink Dashboard</h1>

  <form onSubmit={handleAdd} className="dashboard-form">
    <input
      type="text"
      placeholder="Enter URL"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      required
    />
    <input
      type="text"
      placeholder="Custom Code (optional)"
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
    <button type="submit" disabled={loading}>
      Add
    </button>
  </form>

  {error && <div className="error-message">{error}</div>}

  <table className="dashboard-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>URL</th>
        <th>Clicks</th>
        <th>Last Clicked</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {links.length === 0 && (
        <tr>
          <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
            No links yet.
          </td>
        </tr>
      )}
      {links.map((link) => (
        <tr key={link.id}>
          <td>{link.code}</td>
          <td>
            <a
  href={`/api/links/${encodeURIComponent(link.code)}`}
  target="_blank"
  onClick={() => fetchLinks()}
>
  {link.url}
</a>


          </td>
          <td>{link.clicks}</td>
          <td>{link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "-"}</td>
          <td>
            <button
              onClick={() => handleDelete(link.code)}
              className="delete-btn"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
