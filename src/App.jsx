import React, { useState, useEffect } from 'react';
import {
  Calendar, BookOpen, ShoppingCart, Settings, RefreshCw, Clock,
  ChefHat, Sun, Moon, Plus, CheckCircle2, Circle, X, Search, Edit2,
  Trash2, Save, PlusCircle, ArrowLeft
} from 'lucide-react';

// --- BASE DE DONNÉES INITIALE (Mock) ---
const INITIAL_RECIPES = [
  {
    id: 'r1',
    name: 'Tajine de poulet aux olives',
    category: 'Marocaine',
    prepTime: 20,
    cookTime: 45,
    ingredients: [
      { name: 'Poulet', quantity: 500, unit: 'g' },
      { name: 'Olives vertes', quantity: 100, unit: 'g' },
      { name: 'Citron confit', quantity: 1, unit: 'pièce' },
      { name: 'Oignon', quantity: 2, unit: 'pièce' }
    ],
    instructions: "Faire revenir les oignons. Ajouter le poulet et les épices. Couvrir d'eau et laisser mijoter 35 min. Ajouter olives et citron en fin de cuisson."
  },
  {
    id: 'r2',
    name: 'Kefta à la sauce tomate et œufs',
    category: 'Marocaine',
    prepTime: 15,
    cookTime: 20,
    ingredients: [
      { name: 'Viande hachée', quantity: 400, unit: 'g' },
      { name: 'Tomates pelées', quantity: 1, unit: 'boîte' },
      { name: 'Oeuf', quantity: 4, unit: 'pièce' },
      { name: 'Oignon', quantity: 1, unit: 'pièce' }
    ],
    instructions: "Préparer des boulettes avec la viande et les épices. Cuire la sauce tomate 10 min. Ajouter les boulettes (5 min) puis casser les œufs par-dessus."
  },
  {
    id: 'r3',
    name: 'Harira soupe marocaine',
    category: 'Marocaine',
    prepTime: 10,
    cookTime: 30,
    ingredients: [
      { name: 'Pois chiches', quantity: 200, unit: 'g' },
      { name: 'Lentilles', quantity: 100, unit: 'g' },
      { name: 'Tomates', quantity: 3, unit: 'pièce' },
      { name: 'Céleri', quantity: 2, unit: 'branche' }
    ],
    instructions: "Faire revenir oignons et tomates. Ajouter légumes et légumineuses. Couvrir et cuire 25 min. Ajouter du citron en fin de cuisson."
  },
  {
    id: 'r4',
    name: 'Curry de lentilles corail',
    category: 'Monde',
    prepTime: 10,
    cookTime: 20,
    ingredients: [
      { name: 'Lentilles corail', quantity: 200, unit: 'g' },
      { name: 'Lait de coco', quantity: 200, unit: 'ml' },
      { name: 'Pâte de curry', quantity: 1, unit: 'c.à.s' },
      { name: 'Oignon', quantity: 1, unit: 'pièce' }
    ],
    instructions: "Faire revenir l'oignon et la pâte de curry. Ajouter les lentilles et couvrir d'eau. Cuire 15 min. Ajouter le lait de coco et chauffer 5 min."
  },
  {
    id: 'r5',
    name: 'Poke Bowl Saumon Avocat',
    category: 'Monde',
    prepTime: 15,
    cookTime: 15,
    ingredients: [
      { name: 'Saumon frais', quantity: 300, unit: 'g' },
      { name: 'Avocat', quantity: 1, unit: 'pièce' },
      { name: 'Riz à sushi', quantity: 200, unit: 'g' },
      { name: 'Sauce soja', quantity: 3, unit: 'c.à.s' }
    ],
    instructions: "Cuire le riz. Couper le saumon en dés et mariner dans la sauce soja. Couper l'avocat. Assembler le tout dans un bol."
  },
  {
    id: 'r6',
    name: 'Pasta aglio e olio',
    category: 'Monde',
    prepTime: 5,
    cookTime: 15,
    ingredients: [
      { name: 'Spaghetti', quantity: 400, unit: 'g' },
      { name: 'Ail', quantity: 4, unit: 'gousse' },
      { name: 'Huile d\'olive', quantity: 5, unit: 'c.à.s' },
      { name: 'Persil frais', quantity: 1, unit: 'bouquet' }
    ],
    instructions: "Cuire les pâtes al dente. Faire revenir l'ail haché dans l'huile sans brûler. Mélanger avec les pâtes et parsemer de persil."
  },
  {
    id: 'r7',
    name: 'Salade César express',
    category: 'Autre',
    prepTime: 10,
    cookTime: 0,
    ingredients: [
      { name: 'Laitue romaine', quantity: 1, unit: 'pièce' },
      { name: 'Parmesan', quantity: 50, unit: 'g' },
      { name: 'Croûtons', quantity: 100, unit: 'g' },
      { name: 'Sauce César', quantity: 3, unit: 'c.à.s' }
    ],
    instructions: "Couper la laitue. Ajouter les croûtons, le parmesan râpé et la sauce César. Mélanger délicatement et servir immédiatement."
  },
  {
    id: 'r8',
    name: 'Omelette au Khlii',
    category: 'Marocaine',
    prepTime: 5,
    cookTime: 5,
    ingredients: [
      { name: 'Oeuf', quantity: 4, unit: 'pièce' },
      { name: 'Khlii (viande séchée)', quantity: 100, unit: 'g' }
    ],
    instructions: "Réchauffer le Khlii dans une poêle pour faire fondre la graisse. Casser les œufs par-dessus et brouiller légèrement. Servir avec du pain."
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('plan');

  // --- ETATS GLOBAUX ---
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [plan, setPlan] = useState([]);

  // Paramètres : Temps disponible
  const [defaultTimes, setDefaultTimes] = useState({
    lunch:  { 1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 30, 0: 45 },
    dinner: { 1: 30, 2: 30, 3: 30, 4: 30, 5: 30, 6: 45, 0: 60 }
  });

  // États des Modales & Formulaires
  const [modalConfig, setModalConfig] = useState(null);
  const [searchRecipe, setSearchRecipe] = useState('');

  // Éditeur de recette
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Courses
  const [checkedItems, setCheckedItems] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');

  // Initialisation du plan au chargement
  useEffect(() => {
    generateSmartPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIQUE METIER : PLANIFICATION ---
  const generateSmartPlan = (times = defaultTimes) => {
    const newPlan = [];
    const today = new Date();
    let lastRecipeId = null;

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const timeLunch  = times.lunch[dayOfWeek];
      const timeDinner = times.dinner[dayOfWeek];

      const getValidRecipe = (timeLimit, lastId) => {
        let valid = recipes.filter(r => r.prepTime <= timeLimit && r.id !== lastId);
        if (valid.length === 0) valid = recipes.filter(r => r.prepTime <= timeLimit);
        if (valid.length > 0) return valid[Math.floor(Math.random() * valid.length)];
        return null;
      };

      const lunchRecipe  = getValidRecipe(timeLunch, lastRecipeId);
      lastRecipeId = lunchRecipe ? lunchRecipe.id : lastRecipeId;

      const dinnerRecipe = getValidRecipe(timeDinner, lastRecipeId);
      lastRecipeId = dinnerRecipe ? dinnerRecipe.id : lastRecipeId;

      newPlan.push({
        id: `day-${i}`,
        date: date,
        timeLunch,
        timeDinner,
        lunchRecipe,
        dinnerRecipe
      });
    }

    setPlan(newPlan);
  };

  const handleRandomReplace = () => {
    const { dayIndex, mealType, availableTime } = modalConfig;
    const currentRecipe = plan[dayIndex][`${mealType}Recipe`];
    const validRecipes = recipes.filter(r => r.prepTime <= availableTime && r.id !== currentRecipe?.id);

    if (validRecipes.length > 0) {
      handleManualReplace(validRecipes[Math.floor(Math.random() * validRecipes.length)]);
    } else {
      alert("Pas d'autre recette assez rapide dans votre catalogue pour ce temps imparti !");
    }
  };

  const handleManualReplace = (selectedRecipe) => {
    const { dayIndex, mealType } = modalConfig;
    const newPlan = [...plan];
    newPlan[dayIndex][`${mealType}Recipe`] = selectedRecipe;
    setPlan(newPlan);
    setModalConfig(null);
  };

  // --- LOGIQUE METIER : RECETTES (CRUD) ---
  const openRecipeForm = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(JSON.parse(JSON.stringify(recipe)));
    } else {
      setEditingRecipe({
        id: `r_${Date.now()}`,
        name: '',
        category: 'Marocaine',
        prepTime: 15,
        cookTime: 20,
        ingredients: [{ name: '', quantity: '', unit: '' }],
        instructions: ''
      });
    }
    setIsFormOpen(true);
  };

  const saveRecipe = () => {
    if (!editingRecipe.name.trim()) return alert("Le nom de la recette est obligatoire.");
    const cleanedIngredients = editingRecipe.ingredients.filter(ing => ing.name.trim() !== '');
    const recipeToSave = { ...editingRecipe, ingredients: cleanedIngredients };
    const existingIndex = recipes.findIndex(r => r.id === recipeToSave.id);

    if (existingIndex >= 0) {
      const updatedRecipes = [...recipes];
      updatedRecipes[existingIndex] = recipeToSave;
      setRecipes(updatedRecipes);
    } else {
      setRecipes([recipeToSave, ...recipes]);
    }
    setIsFormOpen(false);
  };

  const deleteRecipe = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette recette ?")) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const updateIngredient = (index, field, value) => {
    const newIngs = [...editingRecipe.ingredients];
    newIngs[index][field] = value;
    setEditingRecipe({ ...editingRecipe, ingredients: newIngs });
  };

  const addIngredientField = () => {
    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const removeIngredientField = (index) => {
    const newIngs = editingRecipe.ingredients.filter((_, i) => i !== index);
    setEditingRecipe({ ...editingRecipe, ingredients: newIngs });
  };

  // --- LOGIQUE METIER : COURSES ---
  const getBaseShoppingList = () => {
    const list = {};
    plan.forEach((day, index) => {
      [day.lunchRecipe, day.dinnerRecipe].forEach(recipe => {
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            const key = `gen_${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`;
            if (list[key]) {
              list[key].quantity = Number(list[key].quantity) + Number(ing.quantity);
            } else {
              list[key] = { id: key, name: ing.name, quantity: ing.quantity, unit: ing.unit, isCustom: false, firstUsedIndex: index };
            }
          });
        }
      });
    });
    return Object.values(list);
  };

  const addCustomItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setCustomItems([...customItems, {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      quantity: '',
      unit: '',
      isCustom: true
    }]);
    setNewItemName('');
  };

  // --- COMPOSANTS DE VUE ---

  // 1. Modale de remplacement de repas (Plan)
  const renderReplaceModal = () => {
    if (!modalConfig) return null;
    const isLunch = modalConfig.mealType === 'lunch';
    const currentMealName = isLunch ? 'Déjeuner' : 'Dîner';
    const filteredRecipes = recipes.filter(r =>
      r.name.toLowerCase().includes(searchRecipe.toLowerCase()) ||
      r.category.toLowerCase().includes(searchRecipe.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex flex-col justify-end sm:justify-center sm:p-4 animate-in fade-in">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col mx-auto shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800">Modifier le {currentMealName}</h3>
              <p className="text-xs text-gray-500">Temps max. configuré : {modalConfig.availableTime} min</p>
            </div>
            <button
              onClick={() => setModalConfig(null)}
              className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-shrink-0">
            <button
              onClick={handleRandomReplace}
              className="w-full bg-amber-100 text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-200 transition-colors flex justify-center items-center gap-2 mb-4"
            >
              <RefreshCw size={20} /> Tirer au sort
            </button>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher une recette..."
                value={searchRecipe}
                onChange={(e) => setSearchRecipe(e.target.value)}
                className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-4 pt-0 space-y-2 flex-grow">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Choisir manuellement</h4>
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => handleManualReplace(recipe)}
                className="p-3 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h5 className="font-bold text-gray-800 text-sm">{recipe.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${recipe.category === 'Marocaine' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {recipe.category}
                    </span>
                    <span className={`text-[10px] font-medium flex items-center ${recipe.prepTime > modalConfig.availableTime ? 'text-red-500' : 'text-gray-500'}`}>
                      <ChefHat size={12} className="mr-1" /> {recipe.prepTime}m
                    </span>
                  </div>
                </div>
                <Edit2 size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. Modale Éditeur de Recette (Pleine page)
  const renderRecipeForm = () => {
    if (!isFormOpen || !editingRecipe) return null;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-4">
        <div className="bg-white px-4 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setIsFormOpen(false)}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            <ArrowLeft size={20} /> <span className="font-bold">Retour</span>
          </button>
          <h2 className="font-black text-gray-800 text-lg">
            {editingRecipe.name ? 'Modifier' : 'Nouvelle Recette'}
          </h2>
          <button
            onClick={saveRecipe}
            className="text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1"
          >
            <Save size={20} /> Enregistrer
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-24 bg-gray-50">
          {/* Infos de base */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom du plat</label>
              <input
                type="text"
                value={editingRecipe.name}
                onChange={e => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-amber-500 font-bold text-gray-800"
                placeholder="Ex: Tajine aux pruneaux..."
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
                <select
                  value={editingRecipe.category}
                  onChange={e => setEditingRecipe({ ...editingRecipe, category: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Marocaine">Marocaine</option>
                  <option value="Monde">Monde</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <ChefHat size={14} /> Prép. (min)
                </label>
                <input
                  type="number"
                  value={editingRecipe.prepTime}
                  onChange={e => setEditingRecipe({ ...editingRecipe, prepTime: Number(e.target.value) })}
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Clock size={14} /> Cuisson (min)
                </label>
                <input
                  type="number"
                  value={editingRecipe.cookTime}
                  onChange={e => setEditingRecipe({ ...editingRecipe, cookTime: Number(e.target.value) })}
                  className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ingrédients */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase">Ingrédients</label>
              <button
                onClick={addIngredientField}
                className="text-amber-600 text-xs font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100"
              >
                <PlusCircle size={14} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {editingRecipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nom (ex: Tomate)"
                    value={ing.name}
                    onChange={e => updateIngredient(idx, 'name', e.target.value)}
                    className="w-1/2 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    value={ing.quantity}
                    onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                    className="w-1/4 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unité"
                    value={ing.unit}
                    onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                    className="w-1/4 border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                    list="units"
                  />
                  <datalist id="units">
                    <option value="g" />
                    <option value="kg" />
                    <option value="ml" />
                    <option value="cl" />
                    <option value="pièce" />
                    <option value="c.à.s" />
                    <option value="c.à.c" />
                  </datalist>
                  <button
                    onClick={() => removeIngredientField(idx)}
                    className="p-2 text-gray-300 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Instructions de préparation</label>
            <textarea
              value={editingRecipe.instructions || ''}
              onChange={e => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none h-32 resize-none"
              placeholder="Étape 1 : ..."
            />
          </div>
        </div>
      </div>
    );
  };

  // --- VUES PRINCIPALES (ONGLETS) ---

  const renderPlan = () => (
    <div className="space-y-4 pb-24">
      <div className="bg-amber-100 p-4 rounded-xl text-amber-900 shadow-sm mb-4">
        <h2 className="font-bold flex items-center gap-2">
          <Clock size={20} /> Menu des 14 jours
        </h2>
        <p className="text-sm mt-1 opacity-80">
          Généré depuis vos {recipes.length} recettes. Cliquez sur un repas pour le modifier.
        </p>
      </div>

      {plan.map((day, index) => (
        <div key={day.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-black text-gray-800 uppercase text-sm tracking-wide">
            {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day.date.getDay()]} {day.date.getDate()}
          </div>

          {/* Déjeuner */}
          <div
            onClick={() => setModalConfig({ dayIndex: index, mealType: 'lunch', availableTime: day.timeLunch })}
            className="p-3 border-b border-gray-50 flex items-start gap-3 hover:bg-gray-50 cursor-pointer group"
          >
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg flex-shrink-0">
              <Sun size={20} />
            </div>
            <div className="flex-grow min-w-0 pt-0.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex justify-between">
                <span>Déjeuner</span>
                <span>{day.timeLunch}m max</span>
              </div>
              {day.lunchRecipe
                ? <p className="font-bold text-gray-800 text-sm truncate">{day.lunchRecipe.name}</p>
                : <p className="text-sm text-gray-400 italic">Aucune recette</p>
              }
            </div>
          </div>

          {/* Dîner */}
          <div
            onClick={() => setModalConfig({ dayIndex: index, mealType: 'dinner', availableTime: day.timeDinner })}
            className="p-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer group"
          >
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg flex-shrink-0">
              <Moon size={20} />
            </div>
            <div className="flex-grow min-w-0 pt-0.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 flex justify-between">
                <span>Dîner</span>
                <span>{day.timeDinner}m max</span>
              </div>
              {day.dinnerRecipe
                ? <p className="font-bold text-gray-800 text-sm truncate">{day.dinnerRecipe.name}</p>
                : <p className="text-sm text-gray-400 italic">Aucune recette</p>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecipesList = () => (
    <div className="space-y-4 pb-24">
      <div className="bg-blue-100 p-4 rounded-xl text-blue-900 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <BookOpen size={20} /> Votre Catalogue
          </h2>
          <p className="text-sm mt-1 opacity-80">{recipes.length} recettes disponibles.</p>
        </div>
        <button
          onClick={() => openRecipeForm()}
          className="bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative group">
            <div className="pr-16">
              <h3 className="font-bold text-gray-800 leading-tight mb-2">{recipe.name}</h3>
              <div className="flex gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${recipe.category === 'Marocaine' ? 'bg-orange-100 text-orange-700' : recipe.category === 'Monde' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {recipe.category}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                  <ChefHat size={12} className="mr-1" /> Prép: {recipe.prepTime}m
                </span>
              </div>
            </div>
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <button
                onClick={() => openRecipeForm(recipe)}
                className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteRecipe(recipe.id)}
                className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 border border-gray-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShopping = () => {
    const allItems = [...getBaseShoppingList(), ...customItems].sort((a, b) => {
      const idxA = a.firstUsedIndex !== undefined ? a.firstUsedIndex : -1;
      const idxB = b.firstUsedIndex !== undefined ? b.firstUsedIndex : -1;
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

    const uncheckedList = allItems.filter(item => !checkedItems[item.id]);
    const checkedList   = allItems.filter(item =>  checkedItems[item.id]);

    return (
      <div className="space-y-4 pb-24">
        <div className="bg-emerald-100 p-4 rounded-xl text-emerald-900 shadow-sm mb-2">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Liste de courses
          </h2>
          <p className="text-sm mt-1 opacity-80">Générée depuis votre menu des 14 jours.</p>
        </div>

        <form onSubmit={addCustomItem} className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un article hors recette..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-grow border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700">
            <Plus size={20} />
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {uncheckedList.map((item) => (
              <li key={item.id} className="p-3 hover:bg-gray-50 flex items-center gap-3 group">
                <button
                  onClick={() => setCheckedItems(p => ({ ...p, [item.id]: !p[item.id] }))}
                  className="text-gray-300 hover:text-emerald-500"
                >
                  <Circle size={24} />
                </button>
                <div className="flex-grow flex flex-col">
                  <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                  {item.firstUsedIndex !== undefined && item.firstUsedIndex >= 0 && plan[item.firstUsedIndex] && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      Prévu pour {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][plan[item.firstUsedIndex].date.getDay()]}
                      <strong className={item.firstUsedIndex < 7 ? "text-emerald-600 ml-1 font-bold" : "text-gray-400 ml-1 font-normal"}>
                        {item.firstUsedIndex < 7 ? '(Cette sem.)' : '(Sem. pro.)'}
                      </strong>
                    </span>
                  )}
                </div>
                {item.quantity && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {item.quantity} {item.unit !== 'pièce' ? item.unit : ''}
                  </span>
                )}
                {item.isCustom && (
                  <button
                    onClick={() => {
                      setCustomItems(customItems.filter(i => i.id !== item.id));
                      const n = { ...checkedItems };
                      delete n[item.id];
                      setCheckedItems(n);
                    }}
                    className="text-gray-300 hover:text-red-500 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {checkedList.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 pb-2 rounded-b-xl">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase p-3 pb-1">Articles cochés</h4>
              <ul className="divide-y divide-gray-100">
                {checkedList.map((item) => (
                  <li key={item.id} className="p-3 flex items-center gap-3 opacity-50">
                    <button
                      onClick={() => setCheckedItems(p => ({ ...p, [item.id]: !p[item.id] }))}
                      className="text-emerald-500"
                    >
                      <CheckCircle2 size={24} />
                    </button>
                    <span className="font-medium text-gray-600 text-sm line-through flex-grow">{item.name}</span>
                    {item.isCustom && (
                      <button
                        onClick={() => setCustomItems(customItems.filter(i => i.id !== item.id))}
                        className="text-gray-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const keys = [1, 2, 3, 4, 5, 6, 0];

    const handleTimeChange = (meal, key, value) =>
      setDefaultTimes(prev => ({
        ...prev,
        [meal]: { ...prev[meal], [key]: parseInt(value) || 0 }
      }));

    return (
      <div className="space-y-4 pb-24">
        <div className="bg-gray-100 p-4 rounded-xl text-gray-800 shadow-sm mb-2">
          <h2 className="font-bold flex items-center gap-2">
            <Settings size={20} /> Temps disponibles
          </h2>
          <p className="text-sm mt-1 opacity-70">Configurez votre temps de préparation par jour.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            <div className="w-1/3 p-3">Jour</div>
            <div className="w-1/3 p-3 text-center border-l border-gray-100 flex justify-center items-center gap-1">
              <Sun size={12} /> Midi (m)
            </div>
            <div className="w-1/3 p-3 text-center border-l border-gray-100 flex justify-center items-center gap-1">
              <Moon size={12} /> Soir (m)
            </div>
          </div>
          {days.map((day, idx) => {
            const dayKey = keys[idx];
            return (
              <div key={dayKey} className="flex border-b border-gray-50 last:border-0 items-center">
                <div className="w-1/3 p-3 font-medium text-gray-700 text-sm">{day}</div>
                <div className="w-1/3 p-2 border-l border-gray-50">
                  <input
                    type="number"
                    value={defaultTimes.lunch[dayKey]}
                    onChange={(e) => handleTimeChange('lunch', dayKey, e.target.value)}
                    className="w-full border border-gray-200 rounded p-2 text-center text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="w-1/3 p-2 border-l border-gray-50">
                  <input
                    type="number"
                    value={defaultTimes.dinner[dayKey]}
                    onChange={(e) => handleTimeChange('dinner', dayKey, e.target.value)}
                    className="w-full border border-gray-200 rounded p-2 text-center text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { generateSmartPlan(defaultTimes); setCurrentTab('plan'); }}
          className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-amber-700 flex justify-center items-center gap-2"
        >
          <RefreshCw size={20} /> Appliquer et Recalculer le menu
        </button>
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto relative shadow-2xl">
      <div className="bg-white px-6 py-4 sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
          Cuisine<span className="text-amber-500">Facile</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
          Planificateur de repas intelligent
        </p>
      </div>

      <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto">
        {currentTab === 'plan'     && renderPlan()}
        {currentTab === 'recipes'  && renderRecipesList()}
        {currentTab === 'shopping' && renderShopping()}
        {currentTab === 'settings' && renderSettings()}
        {renderReplaceModal()}
        {renderRecipeForm()}
      </div>

      <div className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md flex justify-around p-2 pb-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <NavButton tab="plan"     icon={<Calendar size={22} />}     label="Plan"    current={currentTab} set={setCurrentTab} activeColor="text-amber-600 bg-amber-50" />
        <NavButton tab="recipes"  icon={<BookOpen size={22} />}     label="Recettes" current={currentTab} set={setCurrentTab} activeColor="text-blue-600 bg-blue-50" />
        <NavButton tab="shopping" icon={<ShoppingCart size={22} />} label="Courses"  current={currentTab} set={setCurrentTab} activeColor="text-emerald-600 bg-emerald-50" />
        <NavButton tab="settings" icon={<Settings size={22} />}     label="Dispos"   current={currentTab} set={setCurrentTab} activeColor="text-gray-800 bg-gray-100" />
      </div>
    </div>
  );
}

// Sous-composant pour les boutons de navigation
const NavButton = ({ tab, icon, label, current, set, activeColor }) => (
  <button
    onClick={() => set(tab)}
    className={`flex flex-col items-center gap-1 w-1/4 py-2 rounded-xl transition-colors ${
      current === tab ? activeColor : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {React.cloneElement(icon, { className: current === tab ? 'fill-current opacity-20' : '' })}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
