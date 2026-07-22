import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db, isConfigured } from "../firebase/config";
import { getClientTelemetry } from "../services/telemetryService";
import { evaluateLoginAttempt } from "../services/detectionEngine";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("admin"); // SecOps Admin view

  // Real-time State
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTelemetry, setActiveTelemetry] = useState(null);

  // Initial Telemetry Fetch
  useEffect(() => {
    getClientTelemetry().then((telemetry) => {
      setActiveTelemetry(telemetry);
    });
  }, []);

  // Initialize Default Seed / Demo Data if Firestore is empty or running locally without config
  const initializeSeedData = () => {
    const defaultUsers = [
      {
        id: "user_alex_dev",
        email: "alex.cyber@company.com",
        name: "Alex Mercer",
        role: "SecOps Lead",
        locked: false,
        knownDevices: ["Chrome on macOS (1920x1080)"],
        knownLocations: [{ city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 }],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "user_sarah_admin",
        email: "admin@soc.io",
        name: "Sarah Jenkins",
        role: "admin",
        locked: false,
        knownDevices: ["Chrome on Windows (2560x1440)"],
        knownLocations: [{ city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 }],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "user_target_victim",
        email: "target.user@corp.internal",
        name: "Target Victim Account",
        role: "Analyst",
        locked: true,
        lockedReason: "Account locked due to 5 consecutive failed login attempts",
        knownDevices: ["Safari on macOS (1728x1117)"],
        knownLocations: [{ city: "Austin", country: "United States", lat: 30.2672, lng: -97.7431 }],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const defaultAttempts = [
      {
        id: "att_101",
        userId: "user_alex_dev",
        email: "alex.cyber@company.com",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        ip: "198.51.100.42",
        device: "Chrome on macOS (1920x1080)",
        location: { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
        status: "success"
      },
      {
        id: "att_102",
        userId: "user_alex_dev",
        email: "alex.cyber@company.com",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        ip: "203.0.113.195",
        device: "Chrome on macOS (1920x1080)",
        location: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
        status: "success"
      },
      {
        id: "att_103",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Bot Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
        status: "failed"
      },
      {
        id: "att_104",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Bot Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
        status: "failed"
      },
      {
        id: "att_105",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Bot Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
        status: "failed"
      },
      {
        id: "att_106",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Bot Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
        status: "failed"
      },
      {
        id: "att_107",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Bot Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
        status: "failed"
      },
      {
        id: "att_108",
        userId: "user_sarah_admin",
        email: "admin@soc.io",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        ip: "103.21.244.0",
        device: "Opera on Linux (1920x1080)",
        location: { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
        status: "success"
      }
    ];

    const defaultAlerts = [
      {
        id: "alt_201",
        userId: "user_alex_dev",
        email: "alex.cyber@company.com",
        type: "impossible_travel",
        severity: "high",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: {
          distanceKm: 8270,
          timeDiffMinutes: 10,
          impliedSpeedKmh: 49620,
          fromLocation: "San Francisco, United States",
          toLocation: "Tokyo, Japan",
          reason: "Authentication from Tokyo, Japan occurred 10 mins after San Francisco, United States (8,270 km away). Implied travel speed: 49,620 km/h."
        },
        resolved: false
      },
      {
        id: "alt_202",
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        type: "brute_force",
        severity: "high",
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        details: {
          failedCount: 5,
          timeWindow: "5 minutes",
          targetEmail: "target.user@corp.internal",
          lastIp: "185.220.101.5",
          reason: "5 consecutive failed login attempts detected within 5 minutes."
        },
        resolved: false
      },
      {
        id: "alt_203",
        userId: "user_sarah_admin",
        email: "admin@soc.io",
        type: "new_device",
        severity: "medium",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: {
          device: "Opera on Linux (1920x1080)",
          ip: "103.21.244.0",
          location: "Sydney, Australia",
          reason: "Login detected from unrecognized device signature: Opera on Linux."
        },
        resolved: false
      },
      {
        id: "alt_204",
        userId: "user_sarah_admin",
        email: "admin@soc.io",
        type: "unusual_time",
        severity: "low",
        timestamp: new Date(new Date().setHours(3, 14, 0, 0)).toISOString(),
        details: {
          hour: 3,
          formattedTime: "03:14:00 AM",
          reason: "Login detected at unusual hour (03:14 AM), outside typical user activity window."
        },
        resolved: true
      }
    ];

    setUsersList(defaultUsers);
    setLoginAttempts(defaultAttempts);
    setAlerts(defaultAlerts);
  };

  // Real-time Firestore Listeners using onSnapshot (Spark Plan Compatible)
  useEffect(() => {
    if (!isConfigured) {
      console.log("Running in demo mode with client threat engine & seed dataset.");
      initializeSeedData();
      setLoading(false);
      return;
    }

    try {
      // 1. Listen to Login Attempts
      const qAttempts = query(collection(db, "loginAttempts"), orderBy("timestamp", "desc"), limit(100));
      const unsubscribeAttempts = onSnapshot(qAttempts, (snapshot) => {
        if (!snapshot.empty) {
          const attempts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp
          }));
          setLoginAttempts(attempts);
        } else {
          // Empty firestore fallback
          setLoginAttempts((prev) => (prev.length === 0 ? initializeSeedData() || prev : prev));
        }
      }, (err) => {
        console.warn("Firestore loginAttempts snapshot fallback:", err);
      });

      // 2. Listen to Alerts
      const qAlerts = query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(100));
      const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
        if (!snapshot.empty) {
          const altList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp
          }));
          setAlerts(altList);
        }
      }, (err) => {
        console.warn("Firestore alerts snapshot fallback:", err);
      });

      // 3. Listen to Users
      const qUsers = collection(db, "users");
      const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        if (!snapshot.empty) {
          const uList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setUsersList(uList);
        }
      }, (err) => {
        console.warn("Firestore users snapshot fallback:", err);
      });

      // Auth state tracking
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCurrentUser({ id: user.uid, ...userSnap.data() });
            } else {
              setCurrentUser({ id: user.uid, email: user.email, name: user.displayName || user.email.split("@")[0] });
            }
          } catch (e) {
            setCurrentUser({ id: user.uid, email: user.email, name: user.email.split("@")[0] });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return () => {
        unsubscribeAttempts();
        unsubscribeAlerts();
        unsubscribeUsers();
        unsubscribeAuth();
      };
    } catch (err) {
      console.warn("Firebase initialization error, launching demo mode:", err);
      initializeSeedData();
      setLoading(false);
    }
  }, []);

  /**
   * Log Login Attempt & Trigger Client-Side Threat Engine (Spark Plan)
   */
  const recordLoginAttempt = async (attemptData) => {
    const telemetry = activeTelemetry || await getClientTelemetry();
    
    const newAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: attemptData.userId || (currentUser ? currentUser.id : null),
      email: attemptData.email,
      timestamp: attemptData.timestamp || new Date().toISOString(),
      ip: attemptData.ip || telemetry.ip,
      device: attemptData.device || telemetry.deviceInfo,
      deviceInfo: attemptData.deviceInfo || telemetry.deviceInfo,
      location: attemptData.location || telemetry.location,
      status: attemptData.status // "success" | "failed"
    };

    // 1. Local state update for instant UI feedback
    setLoginAttempts((prev) => [newAttempt, ...prev]);

    // 2. Evaluate Client-Side Threat Engine rules
    const userObj = usersList.find((u) => u.email === attemptData.email || u.id === newAttempt.userId) || currentUser;
    const { alertsToCreate, lockAccount } = evaluateLoginAttempt(newAttempt, [newAttempt, ...loginAttempts], userObj);

    if (alertsToCreate.length > 0) {
      setAlerts((prev) => [...alertsToCreate, ...prev]);
    }

    if (lockAccount && userObj) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.email === userObj.email || u.id === userObj.id
            ? { ...u, locked: true, lockedReason: "Account locked automatically by Threat Detection Engine (High Severity Event)" }
            : u
        )
      );
      if (currentUser && (currentUser.email === userObj.email || currentUser.id === userObj.id)) {
        setCurrentUser((prev) => ({ ...prev, locked: true, lockedReason: "Account locked automatically by Threat Detection Engine" }));
      }
    }

    // 3. Write directly to Firestore Collections (Spark Plan Compatible)
    if (isConfigured) {
      try {
        await addDoc(collection(db, "loginAttempts"), {
          ...newAttempt,
          timestamp: serverTimestamp()
        });

        for (const alert of alertsToCreate) {
          await addDoc(collection(db, "alerts"), {
            ...alert,
            timestamp: serverTimestamp()
          });
        }

        if (lockAccount && newAttempt.userId) {
          try {
            await updateDoc(doc(db, "users", newAttempt.userId), {
              locked: true,
              lockedReason: "Automated threat response (High Severity Alert)"
            });
          } catch (err) {
            // Create user doc if not existing yet
            await setDoc(doc(db, "users", newAttempt.userId), {
              email: newAttempt.email,
              locked: true,
              lockedReason: "Automated threat response (High Severity Alert)"
            }, { merge: true });
          }
        }
      } catch (e) {
        console.warn("Firestore write notice:", e);
      }
    }

    return { newAttempt, alertsToCreate, lockAccount };
  };

  /**
   * User Signup
   */
  const signup = async (email, password, name) => {
    const telemetry = activeTelemetry || await getClientTelemetry();
    let userId = `user_${Date.now()}`;

    if (isConfigured) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCred.user.uid;
      } catch (err) {
        console.warn("Firebase auth signup error:", err);
      }
    }

    const newUser = {
      id: userId,
      email,
      name: name || email.split("@")[0],
      role: "SecOps Lead",
      locked: false,
      knownDevices: [telemetry.deviceInfo],
      knownLocations: [telemetry.location],
      createdAt: new Date().toISOString()
    };

    setUsersList((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    if (isConfigured) {
      try {
        await setDoc(doc(db, "users", userId), newUser);
      } catch (e) {
        console.warn("Firestore user creation notice:", e);
      }
    }

    // Log successful signup attempt
    await recordLoginAttempt({
      userId,
      email,
      status: "success",
      device: telemetry.deviceInfo,
      location: telemetry.location,
      ip: telemetry.ip
    });

    return newUser;
  };

  /**
   * User Login
   */
  const login = async (email, password) => {
    const telemetry = activeTelemetry || await getClientTelemetry();
    const existingUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // Check if account is locked
    if (existingUser && existingUser.locked) {
      await recordLoginAttempt({
        userId: existingUser.id,
        email,
        status: "failed",
        device: telemetry.deviceInfo,
        location: telemetry.location,
        ip: telemetry.ip
      });
      throw new Error(`ACCOUNT LOCKED: ${existingUser.lockedReason || "Contact Security Administrator to unlock."}`);
    }

    let authUser = null;
    if (isConfigured) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        authUser = res.user;
      } catch (err) {
        await recordLoginAttempt({
          userId: existingUser ? existingUser.id : null,
          email,
          status: "failed",
          device: telemetry.deviceInfo,
          location: telemetry.location,
          ip: telemetry.ip
        });
        throw new Error("Invalid email or password credentials.");
      }
    } else {
      // Standalone Demo login check
      if (password === "wrong" || password === "failed") {
        await recordLoginAttempt({
          userId: existingUser ? existingUser.id : null,
          email,
          status: "failed",
          device: telemetry.deviceInfo,
          location: telemetry.location,
          ip: telemetry.ip
        });
        throw new Error("Invalid password specified for demo login.");
      }
    }

    const userObj = existingUser || {
      id: authUser ? authUser.uid : `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: email.includes("admin") ? "admin" : "SecOps Lead",
      locked: false,
      knownDevices: [telemetry.deviceInfo],
      knownLocations: [telemetry.location]
    };

    setCurrentUser(userObj);

    // Record login attempt
    await recordLoginAttempt({
      userId: userObj.id,
      email,
      status: "success",
      device: telemetry.deviceInfo,
      location: telemetry.location,
      ip: telemetry.ip
    });

    return userObj;
  };

  /**
   * Demo Quick Login
   */
  const demoLogin = async (userType) => {
    if (userType === "admin") {
      const user = usersList.find((u) => u.email === "admin@soc.io") || {
        id: "user_sarah_admin",
        email: "admin@soc.io",
        name: "Sarah Jenkins",
        role: "admin",
        locked: false
      };
      setCurrentUser(user);
      setRole("admin");
      await recordLoginAttempt({ userId: user.id, email: user.email, status: "success" });
    } else if (userType === "secops") {
      const user = usersList.find((u) => u.email === "alex.cyber@company.com") || {
        id: "user_alex_dev",
        email: "alex.cyber@company.com",
        name: "Alex Mercer",
        role: "SecOps Lead",
        locked: false
      };
      setCurrentUser(user);
      setRole("SecOps Lead");
      await recordLoginAttempt({ userId: user.id, email: user.email, status: "success" });
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    if (isConfigured) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Sign out notice:", e);
      }
    }
    setCurrentUser(null);
  };

  /**
   * Resolve Threat Alert
   */
  const resolveAlert = async (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );

    if (isConfigured) {
      try {
        await updateDoc(doc(db, "alerts", alertId), { resolved: true });
      } catch (e) {
        console.warn("Alert update notice:", e);
      }
    }
  };

  /**
   * Toggle User Account Lock State
   */
  const toggleUserLock = async (userId, targetState, reason) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId || u.email === userId
          ? {
              ...u,
              locked: targetState,
              lockedReason: targetState ? reason || "Locked manually by Administrator" : null
            }
          : u
      )
    );

    if (currentUser && (currentUser.id === userId || currentUser.email === userId)) {
      setCurrentUser((prev) => ({
        ...prev,
        locked: targetState,
        lockedReason: targetState ? reason || "Locked manually by Administrator" : null
      }));
    }

    if (isConfigured) {
      try {
        await updateDoc(doc(db, "users", userId), {
          locked: targetState,
          lockedReason: targetState ? reason || "Locked manually by Administrator" : null
        });
      } catch (e) {
        console.warn("Lock state update notice:", e);
      }
    }
  };

  const value = {
    currentUser,
    loading,
    role,
    setRole,
    loginAttempts,
    alerts,
    usersList,
    activeTelemetry,
    login,
    signup,
    demoLogin,
    logout,
    recordLoginAttempt,
    resolveAlert,
    toggleUserLock
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
