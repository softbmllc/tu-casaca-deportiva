  // src/context/AuthContext.tsx
  
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLoggedInUser, loginUser as utilsLoginUser, logoutUser as utilsLogoutUser } from "../utils/userUtils";
import { getAdminUserByEmail } from "../firebaseUtils";
import { User } from "../data/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar el estado directamente con lo que hay en localStorage
  // esto evita el flash inicial de "no autenticado"
  const storedUser = getLoggedInUser();
  const [user, setUser] = useState<User | null>(
    storedUser ? {
      id: String(storedUser.id),
      uid: String(storedUser.id),
      name: storedUser.name,
      email: storedUser.email,
      password: "", // Ajusta esto según cómo manejes la contraseña
    } : null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const adminUser = await getAdminUserByEmail(firebaseUser.email);
        if (adminUser && adminUser.activo) {
          setUser({
            id: adminUser.id || firebaseUser.uid,
            uid: firebaseUser.uid,
            name: adminUser.nombre,
            email: adminUser.email,
            password: "",
          });
          localStorage.setItem("userEmail", adminUser.email);
          utilsLoginUser({
            id: adminUser.id || firebaseUser.uid,
            name: adminUser.nombre,
            email: adminUser.email,
          });
        } else {
          utilsLogoutUser();
          setUser(null);
          localStorage.removeItem("userEmail");
        }
      } else {
        utilsLogoutUser();
        setUser(null);
        localStorage.removeItem("userEmail");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = (user: User) => {
    setUser({
      ...user,
      uid: String(user.id),
    });
    utilsLoginUser({
      id: String(user.id),
      name: user.name,
      email: user.email,
    });
    localStorage.setItem("userEmail", user.email);
  };

  const logout = () => {
    setUser(null);
    utilsLogoutUser();
    localStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}