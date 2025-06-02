  // src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLoggedInUser, loginUser as utilsLoginUser, logoutUser as utilsLogoutUser } from "../utils/userUtils";
import { User } from "../data/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseDB } from "../firebase";

interface AuthContextType {
  user: User | null;
  login: (user: User & { password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar el estado directamente con lo que hay en localStorage
  // esto evita el flash inicial de "no autenticado"
  const storedUser = getLoggedInUser();
  const [user, setUser] = useState<User | null>(
    storedUser ? {
      id: String(storedUser.id),
      name: storedUser.name,
      email: storedUser.email,
      password: "", // Ajusta esto según cómo manejes la contraseña
    } : null
  );

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "Admin",
          email: firebaseUser.email || "",
          password: "", // no almacenamos la contraseña aquí
        };
        setUser(userData);
        utilsLoginUser({
          id: Number(userData.id), // puede ser string si usás UID
          name: userData.name,
          email: userData.email,
        });
      } else {
        setUser(null);
        utilsLogoutUser();
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (user: User & { password: string }) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;

      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "Admin",
        email: firebaseUser.email || "",
        password: "", // no almacenamos la contraseña aquí
      };

      setUser(userData);
      utilsLoginUser({
        id: Number(userData.id),
        name: userData.name,
        email: userData.email,
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Login fallido: " + (error as Error).message);
    }
  };

  const logout = () => {
    setUser(null);
    utilsLogoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}