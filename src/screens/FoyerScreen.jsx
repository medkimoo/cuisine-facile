import React, { useState } from 'react';
import { Home, Users, Copy, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FoyerScreen({ user, onFoyerReady }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [foyerName, setFoyerName] = useState('Notre Foyer');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateFoyer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Générer un code unique 8 caractères
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: foyer, error: foyerErr } = await supabase
      .from('foyers')
      .insert({ nom: foyerName, code_invitation: code, created_by: user.id })
      .select()
      .single();

    if (foyerErr) { setError(foyerErr.message); setLoading(false); return; }

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ foyer_id: foyer.id })
      .eq('id', user.id);

    setLoading(false);
    if (profileErr) return setError(profileErr.message);
    onFoyerReady(foyer);
  };

  const handleJoinFoyer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: foyers, error: foyerErr } = await supabase
      .from('foyers')
      .select()
      .eq('code_invitation', inviteCode.trim().toUpperCase());

    if (foyerErr || !foyers?.length) {
      setError('Code invalide. Vérifiez le code partagé par votre partenaire.');
      setLoading(false);
      return;
    }

    const foyer = foyers[0];
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ foyer_id: foyer.id })
      .eq('id', user.id);

    setLoading(false);
    if (profileErr) return setError(profileErr.message);
    onFoyerReady(foyer);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 mx-auto mb-4">
            <Home size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Votre Foyer</h1>
          <p className="text-gray-500 text-sm mt-1">Synchronisez l'app avec votre partenaire</p>
        </div>

        {!mode && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Home size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Créer un Foyer</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Je crée le foyer et j'invite mon partenaire</p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Rejoindre un Foyer</h3>
                  <p className="text-gray-500 text-xs mt-0.5">J'ai un code d'invitation de mon partenaire</p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </div>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <button onClick={() => setMode(null)} className="text-gray-400 text-sm mb-4 hover:text-gray-600">← Retour</button>
            <h2 className="font-black text-gray-800 text-lg mb-4">Créer votre Foyer</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}
            <form onSubmit={handleCreateFoyer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nom du foyer</label>
                <input
                  type="text"
                  value={foyerName}
                  onChange={e => setFoyerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Ex: Maison Karim & Sofia"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer le Foyer'}
              </button>
            </form>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <button onClick={() => setMode(null)} className="text-gray-400 text-sm mb-4 hover:text-gray-600">← Retour</button>
            <h2 className="font-black text-gray-800 text-lg mb-4">Rejoindre un Foyer</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}
            <form onSubmit={handleJoinFoyer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Code d'invitation</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest font-bold text-center text-lg"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Vérification...' : 'Rejoindre le Foyer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
