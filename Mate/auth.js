// auth.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

// Verifica si hay usuario activo
export async function verificarSesion(callback) {
  const uid = localStorage.getItem('mateia_uid');

  if (!uid) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert('Usuario no encontrado en Firestore.');
      localStorage.removeItem('mateia_uid');
      window.location.href = 'login.html';
      return;
    }

    // Ejecuta callback con datos del usuario
    callback(docSnap.data(), uid);

  } catch (error) {
    console.error('Error al verificar sesión:', error);
    alert('Error al cargar datos del usuario.');
    localStorage.removeItem('mateia_uid');
    window.location.href = 'login.html';
  }
}

// Función para cerrar sesión
export function cerrarSesion() {
  signOut(auth).then(() => {
    localStorage.removeItem('mateia_uid');
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Error al cerrar sesión:', error);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      import('./auth.js').then(({ cerrarSesion }) => cerrarSesion());
    });
  }
});