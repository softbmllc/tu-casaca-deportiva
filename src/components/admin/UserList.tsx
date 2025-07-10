// src/components/admin/UserList.tsx
import { useState, useEffect } from "react";
import { registerAdminUser } from "./../../firebaseUtils";
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";

export default function UserList() {
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [userList, setUserList] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usersData = querySnapshot.docs.map((doc) => doc.data());
      setUserList(usersData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    const storedEmail = localStorage.getItem("userEmail");
    setCurrentUserEmail(storedEmail);
  }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;

    try {
      await registerAdminUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        isSuperAdmin: false,
      });

      alert("✅ Usuario creado correctamente.");
      setNewUser({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error: any) {
      alert("❌ Error al crear usuario: " + error.message);
    }
  };

  const handleDeleteUser = async (email: string) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirm) return;

    try {
      const db = getFirestore();

      // Leer UID del usuario
      const userDocRef = doc(db, "usuarios", email);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const uid = userData?.uid;

      // Eliminar de Firestore
      await deleteDoc(userDocRef);

      // (Intento) Eliminar de Firebase Auth - esto fallará en frontend sin privilegios
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && user.uid === uid) {
          await deleteUser(user);
        }
      } catch (authErr) {
        console.warn("⚠️ No se pudo eliminar de Firebase Auth (se necesita entorno seguro):", authErr);
      }

      alert("✅ Usuario eliminado correctamente.");
      fetchUsers();
    } catch (error) {
      alert("❌ Error al eliminar usuario.");
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-6">Administradores</h2>

      {/* Formulario de creación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nombre"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
      </div>

      <button
        onClick={handleAddUser}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        Crear Administrador
      </button>

      <hr className="my-6" />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Nombre</th>
            <th className="py-2 text-left">Email</th>
            <th className="py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr key={user.email} className="border-b">
              <td className="py-2 flex items-center gap-2">
                {user.name}
                {user.isSuperAdmin && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    Super Admin
                  </span>
                )}
              </td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">
                {currentUserEmail === "r.opalo@icloud.com" &&
                !user.isSuperAdmin &&
                user.email !== "r.opalo@icloud.com" ? (
                  <button
                    onClick={() => handleDeleteUser(user.email)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                ) : (
                  <span className="text-gray-400 italic">No editable</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}