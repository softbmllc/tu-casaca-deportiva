// src/components/admin/AdminCategoryManager.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchLeagues,
  fetchSubcategories,
  createLeague,
  deleteLeague,
  createSubcategory,
  deleteSubcategory,
} from "../../firebaseUtils";
import { doc, setDoc } from "firebase/firestore";
import { firebaseDB } from "@/firebase";
import { useConfirm } from "@/components/ui/confirm";

export default function AdminCategoryManager() {
  const [leagues, setLeagues] = useState<{ id: string; name: string }[]>([]);
  const [newLeague, setNewLeague] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [newSubcategory, setNewSubcategory] = useState("");
  // Edición de nombre de categoría
  const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
  const [editedLeagueName, setEditedLeagueName] = useState<string>("");

  const confirm = useConfirm();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const fetched = await fetchLeagues();
      setLeagues(fetched.map((l) => ({ id: l.id, name: l.name })));
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const loadSubcategories = async (leagueId: string) => {
    try {
      const fetched = await fetchSubcategories(leagueId);
      setSubcategories(fetched);
    } catch (err) {
      console.error("Error al cargar subcategorías:", err);
    }
  };

  const handleCreateLeague = async () => {
    if (!newLeague.trim()) return;
    try {
      setLoading(true);
      await createLeague(newLeague.trim());
      setNewLeague("");
      await loadLeagues();
    } catch (err) {
      console.error("Error creando categoría:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeague = async (id: string) => {
    const league = leagues.find(l => l.id === id);
    const confirmed = await confirm({
      title: "¿Eliminar categoría?",
      description: `¿Seguro que querés eliminar "${league?.name}" permanentemente?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      setLoading(true);
      await deleteLeague(id);
      setSelectedLeagueId("");
      setSubcategories([]);
      await loadLeagues();
    } catch (err) {
      console.error("Error eliminando categoría:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategory.trim() || !selectedLeagueId) return;
    try {
      setLoading(true);
      await createSubcategory(selectedLeagueId, newSubcategory.trim());
      setNewSubcategory("");
      await loadSubcategories(selectedLeagueId);
    } catch (err) {
      console.error("Error creando subcategoría:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!selectedLeagueId) return;
    const sub = subcategories.find((s) => s.id === subcategoryId);
    const confirmed = await confirm({
      title: "¿Eliminar subcategoría?",
      description: sub ? `¿Seguro que querés eliminar "${sub.name}" permanentemente?` : "¿Seguro que querés eliminar esta subcategoría permanentemente?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      setLoading(true);
      await deleteSubcategory(selectedLeagueId, subcategoryId);
      await loadSubcategories(selectedLeagueId);
    } catch (err) {
      console.error("Error eliminando subcategoría:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestionar Categorías</h2>

      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Nueva categoría (ej. Fútbol)"
          value={newLeague}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLeague(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleCreateLeague} disabled={loading || !newLeague.trim()}>
          Crear
        </Button>
      </div>

      <table className="w-full border text-sm mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Categoría</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map((league) => (
            <tr key={league.id} className={`text-center ${selectedLeagueId === league.id ? "bg-gray-50" : ""}`}>
              <td className="border px-4 py-2 text-xs text-gray-400">{league.id}</td>
              <td className="border px-4 py-2 font-medium">
                {editingLeagueId === league.id ? (
                  <Input
                    value={editedLeagueName}
                    onChange={(e) => setEditedLeagueName(e.target.value)}
                    onBlur={async () => {
                      if (!editedLeagueName.trim() || editedLeagueName === league.name) {
                        setEditingLeagueId(null);
                        return;
                      }
                      try {
                        setLoading(true);
                        const docRef = doc(firebaseDB, "leagues", league.id);
                        await setDoc(docRef, { id: league.id, name: editedLeagueName.trim() });
                        await loadLeagues();
                      } catch (err) {
                        console.error("Error actualizando nombre de categoría:", err);
                      } finally {
                        setEditingLeagueId(null);
                        setLoading(false);
                      }
                    }}
                    autoFocus
                    disabled={loading}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={async () => {
                      setSelectedLeagueId(league.id);
                      await loadSubcategories(league.id);
                    }}
                  >
                    {league.name}
                  </span>
                )}
              </td>
              <td className="border px-4 py-2">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                  onClick={() => handleDeleteLeague(league.id)}
                  disabled={loading}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLeagueId && (
        <div className="mt-10">
          <p className="text-sm text-gray-500 mb-1">
            Visualizando subcategorías de: <span className="font-semibold">{leagues.find(l => l.id === selectedLeagueId)?.name}</span>
          </p>
          <h3 className="text-xl font-bold mb-4">Subcategorías</h3>

          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Nueva subcategoría (ej. Premier League)"
              value={newSubcategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubcategory(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleCreateSubcategory} disabled={loading || !newSubcategory.trim()}>
              Crear
            </Button>
          </div>

          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Subcategoría</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sub) => (
                <tr key={sub.id} className="text-center">
                  <td className="border px-4 py-2 text-xs text-gray-400">{sub.id}</td>
                  <td className="border px-4 py-2 font-medium">{sub.name}</td>
                  <td className="border px-4 py-2">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}