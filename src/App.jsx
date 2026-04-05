import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [innlegg, setInnlegg] = useState([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyttInnhold, setNyttInnhold] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchPosts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
  
      const response = await fetch('/api/GetPosts');
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
      const response = await fetch(`/api/deletepost/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error("Noe gikk galt ved sletting");
      }
  
      console.log("Slettet!");
      setInnlegg(prev => prev.filter(post => post.Id !== id));
      fetchPosts(false); // ❌ ingen spinner
  
    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
  };

  const handlePublish = async () => {
    if (!nyTittel) return alert("Du må ha en tittel!");

    try {
      const response = await fetch('/api/CreatePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tittel: nyTittel, Innhold: nyttInnhold, BildeUrl: "" })
      });

      if (response.ok) {
        setNyTittel("");
        setNyttInnhold("");
        fetchPosts(false); // ❌ ingen spinner
        const newPost = await response.json();
setInnlegg(prev => [newPost, ...prev]);
      }
    } catch (error) {
      console.error("Feil ved publisering:", error);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="App">
      <h1>Mester-Logg v2</h1>

      <div className="input-container" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Tittel"
          value={nyTittel}
          onChange={(e) => setNyTittel(e.target.value)}
        />
        <textarea
          placeholder="Hva har du gjort i dag?"
          value={nyttInnhold}
          onChange={(e) => setNyttInnhold(e.target.value)}
        ></textarea>
        <button onClick={handlePublish}>Publiser Innlegg</button>
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
              <small>{new Date(post.Tidspunkt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App