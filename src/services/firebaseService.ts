import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { localStorageService } from './localStorageService';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

const mapUser = (user: User): AuthUser => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
});

export const firebaseService = {
    async loginWithGoogle(): Promise<AuthUser> {
        const result = await signInWithPopup(auth, googleProvider);
        const user = mapUser(result.user);
        localStorageService.set('auth_user', user);
        return user;
    },

    async loginWithEmail(email: string, password: string): Promise<AuthUser> {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = mapUser(result.user);
        localStorageService.set('auth_user', user);
        return user;
    },

    async register(email: string, password: string): Promise<AuthUser> {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = mapUser(result.user);
        localStorageService.set('auth_user', user);
        return user;
    },

    async logout(): Promise<void> {
        await signOut(auth);
        localStorageService.remove('auth_user');
    },

    onAuthChanged(callback: (user: AuthUser | null) => void): () => void {
        return onAuthStateChanged(auth, (user) => {
            callback(user ? mapUser(user) : null);
        });
    },

    getCachedUser(): AuthUser | null {
        return localStorageService.get<AuthUser>('auth_user');
    },
};