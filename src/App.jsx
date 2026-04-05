import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [innlegg, setInnlegg] = useState([]);
  const [nyTittel, setNyTittel] = useState("");
  const [nyttInnhold, setNyttInnhold] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/GetPosts');
      const data = await response.json();
      setInnlegg(data);
    } catch (error) {
      console.error("Klarte ikke hente data:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/deletepost/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
    if (response.ok) {
      fetchPosts();
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
        fetchPosts(); // Last listen på nytt for å se det nye innlegget!
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
      
      <div className="input-container" style={{marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto'}}>
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
        {innlegg.map((post) => (
          <div key={post.Id} className="post-card" style={{border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '8px'}}>
            <button className="absolute top-0 right-0" 
            onClick={() => handleDelete(post.Id)}>Slett</button>
            <h3>{post.Tittel}</h3>
            <p>{post.Innhold}</p>
            <small>{new Date(post.Tidspunkt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App