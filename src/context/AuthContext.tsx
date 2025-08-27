  // src/context/AuthContext.tsx
  
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLoggedInUser, loginUser as utilsLoginUser, logoutUser as utilsLogoutUser } from "../utils/userUtils";
import { getAdminByUid } from "../firebaseUtils";
import { User } from "../data/types";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
      if (firebaseUser) {
        // ⛔️ Si la sesión es anónima, no intentes leer /admins/{uid}
        if ((firebaseUser as any).isAnonymous) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        let adminDoc: any = null;
        try {
          adminDoc = await getAdminByUid(firebaseUser.uid);
        } catch (e) {
          // Silenciar permission-denied cuando no corresponde
          adminDoc = null;
        }
        const allowedRoles = ['superadmin','admin','editor','viewer'];
        if (adminDoc && allowedRoles.includes(adminDoc.role)) {
          const adminEmail = adminDoc.email ?? firebaseUser.email ?? '';
          const adminName = adminDoc.nombre ?? adminDoc.name ?? firebaseUser.displayName ?? 'Admin';
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: adminName,
            email: adminEmail,
            password: "",
          });
          localStorage.setItem("userEmail", adminEmail);
          utilsLoginUser({
            id: firebaseUser.uid,
            name: adminName,
            email: adminEmail,
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

  async function signIn(email: string, password: string) {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}