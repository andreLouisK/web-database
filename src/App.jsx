import React, { useEffect, useState } from "react";
import './App.css';

const API_BASE_URL = "https://web-database-functions-cjhmgbcuh9ajbnb0.westeurope-01.azurewebsites.net/api";

function App() {
  const [innlegg, setInnlegg] = useState([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyttInnhold, setNyttInnhold] = useState("");
  const [valgtFil, setValgtFil] = useState(null);
  const [preview, setPreview] = useState(null); // For bilde-preview
  const [loading, setLoading] = useState(true);
  const [lasterOpp, setLasterOpp] = useState(false);

  const fetchPosts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/GetPosts`);
      const data = await response.json();
      setInnlegg(data);
    } catch (error) {
      console.error("Klarte ikke hente data:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deletepost/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Noe gikk galt ved sletting");
      setInnlegg(prev => prev.filter(post => post.Id !== id));
      fetchPosts(false);
    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setValgtFil(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handlePublish = async () => {
    if (!nyTittel) return alert("Du må ha en tittel!");
    setLasterOpp(true);

    try {
      let bildeUrl = "";

      if (valgtFil) {
        const formData = new FormData();
        formData.append('file', valgtFil);

        const uploadRes = await fetch(`${API_BASE_URL}/UploadImage`, {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          bildeUrl = data.url;
        } else {
          alert("Kunne ikke laste opp bilde.");
          setLasterOpp(false);
          return;
        }
      }

      const postRes = await fetch(`${API_BASE_URL}/CreatePost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tittel: nyTittel, Innhold: nyttInnhold, BildeUrl: bildeUrl })
      });

      if (postRes.ok) {
        setNyTittel("");
        setNyttInnhold("");
        setValgtFil(null);
        setPreview(null); // Nullstill preview
        fetchPosts(false);
        // Nullstill fil-input feltet
        document.getElementById("fileInput").value = "";
      }
    } catch (error) {
      console.error("Feil under publisering:", error);
    } finally {
      setLasterOpp(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="App">
      <h1>Mester-Logg v2</h1>

      <div className="nytt-innlegg-skjema">
        <input
          type="text"
          placeholder="Tittel..."
          value={nyTittel}
          onChange={(e) => setNyTittel(e.target.value)}
        />
        <textarea
          placeholder="Hva tenker du på?"
          value={nyttInnhold}
          onChange={(e) => setNyttInnhold(e.target.value)}
        />
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview && <img className="preview" src={preview} alt="preview" />}
        <button onClick={handlePublish} disabled={lasterOpp}>
          {lasterOpp ? "Publiserer..." : "Lag innlegg"}
        </button>
      </div>

      <div className="liste">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Laster innlegg...</p>
          </div>
        ) : (
          innlegg.map((post) => (
            <div key={post.Id} className="post-card">
              <button onClick={() => handleDelete(post.Id)}>Slett</button>
              <h3>{post.Tittel}</h3>
              <p>{post.Innhold}</p>
              {post.BildeUrl && <img src={post.BildeUrl} alt={post.Tittel} />}
              <small>{new Date(post.Tidspunkt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;