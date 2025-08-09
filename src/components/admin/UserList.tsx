// src/components/admin/UserList.tsx

import { useState, useEffect } from "react";
import EditUserModal from "./EditUserModal";
import { fetchAdminUsers } from "./../../firebaseUtils";
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getUsers, updateUser } from "../../utils/userUtils";
import { AuthUser } from "../../data/types";
import { useAuth } from "../../context/AuthContext";
import ModalConfirm from './ModalConfirm';
import { toast } from 'react-hot-toast';

export default function UserList() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/admin/login";
    }
  }, [user]);

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [userList, setUserList] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const firestore = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await getUsers();
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handleEditClick = (user: AuthUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (updatedData: { name: string; email: string; password?: string }) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, updatedData);
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await fetchAdminUsers();
      setUserList(users);
    } catch (error) {
      console.error("Error al cargar usuarios admin:", error);
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
      // 1. Crear en Firebase Auth
      await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

      // 2. Crear en Firestore
      const db = getFirestore();
      await setDoc(doc(db, "adminUsers", newUser.email), {
        nombre: newUser.name,
        email: newUser.email,
        rol: "admin",
        activo: true,
        creadoEn: serverTimestamp(),
      });

      alert("✅ Administrador creado correctamente.");
      setNewUser({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error: any) {
      alert("❌ Error al crear administrador: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      const db = getFirestore();

      // Leer UID del usuario
      const userDocRef = doc(db, "usuarios", selectedUser.email);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const uid = userData?.uid;

      // Eliminar de Firestore
      await deleteDoc(userDocRef);

      // (Intento) Eliminar de Firebase Auth - esto fallará en frontend sin privilegios
      try {
        const auth = getAuth();
        if (uid) {
          await deleteUser(uid);
        }
      } catch (authErr) {
        console.warn("⚠️ No se pudo eliminar de Firebase Auth (se necesita entorno seguro):", authErr);
      }

      toast.success("✅ Usuario eliminado correctamente.");
      setShowConfirmModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("❌ Error al eliminar usuario.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditedName(user.nombre);
    setEditedEmail(user.email);
    setEditPassword("");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const db = getFirestore();
      const updatedUser = {
        ...editingUser,
        nombre: editedName,
        ...(editPassword && { password: editPassword }),
      };
      await setDoc(doc(db, "adminUsers", editingUser.email), updatedUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert("❌ Error al guardar cambios.");
      console.error(error);
    }
  };

  const handleToggleActivo = async (user: any) => {
    try {
      const db = getFirestore();
      await setDoc(doc(db, "adminUsers", user.email), {
        ...user,
        activo: !user.activo,
      });
      fetchUsers();
    } catch (error) {
      alert("❌ Error al cambiar estado.");
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    const userToDelete = userList.find(u => u.id === id);
    if (!userToDelete) return;
    setSelectedUser(userToDelete);
    setShowConfirmModal(true);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm mb-4">
        {isLoading ? (
          <p className="text-gray-500">Cargando usuario...</p>
        ) : user ? null : (
          <p className="text-red-600">Usuario no logueado</p>
        )}
      </div>

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
            <th className="py-2 text-left">ID</th>
            <th className="py-2 text-left">Acciones</th>
            <th className="py-2 text-left">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((admin) => (
            <tr key={admin.email} className="border-b">
              <td className="py-2 flex items-center gap-2">
                {admin.nombre}
                {admin.rol === "superadmin" && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    Super Admin
                  </span>
                )}
              </td>
              <td className="px-4 py-2 border">{admin.id}</td>
              <td className="py-2">
                {/* Nueva lógica: solo el superadmin puede editar su propio perfil */}
                {admin.email === 'lilianpresa@hotmail.com' ? (
                  user?.email === 'lilianpresa@hotmail.com' ? (
                    <button
                      onClick={() => handleEdit(admin)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                  ) : (
                    <span className="text-gray-400">No editable</span>
                  )
                ) : (
                  <button
                    onClick={() => handleEdit(admin)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                )}
              </td>
              <td className="py-2">
                {admin.rol !== "superadmin" && admin.id !== "lilianpresa@hotmail.com" && (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-bold mb-2">Editar Administrador</h3>
          <input
            type="text"
            className="border px-2 py-1 mr-2 rounded"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Nombre"
          />
          {/* <input
            type="email"
            className="border px-2 py-1 mr-2 rounded"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            placeholder="Email"
          /> */}
          <button onClick={handleSaveEdit} className="bg-green-600 text-white px-3 py-1 rounded mr-2">Guardar</button>
          <button onClick={() => setEditingUser(null)} className="text-gray-500 underline">Cancelar</button>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveUser}
          initialData={{ name: selectedUser.name, email: selectedUser.email }}
        />
      )}

      {showConfirmModal && selectedUser && (
        <ModalConfirm
          title="¿Eliminar usuario?"
          message={`¿Estás seguro de que querés eliminar a ${selectedUser?.name || selectedUser?.email || "este usuario"}?`}
          onConfirm={handleDeleteUser}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}