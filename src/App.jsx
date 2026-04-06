import React, { useEffect, useState } from "react";
import './App.css';

const API_BASE_URL = "https://web-database-functions-cjhmgbcuh9ajbnb0.westeurope-01.azurewebsites.net/api";

function App() {
  const [innlegg, setInnlegg] = useState([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyttInnhold, setNyttInnhold] = useState("");
  const [loading, setLoading] = useState(true);
  const [valgtFil, setValgtFil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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

  const handleFileChange = (file) => {
    if (!file) return;

    setValgtFil(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setValgtFil(null);
    setPreviewUrl(null);
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
        setPreviewUrl(null);
        fetchPosts(false);
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
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">Mester-Logg v2</h1>

        {/* Skjema */}
        <div className="bg-white p-4 rounded-2xl shadow mb-6">
          <input
            type="text"
            placeholder="Tittel..."
            value={nyTittel}
            onChange={(e) => setNyTittel(e.target.value)}
            className="w-full mb-3 p-2 border rounded-lg"
          />

          <textarea
            placeholder="Hva tenker du på?"
            value={nyttInnhold}
            onChange={(e) => setNyttInnhold(e.target.value)}
            className="w-full mb-3 p-2 border rounded-lg h-24"
          />

          <input
            key={valgtFil ? "valgt" : "tom"}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="mb-3"
          />

          {/* Preview */}
          {previewUrl && (
            <div className="relative mb-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-60 object-cover rounded-xl"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded"
              >
                Fjern
              </button>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={lasterOpp}
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            {lasterOpp ? "Publiserer..." : "Lag innlegg"}
          </button>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center mt-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-3">Laster innlegg...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {innlegg.map((post) => (
              <div
                key={post.Id}
                className="bg-white p-4 rounded-2xl shadow relative"
              >
                <button
                  className="absolute top-2 right-2 text-sm text-red-500"
                  onClick={() => handleDelete(post.Id)}
                >
                  Slett
                </button>

                <h3 className="text-xl font-semibold mb-1">{post.Tittel}</h3>
                <p className="text-gray-700 mb-2">{post.Innhold}</p>

                {post.BildeUrl && (
                  <img
                    src={post.BildeUrl}
                    alt={post.Tittel}
                    className="w-full max-h-60 object-cover rounded-xl mb-2"
                  />
                )}

                <small className="text-gray-400">
                  {new Date(post.Tidspunkt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;