import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, BookOpen, ShoppingCart, Settings, RefreshCw, Clock,
  ChefHat, Sun, Moon, Plus, CheckCircle2, Circle, X, Search, Edit2,
  Trash2, Save, PlusCircle, ArrowLeft, Home, Users, Copy, LogOut,
  Tag, Filter, Layers, Star, Leaf, Fish, Beef, Zap, Coffee
} from 'lucide-react';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import FoyerScreen from './screens/FoyerScreen';

// =============================================
// CONSTANTES
// =============================================

const RAYONS = [
  { id: 'Fruits & Légumes', label: 'Fruits & Légumes', emoji: '🍎' },
  { id: 'Boucherie/Poissonnerie', label: 'Boucherie/Poissonnerie', emoji: '🥩' },
  { id: 'Crèmerie', label: 'Crèmerie', emoji: '🥛' },
  { id: 'Épicerie salée', label: 'Épicerie salée', emoji: '🥫' },
  { id: 'Épicerie sucrée', label: 'Épicerie sucrée', emoji: '🍬' },
  { id: 'Surgelés', label: 'Surgelés', emoji: '❄️' },
  { id: 'Boissons', label: 'Boissons', emoji: '🥤' },
];

const TAGS = [
  { id: 'Végétarien', label: 'Végétarien', emoji: '🥦', color: 'bg-green-100 text-green-700' },
  { id: 'Viande', label: 'Viande', emoji: '🥩', color: 'bg-red-100 text-red-700' },
  { id: 'Poisson', label: 'Poisson', emoji: '🐟', color: 'bg-blue-100 text-blue-700' },
  { id: 'Léger', label: 'Léger', emoji: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'Confort', label: 'Confort', emoji: '☕', color: 'bg-orange-100 text-orange-700' },
];

const CATEGORIES = ['Marocaine', 'Monde', 'Autre'];

const INITIAL_RECIPES = [
  { id: 'r1', nom: 'Tajine de poulet aux olives', categorie: 'Marocaine', prep_time: 20, cook_time: 45, portions_defaut: 4, tags: ['Viande'], instructions: "Faire revenir les oignons. Ajouter le poulet et les épices. Couvrir d'eau et laisser mijoter 35 min.", ingredients: [{ nom: 'Poulet', quantite: 500, unite: 'g', rayon: 'Boucherie/Poissonnerie' }, { nom: 'Olives vertes', quantite: 100, unite: 'g', rayon: 'Épicerie salée' }, { nom: 'Oignon', quantite: 2, unite: 'pièce', rayon: 'Fruits & Légumes' }] },
  { id: 'r2', nom: 'Kefta à la sauce tomate', categorie: 'Marocaine', prep_time: 15, cook_time: 20, portions_defaut: 4, tags: ['Viande'], instructions: "Préparer des boulettes. Cuire la sauce tomate 10 min. Ajouter les boulettes puis les œufs.", ingredients: [{ nom: 'Viande hachée', quantite: 400, unite: 'g', rayon: 'Boucherie/Poissonnerie' }, { nom: 'Tomates pelées', quantite: 1, unite: 'boîte', rayon: 'Épicerie salée' }, { nom: 'Oeuf', quantite: 4, unite: 'pièce', rayon: 'Crèmerie' }] },
  { id: 'r3', nom: 'Harira marocaine', categorie: 'Marocaine', prep_time: 10, cook_time: 30, portions_defaut: 4, tags: ['Végétarien', 'Léger'], instructions: "Faire revenir oignons et tomates. Ajouter légumes et légumineuses. Couvrir et cuire 25 min.", ingredients: [{ nom: 'Pois chiches', quantite: 200, unite: 'g', rayon: 'Épicerie salée' }, { nom: 'Lentilles', quantite: 100, unite: 'g', rayon: 'Épicerie salée' }, { nom: 'Tomates', quantite: 3, unite: 'pièce', rayon: 'Fruits & Légumes' }] },
  { id: 'r4', nom: 'Curry de lentilles corail', categorie: 'Monde', prep_time: 10, cook_time: 20, portions_defaut: 2, tags: ['Végétarien', 'Léger'], instructions: "Faire revenir l'oignon et la pâte de curry. Ajouter les lentilles. Ajouter le lait de coco.", ingredients: [{ nom: 'Lentilles corail', quantite: 200, unite: 'g', rayon: 'Épicerie salée' }, { nom: 'Lait de coco', quantite: 200, unite: 'ml', rayon: 'Épicerie salée' }, { nom: 'Oignon', quantite: 1, unite: 'pièce', rayon: 'Fruits & Légumes' }] },
  { id: 'r5', nom: 'Poke Bowl Saumon', categorie: 'Monde', prep_time: 15, cook_time: 15, portions_defaut: 2, tags: ['Poisson', 'Léger'], instructions: "Cuire le riz. Mariner le saumon dans la sauce soja. Assembler le tout dans un bol.", ingredients: [{ nom: 'Saumon frais', quantite: 300, unite: 'g', rayon: 'Boucherie/Poissonnerie' }, { nom: 'Avocat', quantite: 1, unite: 'pièce', rayon: 'Fruits & Légumes' }, { nom: 'Riz à sushi', quantite: 200, unite: 'g', rayon: 'Épicerie salée' }] },
  { id: 'r6', nom: 'Pasta aglio e olio', categorie: 'Monde', prep_time: 5, cook_time: 15, portions_defaut: 2, tags: ['Végétarien', 'Confort'], instructions: "Cuire les pâtes al dente. Faire revenir l'ail haché dans l'huile. Mélanger avec les pâtes.", ingredients: [{ nom: 'Spaghetti', quantite: 400, unite: 'g', rayon: 'Épicerie salée' }, { nom: 'Ail', quantite: 4, unite: 'gousse', rayon: 'Fruits & Légumes' }, { nom: 'Persil frais', quantite: 1, unite: 'bouquet', rayon: 'Fruits & Légumes' }] },
  { id: 'r7', nom: 'Omelette au Khlii', categorie: 'Marocaine', prep_time: 5, cook_time: 5, portions_defaut: 2, tags: ['Viande', 'Léger'], instructions: "Réchauffer le Khlii. Casser les œufs par-dessus et brouiller.", ingredients: [{ nom: 'Oeuf', quantite: 4, unite: 'pièce', rayon: 'Crèmerie' }, { nom: 'Khlii', quantite: 100, unite: 'g', rayon: 'Boucherie/Poissonnerie' }] },
];

// =============================================
// HELPER FUNCTIONS
// =============================================

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const formatDateShort = (date) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Aujourd\'hui';
  if (d.toDateString() === tomorrow.toDateString()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
};

const getTagInfo = (tagId) => TAGS.find(t => t.id === tagId) || {};
const getRayonInfo = (rayonId) => RAYONS.find(r => r.id === rayonId) || { emoji: '🛒', label: rayonId };

const generateSmartPlan = (recipes, defaultTimes) => {
  const plan = [];
  const today = new Date();
  const meatTags = ['Viande'];
  let meatCount = 0;

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    const timeLunch = defaultTimes.lunch[dayOfWeek] || 30;
    const timeDinner = defaultTimes.dinner[dayOfWeek] || 60;

    const getValidRecipe = (timeLimit, lastId, avoidMeat = false) => {
      let valid = recipes.filter(r => r.prep_time <= timeLimit && r.id !== lastId);
      if (avoidMeat) {
        const noMeat = valid.filter(r => !r.tags?.some(t => meatTags.includes(t)));
        if (noMeat.length > 0) valid = noMeat;
      }
      if (valid.length === 0) valid = recipes.filter(r => r.prep_time <= timeLimit);
      if (valid.length > 0) return valid[Math.floor(Math.random() * valid.length)];
      return null;
    };

    const lunchRecipe = getValidRecipe(timeLunch, null, meatCount >= 4);
    if (lunchRecipe?.tags?.some(t => meatTags.includes(t))) meatCount++;

    const dinnerRecipe = getValidRecipe(timeDinner, lunchRecipe?.id, meatCount >= 4);
    if (dinnerRecipe?.tags?.some(t => meatTags.includes(t))) meatCount++;

    plan.push({ date, timeLunch, timeDinner, lunchRecipe, dinnerRecipe, isResteMidi: false });
  }
  return plan;
};

// =============================================
// MAIN APP
// =============================================

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [foyer, setFoyer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- APP STATE ---
  const [currentTab, setCurrentTab] = useState('plan');
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [plan, setPlan] = useState([]);
  const [defaultTimes, setDefaultTimes] = useState({
    lunch:  { 1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 30, 0: 45 },
    dinner: { 1: 30, 2: 30, 3: 30, 4: 30, 5: 30, 6: 45, 0: 60 }
  });

  // Modales & formulaires
  const [modalConfig, setModalConfig] = useState(null);
  const [searchRecipe, setSearchRecipe] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Courses
  const [checkedItems, setCheckedItems] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemRayon, setNewItemRayon] = useState('Épicerie salée');

  // Résumé nutritionnel
  const [showNutritionSummary, setShowNutritionSummary] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [coursesSaved, setCoursesSaved] = useState(false);
  const [recipesSaved, setRecipesSaved] = useState(false);

  // =============================================
  // AUTH + FOYER INIT
  // =============================================

  useEffect(() => {
    // onAuthStateChange gère TOUS les cas : session existante, OAuth return, sign in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Event:', event, 'User:', session?.user?.email || 'none');

      if (session?.user) {
        setUser(session.user);
        // Utiliser setTimeout pour éviter un deadlock avec les appels Supabase
        // pendant le callback onAuthStateChange
        setTimeout(() => loadFoyer(session.user.id), 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFoyer(null);
        setAuthLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        // Pas de session au démarrage
        console.log('[Auth] Pas de session active');
        setAuthLoading(false);
      }
    });

    // Nettoyer l'URL après un retour OAuth (les # et ? params)
    if (window.location.hash || window.location.search.includes('code=')) {
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }, 1000);
    }

    return () => subscription.unsubscribe();
  }, []);

  const loadFoyer = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, foyers(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[Foyer] Erreur chargement profil:', error.message);
        // Table profiles n'existe peut-être pas encore - c'est ok
      }

      if (profile?.foyers) {
        setFoyer(profile.foyers);
        if (profile.foyers.settings?.defaultTimes) {
          setDefaultTimes(profile.foyers.settings.defaultTimes);
        }
        await loadRecettes(profile.foyers.id);
        await loadPlanification(profile.foyers.id);
        await loadCourses(profile.foyers.id);
      } else {
        console.log('[Foyer] Pas de foyer associé, affichage écran Foyer');
      }
    } catch (err) {
      console.error('[Foyer] Erreur inattendue:', err);
    }
    setAuthLoading(false);
  };

  const loadRecettes = async (foyerId) => {
    const { data } = await supabase
      .from('recettes')
      .select('*, ingredients(*)')
      .eq('foyer_id', foyerId)
      .order('created_at', { ascending: false });
      
    if (data && data.length > 0) {
      setRecipes(data);
    } else {
      setRecipes(INITIAL_RECIPES); // Optimistic initial render
      for (const recipe of INITIAL_RECIPES) {
        const { data: savedRecette } = await supabase.from('recettes').insert({
          foyer_id: foyerId, nom: recipe.nom, categorie: recipe.categorie,
          prep_time: recipe.prep_time, cook_time: recipe.cook_time,
          portions_defaut: recipe.portions_defaut, tags: recipe.tags,
          instructions: recipe.instructions
        }).select().single();

        if (savedRecette && recipe.ingredients?.length > 0) {
          await supabase.from('ingredients').insert(
            recipe.ingredients.map((ing, i) => ({ 
              recette_id: savedRecette.id, nom: ing.nom, 
              quantite: ing.quantite, unite: ing.unite, 
              rayon: ing.rayon, ordre: i 
            }))
          );
        }
      }
      
      const { data: newData } = await supabase
        .from('recettes')
        .select('*, ingredients(*)')
        .eq('foyer_id', foyerId)
        .order('created_at', { ascending: false });
      if (newData) setRecipes(newData);
    }
  };

  const loadPlanification = async (foyerId) => {
    const { data } = await supabase
      .from('planification')
      .select('*, recettes(*, ingredients(*))')
      .eq('foyer_id', foyerId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(28);

    if (data && data.length > 0) {
      const planMap = {};
      data.forEach(item => {
        const key = item.date;
        if (!planMap[key]) {
          planMap[key] = { date: new Date(item.date), timeLunch: 30, timeDinner: 60, lunchRecipe: null, dinnerRecipe: null, isResteMidi: false };
        }
        if (item.repas_type === 'midi') {
          planMap[key].lunchRecipe = item.recettes;
          planMap[key].isResteMidi = item.is_reste;
        } else {
          planMap[key].dinnerRecipe = item.recettes;
        }
      });
      setPlan(Object.values(planMap));
    } else {
      // Générer un plan local avec les recettes par défaut
      setPlan(generateSmartPlan(INITIAL_RECIPES, { lunch: { 1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 30, 0: 45 }, dinner: { 1: 30, 2: 30, 3: 30, 4: 30, 5: 30, 6: 45, 0: 60 } }));
    }
  };

  const loadCourses = async (foyerId) => {
    const { data } = await supabase
      .from('liste_courses')
      .select('*')
      .eq('foyer_id', foyerId);
    if (data) {
      const checked = {};
      const loadedCustoms = [];
      data.forEach(item => { 
        if (item.ingredient_nom.startsWith('[CUSTOM]')) {
          const nom = item.ingredient_nom.substring(8);
          loadedCustoms.push({ id: item.ingredient_nom, nom, quantite: '', unite: '', rayon: item.rayon || 'Divers', isCustom: true });
        }
        if (item.coche) checked[item.ingredient_nom] = true; 
      });
      setCheckedItems(checked);
      setCustomItems(loadedCustoms);
    }
  };

  // Real-time sync
  useEffect(() => {
    if (!foyer) return;

    const coursesSub = supabase
      .channel('courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'liste_courses', filter: `foyer_id=eq.${foyer.id}` }, () => {
        loadCourses(foyer.id);
      })
      .subscribe();

    const planSub = supabase
      .channel('planification')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planification', filter: `foyer_id=eq.${foyer.id}` }, () => {
        loadPlanification(foyer.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesSub);
      supabase.removeChannel(planSub);
    };
  }, [foyer]);

  // Init plan local si pas connecté
  useEffect(() => {
    if (!user && plan.length === 0) {
      setPlan(generateSmartPlan(INITIAL_RECIPES, defaultTimes));
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // =============================================
  // LOGIQUE PLANIFICATION
  // =============================================

  const handleGeneratePlan = () => {
    const newPlan = generateSmartPlan(recipes, defaultTimes);
    setPlan(newPlan);
    if (foyer) savePlanToSupabase(newPlan, foyer.id);
  };

  const savePlanToSupabase = async (newPlan, foyerId) => {
    const rows = [];
    newPlan.forEach(day => {
      const dateStr = day.date.toISOString().split('T')[0];
      if (day.lunchRecipe) rows.push({ foyer_id: foyerId, date: dateStr, repas_type: 'midi', recette_id: day.lunchRecipe.id, is_reste: day.isResteMidi || false });
      if (day.dinnerRecipe) rows.push({ foyer_id: foyerId, date: dateStr, repas_type: 'soir', recette_id: day.dinnerRecipe.id, is_reste: false });
    });
    await supabase.from('planification').upsert(rows, { onConflict: 'foyer_id,date,repas_type' });
  };

  const handleManualReplace = async (selectedRecipe) => {
    const { dayIndex, mealType } = modalConfig;
    const newPlan = [...plan];
    newPlan[dayIndex][`${mealType === 'lunch' ? 'lunch' : 'dinner'}Recipe`] = selectedRecipe;
    setPlan(newPlan);
    setModalConfig(null);

    if (foyer) {
      const day = newPlan[dayIndex];
      const dateStr = day.date.toISOString().split('T')[0];
      await supabase.from('planification').upsert({
        foyer_id: foyer.id, date: dateStr,
        repas_type: mealType === 'lunch' ? 'midi' : 'soir',
        recette_id: selectedRecipe.id, is_reste: false
      }, { onConflict: 'foyer_id,date,repas_type' });
    }
  };

  const handleRandomReplace = () => {
    const { dayIndex, mealType, availableTime } = modalConfig;
    const current = plan[dayIndex][`${mealType === 'lunch' ? 'lunch' : 'dinner'}Recipe`];
    const valid = recipes.filter(r => r.prep_time <= availableTime && r.id !== current?.id);
    if (valid.length > 0) handleManualReplace(valid[Math.floor(Math.random() * valid.length)]);
  };

  // Mode Restes : cuisiner double le soir pour le midi suivant
  const handleCuisinerDouble = async (dayIndex) => {
    const newPlan = [...plan];
    const dinnerRecipe = newPlan[dayIndex].dinnerRecipe;
    if (!dinnerRecipe || dayIndex + 1 >= newPlan.length) return;

    newPlan[dayIndex + 1].lunchRecipe = { ...dinnerRecipe };
    newPlan[dayIndex + 1].isResteMidi = true;
    setPlan(newPlan);

    if (foyer) {
      const nextDay = newPlan[dayIndex + 1];
      const dateStr = nextDay.date.toISOString().split('T')[0];
      await supabase.from('planification').upsert({
        foyer_id: foyer.id, date: dateStr, repas_type: 'midi',
        recette_id: dinnerRecipe.id, is_reste: true
      }, { onConflict: 'foyer_id,date,repas_type' });
    }
  };

  // =============================================
  // LOGIQUE RECETTES (CRUD)
  // =============================================

  const openRecipeForm = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(JSON.parse(JSON.stringify(recipe)));
    } else {
      setEditingRecipe({
        id: `r_${Date.now()}`,
        nom: '', categorie: 'Marocaine', prep_time: 15, cook_time: 20,
        portions_defaut: 2, tags: [], instructions: '',
        ingredients: [{ nom: '', quantite: '', unite: '', rayon: 'Épicerie salée' }]
      });
    }
    setIsFormOpen(true);
  };

  const saveRecipe = async () => {
    if (!editingRecipe.nom.trim()) return alert("Le nom est obligatoire.");
    const cleanedIngredients = editingRecipe.ingredients.filter(ing => ing.nom.trim() !== '');
    const recipeToSave = { ...editingRecipe, ingredients: cleanedIngredients };

    const existingIndex = recipes.findIndex(r => r.id === recipeToSave.id);
    if (existingIndex >= 0) {
      const updated = [...recipes];
      updated[existingIndex] = recipeToSave;
      setRecipes(updated);
    } else {
      setRecipes([recipeToSave, ...recipes]);
    }

    if (foyer) {
      const { data: savedRecette, error } = await supabase.from('recettes').upsert({
        id: recipeToSave.id.startsWith('r_') ? undefined : recipeToSave.id,
        foyer_id: foyer.id, nom: recipeToSave.nom, categorie: recipeToSave.categorie,
        prep_time: recipeToSave.prep_time, cook_time: recipeToSave.cook_time,
        portions_defaut: recipeToSave.portions_defaut, tags: recipeToSave.tags,
        instructions: recipeToSave.instructions
      }).select().single();

      if (savedRecette && cleanedIngredients.length > 0) {
        await supabase.from('ingredients').delete().eq('recette_id', savedRecette.id);
        await supabase.from('ingredients').insert(
          cleanedIngredients.map((ing, i) => ({ recette_id: savedRecette.id, nom: ing.nom, quantite: ing.quantite, unite: ing.unite, rayon: ing.rayon, ordre: i }))
        );
      }
    }
    setIsFormOpen(false);
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Supprimer cette recette ?")) return;
    setRecipes(recipes.filter(r => r.id !== id));
    if (foyer) {
      await supabase.from('planification').delete().eq('recette_id', id);
      await supabase.from('ingredients').delete().eq('recette_id', id);
      await supabase.from('recettes').delete().eq('id', id);
    }
  };

  const toggleTag = (tagId) => {
    const current = editingRecipe.tags || [];
    setEditingRecipe({
      ...editingRecipe,
      tags: current.includes(tagId) ? current.filter(t => t !== tagId) : [...current, tagId]
    });
  };

  const updateIngredient = (index, field, value) => {
    const newIngs = [...editingRecipe.ingredients];
    newIngs[index][field] = value;
    setEditingRecipe({ ...editingRecipe, ingredients: newIngs });
  };

  // =============================================
  // LOGIQUE COURSES
  // =============================================

  const getShoppingListByRayon = () => {
    const list = {};
    plan.forEach((day) => {
      const repas = [
        { recipe: day.lunchRecipe, isReste: day.isResteMidi },
        { recipe: day.dinnerRecipe, isReste: false }
      ];
      repas.forEach(({ recipe, isReste }) => {
        if (!recipe) return;
        const multiplier = isReste ? 1 : 1;
        recipe.ingredients?.forEach(ing => {
          const key = `${ing.nom.toLowerCase()}_${ing.unite?.toLowerCase()}`;
          const rayon = ing.rayon || 'Épicerie salée';
          if (!list[rayon]) list[rayon] = {};
          if (list[rayon][key]) {
            list[rayon][key].quantite = Number(list[rayon][key].quantite) + Number(ing.quantite) * multiplier;
          } else {
            list[rayon][key] = { nom: ing.nom, quantite: Number(ing.quantite) * multiplier, unite: ing.unite || '', rayon };
          }
        });
      });
    });
    return list;
  };

  const toggleCourse = async (key) => {
    const newChecked = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(newChecked);
    if (foyer) {
      await supabase.from('liste_courses').upsert({
        foyer_id: foyer.id, ingredient_nom: key, coche: newChecked[key],
        quantite: 1, unite: '', rayon: 'Épicerie salée'
      }, { onConflict: 'foyer_id,ingredient_nom' });
    }
  };

  const addCustomItem = async (e) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    
    // Check if duplicate maybe
    const dbKey = `[CUSTOM]${name}`;
    const isDuplicate = customItems.some(i => i.id === dbKey);
    if (isDuplicate) return;

    const newItem = { id: dbKey, nom: name, quantite: '', unite: '', rayon: newItemRayon, isCustom: true };
    setCustomItems([...customItems, newItem]);
    setNewItemName('');

    if (foyer) {
      await supabase.from('liste_courses').upsert({
        foyer_id: foyer.id, 
        ingredient_nom: dbKey, 
        coche: false,
        quantite: 1, 
        unite: '', 
        rayon: newItemRayon
      }, { onConflict: 'foyer_id,ingredient_nom' });
    }
  };

  // =============================================
  // RÉSUMÉ NUTRITIONNEL
  // =============================================

  const getNutritionSummary = () => {
    const counts = { Viande: 0, Poisson: 0, Végétarien: 0, Léger: 0, Confort: 0 };
    plan.forEach(day => {
      [day.lunchRecipe, day.dinnerRecipe].forEach(r => {
        if (!r) return;
        r.tags?.forEach(tag => { if (counts[tag] !== undefined) counts[tag]++; });
      });
    });
    return counts;
  };

  const saveSettings = async () => {
    if (!foyer) return;
    await supabase.from('foyers').update({ temps_defaut_midi: defaultTimes.lunch[1], temps_defaut_soir: defaultTimes.dinner[1] }).eq('id', foyer.id);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // =============================================
  // AUTH GUARDS
  // =============================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ChefHat size={32} className="text-white" />
          </div>
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;
  if (user && !foyer) return <FoyerScreen user={user} onFoyerReady={(f) => { setFoyer(f); loadRecettes(f.id); loadPlanification(f.id); }} />;

  // =============================================
  // RENDU PRINCIPAL
  // =============================================

  const filteredRecipes = recipes.filter(r => {
    const matchSearch = !searchRecipe || r.nom.toLowerCase().includes(searchRecipe.toLowerCase()) || r.categorie.toLowerCase().includes(searchRecipe.toLowerCase());
    const matchTag = !filterTag || r.tags?.includes(filterTag);
    const matchCat = !filterCategory || r.categorie === filterCategory;
    return matchSearch && matchTag && matchCat;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto font-sans">
      {/* Modales */}
      {modalConfig && renderReplaceModal()}
      {isFormOpen && editingRecipe && renderRecipeForm()}

      {/* Header */}
      <header className="bg-white px-4 pt-safe pt-4 pb-3 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-800 text-base leading-none">CuisineFacile</h1>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Home size={10} /> {foyer?.nom}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-700 font-bold text-xs">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'plan' && renderPlanTab()}
        {currentTab === 'recipes' && renderRecipesTab()}
        {currentTab === 'shopping' && renderShoppingTab()}
        {currentTab === 'settings' && renderSettingsTab()}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-100 pb-safe pb-4 pt-2 px-2 flex justify-around">
        {[
          { id: 'plan', icon: Calendar, label: 'Planning' },
          { id: 'recipes', icon: BookOpen, label: 'Recettes' },
          { id: 'shopping', icon: ShoppingCart, label: 'Courses' },
          { id: 'settings', icon: Settings, label: 'Réglages' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${currentTab === tab.id ? 'text-amber-600 bg-amber-50' : 'text-gray-400'}`}
          >
            <tab.icon size={22} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  // =============================================
  // ONGLET PLANNING
  // =============================================

  function renderPlanTab() {
    const summary = getNutritionSummary();
    return (
      <div className="p-4 space-y-4">
        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleGeneratePlan} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm">
            <RefreshCw size={18} /> Générer
          </button>
          <button onClick={() => {
            setPlanSaved(true);
            setTimeout(() => setPlanSaved(false), 2000);
          }} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm">
            <Save size={18} /> {planSaved ? 'Enregistré ✅' : 'Enregistrer'}
          </button>
          <button onClick={() => setShowNutritionSummary(!showNutritionSummary)} className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center hover:bg-green-200 flex-shrink-0">
            <Leaf size={20} />
          </button>
        </div>

        {/* Résumé nutritionnel */}
        {showNutritionSummary && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 text-sm mb-3">Équilibre alimentaire (14j)</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm">🥩 {summary.Viande} viande</span>
              <span className="text-sm">🐟 {summary.Poisson} poisson</span>
              <span className="text-sm">🥦 {summary.Végétarien} végé</span>
              <span className="text-sm">⚡ {summary.Léger} léger</span>
              <span className="text-sm">☕ {summary.Confort} confort</span>
            </div>
            {summary.Viande >= 8 && (
              <p className="text-xs text-orange-600 mt-2 font-medium">⚠️ Beaucoup de viande cette semaine, pensez à équilibrer !</p>
            )}
          </div>
        )}

        {/* Jours */}
        {plan.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-100">
              <h3 className="font-black text-amber-800 capitalize text-sm">{formatDate(day.date)}</h3>
            </div>
            <div className="p-3 space-y-2">
              {/* Déjeuner */}
              <MealCard
                meal={day.lunchRecipe}
                type="lunch"
                isReste={day.isResteMidi}
                timeLimit={day.timeLunch}
                onEdit={() => setModalConfig({ dayIndex, mealType: 'lunch', availableTime: day.timeLunch })}
              />
              {/* Dîner */}
              <MealCard
                meal={day.dinnerRecipe}
                type="dinner"
                timeLimit={day.timeDinner}
                onEdit={() => setModalConfig({ dayIndex, mealType: 'dinner', availableTime: day.timeDinner })}
                onCuisinerDouble={dayIndex < plan.length - 1 ? () => handleCuisinerDouble(dayIndex) : null}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =============================================
  // ONGLET RECETTES
  // =============================================

  function renderRecipesTab() {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 space-y-3 flex-shrink-0">
          {/* Recherche */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchRecipe}
              onChange={e => setSearchRecipe(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => { setFilterTag(''); setFilterCategory(''); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${!filterTag && !filterCategory ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              Tous
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterCategory === cat ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
            {TAGS.map(tag => (
              <button key={tag.id}
                onClick={() => setFilterTag(filterTag === tag.id ? '' : tag.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterTag === tag.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 mt-2">
          {/* Bouton de sauvegarde globale */}
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-2">
            <span className="text-sm font-bold text-gray-700">Votre carnet de recettes</span>
            <button onClick={() => {
              setRecipesSaved(true);
              setTimeout(() => setRecipesSaved(false), 2000);
            }} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors flex items-center gap-2">
              <Save size={14} /> {recipesSaved ? 'Enregistré ✅' : 'Enregistrer'}
            </button>
          </div>

          <button
            onClick={() => openRecipeForm()}
            className="w-full border-2 border-dashed border-amber-300 text-amber-600 font-bold py-4 rounded-2xl hover:bg-amber-50 flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Ajouter une recette
          </button>

          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm">{recipe.nom}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${recipe.categorie === 'Marocaine' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {recipe.categorie}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <Clock size={10} /> {recipe.prep_time}m prép.
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <Users size={10} /> {recipe.portions_defaut || 2} pers.
                    </span>
                    {recipe.tags?.map(tag => {
                      const info = getTagInfo(tag);
                      return <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${info.color}`}>{info.emoji} {info.label}</span>;
                    })}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openRecipeForm(recipe)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteRecipe(recipe.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune recette trouvée</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================
  // ONGLET COURSES
  // =============================================

  function renderShoppingTab() {
    const listByRayon = getShoppingListByRayon();
    const allCustom = [...customItems];
    if (allCustom.length > 0) {
      allCustom.forEach(item => { 
        const r = item.rayon || 'Divers';
        if (!listByRayon[r]) listByRayon[r] = {};
        listByRayon[r][item.id] = item; 
      });
    }

    const orderedRayons = RAYONS.map(r => r.id).filter(r => listByRayon[r]);
    if (listByRayon['Divers']) orderedRayons.push('Divers');

    return (
      <div className="p-4 space-y-4">
        {/* Bouton de sauvegarde globale */}
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-bold text-gray-700">Votre liste de courses</span>
          <button onClick={() => {
            setCoursesSaved(true);
            setTimeout(() => setCoursesSaved(false), 2000);
          }} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors flex items-center gap-2">
            <Save size={14} /> {coursesSaved ? 'Enregistrée ✅' : 'Enregistrer'}
          </button>
        </div>
        
        {/* Ajouter un article */}
        <form onSubmit={addCustomItem} className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un article..."
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={newItemRayon}
            onChange={e => setNewItemRayon(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-2 py-3 text-xs focus:outline-none"
          >
            {RAYONS.map(r => <option key={r.id} value={r.id}>{r.emoji}</option>)}
          </select>
          <button type="submit" className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center hover:bg-amber-600">
            <Plus size={20} />
          </button>
        </form>

        {/* Liste par rayons */}
        {orderedRayons.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Générez un planning pour voir la liste de courses</p>
          </div>
        )}

        {orderedRayons.map(rayonId => {
          const rayonInfo = getRayonInfo(rayonId);
          const items = Object.entries(listByRayon[rayonId] || {});
          const unchecked = items.filter(([key]) => !checkedItems[key]);
          const checked = items.filter(([key]) => checkedItems[key]);

          return (
            <div key={rayonId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-lg">{rayonInfo.emoji}</span>
                <h3 className="font-bold text-gray-700 text-sm">{rayonInfo.label || rayonId}</h3>
                <span className="ml-auto text-xs text-gray-400">{unchecked.length}/{items.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {unchecked.map(([key, item]) => (
                  <ShoppingItem key={key} itemKey={key} item={item} checked={false} onToggle={() => toggleCourse(key)} />
                ))}
                {checked.map(([key, item]) => (
                  <ShoppingItem key={key} itemKey={key} item={item} checked={true} onToggle={() => toggleCourse(key)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // =============================================
  // ONGLET RÉGLAGES
  // =============================================

  function renderSettingsTab() {
    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const TIME_OPTIONS = [15, 30, 45, 60, 90];

    return (
      <div className="p-4 space-y-6">
        {/* Foyer info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2">
            <Home size={18} className="text-amber-500" /> Votre Foyer
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{foyer?.nom}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <p className="text-xs text-gray-500">Code d'invitation</p>
                <p className="font-black text-gray-800 tracking-widest">{foyer?.code_invitation}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(foyer?.code_invitation); }}
                className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center hover:bg-amber-200"
              >
                <Copy size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400">Partagez ce code avec votre partenaire pour synchroniser l'application.</p>
          </div>
        </div>

        {/* Temps disponibles */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-black text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Temps disponible
            </h2>
            <button onClick={saveSettings} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors">
              {settingsSaved ? 'Enregistré ✅' : 'Enregistrer'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Définit les recettes proposées selon votre disponibilité.</p>

          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map(day => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-8 text-xs font-bold text-gray-500">{DAYS[day]}</span>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1"><Sun size={10} /> Midi</p>
                  <select value={defaultTimes.lunch[day]} onChange={e => setDefaultTimes({ ...defaultTimes, lunch: { ...defaultTimes.lunch, [day]: Number(e.target.value) } })} className="w-full border border-gray-200 rounded-lg p-1.5 text-xs bg-white">
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} min</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1"><Moon size={10} /> Soir</p>
                  <select value={defaultTimes.dinner[day]} onChange={e => setDefaultTimes({ ...defaultTimes, dinner: { ...defaultTimes.dinner, [day]: Number(e.target.value) } })} className="w-full border border-gray-200 rounded-lg p-1.5 text-xs bg-white">
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} min</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compte */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2">
            <Users size={18} className="text-amber-500" /> Compte
          </h2>
          <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors">
            <LogOut size={18} /> Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // =============================================
  // MODALE REMPLACEMENT
  // =============================================

  function renderReplaceModal() {
    const isLunch = modalConfig.mealType === 'lunch';
    const filtered = recipes.filter(r =>
      r.nom.toLowerCase().includes(searchRecipe.toLowerCase()) ||
      r.categorie.toLowerCase().includes(searchRecipe.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-gray-900/60 z-50 flex flex-col justify-end sm:justify-center sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col mx-auto shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800">{isLunch ? 'Déjeuner' : 'Dîner'}</h3>
              <p className="text-xs text-gray-500">Temps max : {modalConfig.availableTime} min</p>
            </div>
            <button onClick={() => setModalConfig(null)} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"><X size={20} /></button>
          </div>
          <div className="p-4 flex-shrink-0">
            <button onClick={handleRandomReplace} className="w-full bg-amber-100 text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-200 flex justify-center items-center gap-2 mb-3">
              <RefreshCw size={18} /> Tirer au sort
            </button>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Chercher..." value={searchRecipe} onChange={e => setSearchRecipe(e.target.value)}
                className="w-full bg-gray-100 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="overflow-y-auto p-4 pt-0 space-y-2 flex-grow">
            {filtered.map(recipe => (
              <div key={recipe.id} onClick={() => handleManualReplace(recipe)}
                className="p-3 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50 cursor-pointer flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-gray-800 text-sm">{recipe.nom}</h5>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-500"><Clock size={10} className="inline" /> {recipe.prep_time}m</span>
                    {recipe.tags?.slice(0, 2).map(tag => {
                      const info = getTagInfo(tag);
                      return <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${info.color}`}>{info.emoji}</span>;
                    })}
                  </div>
                </div>
                <Edit2 size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // FORMULAIRE RECETTE
  // =============================================

  function renderRecipeForm() {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="bg-white px-4 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <button onClick={() => setIsFormOpen(false)} className="text-gray-500 flex items-center gap-1">
            <ArrowLeft size={20} /> <span className="font-bold">Retour</span>
          </button>
          <h2 className="font-black text-gray-800">{editingRecipe.nom ? 'Modifier' : 'Nouvelle recette'}</h2>
          <button onClick={saveRecipe} className="text-amber-600 font-bold flex items-center gap-1">
            <Save size={20} /> Sauver
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-5 pb-24 bg-gray-50">
          {/* Infos de base */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom du plat</label>
              <input type="text" value={editingRecipe.nom} onChange={e => setEditingRecipe({ ...editingRecipe, nom: e.target.value })}
                className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-amber-500 font-bold text-gray-800 bg-transparent"
                placeholder="Ex: Tajine aux pruneaux..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
                <select value={editingRecipe.categorie} onChange={e => setEditingRecipe({ ...editingRecipe, categorie: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Portions</label>
                <input type="number" value={editingRecipe.portions_defaut} onChange={e => setEditingRecipe({ ...editingRecipe, portions_defaut: Number(e.target.value) })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" min="1" max="10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ChefHat size={12} /> Prép. (min)</label>
                <input type="number" value={editingRecipe.prep_time} onChange={e => setEditingRecipe({ ...editingRecipe, prep_time: Number(e.target.value) })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Clock size={12} /> Cuisson (min)</label>
                <input type="number" value={editingRecipe.cook_time} onChange={e => setEditingRecipe({ ...editingRecipe, cook_time: Number(e.target.value) })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Tags nutritionnels */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => {
                const active = editingRecipe.tags?.includes(tag.id);
                return (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active ? tag.color + ' border-transparent' : 'bg-white border-gray-200 text-gray-500'}`}>
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingrédients */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase">Ingrédients</label>
              <button type="button" onClick={() => setEditingRecipe({ ...editingRecipe, ingredients: [...editingRecipe.ingredients, { nom: '', quantite: '', unite: '', rayon: 'Épicerie salée' }] })}
                className="text-amber-600 text-xs font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100">
                <PlusCircle size={14} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {editingRecipe.ingredients.map((ing, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nom (ex: Tomate)" value={ing.nom} onChange={e => updateIngredient(idx, 'nom', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
                    <button onClick={() => { const newIngs = editingRecipe.ingredients.filter((_, i) => i !== idx); setEditingRecipe({ ...editingRecipe, ingredients: newIngs }); }}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Qté" value={ing.quantite} onChange={e => updateIngredient(idx, 'quantite', e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
                    <input type="text" placeholder="Unité" value={ing.unite} onChange={e => updateIngredient(idx, 'unite', e.target.value)} list="units"
                      className="w-24 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
                    <select value={ing.rayon} onChange={e => updateIngredient(idx, 'rayon', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500">
                      {RAYONS.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <datalist id="units">
              <option value="g" /><option value="kg" /><option value="ml" /><option value="cl" />
              <option value="pièce" /><option value="c.à.s" /><option value="c.à.c" />
              <option value="bouquet" /><option value="boîte" /><option value="gousse" />
            </datalist>
          </div>

          {/* Instructions */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Instructions</label>
            <textarea value={editingRecipe.instructions} onChange={e => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
              rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              placeholder="Étapes de préparation..." />
          </div>
        </div>
      </div>
    );
  }
}

// =============================================
// SOUS-COMPOSANTS
// =============================================

function MealCard({ meal, type, isReste, timeLimit, onEdit, onCuisinerDouble }) {
  const isLunch = type === 'lunch';
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${isReste ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLunch ? 'bg-yellow-100' : 'bg-indigo-100'}`}>
        {isLunch ? <Sun size={16} className="text-yellow-600" /> : <Moon size={16} className="text-indigo-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-400">{isLunch ? 'Déjeuner' : 'Dîner'}</p>
          {isReste && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Restes ♻️</span>}
        </div>
        {meal ? (
          <>
            <p className="font-bold text-gray-800 text-sm truncate">{meal.nom}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-400"><Clock size={9} className="inline" /> {meal.prep_time}m</span>
              {meal.tags?.slice(0, 2).map(tag => {
                const info = TAGS.find(t => t.id === tag) || {};
                return <span key={tag} className="text-[10px]">{info.emoji}</span>;
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">Aucun repas</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg">
          <Edit2 size={14} />
        </button>
        {!isLunch && onCuisinerDouble && meal && (
          <button onClick={onCuisinerDouble} title="Cuisiner double pour demain midi" className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg text-[10px] font-bold">
            x2
          </button>
        )}
      </div>
    </div>
  );
}

function ShoppingItem({ itemKey, item, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${checked ? 'opacity-50' : ''}`}
    >
      {checked ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-gray-300 flex-shrink-0" />}
      <span className={`flex-1 text-sm font-medium text-gray-700 ${checked ? 'line-through' : ''}`}>{item.nom}</span>
      {item.quantite && (
        <span className="text-xs text-gray-400">{Math.round(Number(item.quantite) * 10) / 10} {item.unite}</span>
      )}
    </div>
  );
}
