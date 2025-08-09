// src/components/admin/EditUserModal.tsx

import React, { useState } from "react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: { name: string; email: string; password?: string }) => void;
  initialData: {
    name: string;
    email: string;
  };
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      name,
      email,
      ...(password && { password }),
    };
    onSave(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva Contraseña (opcional)"
            className="border p-2 rounded"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="text-gray-600 px-4 py-2 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;