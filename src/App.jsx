import React from "react";
import { useEffect, useState } from 'react'
import './App.css'

// --- VIKTIG: BYTT UT DENNE MED DIN EKTE URL FRA AZURE PORTAL ---
const API_BASE_URL = "https://web-database-functions-cjhmgbcuh9ajbnb0.westeurope-01.azurewebsites.net/api";

function App() {
  const [innlegg, setInnlegg] = useState([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyttInnhold, setNyttInnhold] = useState("");
  const [loading, setLoading] = useState(true);
  const [valgtFil, setValgtFil] = useState(null);
  const [lasterOpp, setLasterOpp] = useState(false); // For å vise en "laster..." melding

  const fetchPosts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      // Bruker nå den fulle URL-en
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
      const response = await fetch(`${API_BASE_URL}/deletepost/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Noe gikk galt ved sletting");

      setInnlegg(prev => prev.filter(post => post.Id !== id));
      fetchPosts(false);

    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
  };

  const handlePublish = async () => {
    if (!nyTittel) return alert("Du må ha en tittel!");
    setLasterOpp(true);

    try {
      let bildeUrl = "";

      // STEG 1: Last opp bilde hvis det er valgt
      if (valgtFil) {
        const formData = new FormData();
        formData.append('file', valgtFil);

        const uploadRes = await fetch(`${API_BASE_URL}/UploadImage`, {
          method: 'POST',
          body: formData // Fetch setter automatisk riktig Content-Type for FormData
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          bildeUrl = data.url; // Dette er URL-en fra Azure Blob Storage
        } else {
          alert("Kunne ikke laste opp bilde.");
          setLasterOpp(false);
          return;
        }
      }

      // STEG 2: Opprett innlegget i SQL
      const postRes = await fetch(`${API_BASE_URL}/CreatePost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Tittel: nyTittel,
          Innhold: nyttInnhold,
          BildeUrl: bildeUrl
        })
      });

      if (postRes.ok) {
        setNyTittel("");
        setNyttInnhold("");
        setValgtFil(null);
        // Nullstill fil-inputen i DOM-en hvis nødvendig
        fetchPosts(false);
      }
    } catch (error) {
      console.error("Feil under publisering:", error);
    } finally {
      setLasterOpp(false);
      <input
        key={valgtFil ? "valgt" : "tom"} // Dette tvinger feltet til å nullstille seg når valgtFil blir null
        type="file"
        accept="image/*"
        onChange={(e) => setValgtFil(e.target.files[0])}
      />
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

        {/* Ny fil-velger */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setValgtFil(e.target.files[0])}
        />

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
            <div key={post.Id} className="post-card" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '8px' }}>
              <button className="absolute top-0 right-0"
                onClick={() => handleDelete(post.Id)}>Slett</button>
              <h3>{post.Tittel}</h3>
              <p>{post.Innhold}</p>
              {post.BildeUrl && (
                <img
                  src={post.BildeUrl}
                  alt={post.Tittel}
                  style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '8px' }}
                />
              )}
              <small>{new Date(post.Tidspunkt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App