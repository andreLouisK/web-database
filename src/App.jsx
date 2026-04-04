import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [innlegg, setInnlegg] = useState([]);

  // Denne funksjonen skal vi koble til Azure Function senere
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/GetPosts');
      const data = await response.json();
      setInnlegg(data);
    } catch (error) {
      console.error("Klarte ikke hente data:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="App">
      <h1>Mester-Logg v2</h1>
      
      <div className="w-20 h-20 bg-red-500">
        <input type="text" placeholder="Tittel" id="tittel" />
        <textarea placeholder="Innhold"></textarea>
        <input type="file" accept="image/*" />
        <button>Publiser Innlegg</button>
      </div>

      <div className="liste">
        {innlegg.map((post) => (
          <div key={post.Id} className="post-card">
            {post.BildeUrl && <img src={post.BildeUrl} alt={post.Tittel} style={{width: '200px'}} />}
            <h3>{post.Tittel}</h3>
            <p>{post.Innhold}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App