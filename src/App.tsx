import React, { useState, useMemo, useEffect } from 'react';
import './styles.css';

// --- LANGKAH 1: Impor Firebase ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// --- LANGKAH 2: Masukkan Kunci Rahasiamu ---
// TODO: PASTE FIREBASE CONFIG ANDA DI SINI
Const firebaseConfig = {
  apiKey: "AIzaSyB8OYNfckOHNYIaltUr4-1cKY8hcTL52Cc",
  authDomain: "backend-prompt-studio.firebaseapp.com",
  projectId: "backend-prompt-studio",
  storageBucket: "backend-prompt-studio.firebasestorage.app",
  messagingSenderId: "1061635739260",
  appId: "1:1061635739260:web:2bd7e7d906deee4c4503f9"
};

// --- LANGKAH 3: Inisialisasi Firebase & Firestore ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- Database Bilingual ---
const optionData = {
  style: [
    { id: 'fotorealistis', id_text: 'Fotorealistis', en_text: 'Photorealistic' },
    { id: 'sinematik', id_text: 'Sinematik', en_text: 'Cinematic' },
    { id: 'anime', id_text: 'Anime / Manga', en_text: 'Anime / Manga' },
    { id: 'lukisan_cat_minyak', id_text: 'Lukisan Cat Minyak', en_text: 'Oil Painting' },
    { id: 'seni_digital', id_text: 'Seni Digital', en_text: 'Digital Art' },
    { id: 'fantasi', id_text: 'Fantasi', en_text: 'Fantasy Art' },
    { id: 'cyberpunk', id_text: 'Cyberpunk', en_text: 'Cyberpunk' },
  ],
  lighting: [
    { id: 'golden_hour', id_text: 'Golden Hour', en_text: 'Golden Hour' },
    { id: 'blue_hour', id_text: 'Blue Hour', en_text: 'Blue Hour' },
    { id: 'remang', id_text: 'Remang-remang', en_text: 'Dimly lit' },
    { id: 'neon', id_text: 'Lampu Neon', en_text: 'Neon lighting' },
    { id: 'sinematik_lighting', id_text: 'Pencahayaan Sinematik', en_text: 'Cinematic lighting' },
  ],
  color: [
    { id: 'hangat', id_text: 'Warna Hangat', en_text: 'Warm tones' },
    { id: 'dingin', id_text: 'Warna Dingin', en_text: 'Cool tones' },
    { id: 'pastel', id_text: 'Pastel', en_text: 'Pastel' },
    { id: 'vibrant', id_text: 'Vibrant / Cerah', en_text: 'Vibrant' },
    { id: 'hitam_putih', id_text: 'Hitam Putih', en_text: 'Black and white' },
  ],
  composition: [
    { id: 'close_up', id_text: 'Bidikan Dekat', en_text: 'Close-up' },
    { id: 'medium_shot', id_text: 'Bidikan Setengah Badan', en_text: 'Medium Shot' },
    { id: 'full_shot', id_text: 'Bidikan Seluruh Badan', en_text: 'Full Shot' },
    { id: 'wide_shot', id_text: 'Bidikan Lebar', en_text: 'Wide Shot' },
    { id: 'low_angle', id_text: 'Bidikan Sudut Bawah', en_text: 'Low-Angle Shot' },
    { id: 'high_angle', id_text: 'Bidikan Sudut Atas', en_text: 'High-Angle Shot' },
  ],
  mood: [
    { id: 'ceria', id_text: 'Ceria', en_text: 'Cheerful' },
    { id: 'sedih', id_text: 'Sedih / Melankolis', en_text: 'Sad / Melancholic' },
    { id: 'misterius', id_text: 'Misterius / Gelap', en_text: 'Mysterious / Dark' },
    { id: 'romantis', id_text: 'Romantis', en_text: 'Romantic' },
    { id: 'epik', id_text: 'Epik / Megah', en_text: 'Epic / Majestic' },
  ],
};

// --- FIX TYPESCRIPT (PERBAIKAN ERROR DI SINI) ---
interface Option {
  id: string;
  id_text: string;
  en_text: string;
}

interface OptionButtonProps {
  category: string;
  option: Option;
  selected: boolean;
  onSelect: (category: string, value: string) => void;
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
// ----------------------------------------------

// --- Komponen Tombol Pilihan (dengan Tipe) ---
const OptionButton = ({ category, option, selected, onSelect }: OptionButtonProps) => (
  <button
    className={`option-btn ${selected ? 'selected' : ''}`}
    onClick={() => onSelect(category, option.id)}
  >
    {option.id_text}
  </button>
);

// --- Komponen Input Teks (dengan Tipe) ---
const TextInput = ({ label, value, onChange }: TextInputProps) => (
  <div className="input-section">
    <h4>{label}</h4>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={`Ketik ${label.toLowerCase()} di sini...`}
    />
  </div>
);


// --- Komponen Utama Aplikasi ---
function App() {
  const [isDarkMode, setDarkMode] = useState(false);
  const [activeLang, setActiveLang] = useState('id');
  const [activeTab, setActiveTab] = useState('generator');

  // State untuk input
  const [subject, setSubject] = useState('');
  const [background, setBackground] = useState('');
  const [selectedStyle, setStyle] = useState<string | null>(null);
  const [selectedLighting, setLighting] = useState<string | null>(null);
  const [selectedColor, setColor] = useState<string | null>(null);
  const [selectedComp, setComp] = useState<string | null>(null);
  const [selectedMood, setMood] = useState<string | null>(null);
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk update state tombol
  const handleSelect = (category: string, value: string) => {
    type CategoryKey = 'style' | 'lighting' | 'color' | 'composition' | 'mood';
    
    const setters = {
      style: setStyle,
      lighting: setLighting,
      color: setColor,
      composition: setComp,
      mood: setMood,
    };
    
    if (category in setters) {
      setters[category as CategoryKey]((prev) => (prev === value ? null : value));
    }
  };
  
  // --- Mesin Perakit Kalimat ---
  const generatedPrompts = useMemo(() => {
    const findText = (category: string, id: string | null) => {
      if (!id) return null;
      type OptionDataKey = keyof typeof optionData;
      const data = optionData[category as OptionDataKey];
      if (!data) return null;
      
      const item = data.find((opt: Option) => opt.id === id);
      return item ? { id: item.id_text, en: item.en_text } : null;
    };
    
    const style = findText('style', selectedStyle);
    const lighting = findText('lighting', selectedLighting);
    const color = findText('color', selectedColor);
    const comp = findText('composition', selectedComp);
    const mood = findText('mood', selectedMood);
    
    let prompt_id = comp ? `Sebuah ${comp.id}` : 'Sebuah gambar';
    prompt_id += style ? ` ${style.id}` : '';
    prompt_id += subject ? ` dari ${subject}` : '';
    prompt_id += background ? ` ${background ? `di ${background}` : ''}` : '';
    prompt_id += lighting ? `, dengan ${lighting.id}` : '';
    prompt_id += color ? ` dan ${color.id}` : '';
    prompt_id += mood ? `, dalam ${mood.id}` : '';
    prompt_id += '.';
    
    let prompt_en = comp ? `A ${comp.en}` : 'An image';
    prompt_en += style ? ` ${style.en} style` : '';
    prompt_en += subject ? ` of ${subject}` : '';
    prompt_en += background ? ` ${background ? `on ${background}` : ''}` : '';
    prompt_en += lighting ? `, with ${lighting.en}` : '';
    prompt_en += color ? ` and ${color.en}` : '';
    prompt_en += mood ? `, in a ${mood.en} mood` : '';
    prompt_en += '.';
    
    if (!subject && !background && !style && !lighting && !color && !comp && !mood) {
      return { id: 'Pilih opsi di atas untuk membuat prompt...', en: 'Select options above to build a prompt...' };
    }
    return { id: prompt_id, en: prompt_en };
  }, [subject, background, selectedStyle, selectedLighting, selectedColor, selectedComp, selectedMood]);

  // Fungsi Reset
  const handleReset = () => {
    setSubject('');
    setBackground('');
    setStyle(null);
    setLighting(null);
    setColor(null);
    setComp(null);
    setMood(null);
  };
  
  // Fungsi Salin
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Prompt disalin!');
    }).catch(err => {
      console.error('Gagal menyalin: ', err);
    });
  };
  
  // --- Simpan ke Firebase ---
  const handleSave = async () => {
    if (generatedPrompts.id.startsWith('Pilih opsi')) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "prompts"), {
        prompt_id: generatedPrompts.id,
        prompt_en: generatedPrompts.en,
        createdAt: new Date()
      });
      alert('Prompt berhasil disimpan ke database!');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Gagal menyimpan ke database. Cek console.');
    }
    setIsLoading(false);
  };
  
  // --- Ambil data Favorit dari Firebase ---
  const fetchFavorites = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "prompts"));
    const favsList: any[] = [];
    querySnapshot.forEach((doc) => {
      favsList.push({ ...doc.data(), id: doc.id });
    });
    setFavorites(favsList);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (activeTab === 'favorit') {
      fetchFavorites();
    }
  }, [activeTab]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <h1>BackEnd Prompt Studio</h1>
        <button onClick={() => setDarkMode(!isDarkMode)} className="mode-toggle">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <nav className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'generator' ? 'active' : ''}`} onClick={() => setActiveTab('generator')}>
          🚀 GENERATOR
        </button>
        <button className={`nav-tab ${activeTab === 'favorit' ? 'active' : ''}`} onClick={() => setActiveTab('favorit')}>
          ⭐ FAVORIT
        </button>
      </nav>

      {/* --- Tampilan Tab Generator --- */}
      {activeTab === 'generator' && (
        <>
          <main className="generator-body">
            <TextInput label="Subjek Utama" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <TextInput label="Latar Belakang" value={background} onChange={(e) => setBackground(e.target.value)} />

            <div className="input-section"><h4>Pilih Gaya Visual</h4><div className="option-buttons">{optionData.style.map((opt) => (<OptionButton key={opt.id} category="style" option={opt} selected={selectedStyle === opt.id} onSelect={handleSelect} />))}</div></div>
            <div className="input-section"><h4>Pilih Pencahayaan</h4><div className="option-buttons">{optionData.lighting.map((opt) => (<OptionButton key={opt.id} category="lighting" option={opt} selected={selectedLighting === opt.id} onSelect={handleSelect} />))}</div></div>
            <div className="input-section"><h4>Pilih Palet Warna</h4><div className="option-buttons">{optionData.color.map((opt) => (<OptionButton key={opt.id} category="color" option={opt} selected={selectedColor === opt.id} onSelect={handleSelect} />))}</div></div>
            <div className="input-section"><h4>Pilih Komposisi</h4><div className="option-buttons">{optionData.composition.map((opt) => (<OptionButton key={opt.id} category="composition" option={opt} selected={selectedComp === opt.id} onSelect={handleSelect} />))}</div></div>
            <div className="input-section"><h4>Pilih Mood</h4><div className="option-buttons">{optionData.mood.map((opt) => (<OptionButton key={opt.id} category="mood" option={opt} selected={selectedMood === opt.id} onSelect={handleSelect} />))}</div></div>
          </main>

          <footer className="output-area">
            <h3>🌟 Hasil Prompt Anda 🌟</h3>
            <div className="lang-tabs">
              <button className={`lang-tab ${activeLang === 'id' ? 'active' : ''}`} onClick={() => setActiveLang('id')}>ID</button>
              <button className={`lang-tab ${activeLang === 'en' ? 'active' : ''}`} onClick={() => setActiveLang('en')}>EN</button>
            </div>
            
            <div className="prompt-result">
              <p>{activeLang === 'id' ? generatedPrompts.id : generatedPrompts.en}</p>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn save" onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : '❤️ Simpan'}
              </button>
              <button className="action-btn copy" onClick={() => handleCopy(activeLang === 'id' ? generatedPrompts.id : generatedPrompts.en)}>📋 Salin</button>
              <button className="action-btn reset" onClick={handleReset}>🔄 Reset</button>
            </div>
          </footer>
        </>
      )}
      
      {/* --- Tampilan Tab Favorit --- */}
      {activeTab === 'favorit' && (
        <main className="favorites-body">
          {isLoading && <p>Memuat favorit...</p>}
          {!isLoading && favorites.length === 0 && (
            <p>Belum ada prompt yang disimpan.</p>
          )}
          {!isLoading && favorites.length > 0 && (
            <ul className="favorites-list">
              {favorites.map(fav => (
                <li key={fav.id} className="favorite-item">
                  <p className="fav-prompt-text">{fav.prompt_id}</p>
                  <div className="fav-actions">
                    <button onClick={() => handleCopy(fav.prompt_id)}>Salin ID</button>
                    <button onClick={() => handleCopy(fav.prompt_en)}>Salin EN</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

    </div>
  );
}

export default App;


      
